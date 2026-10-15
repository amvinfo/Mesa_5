<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$id = $_GET['id'] ?? 0;
$pdo = getDB();
$stmt = $pdo->prepare("SELECT t.*, c.nombre as categoria_nombre FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.id = ?");
$stmt->execute([$id]);
$ticket = $stmt->fetch();
if (!$ticket) { header('Location: tickets.php'); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['change_status'])) {
        $ns = $_POST['new_status'];
        $pdo->prepare("UPDATE tickets SET estado=?, updated_at=NOW(), resolved_at=CASE WHEN ? IN ('resuelto','cerrado') THEN NOW() ELSE resolved_at END WHERE id=?")->execute([$ns, $ns, $id]);
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, 'status_change', ?, ?)")->execute([$id, "Estado cambiado a $ns", $_SESSION['user_id']]);
        if ($ns === 'resuelto' || $ns === 'cerrado') {
            addEmailLog($ticket['solicitante_email'], "Su ticket {$ticket['ticket_number']} ha sido cerrado", 'ticket_closed', 'sent', $id);
        }
        header("Location: ticket-detail.php?id=$id"); exit;
    }
    if (isset($_POST['assign'])) {
        $pdo->prepare("UPDATE tickets SET asignado_a=?, estado=CASE WHEN estado='abierto' THEN 'en_proceso' ELSE estado END, updated_at=NOW() WHERE id=?")->execute([$_POST['user_id'] ?: null, $id]);
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, 'assignment', ?, ?)")->execute([$id, "Ticket asignado", $_SESSION['user_id']]);
        header("Location: ticket-detail.php?id=$id"); exit;
    }
    if (isset($_POST['add_response'])) {
        $pdo->prepare("INSERT INTO ticket_historial (ticket_id, tipo, contenido, autor_id) VALUES (?, ?, ?, ?)")->execute([$id, $_POST['response_type'], $_POST['response'], $_SESSION['user_id']]);
        $pdo->prepare("UPDATE tickets SET updated_at=NOW() WHERE id=?")->execute([$id]);
        if ($_POST['response_type'] === 'response') {
            addEmailLog($ticket['solicitante_email'], "Actualización de su ticket {$ticket['ticket_number']}", 'staff_response', 'sent', $id);
        }
        header("Location: ticket-detail.php?id=$id"); exit;
    }
}

$history = $pdo->prepare("SELECT h.*, u.full_name as autor_nombre FROM ticket_historial h LEFT JOIN usuarios u ON h.autor_id = u.id WHERE h.ticket_id = ? ORDER BY h.created_at DESC");
$history->execute([$id]);
$hist = $history->fetchAll();
$users = $pdo->query("SELECT id, full_name FROM usuarios WHERE active = 1 AND role IN ('tecnico','supervisor')")->fetchAll();

$pageTitle = '🎫 ' . $ticket['ticket_number'];
$current = 'tickets';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<a href="tickets.php" class="text-sm text-gray-600 hover:text-gray-800 mb-4 inline-block">← Volver a la lista</a>

<div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex flex-wrap items-center gap-3 mb-3">
                <span class="font-mono font-bold text-[#1a3a6c]"><?= e($ticket['ticket_number']) ?></span>
                <?= getStatusBadge($ticket['estado']) ?>
                <?= getPriorityBadge($ticket['prioridad']) ?>
            </div>
            <h1 class="text-xl font-bold text-gray-800 mb-2"><?= e($ticket['asunto']) ?></h1>
            <p class="text-gray-600 text-sm"><?= e($ticket['descripcion']) ?></p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div class="flex flex-wrap items-center gap-3">
                <form method="POST" class="flex items-center gap-2">
                    <input type="hidden" name="new_status" id="newStatus">
                    <?php foreach (['abierto'=>'Abierto','en_proceso'=>'En Proceso','resuelto'=>'Resuelto','cerrado'=>'Cerrado'] as $k=>$v): ?>
                    <button type="submit" name="change_status" onclick="document.getElementById('newStatus').value='<?= $k ?>'" class="px-3 py-1.5 rounded text-xs <?= $ticket['estado']===$k?'bg-[#1a3a6c] text-white':'bg-gray-100 hover:bg-gray-200 text-gray-700' ?>"><?= $v ?></button>
                    <?php endforeach; ?>
                </form>
                <form method="POST" class="flex items-center gap-2">
                    <select name="user_id" class="px-2 py-1.5 border border-gray-300 rounded text-xs">
                        <option value="">Asignar a...</option>
                        <?php foreach ($users as $u): ?><option value="<?= $u['id'] ?>"><?= e($u['full_name']) ?></option><?php endforeach; ?>
                    </select>
                    <button type="submit" name="assign" class="px-3 py-1.5 bg-purple-600 text-white rounded text-xs">Asignar</button>
                </form>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form method="POST" class="space-y-3">
                <div class="flex gap-2">
                    <button type="button" onclick="document.getElementById('rtype').value='response'" class="px-3 py-1.5 rounded text-xs bg-[#1a3a6c] text-white">Respuesta Pública</button>
                    <button type="button" onclick="document.getElementById('rtype').value='internal_note'" class="px-3 py-1.5 rounded text-xs bg-yellow-500 text-white">Nota Interna</button>
                </div>
                <input type="hidden" name="response_type" id="rtype" value="response">
                <textarea name="response" rows="3" placeholder="Escriba su respuesta..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
                <div class="flex justify-end">
                    <button type="submit" name="add_response" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Enviar</button>
                </div>
            </form>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Historial</h3>
            <?php if (empty($hist)): ?>
                <p class="text-gray-500 text-sm text-center py-4">Sin historial</p>
            <?php else: foreach ($hist as $h): ?>
                <div class="p-3 rounded-lg border-l-4 mb-2 <?= $h['tipo']==='internal_note'?'bg-yellow-50 border-yellow-400':($h['tipo']==='status_change'?'bg-blue-50 border-blue-400':'bg-gray-50 border-gray-300') ?>">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium text-gray-500"><?= e($h['autor_nombre'] ?? 'Sistema') ?></span>
                        <span class="text-xs text-gray-400"><?= formatDate($h['created_at']) ?></span>
                        <?php if ($h['tipo']==='internal_note'): ?><span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">NOTA INTERNA</span><?php endif; ?>
                    </div>
                    <p class="text-sm text-gray-700"><?= nl2br(e($h['contenido'])) ?></p>
                </div>
            <?php endforeach; endif; ?>
        </div>
    </div>

    <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800 mb-4 text-sm">Información del Ticket</h3>
            <dl class="space-y-3 text-sm">
                <div><dt class="text-gray-500">Solicitante</dt><dd class="font-medium"><?= e($ticket['solicitante_nombre']) ?></dd></div>
                <div><dt class="text-gray-500">Correo</dt><dd class="font-medium text-xs"><?= e($ticket['solicitante_email']) ?></dd></div>
                <div><dt class="text-gray-500">Categoría</dt><dd class="font-medium"><?= e($ticket['categoria_nombre']) ?></dd></div>
                <div><dt class="text-gray-500">Creado</dt><dd class="font-medium"><?= formatDate($ticket['created_at']) ?></dd></div>
                <?php if ($ticket['resolved_at']): ?><div><dt class="text-gray-500">Resuelto</dt><dd class="font-medium text-green-700"><?= formatDate($ticket['resolved_at']) ?></dd></div><?php endif; ?>
            </dl>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
