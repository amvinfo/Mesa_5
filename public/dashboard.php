<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$pageTitle = '📊 Resumen';
$current = 'dashboard';
$kpis = getKPIs();
$chartData = getChartData();
$pdo = getDB();
$recent = $pdo->query("SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5")->fetchAll();
$statusData = getTicketsByStatus();
$prefs = getUserPreferences($_SESSION['user_id']);

// Procesar cambios de preferencias
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_prefs'])) {
    $theme = $_POST['theme'] ?? 'light';
    $density = $_POST['density'] ?? 'normal';
    saveUserPreferences($_SESSION['user_id'], $theme, $density);
    $prefs['theme'] = $theme;
    $prefs['table_density'] = $density;
}

$themeClass = $prefs['theme'] === 'dark' ? 'dark' : '';
$densityClass = $prefs['table_density'] === 'compact' ? 'text-xs' : ($prefs['table_density'] === 'comfortable' ? 'text-base' : 'text-sm');

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Panel de Resumen</h1>
        <p class="text-gray-500 text-sm">Indicadores operacionales en tiempo real</p>
    </div>
    <button onclick="document.getElementById('prefsModal').classList.remove('hidden')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
        ⚙️ Personalizar
    </button>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <?php
    $cards = [
        ['TOTAL', $kpis['total'], '🎫', 'bg-blue-50'],
        ['ABIERTOS', $kpis['abiertos'], '📊', 'bg-sky-50'],
        ['EN PROCESO', $kpis['enProceso'], '⏱️', 'bg-yellow-50'],
        ['RESUELTOS', $kpis['resueltos'], '✅', 'bg-green-50'],
        ['CRÍTICOS', $kpis['criticos'], '⚠️', 'bg-red-50'],
        ['SIN ASIGNAR', $kpis['sinAsignar'], '👤', 'bg-orange-50'],
        ['HOY', $kpis['creadosHoy'], '📅', 'bg-purple-50'],
        ['PROM (H)', $kpis['avgResolution'], '⏰', 'bg-indigo-50'],
    ];
    foreach ($cards as $c):
    ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="w-10 h-10 <?= $c[3] ?> rounded-lg flex items-center justify-center mb-3"><span class="text-lg"><?= $c[2] ?></span></div>
        <p class="text-2xl font-bold text-gray-800"><?= $c[1] ?></p>
        <p class="text-xs text-gray-500 font-medium mt-1"><?= $c[0] ?></p>
    </div>
    <?php endforeach; ?>
</div>

<div class="grid lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Por Estado</h3>
        <canvas id="chartStatus" height="220"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Por Categoría</h3>
        <canvas id="chartCat" height="220"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Por Prioridad</h3>
        <canvas id="chartPri" height="220"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Tendencia (7 días)</h3>
        <canvas id="chartTrend" height="220"></canvas>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-4 border-b flex justify-between items-center">
        <h2 class="font-semibold">Tickets Recientes</h2>
        <span class="text-xs text-gray-500">Densidad: <?= $prefs['table_density'] ?></span>
    </div>
    <table class="w-full <?= $densityClass ?>">
        <thead class="bg-gray-50"><tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Nº</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Solicitante</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
            <?php foreach ($recent as $t): ?>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-[#1a3a6c]"><?= htmlspecialchars($t['ticket_number']) ?></td>
                <td class="px-4 py-3 text-gray-600 hidden md:table-cell"><?= htmlspecialchars($t['solicitante_nombre']) ?></td>
                <td class="px-4 py-3 truncate max-w-[200px]"><?= htmlspecialchars($t['asunto']) ?></td>
                <td class="px-4 py-3"><?= getStatusBadge($t['estado']) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Modal de Preferencias -->
<div id="prefsModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="font-bold text-gray-800 mb-4">⚙️ Personalizar Dashboard</h2>
        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tema Visual</label>
                <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="theme" value="light" <?= $prefs['theme']==='light'?'checked':'' ?> class="rounded">
                        <span class="text-sm">☀️ Claro</span>
                    </label>
                    <label class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="theme" value="dark" <?= $prefs['theme']==='dark'?'checked':'' ?> class="rounded">
                        <span class="text-sm">🌙 Oscuro</span>
                    </label>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Densidad de Tablas</label>
                <select name="density" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="compact" <?= $prefs['table_density']==='compact'?'selected':'' ?>>Compacta (más datos)</option>
                    <option value="normal" <?= $prefs['table_density']==='normal'?'selected':'' ?>>Normal</option>
                    <option value="comfortable" <?= $prefs['table_density']==='comfortable'?'selected':'' ?>>Cómoda (menos datos)</option>
                </select>
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <button type="button" onclick="this.closest('#prefsModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" name="save_prefs" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Guardar</button>
            </div>
        </form>
    </div>
</div>

<script>
const colors = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4'];
const statusData = <?= json_encode($statusData) ?>;
const catData = <?= json_encode($chartData['byCategory']) ?>;
const priData = <?= json_encode($chartData['byPriority']) ?>;
const trendData = <?= json_encode($chartData['trend']) ?>;

// Gráfico por Estado
if (statusData.length > 0) new Chart(document.getElementById('chartStatus'), {
    type: 'doughnut',
    data: { 
        labels: statusData.map(d => {
            const labels = {'abierto':'Abiertos','en_proceso':'En Proceso','resuelto':'Resueltos','cerrado':'Cerrados'};
            return labels[d.name] || d.name;
        }), 
        datasets: [{ data: statusData.map(d => d.value), backgroundColor: ['#3b82f6','#f59e0b','#10b981','#6b7280'] }]
    },
    options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
});

if (catData.length > 0) new Chart(document.getElementById('chartCat'), {
    type: 'doughnut', data: { labels: catData.map(d => d.nombre), datasets: [{ data: catData.map(d => d.total), backgroundColor: colors }] },
    options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
});
if (priData.length > 0) new Chart(document.getElementById('chartPri'), {
    type: 'doughnut', data: { labels: priData.map(d => d.name), datasets: [{ data: priData.map(d => d.value), backgroundColor: colors }] },
    options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
});
new Chart(document.getElementById('chartTrend'), {
    type: 'line',
    data: { labels: trendData.map(d => d.date), datasets: [
        { label: 'Creados', data: trendData.map(d => d.created), borderColor: '#3b82f6', tension: 0.3 },
        { label: 'Resueltos', data: trendData.map(d => d.resolved), borderColor: '#10b981', tension: 0.3 }
    ]},
    options: { scales: { y: { beginAtZero: true } } }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
