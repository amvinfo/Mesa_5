<?php
/**
 * Portal Público - Vista Ciudadano
 */
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/functions.php';

$success = $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_ticket'])) {
    try {
        $pdo = getDB();
        $ticketNumber = generateTicketNumber();
        $stmt = $pdo->prepare("SELECT id FROM categorias WHERE nombre = ?");
        $stmt->execute([$_POST['categoria']]);
        $catId = $stmt->fetch()['id'] ?? 1;
        $tipoId = $pdo->query("SELECT id FROM tipos_ticket LIMIT 1")->fetch()['id'];
        
        $pdo->prepare("INSERT INTO tickets (ticket_number, asunto, descripcion, solicitante_nombre, solicitante_email, categoria_id, prioridad, estado, tipo_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto', ?)")
            ->execute([$ticketNumber, $_POST['asunto'], $_POST['descripcion'], $_POST['nombre'], $_POST['email'], $catId, $_POST['prioridad'], $tipoId]);
        
        addEmailLog($_POST['email'], "Hemos recibido su solicitud $ticketNumber", 'ticket_created');
        $success = "✅ Ticket creado: <strong>$ticketNumber</strong>";
    } catch (Exception $e) { $error = 'Error: ' . $e->getMessage(); }
}

$queriedTicket = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query_ticket'])) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE ticket_number = ?");
    $stmt->execute([trim($_POST['ticket_number'] ?? '')]);
    $queriedTicket = $stmt->fetch();
    if (!$queriedTicket) $error = '❌ No se encontró el ticket.';
}

$pdo = getDB();
$categories = $pdo->query("SELECT * FROM categorias WHERE active = 1 AND visibilidad IN ('both', 'external')")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gobierno de Chile | Mesa de Ayuda</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#d4272e] rounded-lg flex items-center justify-center"><span class="text-white text-lg">🏛️</span></div>
                <div><h1 class="text-lg font-bold text-[#1a3a6c]">GOBIERNO DE CHILE</h1><p class="text-xs text-gray-500">HELPDESK | Mesa de Ayuda TI</p></div>
            </div>
            <a href="login.php" class="bg-[#1a3a6c] text-white px-4 py-2 rounded-lg text-sm font-medium">🔐 Acceso Funcionarios</a>
        </div>
    </header>

    <section class="bg-gradient-to-br from-[#1a3a6c] to-blue-900 text-white py-16">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">¿En qué podemos ayudarte hoy?</h2>
            <p class="text-blue-100">Portal de atención ciudadana</p>
        </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 -mt-8">
        <div class="grid md:grid-cols-2 gap-6">
            <a href="#ticket-form" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-[#d4272e]">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center"><span class="text-2xl">🎫</span></div>
                    <div><h3 class="text-lg font-bold">Solicitar Soporte Técnico</h3><p class="text-sm text-gray-500">Crea un nuevo ticket</p></div>
                </div>
            </a>
            <a href="#ticket-query" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-[#1a3a6c]">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center"><span class="text-2xl">🔍</span></div>
                    <div><h3 class="text-lg font-bold">Consultar Estado</h3><p class="text-sm text-gray-500">Revisa tu solicitud</p></div>
                </div>
            </a>
        </div>
    </section>

    <?php if ($success || $error): ?>
    <div class="max-w-3xl mx-auto px-4 mt-6">
        <div class="<?= $success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700' ?> border px-4 py-3 rounded-lg"><?= $success ?: $error ?></div>
    </div>
    <?php endif; ?>

    <section id="ticket-form" class="max-w-3xl mx-auto px-4 mt-8">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 class="text-xl font-bold mb-6">🎫 Nuevo Ticket</h3>
            <form method="POST" class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                    <input required name="nombre" placeholder="Nombre Completo *" class="px-4 py-2.5 border border-gray-300 rounded-lg">
                    <input required type="email" name="email" placeholder="Correo *" class="px-4 py-2.5 border border-gray-300 rounded-lg">
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                    <select required name="categoria" class="px-4 py-2.5 border border-gray-300 rounded-lg">
                        <option value="">Categoría *</option>
                        <?php foreach ($categories as $c): ?><option value="<?= htmlspecialchars($c['nombre']) ?>"><?= htmlspecialchars($c['nombre']) ?></option><?php endforeach; ?>
                    </select>
                    <select required name="prioridad" class="px-4 py-2.5 border border-gray-300 rounded-lg">
                        <option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
                    </select>
                </div>
                <input required name="asunto" placeholder="Asunto *" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                <textarea required name="descripcion" rows="4" placeholder="Descripción *" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"></textarea>
                <button type="submit" name="create_ticket" class="w-full bg-[#d4272e] text-white py-3 rounded-lg font-medium">📤 Enviar</button>
            </form>
        </div>
    </section>

    <section id="ticket-query" class="max-w-3xl mx-auto px-4 mt-8">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 class="text-xl font-bold mb-6">🔍 Consultar Ticket</h3>
            <form method="POST" class="flex gap-3">
                <input type="text" name="ticket_number" placeholder="TKT-2026-00001" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg">
                <button type="submit" name="query_ticket" class="bg-[#1a3a6c] text-white px-6 py-2.5 rounded-lg font-medium">Consultar</button>
            </form>
            <?php if ($queriedTicket): ?>
            <div class="border border-gray-200 rounded-xl p-6 mt-4">
                <div class="flex items-center gap-3 mb-3">
                    <span class="font-mono font-bold text-[#1a3a6c]"><?= htmlspecialchars($queriedTicket['ticket_number']) ?></span>
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><?= ucfirst(str_replace('_', ' ', $queriedTicket['estado'])) ?></span>
                </div>
                <h4 class="font-semibold mb-2"><?= htmlspecialchars($queriedTicket['asunto']) ?></h4>
                <p class="text-sm text-gray-600"><?= htmlspecialchars($queriedTicket['descripcion']) ?></p>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <footer class="bg-[#1a1a2e] text-white py-8 mt-12">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <p class="text-sm text-gray-400">© <?= date('Y') ?> Gobierno de Chile — Mesa de Ayuda TI</p>
        </div>
    </footer>
</body>
</html>
