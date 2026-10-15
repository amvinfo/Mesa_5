<?php
/**
 * Funciones Auxiliares
 */

function e($str) { return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8'); }

function formatDate($date, $format = 'd/m/Y H:i') {
    if (empty($date)) return '';
    return date($format, strtotime($date));
}

function timeAgo($date) {
    $diff = time() - strtotime($date);
    if ($diff < 60) return 'hace ' . $diff . ' segundos';
    if ($diff < 3600) return 'hace ' . floor($diff/60) . ' minutos';
    if ($diff < 86400) return 'hace ' . floor($diff/3600) . ' horas';
    return 'hace ' . floor($diff/86400) . ' días';
}

function generateTicketNumber() {
    $pdo = getDB();
    $year = date('Y');
    $stmt = $pdo->query("SELECT COUNT(*) + 1 as next FROM tickets WHERE YEAR(created_at) = $year");
    $next = $stmt->fetch()['next'];
    return sprintf('TKT-%s-%05d', $year, $next);
}

function getStatusBadge($status) {
    $map = [
        'abierto' => ['Abierto', 'bg-blue-100 text-blue-700'],
        'en_proceso' => ['En Proceso', 'bg-yellow-100 text-yellow-700'],
        'resuelto' => ['Resuelto', 'bg-green-100 text-green-700'],
        'cerrado' => ['Cerrado', 'bg-gray-100 text-gray-700']
    ];
    $data = $map[$status] ?? ['Desconocido', 'bg-gray-100 text-gray-700'];
    return '<span class="px-2.5 py-1 rounded-full text-xs font-medium ' . $data[1] . '">' . $data[0] . '</span>';
}

function getPriorityBadge($priority) {
    $map = [
        'baja' => ['Baja', 'bg-gray-100 text-gray-600'],
        'media' => ['Media', 'bg-blue-100 text-blue-600'],
        'alta' => ['Alta', 'bg-orange-100 text-orange-600'],
        'urgente' => ['Urgente', 'bg-red-100 text-red-600']
    ];
    $data = $map[$priority] ?? ['Media', 'bg-gray-100 text-gray-600'];
    return '<span class="px-2 py-0.5 rounded text-xs font-medium ' . $data[1] . '">' . $data[0] . '</span>';
}

function getKPIs() {
    $pdo = getDB();
    $today = date('Y-m-d');
    
    $total = $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
    $abiertos = $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'abierto'")->fetchColumn();
    $enProceso = $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'en_proceso'")->fetchColumn();
    $resueltos = $pdo->query("SELECT COUNT(*) FROM tickets WHERE estado IN ('resuelto','cerrado')")->fetchColumn();
    $criticos = $pdo->query("SELECT COUNT(*) FROM tickets WHERE prioridad IN ('urgente','alta') AND estado NOT IN ('resuelto','cerrado')")->fetchColumn();
    $sinAsignar = $pdo->query("SELECT COUNT(*) FROM tickets WHERE asignado_a IS NULL AND estado NOT IN ('resuelto','cerrado')")->fetchColumn();
    $creadosHoy = $pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = '$today'")->fetchColumn();
    
    $avg = $pdo->query("SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) FROM tickets WHERE resolved_at IS NOT NULL")->fetchColumn();
    $avgResolution = round($avg ?? 0, 1);
    
    return compact('total', 'abiertos', 'enProceso', 'resueltos', 'criticos', 'sinAsignar', 'creadosHoy', 'avgResolution');
}

function getChartData() {
    $pdo = getDB();
    
    // Por categoría
    $stmt = $pdo->query("SELECT c.nombre, COUNT(t.id) as total FROM tickets t JOIN categorias c ON t.categoria_id = c.id GROUP BY c.id ORDER BY total DESC");
    $byCategory = $stmt->fetchAll();
    
    // Por prioridad
    $stmt = $pdo->query("SELECT prioridad as name, COUNT(*) as value FROM tickets GROUP BY prioridad");
    $byPriority = $stmt->fetchAll();
    
    // Tendencia últimos 7 días
    $trend = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $label = date('d M', strtotime("-$i days"));
        $created = $pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = '$date'")->fetchColumn();
        $resolved = $pdo->query("SELECT COUNT(*) FROM tickets WHERE DATE(resolved_at) = '$date'")->fetchColumn();
        $trend[] = ['date' => $label, 'created' => (int)$created, 'resolved' => (int)$resolved];
    }
    
    return ['byCategory' => $byCategory, 'byPriority' => $byPriority, 'trend' => $trend];
}

function getUnreadNotifications() {
    if (!isLoggedIn()) return 0;
    $pdo = getDB();
    $role = $_SESSION['user_role'];
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notificaciones WHERE `read` = 0 AND (for_role = 'all' OR for_role = ?)");
    $stmt->execute([$role]);
    return $stmt->fetchColumn();
}

function addNotification($type, $title, $message, $forRole = 'all', $ticketId = null) {
    $pdo = getDB();
    $pdo->prepare("INSERT INTO notificaciones (tipo, titulo, mensaje, for_role, ticket_id) VALUES (?, ?, ?, ?, ?)")
        ->execute([$type, $title, $message, $forRole, $ticketId]);
}

function addEmailLog($to, $subject, $template, $status = 'sent', $ticketId = null) {
    $pdo = getDB();
    $pdo->prepare("INSERT INTO email_logs (to_email, subject, template_key, status, ticket_id) VALUES (?, ?, ?, ?, ?)")
        ->execute([$to, $subject, $template, $status, $ticketId]);
}
