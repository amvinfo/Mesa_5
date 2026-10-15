<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$id = $_GET['id'] ?? 0;
$stmt = $pdo->prepare("SELECT t.*, c.nombre as cat FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.id = ?");
$stmt->execute([$id]);
$ticket = $stmt->fetch();
if (!$ticket) { header('Location: tickets.php'); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['change_status'])) {
        $pdo->prepare("UPDATE tickets SET estado=?, updated_at=NOW(), resolved_at=CASE WHEN ? IN ('resuelto','cerrado') THEN NOW() ELSE resolved_at END WHERE id=?")->execute([$_POST['new_status'],$_POST['new_status'],$id]);
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, 'status_change', ?, ?)")->execute([$id, "Estado: {$_POST['new_status']}", $_SESSION['user_id']]);
        if (in_array($_POST['new_status'], ['resuelto','cerrado'])) addEmailLog($ticket['solicitante_email'], "Ticket {$ticket['ticket_number']} cerrado", 'ticket_closed', 'sent', $id);
        header("Location: ticket-detail.php?id=$id"); exit;
    }
    if (isset($_POST['add_response'])) {
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, ?, ?, ?)")->execute([$id, $_POST['response_type'], $_POST['response'], $_SESSION['user_id']]);
        if ($_POST['response_type'] === 'response') addEmailLog($ticket['solicitante_email'], "Actualización {$ticket['ticket_number']}", 'staff_response', 'sent', $id);
        header("Location: ticket-detail.php?id=$id"); exit;
    }
}

$history = $pdo->prepare("SELECT h.*, u.full_name FROM ticket_historial h LEFT JOIN usuarios u ON h.autor_id = u.id WHERE h.ticket_id = ? ORDER BY h.created_at DESC");
$history->execute([$id]);
$hist = $history->fetchAll();

$pageTitle = '🎫 ' . $ticket['ticket_number']; $current = 'tickets';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<a href="tickets.php" class="text-sm text-gray-600 mb-4 inline-block">← Volver</a>
<div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border">
            <div class="flex items-center gap-3 mb-3"><span class="font-mono font-bold text-[#1a3a6c]"><?= e($ticket['ticket_number']) ?></span><?= getStatusBadge($ticket['estado']) ?><?= getPriorityBadge($ticket['prioridad']) ?></div>
            <h1 class="text-xl font-bold mb-2"><?= e($ticket['asunto']) ?></h1>
            <p class="text-gray-600 text-sm"><?= e($ticket['descripcion']) ?></p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border">
            <form method="POST" class="flex flex-wrap gap-2">
                <input type="hidden" name="new_status" id="ns">
                <?php foreach (['abierto'=>'Abierto','en_proceso'=>'En Proceso','resuelto'=>'Resuelto','cerrado'=>'Cerrado'] as $k=>$v): ?>
                <button type="submit" name="change_status" onclick="document.getElementById('ns').value='<?= $k ?>'" class="px-3 py-1.5 rounded text-xs <?= $ticket['estado']===$k?'bg-[#1a3a6c] text-white':'bg-gray-100 hover:bg-gray-200' ?>"><?= $v ?></button>
                <?php endforeach; ?>
            </form>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border">
            <form method="POST" class="space-y-3">
                <div class="flex gap-2"><button type="button" onclick="document.getElementById('rt').value='response'" class="px-3 py-1.5 rounded text-xs bg-[#1a3a6c] text-white">Respuesta</button><button type="button" onclick="document.getElementById('rt').value='internal_note'" class="px-3 py-1.5 rounded text-xs bg-yellow-500 text-white">Nota Interna</button></div>
                <input type="hidden" name="response_type" id="rt" value="response">
                <textarea name="response" rows="3" placeholder="Escribir..." class="w-full px-3 py-2 border rounded-lg text-sm resize-none"></textarea>
                <div class="flex justify-end"><button type="submit" name="add_response" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Enviar</button></div>
            </form>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border">
            <h3 class="font-semibold mb-4">Historial</h3>
            <?php foreach ($hist as $h): ?>
            <div class="p-3 rounded-lg border-l-4 mb-2 <?= $h['tipo']==='internal_note'?'bg-yellow-50 border-yellow-400':($h['tipo']==='status_change'?'bg-blue-50 border-blue-400':'bg-gray-50 border-gray-300') ?>">
                <div class="flex items-center gap-2 mb-1"><span class="text-xs font-medium text-gray-500"><?= e($h['full_name'] ?? 'Sistema') ?></span><span class="text-xs text-gray-400"><?= formatDate($h['created_at']) ?></span><?php if ($h['tipo']==='internal_note'): ?><span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">NOTA INTERNA</span><?php endif; ?></div>
                <p class="text-sm text-gray-700"><?= nl2br(e($h['contenido'])) ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <div class="bg-white rounded-xl p-5 shadow-sm border h-fit">
        <h3 class="font-semibold text-sm mb-4">Información</h3>
        <dl class="space-y-3 text-sm">
            <div><dt class="text-gray-500">Solicitante</dt><dd class="font-medium"><?= e($ticket['solicitante_nombre']) ?></dd></div>
            <div><dt class="text-gray-500">Correo</dt><dd class="font-medium text-xs"><?= e($ticket['solicitante_email']) ?></dd></div>
            <div><dt class="text-gray-500">Categoría</dt><dd class="font-medium"><?= e($ticket['cat']) ?></dd></div>
            <div><dt class="text-gray-500">Creado</dt><dd class="font-medium"><?= formatDate($ticket['created_at']) ?></dd></div>
        </dl>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
