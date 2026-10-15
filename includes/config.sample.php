<?php
/**
 * Configuración por defecto (se sobrescribe en instalación)
 */
if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'helpdesk_gobcl');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_CHARSET', 'utf8mb4');
    define('SITE_URL', 'http://localhost');
    define('SITE_PATH', __DIR__ . '/..');
    define('TIMEZONE', 'America/Santiago');
    date_default_timezone_set(TIMEZONE);
}
