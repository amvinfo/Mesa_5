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

// Enviar correo de notificación a soporte central al crear ticket
function notifySupportCenter($ticketData) {
    $pdo = getDB();
    $config = [];
    $stmt = $pdo->query("SELECT clave, valor FROM configuracion WHERE clave = 'support_email'");
    $row = $stmt->fetch();
    $supportEmail = $row ? $row['valor'] : 'soporte@gob.cl';
    
    // Registrar en log de correos
    addEmailLog(
        $supportEmail,
        "Nuevo ticket creado: {$ticketData['ticket_number']}",
        'new_ticket_support',
        'sent',
        $ticketData['id'] ?? null
    );
    
    // Crear notificación interna para supervisores
    $pdo->prepare("INSERT INTO notificaciones (tipo, titulo, mensaje, for_role, ticket_id) VALUES (?, ?, ?, ?, ?)")
        ->execute(['system', 'Nuevo ticket sin asignar', "Ticket {$ticketData['ticket_number']} requiere atención", 'supervisor', $ticketData['id'] ?? null]);
}

// Verificar si el técnico puede ver el ticket (regla de visibilidad)
function canTechnicianViewTicket($ticketId, $userId) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT asignado_a FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();
    
    // Técnicos solo ven tickets asignados a ellos
    return $ticket && $ticket['asignado_a'] == $userId;
}

// Obtener tickets visibles según rol
function getVisibleTickets($userId, $role) {
    $pdo = getDB();
    
    if ($role === 'tecnico') {
        // Técnicos solo ven sus tickets asignados
        $stmt = $pdo->prepare("SELECT t.*, c.nombre as categoria_nombre FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.asignado_a = ? ORDER BY t.created_at DESC");
        $stmt->execute([$userId]);
    } else {
        // Supervisores y Admins ven todos los tickets
        $stmt = $pdo->query("SELECT t.*, c.nombre as categoria_nombre FROM tickets t LEFT JOIN categorias c ON t.categoria_id = c.id ORDER BY t.created_at DESC");
    }
    
    return $stmt->fetchAll();
}

// Obtener preferencias de usuario
function getUserPreferences($userId) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM user_preferences WHERE user_id = ?");
    $stmt->execute([$userId]);
    $prefs = $stmt->fetch();
    
    return $prefs ?: [
        'theme' => 'light',
        'table_density' => 'normal',
        'dashboard_layout' => null
    ];
}

// Guardar preferencias de usuario
function saveUserPreferences($userId, $theme, $density, $layout = null) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT id FROM user_preferences WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    if ($stmt->fetch()) {
        $pdo->prepare("UPDATE user_preferences SET theme = ?, table_density = ?, dashboard_layout = ? WHERE user_id = ?")
            ->execute([$theme, $density, $layout, $userId]);
    } else {
        $pdo->prepare("INSERT INTO user_preferences (user_id, theme, table_density, dashboard_layout) VALUES (?, ?, ?, ?)")
            ->execute([$userId, $theme, $density, $layout]);
    }
}

// Validar contraseña según políticas
function validatePassword($password) {
    $pdo = getDB();
    $config = [];
    $stmt = $pdo->query("SELECT clave, valor FROM configuracion WHERE clave IN ('password_min_length', 'password_require_uppercase', 'password_require_numbers', 'password_require_special')");
    while ($row = $stmt->fetch()) {
        $config[$row['clave']] = $row['valor'];
    }
    
    $minLength = $config['password_min_length'] ?? 8;
    $requireUpper = $config['password_require_uppercase'] ?? 1;
    $requireNumbers = $config['password_require_numbers'] ?? 1;
    $requireSpecial = $config['password_require_special'] ?? 0;
    
    if (strlen($password) < $minLength) {
        return "La contraseña debe tener al menos $minLength caracteres";
    }
    
    if ($requireUpper && !preg_match('/[A-Z]/', $password)) {
        return "La contraseña debe contener al menos una letra mayúscula";
    }
    
    if ($requireNumbers && !preg_match('/[0-9]/', $password)) {
        return "La contraseña debe contener al menos un número";
    }
    
    if ($requireSpecial && !preg_match('/[^A-Za-z0-9]/', $password)) {
        return "La contraseña debe contener al menos un carácter especial";
    }
    
    return true;
}

// Obtener gráfico de tickets por estado
function getTicketsByStatus() {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT estado as name, COUNT(*) as value FROM tickets GROUP BY estado");
    return $stmt->fetchAll();
}
