<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$tab = $_GET['tab'] ?? 'external';
$search = $_GET['s'] ?? '';
$catFilter = $_GET['cat'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['create'])) {
        $catId = $pdo->prepare("SELECT id FROM categorias WHERE nombre = ?");
        $catId->execute([$_POST['categoria']]);
        $cid = $catId->fetch()['id'] ?? 1;
        $pdo->prepare("INSERT INTO articulos_conocimiento (titulo, resumen, contenido, categoria_id, visibilidad, estado, destacado, autor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$_POST['titulo'],$_POST['resumen'],$_POST['contenido'],$cid,$_POST['visibilidad'],$_POST['estado'],isset($_POST['destacado'])?1:0,$_SESSION['user_id']]);
    }
    if (isset($_POST['delete'])) { $pdo->prepare("DELETE FROM articulos_conocimiento WHERE id = ?")->execute([$_POST['article_id']]); }
}

$sql = "SELECT a.*, c.nombre as cat_nombre FROM articulos_conocimiento a JOIN categorias c ON a.categoria_id = c.id WHERE a.estado = 'published'";
if ($tab === 'internal') $sql .= " AND a.visibilidad IN ('internal', 'both')";
else $sql .= " AND a.visibilidad IN ('external', 'both')";
if ($search) { $sql .= " AND (a.titulo LIKE ? OR a.resumen LIKE ?)"; }
if ($catFilter) { $sql .= " AND c.nombre = ?"; }
$sql .= " ORDER BY a.destacado DESC, a.created_at DESC";
$stmt = $pdo->prepare($sql);
$params = [];
if ($search) { $params[] = "%$search%"; $params[] = "%$search%"; }
if ($catFilter) { $params[] = $catFilter; }
$stmt->execute($params);
$articles = $stmt->fetchAll();
$categories = $pdo->query("SELECT * FROM categorias WHERE active = 1")->fetchAll();

$pageTitle = '📚 Base de Conocimiento'; $current = 'knowledge';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
    <div><h1 class="text-2xl font-bold text-gray-800">📚 Base de Conocimiento</h1><p class="text-gray-500 text-sm mt-1">Artículos y guías de ayuda</p></div>
    <button onclick="document.getElementById('newArticleModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">+ Nuevo Artículo</button>
</div>
<div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
    <a href="?tab=external" class="px-4 py-2 rounded-md text-sm font-medium <?= $tab==='external'?'bg-white shadow-sm text-[#1a3a6c]':'text-gray-600' ?>">🌐 Externa</a>
    <a href="?tab=internal" class="px-4 py-2 rounded-md text-sm font-medium <?= $tab==='internal'?'bg-white shadow-sm text-[#1a3a6c]':'text-gray-600' ?>">🔒 Interna</a>
</div>
<form method="GET" class="flex flex-col sm:flex-row gap-3 mb-6">
    <input type="hidden" name="tab" value="<?= e($tab) ?>">
    <input type="text" name="s" value="<?= e($search) ?>" placeholder="Buscar artículos..." class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm">
    <select name="cat" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"><option value="">Todas las categorías</option><?php foreach ($categories as $c): ?><option value="<?= e($c['nombre']) ?>" <?= $catFilter===$c['nombre']?'selected':'' ?>><?= e($c['nombre']) ?></option><?php endforeach; ?></select>
    <button class="bg-[#1a3a6c] text-white px-4 py-2.5 rounded-lg text-sm">Buscar</button>
</form>
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    <?php foreach ($articles as $a): ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div class="flex items-start justify-between mb-3">
            <span class="text-xs bg-blue-50 text-[#1a3a6c] px-2 py-1 rounded-full font-medium"><?= e($a['cat_nombre']) ?></span>
            <form method="POST"><input type="hidden" name="article_id" value="<?= $a['id'] ?>"><button type="submit" name="delete" class="text-gray-400 hover:text-red-600">🗑️</button></form>
        </div>
        <h3 class="font-semibold text-gray-800 mb-2"><?= e($a['titulo']) ?></h3>
        <p class="text-sm text-gray-500 mb-3"><?= e($a['resumen']) ?></p>
        <div class="flex items-center justify-between">
            <span class="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">Publicado</span>
            <?php if ($a['destacado']): ?><span class="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">⭐ Destacado</span><?php endif; ?>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<?php if (empty($articles)): ?><div class="text-center py-12 text-gray-500 bg-white rounded-xl border">📚 No se encontraron artículos</div><?php endif; ?>

<div id="newArticleModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 class="font-bold text-gray-800 mb-4">Nuevo Artículo</h2>
        <form method="POST" class="space-y-3">
            <input required name="titulo" placeholder="Título *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <input required name="resumen" placeholder="Resumen *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <textarea required name="contenido" rows="6" placeholder="Contenido (HTML soportado) *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none"></textarea>
            <div class="grid md:grid-cols-2 gap-3">
                <select required name="categoria" class="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Categoría *</option><?php foreach ($categories as $c): ?><option value="<?= e($c['nombre']) ?>"><?= e($c['nombre']) ?></option><?php endforeach; ?></select>
                <select name="visibilidad" class="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="both">Ambas</option><option value="external">Solo Externa</option><option value="internal">Solo Interna</option></select>
            </div>
            <div class="grid md:grid-cols-2 gap-3">
                <select name="estado" class="px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="published">Publicado</option><option value="draft">Borrador</option></select>
                <label class="flex items-center gap-2"><input type="checkbox" name="destacado" class="rounded"><span class="text-sm">Artículo destacado</span></label>
            </div>
            <div class="flex justify-end gap-2 pt-3">
                <button type="button" onclick="this.closest('#newArticleModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" name="create" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button>
            </div>
        </form>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
