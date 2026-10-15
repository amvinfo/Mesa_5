<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$pdo = getDB();
$pageTitle = '🎫 Gestión de Tickets';
$current = 'tickets';
$search = $_GET['s'] ?? '';
$filterStatus = $_GET['estado'] ?? '';
$filterPriority = $_GET['prioridad'] ?? '';

// Procesar acciones
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['change_status'])) {
        $tid = $_POST['ticket_id'];
        $newStatus = $_POST['new_status'];
        $pdo->prepare("UPDATE tickets SET estado = ?, updated_at = NOW(), resolved_at = CASE WHEN ? IN ('resuelto','cerrado') THEN NOW() ELSE resolved_at END WHERE id = ?")->execute([$newStatus, $newStatus, $tid]);
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, 'status_change', ?, ?)")->execute([$tid, "Estado cambiado a $newStatus", $_SESSION['user_id']]);
        
        $ticket = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
        $ticket->execute([$tid]);
        $t = $ticket->fetch();
        if ($newStatus === 'resuelto' || $newStatus === 'cerrado') {
            addEmailLog($t['solicitante_email'], "Su ticket {$t['ticket_number']} ha sido cerrado", 'ticket_closed', 'sent', $tid);
        }
    }
    if (isset($_POST['add_response'])) {
        $tid = $_POST['ticket_id'];
        $content = $_POST['response'];
        $type = $_POST['response_type'] ?? 'response';
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, ?, ?, ?)")->execute([$tid, $type, $content, $_SESSION['user_id']]);
        $pdo->prepare("UPDATE tickets SET updated_at = NOW() WHERE id = ?")->execute([$tid]);
        
        if ($type === 'response') {
            $ticket = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
            $ticket->execute([$tid]);
            $t = $ticket->fetch();
            addEmailLog($t['solicitante_email'], "Actualización de su ticket {$t['ticket_number']}", 'staff_response', 'sent', $tid);
        }
    }
    if (isset($_POST['create_ticket'])) {
        $ticketNumber = generateTicketNumber();
        $cat = $pdo->prepare("SELECT id FROM categorias WHERE nombre = ?");
        $cat->execute([$_POST['categoria']]);
        $catId = $cat->fetch()['id'] ?? 1;
        $tipoId = $pdo->query("SELECT id FROM tipos_ticket LIMIT 1")->fetch()['id'];
        
        $pdo->prepare("INSERT INTO tickets (ticket_number, asunto, descripcion, solicitante_nombre, solicitante_email, categoria_id, prioridad, estado, departamento_id, ubicacion_id, tipo_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto', ?, ?, ?)")
            ->execute([$ticketNumber, $_POST['asunto'], $_POST['descripcion'], $_POST['nombre'], $_POST['email'], $catId, $_POST['prioridad'], $_POST['departamento'] ?: null, $_POST['ubicacion'] ?: null, $tipoId]);
        
        addEmailLog($_POST['email'], "Hemos recibido su solicitud $ticketNumber", 'ticket_created', 'sent');
    }
}

// Query
$sql = "SELECT t.*, c.nombre as categoria_nombre FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE 1=1";
$params = [];
if ($search) { $sql .= " AND (t.ticket_number LIKE ? OR t.solicitante_nombre LIKE ? OR t.asunto LIKE ? OR t.solicitante_email LIKE ?)"; $params = array_fill(0, 4, "%$search%"); }
if ($filterStatus) { $sql .= " AND t.estado = ?"; $params[] = $filterStatus; }
if ($filterPriority) { $sql .= " AND t.prioridad = ?"; $params[] = $filterPriority; }
$sql .= " ORDER BY t.created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tickets = $stmt->fetchAll();

$categories = $pdo->query("SELECT * FROM categorias WHERE active = 1")->fetchAll();
$departments = $pdo->query("SELECT * FROM departamentos WHERE active = 1")->fetchAll();
$locations = $pdo->query("SELECT * FROM ubicaciones WHERE active = 1")->fetchAll();

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Tickets</h1>
        <p class="text-gray-500 text-sm mt-1"><?= count($tickets) ?> ticket(s) encontrado(s)</p>
    </div>
    <button onclick="document.getElementById('newTicketModal').classList.remove('hidden')" class="bg-[#1a3a6c] hover:bg-blue-900 text-white px-4 py-2.5 rounded-lg font-medium text-sm">+ Nuevo Ticket</button>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <form method="GET" class="flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
            <input type="text" name="s" value="<?= e($search) ?>" placeholder="Buscar por Nº, solicitante, asunto..." class="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm">
        </div>
        <select name="estado" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos los estados</option>
            <option value="abierto" <?= $filterStatus==='abierto'?'selected':'' ?>>Abierto</option>
            <option value="en_proceso" <?= $filterStatus==='en_proceso'?'selected':'' ?>>En Proceso</option>
            <option value="resuelto" <?= $filterStatus==='resuelto'?'selected':'' ?>>Resuelto</option>
            <option value="cerrado" <?= $filterStatus==='cerrado'?'selected':'' ?>>Cerrado</option>
        </select>
        <select name="prioridad" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Todas las prioridades</option>
            <option value="baja" <?= $filterPriority==='baja'?'selected':'' ?>>Baja</option>
            <option value="media" <?= $filterPriority==='media'?'selected':'' ?>>Media</option>
            <option value="alta" <?= $filterPriority==='alta'?'selected':'' ?>>Alta</option>
            <option value="urgente" <?= $filterPriority==='urgente'?'selected':'' ?>>Urgente</option>
        </select>
        <button type="submit" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">Filtrar</button>
    </form>
</div>

<!-- Tickets Table with Expandable Rows -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <?php foreach ($tickets as $t): 
        $history = $pdo->prepare("SELECT * FROM ticket_historial WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 3");
        $history->execute([$t['id']]);
        $hist = $history->fetchAll();
    ?>
    <div class="border-b border-gray-100">
        <div onclick="this.nextElementSibling.classList.toggle('hidden')" class="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer">
            <span class="text-gray-400">▼</span>
            <span class="font-mono text-xs text-[#1a3a6c] font-medium w-32"><?= e($t['ticket_number']) ?></span>
            <span class="text-gray-600 hidden md:block w-40 truncate"><?= e($t['solicitante_nombre']) ?></span>
            <span class="flex-1 text-gray-800 truncate"><?= e($t['asunto']) ?></span>
            <span class="hidden sm:block"><?= getPriorityBadge($t['prioridad']) ?></span>
            <span><?= getStatusBadge($t['estado']) ?></span>
        </div>
        <div class="hidden bg-blue-50/50 border-t border-blue-100 p-4">
            <p class="text-sm text-gray-700 mb-3"><?= e($t['descripcion']) ?></p>
            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div class="text-xs space-y-1">
                    <div><span class="text-gray-500">Correo:</span> <?= e($t['solicitante_email']) ?></div>
                    <div><span class="text-gray-500">Categoría:</span> <?= e($t['categoria_nombre']) ?></div>
                    <div><span class="text-gray-500">Creado:</span> <?= formatDate($t['created_at']) ?></div>
                </div>
                <div>
                    <p class="text-xs font-medium text-gray-600 mb-2">Cambiar estado:</p>
                    <form method="POST" class="flex flex-wrap gap-1">
                        <input type="hidden" name="ticket_id" value="<?= $t['id'] ?>">
                        <?php foreach (['abierto','en_proceso','resuelto','cerrado'] as $s): ?>
                        <button type="submit" name="change_status" value="1" onclick="this.form.new_status.value='<?= $s ?>'" class="px-2 py-1 rounded text-xs <?= $t['estado']===$s?'bg-[#1a3a6c] text-white':'bg-white border border-gray-200 hover:bg-gray-100' ?>">
                            <?= ['abierto'=>'Abierto','en_proceso'=>'En Proceso','resuelto'=>'Resuelto','cerrado'=>'Cerrado'][$s] ?>
                        </button>
                        <?php endforeach; ?>
                        <input type="hidden" name="new_status" value="">
                    </form>
                    <a href="ticket-detail.php?id=<?= $t['id'] ?>" class="inline-block mt-2 px-3 py-1.5 bg-[#1a3a6c] text-white rounded text-xs font-medium hover:bg-blue-900">Ver detalle completo →</a>
                </div>
            </div>
            <form method="POST" class="border-t border-blue-100 pt-3">
                <input type="hidden" name="ticket_id" value="<?= $t['id'] ?>">
                <div class="flex gap-2">
                    <select name="response_type" class="px-2 py-2 border border-gray-300 rounded text-xs">
                        <option value="response">Respuesta</option>
                        <option value="internal_note">Nota Interna</option>
                    </select>
                    <input type="text" name="response" placeholder="Escribir respuesta..." class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm">
                    <button type="submit" name="add_response" class="px-3 py-2 bg-[#1a3a6c] text-white rounded text-sm">Enviar</button>
                </div>
            </form>
            <?php if ($hist): ?>
            <div class="mt-3 pt-3 border-t border-blue-100">
                <p class="text-xs font-medium text-gray-600 mb-2">Últimas acciones:</p>
                <?php foreach ($hist as $h): ?>
                <div class="text-xs p-2 rounded mb-1 <?= $h['tipo']==='internal_note'?'bg-yellow-50':'bg-white' ?>">
                    <?= formatDate($h['created_at'], 'd/m H:i') ?> — <?= e($h['contenido']) ?>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
    <?php endforeach; ?>
    
    <?php if (empty($tickets)): ?>
    <div class="text-center py-12 text-gray-500">No se encontraron tickets</div>
    <?php endif; ?>
</div>

<!-- New Ticket Modal -->
<div id="newTicketModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex items-center justify-between">
            <h2 class="text-lg font-bold">Nuevo Ticket</h2>
            <button onclick="this.closest('#newTicketModal').classList.add('hidden')" class="text-2xl text-gray-400">&times;</button>
        </div>
        <form method="POST" class="p-6 space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
                <input required name="nombre" placeholder="Nombre *" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <input required type="email" name="email" placeholder="Correo *" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <select required name="categoria" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Categoría *</option>
                    <?php foreach ($categories as $c): ?><option value="<?= e($c['nombre']) ?>"><?= e($c['nombre']) ?></option><?php endforeach; ?>
                </select>
                <select required name="prioridad" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
                </select>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <select name="departamento" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Departamento</option>
                    <?php foreach ($departments as $d): ?><option value="<?= $d['id'] ?>"><?= e($d['nombre']) ?></option><?php endforeach; ?>
                </select>
                <select name="ubicacion" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Ubicación</option>
                    <?php foreach ($locations as $l): ?><option value="<?= $l['id'] ?>"><?= e($l['nombre']) ?></option><?php endforeach; ?>
                </select>
            </div>
            <input required name="asunto" placeholder="Asunto *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <textarea required name="descripcion" rows="3" placeholder="Descripción *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            <div class="flex justify-end gap-3">
                <button type="button" onclick="this.closest('#newTicketModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" name="create_ticket" class="px-6 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
