<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$role = $_SESSION['user_role'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['mark_read'])) { $pdo->prepare("UPDATE notificaciones SET `read` = 1 WHERE id = ?")->execute([$_POST['notif_id']]); }
    if (isset($_POST['mark_all'])) { $pdo->prepare("UPDATE notificaciones SET `read` = 1 WHERE for_role = 'all' OR for_role = ?")->execute([$role]); }
    if (isset($_POST['delete']) && isAdmin()) { $pdo->prepare("DELETE FROM notificaciones WHERE id = ?")->execute([$_POST['notif_id']]); }
}
$notifs = $pdo->prepare("SELECT * FROM notificaciones WHERE for_role = 'all' OR for_role = ? ORDER BY created_at DESC");
$notifs->execute([$role]);
$notifs = $notifs->fetchAll();
$unread = count(array_filter($notifs, fn($n) => !$n['read']));

$pageTitle = '🔔 Notificaciones'; $current = 'notifications';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div><h1 class="text-2xl font-bold text-gray-800">🔔 Notificaciones</h1><p class="text-gray-500 text-sm mt-1"><?= $unread ?> sin leer</p></div>
    <?php if ($unread > 0): ?>
    <form method="POST"><button type="submit" name="mark_all" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">✓ Marcar todas como leídas</button></form>
    <?php endif; ?>
</div>
<div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
    <?php if (empty($notifs)): ?>
    <div class="text-center py-12 text-gray-500">🔔 No hay notificaciones</div>
    <?php else: foreach ($notifs as $n): ?>
    <div class="p-4 flex items-start gap-3 <?= !$n['read']?'bg-blue-50/30':'' ?>">
        <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <?php $icons = ['ticket_update'=>'🎫','ticket_assigned'=>'👤','ticket_closed'=>'✅','system'=>'ℹ️','mention'=>'@']; ?>
            <span><?= $icons[$n['tipo']] ?? '🔔' ?></span>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
                <span class="text-sm font-medium <?= !$n['read']?'text-gray-900':'text-gray-700' ?>"><?= e($n['titulo']) ?></span>
                <?php if (!$n['read']): ?><span class="w-2 h-2 rounded-full bg-[#d4272e]"></span><?php endif; ?>
            </div>
            <p class="text-sm text-gray-600"><?= e($n['mensaje']) ?></p>
            <p class="text-xs text-gray-400 mt-1"><?= timeAgo($n['created_at']) ?></p>
        </div>
        <div class="flex items-center gap-1">
            <?php if (!$n['read']): ?>
            <form method="POST"><input type="hidden" name="notif_id" value="<?= $n['id'] ?>"><button type="submit" name="mark_read" class="p-1.5 text-gray-400 hover:text-green-600">✓</button></form>
            <?php endif; ?>
            <?php if (isAdmin()): ?>
            <form method="POST"><input type="hidden" name="notif_id" value="<?= $n['id'] ?>"><button type="submit" name="delete" class="p-1.5 text-gray-400 hover:text-red-600">🗑️</button></form>
            <?php endif; ?>
        </div>
    </div>
    <?php endforeach; endif; ?>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
