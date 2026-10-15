<?php
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
} else {
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'helpdesk_gobcl');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_CHARSET', 'utf8mb4');
    define('SITE_URL', 'http://localhost');
    define('SITE_PATH', dirname(__DIR__));
    define('TIMEZONE', 'America/Santiago');
    date_default_timezone_set(TIMEZONE);
    if (session_status() === PHP_SESSION_NONE) session_start();
}
