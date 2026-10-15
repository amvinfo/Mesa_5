<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['create'])) {
        $pdo->prepare("INSERT INTO pizarra_eventos (titulo, contenido, autor_id, color, pinned) VALUES (?, ?, ?, ?, ?)")
            ->execute([$_POST['titulo'], $_POST['contenido'], $_SESSION['user_id'], $_POST['color'] ?? 'blue', isset($_POST['pinned']) ? 1 : 0]);
    }
    if (isset($_POST['delete'])) { $pdo->prepare("DELETE FROM pizarra_eventos WHERE id = ? AND autor_id = ?")->execute([$_POST['post_id'], $_SESSION['user_id']]); }
}
$posts = $pdo->query("SELECT p.*, u.full_name FROM pizarra_eventos p JOIN usuarios u ON p.autor_id = u.id ORDER BY p.pinned DESC, p.created_at DESC")->fetchAll();
$colors = ['blue'=>'border-blue-400 bg-blue-50','yellow'=>'border-yellow-400 bg-yellow-50','green'=>'border-green-400 bg-green-50','purple'=>'border-purple-400 bg-purple-50','red'=>'border-red-400 bg-red-50'];

$pageTitle = '📌 Pizarra de Eventos'; $current = 'board';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div><h1 class="text-2xl font-bold text-gray-800">📌 Pizarra de Eventos</h1><p class="text-gray-500 text-sm mt-1">Espacio colaborativo del equipo</p></div>
    <button onclick="document.getElementById('newPostModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">+ Nueva Publicación</button>
</div>
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    <?php foreach ($posts as $p): ?>
    <div class="rounded-xl border-l-4 p-5 shadow-sm <?= $colors[$p['color']] ?? $colors['blue'] ?>">
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2"><?php if ($p['pinned']): ?><span>📌</span><?php endif; ?><h3 class="font-semibold text-gray-800 text-sm"><?= e($p['titulo']) ?></h3></div>
            <?php if ($p['autor_id'] == $_SESSION['user_id'] || isAdmin()): ?>
            <form method="POST" class="inline"><input type="hidden" name="post_id" value="<?= $p['id'] ?>"><button type="submit" name="delete" class="text-gray-400 hover:text-red-600 text-xs">🗑️</button></form>
            <?php endif; ?>
        </div>
        <p class="text-sm text-gray-700 mb-3 whitespace-pre-line"><?= e($p['contenido']) ?></p>
        <div class="flex items-center justify-between text-xs text-gray-500">
            <span><?= e($p['full_name']) ?></span><span><?= timeAgo($p['created_at']) ?></span>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<div id="newPostModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="font-bold text-gray-800 mb-4">Nueva Publicación</h2>
        <form method="POST" class="space-y-3">
            <input required name="titulo" placeholder="Título *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <textarea required name="contenido" rows="4" placeholder="Contenido *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            <div class="flex gap-2">
                <?php foreach (['blue','yellow','green','purple','red'] as $c): ?>
                <label class="cursor-pointer"><input type="radio" name="color" value="<?= $c ?>" class="hidden peer" <?= $c==='blue'?'checked':'' ?>><span class="w-6 h-6 rounded-full block border-2 peer-checked:scale-125 transition <?= str_replace('border-','bg-',$colors[$c]) ?>"></span></label>
                <?php endforeach; ?>
            </div>
            <label class="flex items-center gap-2"><input type="checkbox" name="pinned" class="rounded"><span class="text-sm">Fijar publicación</span></label>
            <div class="flex justify-end gap-2">
                <button type="button" onclick="this.closest('#newPostModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" name="create" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Publicar</button>
            </div>
        </form>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
