<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$canEdit = isSupervisor();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $canEdit) {
    if (isset($_POST['create'])) {
        $pdo->prepare("INSERT INTO noticias (titulo, contenido, categoria, autor_id, published) VALUES (?, ?, ?, ?, ?)")
            ->execute([$_POST['titulo'], $_POST['contenido'], $_POST['categoria'], $_SESSION['user_id'], isset($_POST['published'])?1:0]);
    }
    if (isset($_POST['delete'])) { $pdo->prepare("DELETE FROM noticias WHERE id = ?")->execute([$_POST['news_id']]); }
}
$news = $pdo->query("SELECT n.*, u.full_name FROM noticias n JOIN usuarios u ON n.autor_id = u.id ORDER BY n.published DESC, n.created_at DESC")->fetchAll();

$pageTitle = '📰 Zona de Noticias'; $current = 'news';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div><h1 class="text-2xl font-bold text-gray-800">📰 Zona de Noticias</h1><p class="text-gray-500 text-sm mt-1">Avisos institucionales</p></div>
    <?php if ($canEdit): ?>
    <button onclick="document.getElementById('newNewsModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">+ Nueva Noticia</button>
    <?php endif; ?>
</div>
<div class="space-y-4">
    <?php foreach ($news as $n): if (!$n['published'] && !$canEdit) continue; ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 <?= !$n['published']?'opacity-60':'' ?>">
        <div class="flex items-start justify-between mb-3">
            <div>
                <span class="text-xs bg-blue-50 text-[#1a3a6c] px-2 py-1 rounded-full"><?= e($n['categoria']) ?></span>
                <?php if (!$n['published']): ?><span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-1">Borrador</span><?php endif; ?>
                <h3 class="text-lg font-semibold text-gray-800 mt-2"><?= e($n['titulo']) ?></h3>
            </div>
            <?php if ($canEdit): ?>
            <form method="POST"><input type="hidden" name="news_id" value="<?= $n['id'] ?>"><button type="submit" name="delete" class="text-gray-400 hover:text-red-600">🗑️</button></form>
            <?php endif; ?>
        </div>
        <p class="text-gray-600 text-sm whitespace-pre-line"><?= e($n['contenido']) ?></p>
        <div class="flex items-center gap-4 mt-4 text-xs text-gray-500"><span>Por <?= e($n['full_name']) ?></span><span><?= formatDate($n['created_at'], 'd M Y') ?></span></div>
    </div>
    <?php endforeach; ?>
</div>
<?php if ($canEdit): ?>
<div id="newNewsModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 class="font-bold text-gray-800 mb-4">Nueva Noticia</h2>
        <form method="POST" class="space-y-3">
            <input required name="titulo" placeholder="Título *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <select name="categoria" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Institucional</option><option>Capacitación</option><option>Seguridad</option><option>Tecnología</option><option>General</option>
            </select>
            <textarea required name="contenido" rows="6" placeholder="Contenido *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            <label class="flex items-center gap-2"><input type="checkbox" name="published" checked class="rounded"><span class="text-sm">Publicar inmediatamente</span></label>
            <div class="flex justify-end gap-2">
                <button type="button" onclick="this.closest('#newNewsModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" name="create" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Publicar</button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
