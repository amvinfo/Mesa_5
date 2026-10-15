<?php
function e($str) { return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8'); }
function formatDate($date, $format = 'd/m/Y H:i') { return empty($date) ? '' : date($format, strtotime($date)); }
function timeAgo($date) {
    $diff = time() - strtotime($date);
    if ($diff < 60) return 'hace ' . $diff . 's';
    if ($diff < 3600) return 'hace ' . floor($diff/60) . 'm';
    if ($diff < 86400) return 'hace ' . floor($diff/3600) . 'h';
    return 'hace ' . floor($diff/86400) . 'd';
}
function generateTicketNumber() {
    $pdo = getDB();
    $year = date('Y');
    $next = $pdo->query("SELECT COUNT(*) + 1 FROM tickets WHERE YEAR(created_at) = $year")->fetchColumn();
    return sprintf('TKT-%s-%05d', $year, $next);
}
function getStatusBadge($status) {
    $map = ['abierto' => ['Abierto', 'bg-blue-100 text-blue-700'], 'en_proceso' => ['En Proceso', 'bg-yellow-100 text-yellow-700'], 'resuelto' => ['Resuelto', 'bg-green-100 text-green-700'], 'cerrado' => ['Cerrado', 'bg-gray-100 text-gray-700']];
    $d = $map[$status] ?? ['?', 'bg-gray-100'];
    return '<span class="px-2.5 py-1 rounded-full text-xs font-medium ' . $d[1] . '">' . $d[0] . '</span>';
}
function getPriorityBadge($p) {
    $map = ['baja' => ['Baja', 'bg-gray-100 text-gray-600'], 'media' => ['Media', 'bg-blue-100 text-blue-600'], 'alta' => ['Alta', 'bg-orange-100 text-orange-600'], 'urgente' => ['Urgente', 'bg-red-100 text-red-600']];
    $d = $map[$p] ?? ['?', 'bg-gray-100'];
    return '<span class="px-2 py-0.5 rounded text-xs font-medium ' . $d[1] . '">' . $d[0] . '</span>';
}
function getKPIs() {
    $pdo = getDB();
    $today = date('Y-m-d');
    return [
        'total' => $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn(),
        'abiertos' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'abierto'")->fetchColumn(),
        'enProceso' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'en_proceso'")->fetchColumn(),
        'resueltos' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado IN ('resuelto','cerrado')")->fetchColumn(),
        'criticos' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE prioridad IN ('urgente','alta') AND estado NOT IN ('resuelto','cerrado')")->fetchColumn(),
        'sinAsignar' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE asignado_a IS NULL AND estado NOT IN ('resuelto','cerrado')")->fetchColumn(),
        'creadosHoy' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = '$today'")->fetchColumn(),
        'avgResolution' => round($pdo->query("SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) FROM tickets WHERE resolved_at IS NOT NULL")->fetchColumn() ?? 0, 1)
    ];
}
function getChartData() {
    $pdo = getDB();
    $byCategory = $pdo->query("SELECT c.nombre, COUNT(t.id) as total FROM tickets t JOIN categorias c ON t.categoria_id = c.id GROUP BY c.id")->fetchAll();
    $byPriority = $pdo->query("SELECT prioridad as name, COUNT(*) as value FROM tickets GROUP BY prioridad")->fetchAll();
    $trend = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $trend[] = ['date' => date('d M', strtotime("-$i days")), 'created' => (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = '$date'")->fetchColumn(), 'resolved' => (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(resolved_at) = '$date'")->fetchColumn()];
    }
    return compact('byCategory', 'byPriority', 'trend');
}
function getUnreadNotifications() {
    if (!isLoggedIn()) return 0;
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notificaciones WHERE `read` = 0 AND (for_role = 'all' OR for_role = ?)");
    $stmt->execute([$_SESSION['user_role']]);
    return $stmt->fetchColumn();
}
function addEmailLog($to, $subject, $template, $status = 'sent', $ticketId = null) {
    $pdo = getDB();
    $pdo->prepare("INSERT INTO email_logs (to_email, subject, template_key, status, ticket_id) VALUES (?, ?, ?, ?, ?)")->execute([$to, $subject, $template, $status, $ticketId]);
}
