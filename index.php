<?php
/**
 * Portal Público - Vista Ciudadano
 */
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/functions.php';

$success = $error = '';

// Procesar creación de ticket
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_ticket'])) {
    try {
        $pdo = getDB();
        $ticketNumber = generateTicketNumber();
        $categoria = $_POST['categoria'] ?? '';
        
        // Obtener categoria_id
        $stmt = $pdo->prepare("SELECT id FROM categorias WHERE nombre = ?");
        $stmt->execute([$categoria]);
        $cat = $stmt->fetch();
        $categoriaId = $cat ? $cat['id'] : 1;
        
        // Obtener tipo ticket
        $stmt = $pdo->query("SELECT id FROM tipos_ticket LIMIT 1");
        $tipoId = $stmt->fetch()['id'];
        
        $pdo->prepare("INSERT INTO tickets (ticket_number, asunto, descripcion, solicitante_nombre, solicitante_email, categoria_id, prioridad, estado, tipo_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto', ?)")
            ->execute([$ticketNumber, $_POST['asunto'], $_POST['descripcion'], $_POST['nombre'], $_POST['email'], $categoriaId, $_POST['prioridad'], $tipoId]);
        
        addEmailLog($_POST['email'], "Hemos recibido su solicitud $ticketNumber", 'ticket_created', 'sent');
        $success = "✅ Ticket creado exitosamente. Su número de seguimiento es: <strong>$ticketNumber</strong>";
    } catch (Exception $e) {
        $error = 'Error al crear el ticket: ' . $e->getMessage();
    }
}

// Consultar ticket
$queriedTicket = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query_ticket'])) {
    $pdo = getDB();
    $num = trim($_POST['ticket_number'] ?? '');
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE ticket_number = ?");
    $stmt->execute([$num]);
    $queriedTicket = $stmt->fetch();
    if (!$queriedTicket) $error = '❌ No se encontró ningún ticket con ese número.';
}

// Categorías públicas
$pdo = getDB();
$categories = $pdo->query("SELECT * FROM categorias WHERE active = 1 AND visibilidad IN ('both', 'external') ORDER BY nombre")->fetchAll();
$articles = $pdo->query("SELECT a.*, c.nombre as categoria_nombre FROM articulos_conocimiento a JOIN categorias c ON a.categoria_id = c.id WHERE a.estado = 'published' AND a.visibilidad IN ('both', 'external') ORDER BY a.destacado DESC, a.created_at DESC LIMIT 6")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gobierno de Chile | Mesa de Ayuda</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide { animation: slideDown 0.3s ease-out; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#d4272e] rounded-lg flex items-center justify-center">
                    <span class="text-white text-lg">🏛️</span>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-[#1a3a6c]">GOBIERNO DE CHILE</h1>
                    <p class="text-xs text-gray-500 -mt-0.5">HELPDESK | Mesa de Ayuda TI</p>
                </div>
            </div>
            <a href="login.php" class="bg-[#1a3a6c] hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium">🔐 Acceso Funcionarios</a>
        </div>
    </header>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-[#1a3a6c] to-blue-900 text-white py-16">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">¿En qué podemos ayudarte hoy?</h2>
            <p class="text-blue-100 mb-8">Portal de atención ciudadana para solicitudes de soporte técnico</p>
        </div>
    </section>

    <!-- Action Cards -->
    <section class="max-w-5xl mx-auto px-4 -mt-8">
        <div class="grid md:grid-cols-2 gap-6">
            <a href="#ticket-form" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-[#d4272e]">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center"><span class="text-2xl">🎫</span></div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800">Solicitar Soporte Técnico</h3>
                        <p class="text-sm text-gray-500 mt-1">Crea un nuevo ticket de atención</p>
                    </div>
                </div>
            </a>
            <a href="#ticket-query" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-[#1a3a6c]">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center"><span class="text-2xl">🔍</span></div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800">Consultar Estado de Ticket</h3>
                        <p class="text-sm text-gray-500 mt-1">Revisa el progreso de tu solicitud</p>
                    </div>
                </div>
            </a>
        </div>
    </section>

    <?php if ($success || $error): ?>
    <div class="max-w-3xl mx-auto px-4 mt-6">
        <div class="<?= $success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700' ?> border px-4 py-3 rounded-lg animate-slide">
            <?= $success ?: $error ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- Ticket Form -->
    <section id="ticket-form" class="max-w-3xl mx-auto px-4 mt-8">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 class="text-xl font-bold text-gray-800 mb-6">🎫 Nuevo Ticket de Soporte</h3>
            <form method="POST" class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                        <input required type="text" name="nombre" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                        <input required type="email" name="email" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                        <select required name="categoria" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                            <option value="">Seleccionar</option>
                            <?php foreach ($categories as $c): ?>
                                <option value="<?= e($c['nombre']) ?>"><?= e($c['nombre']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                        <select required name="prioridad" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                            <option value="baja">Baja</option>
                            <option value="media" selected>Media</option>
                            <option value="alta">Alta</option>
                            <option value="urgente">Urgente</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                    <input required type="text" name="asunto" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                    <textarea required name="descripcion" rows="4" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"></textarea>
                </div>
                <button type="submit" name="create_ticket" class="w-full bg-[#d4272e] hover:bg-red-700 text-white py-3 rounded-lg font-medium">📤 Enviar Solicitud</button>
            </form>
        </div>
    </section>

    <!-- Ticket Query -->
    <section id="ticket-query" class="max-w-3xl mx-auto px-4 mt-8">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 class="text-xl font-bold text-gray-800 mb-6">🔍 Consultar Estado de Ticket</h3>
            <form method="POST" class="flex gap-3 mb-4">
                <input type="text" name="ticket_number" placeholder="Ej: TKT-2026-00001" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">
                <button type="submit" name="query_ticket" class="bg-[#1a3a6c] hover:bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium">Consultar</button>
            </form>
            <?php if ($queriedTicket): ?>
            <div class="border border-gray-200 rounded-xl p-6 animate-slide">
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <span class="font-mono font-bold text-lg text-[#1a3a6c]"><?= e($queriedTicket['ticket_number']) ?></span>
                    <?= getStatusBadge($queriedTicket['estado']) ?>
                    <?= getPriorityBadge($queriedTicket['prioridad']) ?>
                </div>
                <h4 class="font-semibold text-gray-800 mb-2"><?= e($queriedTicket['asunto']) ?></h4>
                <p class="text-sm text-gray-600 mb-4"><?= e($queriedTicket['descripcion']) ?></p>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div><span class="text-gray-500">Creado:</span> <span class="font-medium"><?= formatDate($queriedTicket['created_at']) ?></span></div>
                    <div><span class="text-gray-500">Categoría:</span> <span class="font-medium"><?= e($queriedTicket['categoria_id']) ?></span></div>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Categories -->
    <section class="max-w-6xl mx-auto px-4 py-12">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Explora por Categorías</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <?php foreach ($categories as $cat): ?>
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3"><span>📁</span></div>
                <h4 class="font-semibold text-gray-800 text-sm"><?= e($cat['nombre']) ?></h4>
                <p class="text-xs text-gray-500 mt-1"><?= e($cat['descripcion']) ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Articles -->
    <?php if (!empty($articles)): ?>
    <section class="max-w-6xl mx-auto px-4 pb-12">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Artículos Destacados</h3>
        <div class="grid md:grid-cols-3 gap-4">
            <?php foreach (array_slice($articles, 0, 3) as $a): ?>
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <span class="text-xs bg-blue-50 text-[#1a3a6c] px-2 py-1 rounded-full"><?= e($a['categoria_nombre']) ?></span>
                <h4 class="font-semibold text-gray-800 mt-3 mb-2"><?= e($a['titulo']) ?></h4>
                <p class="text-sm text-gray-500"><?= e($a['resumen']) ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

    <footer class="bg-[#1a1a2e] text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-sm text-gray-400">© <?= date('Y') ?> Gobierno de Chile — Mesa de Ayuda TI</p>
        </div>
    </footer>
</body>
</html>
