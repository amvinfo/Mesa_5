<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$pageTitle = '🎫 Tickets'; $current = 'tickets';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['change_status'])) {
        $pdo->prepare("UPDATE tickets SET estado=?, updated_at=NOW(), resolved_at=CASE WHEN ? IN ('resuelto','cerrado') THEN NOW() ELSE resolved_at END WHERE id=?")->execute([$_POST['new_status'],$_POST['new_status'],$_POST['ticket_id']]);
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, 'status_change', ?, ?)")->execute([$_POST['ticket_id'], "Estado: {$_POST['new_status']}", $_SESSION['user_id']]);
    }
    if (isset($_POST['add_response'])) {
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, ?, ?, ?)")->execute([$_POST['ticket_id'], $_POST['response_type'], $_POST['response'], $_SESSION['user_id']]);
        if ($_POST['response_type'] === 'response') {
            $t = $pdo->prepare("SELECT * FROM tickets WHERE id = ?"); $t->execute([$_POST['ticket_id']]); $t = $t->fetch();
            addEmailLog($t['solicitante_email'], "Actualización {$t['ticket_number']}", 'staff_response', 'sent', $_POST['ticket_id']);
        }
    }
    if (isset($_POST['create_ticket'])) {
        $tn = generateTicketNumber();
        $catId = $pdo->prepare("SELECT id FROM categorias WHERE nombre = ?"); $catId->execute([$_POST['categoria']]); $cid = $catId->fetch()['id'] ?? 1;
        $tipoId = $pdo->query("SELECT id FROM tipos_ticket LIMIT 1")->fetch()['id'];
        $pdo->prepare("INSERT INTO tickets (ticket_number, asunto, descripcion, solicitante_nombre, solicitante_email, categoria_id, prioridad, estado, tipo_ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto', ?)")->execute([$tn, $_POST['asunto'], $_POST['descripcion'], $_POST['nombre'], $_POST['email'], $cid, $_POST['prioridad'], $tipoId]);
    }
}

$search = $_GET['s'] ?? ''; $fStatus = $_GET['estado'] ?? ''; $fPri = $_GET['prioridad'] ?? '';
$sql = "SELECT t.*, c.nombre as cat FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE 1=1"; $params = [];
if ($search) { $sql .= " AND (t.ticket_number LIKE ? OR t.solicitante_nombre LIKE ? OR t.asunto LIKE ?)"; $params = array_fill(0, 3, "%$search%"); }
if ($fStatus) { $sql .= " AND t.estado = ?"; $params[] = $fStatus; }
if ($fPri) { $sql .= " AND t.prioridad = ?"; $params[] = $fPri; }
$sql .= " ORDER BY t.created_at DESC";
$stmt = $pdo->prepare($sql); $stmt->execute($params); $tickets = $stmt->fetchAll();
$categories = $pdo->query("SELECT * FROM categorias WHERE active = 1")->fetchAll();

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<div class="flex justify-between mb-6"><div><h1 class="text-2xl font-bold">🎫 Gestión de Tickets</h1><p class="text-gray-500 text-sm"><?= count($tickets) ?> ticket(s)</p></div>
<button onclick="document.getElementById('newModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">+ Nuevo</button></div>

<form method="GET" class="bg-white rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
    <input type="text" name="s" value="<?= e($search) ?>" placeholder="Buscar..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
    <select name="estado" class="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Todos</option><option value="abierto" <?= $fStatus==='abierto'?'selected':'' ?>>Abierto</option><option value="en_proceso" <?= $fStatus==='en_proceso'?'selected':'' ?>>En Proceso</option><option value="resuelto" <?= $fStatus==='resuelto'?'selected':'' ?>>Resuelto</option><option value="cerrado" <?= $fStatus==='cerrado'?'selected':'' ?>>Cerrado</option></select>
    <select name="prioridad" class="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Todas</option><option value="baja" <?= $fPri==='baja'?'selected':'' ?>>Baja</option><option value="media" <?= $fPri==='media'?'selected':'' ?>>Media</option><option value="alta" <?= $fPri==='alta'?'selected':'' ?>>Alta</option><option value="urgente" <?= $fPri==='urgente'?'selected':'' ?>>Urgente</option></select>
    <button class="bg-[#1a3a6c] text-white px-4 py-2 rounded-lg text-sm">Filtrar</button>
</form>

<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
    <?php foreach ($tickets as $t): ?>
    <div class="border-b">
        <div onclick="this.nextElementSibling.classList.toggle('hidden')" class="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer">
            <span class="text-gray-400">▼</span>
            <span class="font-mono text-xs text-[#1a3a6c] w-32"><?= e($t['ticket_number']) ?></span>
            <span class="hidden md:block text-gray-600 w-40 truncate"><?= e($t['solicitante_nombre']) ?></span>
            <span class="flex-1 truncate"><?= e($t['asunto']) ?></span>
            <span class="hidden sm:block"><?= getPriorityBadge($t['prioridad']) ?></span>
            <span><?= getStatusBadge($t['estado']) ?></span>
        </div>
        <div class="hidden bg-blue-50/50 p-4">
            <p class="text-sm mb-3"><?= e($t['descripcion']) ?></p>
            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div class="text-xs space-y-1"><div><span class="text-gray-500">Correo:</span> <?= e($t['solicitante_email']) ?></div><div><span class="text-gray-500">Categoría:</span> <?= e($t['cat']) ?></div><div><span class="text-gray-500">Creado:</span> <?= formatDate($t['created_at']) ?></div></div>
                <div><p class="text-xs font-medium mb-2">Estado:</p>
                <form method="POST" class="flex flex-wrap gap-1"><input type="hidden" name="ticket_id" value="<?= $t['id'] ?>"><input type="hidden" name="new_status" id="ns<?= $t['id'] ?>">
                <?php foreach (['abierto','en_proceso','resuelto','cerrado'] as $s): ?><button type="submit" name="change_status" onclick="document.getElementById('ns<?= $t['id'] ?>').value='<?= $s ?>'" class="px-2 py-1 rounded text-xs <?= $t['estado']===$s?'bg-[#1a3a6c] text-white':'bg-white border hover:bg-gray-100' ?>"><?= ucfirst(str_replace('_',' ',$s)) ?></button><?php endforeach; ?>
                </form><a href="ticket-detail.php?id=<?= $t['id'] ?>" class="inline-block mt-2 px-3 py-1.5 bg-[#1a3a6c] text-white rounded text-xs">Ver detalle →</a></div>
            </div>
            <form method="POST" class="border-t pt-3"><input type="hidden" name="ticket_id" value="<?= $t['id'] ?>">
            <div class="flex gap-2"><select name="response_type" class="px-2 py-2 border rounded text-xs"><option value="response">Respuesta</option><option value="internal_note">Nota Interna</option></select>
            <input type="text" name="response" placeholder="Escribir..." class="flex-1 px-3 py-2 border rounded text-sm">
            <button type="submit" name="add_response" class="px-3 py-2 bg-[#1a3a6c] text-white rounded text-sm">Enviar</button></div></form>
        </div>
    </div>
    <?php endforeach; ?>
    <?php if (empty($tickets)): ?><div class="text-center py-12 text-gray-500">No hay tickets</div><?php endif; ?>
</div>

<div id="newModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
        <h2 class="font-bold mb-4">Nuevo Ticket</h2>
        <form method="POST" class="space-y-3">
            <div class="grid md:grid-cols-2 gap-3"><input required name="nombre" placeholder="Nombre *" class="px-3 py-2 border rounded-lg text-sm"><input required type="email" name="email" placeholder="Correo *" class="px-3 py-2 border rounded-lg text-sm"></div>
            <div class="grid md:grid-cols-2 gap-3"><select required name="categoria" class="px-3 py-2 border rounded-lg text-sm"><option value="">Categoría *</option><?php foreach ($categories as $c): ?><option value="<?= e($c['nombre']) ?>"><?= e($c['nombre']) ?></option><?php endforeach; ?></select><select required name="prioridad" class="px-3 py-2 border rounded-lg text-sm"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
            <input required name="asunto" placeholder="Asunto *" class="w-full px-3 py-2 border rounded-lg text-sm">
            <textarea required name="descripcion" rows="3" placeholder="Descripción *" class="w-full px-3 py-2 border rounded-lg text-sm resize-none"></textarea>
            <div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#newModal').classList.add('hidden')" class="px-4 py-2 border rounded-lg text-sm">Cancelar</button><button type="submit" name="create_ticket" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div>
        </form>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
