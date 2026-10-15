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

<!-- KPIs -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <?php
    $cards = [
        ['TOTAL TICKETS', $kpis['total'], '🎫', 'bg-blue-50', 'text-blue-700'],
        ['ABIERTOS', $kpis['abiertos'], '📊', 'bg-sky-50', 'text-sky-700'],
        ['EN PROCESO', $kpis['enProceso'], '⏱️', 'bg-yellow-50', 'text-yellow-700'],
        ['RESUELTOS', $kpis['resueltos'], '✅', 'bg-green-50', 'text-green-700'],
        ['CRÍTICOS', $kpis['criticos'], '⚠️', 'bg-red-50', 'text-red-700'],
        ['SIN ASIGNAR', $kpis['sinAsignar'], '👤', 'bg-orange-50', 'text-orange-700'],
        ['CREADOS HOY', $kpis['creadosHoy'], '📅', 'bg-purple-50', 'text-purple-700'],
        ['PROM. RESOL. (H)', $kpis['avgResolution'], '⏰', 'bg-indigo-50', 'text-indigo-700'],
    ];
    foreach ($cards as $c):
    ?>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 <?= $c[3] ?> rounded-lg flex items-center justify-center"><span class="text-lg"><?= $c[2] ?></span></div>
        </div>
        <p class="text-2xl font-bold text-gray-800"><?= $c[1] ?></p>
        <p class="text-xs text-gray-500 font-medium mt-1"><?= $c[0] ?></p>
    </div>
    <?php endforeach; ?>
</div>

<!-- Charts -->
<div class="grid lg:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Tickets por Categoría</h3>
        <canvas id="chartCategory" height="220"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Tickets por Prioridad</h3>
        <canvas id="chartPriority" height="220"></canvas>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Tendencia (7 días)</h3>
        <canvas id="chartTrend" height="220"></canvas>
    </div>
</div>

<!-- Recent Tickets -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800">Tickets Recientes</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left px-4 py-3 font-medium text-gray-600">Nº</th>
                    <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Solicitante</th>
                    <th class="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
                    <th class="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                <?php foreach ($recent as $t): ?>
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-xs text-[#1a3a6c] font-medium"><?= e($t['ticket_number']) ?></td>
                    <td class="px-4 py-3 text-gray-600 hidden md:table-cell"><?= e($t['solicitante_nombre']) ?></td>
                    <td class="px-4 py-3 text-gray-800 truncate max-w-[200px]"><?= e($t['asunto']) ?></td>
                    <td class="px-4 py-3"><?= getStatusBadge($t['estado']) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
const catData = <?= json_encode($chartData['byCategory']) ?>;
const priData = <?= json_encode($chartData['byPriority']) ?>;
const trendData = <?= json_encode($chartData['trend']) ?>;
const colors = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4'];

if (catData.length > 0) {
    new Chart(document.getElementById('chartCategory'), {
        type: 'doughnut',
        data: { labels: catData.map(d => d.nombre), datasets: [{ data: catData.map(d => d.total), backgroundColor: colors }] },
        options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
}
if (priData.length > 0) {
    new Chart(document.getElementById('chartPriority'), {
        type: 'doughnut',
        data: { labels: priData.map(d => d.name), datasets: [{ data: priData.map(d => d.value), backgroundColor: colors }] },
        options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
}
new Chart(document.getElementById('chartTrend'), {
    type: 'line',
    data: {
        labels: trendData.map(d => d.date),
        datasets: [
            { label: 'Creados', data: trendData.map(d => d.created), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.3 },
            { label: 'Resueltos', data: trendData.map(d => d.resolved), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3 }
        ]
    },
    options: { plugins: { legend: { labels: { font: { size: 10 } } } }, scales: { y: { beginAtZero: true } } }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
