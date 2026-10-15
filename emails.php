<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$tab = $_GET['tab'] ?? 'logs';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete_log']) && isAdmin()) { $pdo->prepare("DELETE FROM email_logs WHERE id = ?")->execute([$_POST['log_id']]); }
    if (isset($_POST['update_template'])) { $pdo->prepare("UPDATE email_templates SET subject=?, html_content=?, text_content=?, enabled=? WHERE id=?")->execute([$_POST['subject'],$_POST['html'],$_POST['text'],isset($_POST['enabled'])?1:0,$_POST['template_id']]); }
}

$search = $_GET['s'] ?? '';
$filterStatus = $_GET['estado'] ?? '';
$sql = "SELECT * FROM email_logs WHERE 1=1";
$params = [];
if ($search) { $sql .= " AND (to_email LIKE ? OR subject LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }
if ($filterStatus) { $sql .= " AND status = ?"; $params[] = $filterStatus; }
$sql .= " ORDER BY sent_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$logs = $stmt->fetchAll();
$templates = $pdo->query("SELECT * FROM email_templates ORDER BY nombre")->fetchAll();

$pageTitle = '✉️ Registro de Correos'; $current = 'emails';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<h1 class="text-2xl font-bold text-gray-800 mb-1">✉️ Registro de Correos</h1>
<p class="text-gray-500 text-sm mb-6">Historial de correos y plantillas</p>
<div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
    <a href="?tab=logs" class="px-4 py-2 rounded-md text-sm font-medium <?= $tab==='logs'?'bg-white shadow-sm text-[#1a3a6c]':'text-gray-600' ?>">📧 Historial</a>
    <a href="?tab=templates" class="px-4 py-2 rounded-md text-sm font-medium <?= $tab==='templates'?'bg-white shadow-sm text-[#1a3a6c]':'text-gray-600' ?>">📝 Plantillas</a>
</div>
<?php if ($tab === 'logs'): ?>
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <form method="GET" class="flex flex-col md:flex-row gap-3">
        <input type="text" name="s" value="<?= e($search) ?>" placeholder="Buscar..." class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
        <select name="estado" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos</option><option value="sent" <?= $filterStatus==='sent'?'selected':'' ?>>Enviados</option><option value="failed" <?= $filterStatus==='failed'?'selected':'' ?>>Fallidos</option><option value="pending" <?= $filterStatus==='pending'?'selected':'' ?>>Pendientes</option>
        </select>
        <button class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">Filtrar</button>
    </form>
</div>
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Destinatario</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Asunto</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Plantilla</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
            <?php if (isAdmin()): ?><th class="px-4 py-3"></th><?php endif; ?>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
            <?php foreach ($logs as $l): 
                $statusColors = ['sent'=>'bg-green-50 text-green-700','failed'=>'bg-red-50 text-red-700','pending'=>'bg-yellow-50 text-yellow-700'];
                $statusLabels = ['sent'=>'Enviado','failed'=>'Fallido','pending'=>'Pendiente'];
            ?>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs font-medium <?= $statusColors[$l['status']] ?>"><?= $statusLabels[$l['status']] ?></span></td>
                <td class="px-4 py-3 text-gray-700"><?= e($l['to_email']) ?></td>
                <td class="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-[250px]"><?= e($l['subject']) ?></td>
                <td class="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs"><?= e($l['template_key']) ?></td>
                <td class="px-4 py-3 text-gray-500 text-xs"><?= formatDate($l['sent_at']) ?></td>
                <?php if (isAdmin()): ?>
                <td class="px-4 py-3"><form method="POST"><input type="hidden" name="log_id" value="<?= $l['id'] ?>"><button type="submit" name="delete_log" class="text-gray-400 hover:text-red-600">🗑️</button></form></td>
                <?php endif; ?>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php else: ?>
<div class="space-y-4">
    <?php foreach ($templates as $t): ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <details>
            <summary class="flex items-center justify-between cursor-pointer">
                <div><h3 class="font-medium text-gray-800"><?= e($t['nombre']) ?></h3><p class="text-xs text-gray-500">Asunto: <?= e($t['asunto']) ?></p></div>
                <span class="text-xs px-2 py-0.5 rounded <?= $t['enabled']?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500' ?>"><?= $t['enabled']?'Activa':'Inactiva' ?></span>
            </summary>
            <form method="POST" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <input type="hidden" name="template_id" value="<?= $t['id'] ?>">
                <input type="text" name="subject" value="<?= e($t['asunto']) ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <textarea name="html" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none"><?= e($t['html_content']) ?></textarea>
                <textarea name="text" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"><?= e($t['text_content']) ?></textarea>
                <label class="flex items-center gap-2"><input type="checkbox" name="enabled" <?= $t['enabled']?'checked':'' ?> class="rounded"><span class="text-sm">Activa</span></label>
                <button type="submit" name="update_template" class="px-4 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm">Guardar</button>
            </form>
        </details>
    </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
