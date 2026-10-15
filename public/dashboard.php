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

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<h1 class="text-2xl font-bold text-gray-800 mb-1">Panel de Resumen</h1>
<p class="text-gray-500 text-sm mb-6">Indicadores operacionales en tiempo real</p>

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

<div class="grid lg:grid-cols-3 gap-6 mb-8">
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
    <div class="p-4 border-b"><h2 class="font-semibold">Tickets Recientes</h2></div>
    <table class="w-full text-sm">
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

<script>
const colors = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4'];
const catData = <?= json_encode($chartData['byCategory']) ?>;
const priData = <?= json_encode($chartData['byPriority']) ?>;
const trendData = <?= json_encode($chartData['trend']) ?>;

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
