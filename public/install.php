<?php
/**
 * ============================================
 * INSTALADOR - MESA DE AYUDA GOBIERNO DE CHILE
 * Versión 2.0
 * ============================================
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$errors = [];
$success = [];

function checkRequirements() {
    $reqs = [];
    $reqs['PHP Version (7.4+)'] = version_compare(PHP_VERSION, '7.4.0', '>=');
    $reqs['PDO Extension'] = extension_loaded('pdo');
    $reqs['PDO MySQL'] = extension_loaded('pdo_mysql');
    $reqs['JSON Extension'] = extension_loaded('json');
    $reqs['MBString Extension'] = extension_loaded('mbstring');
    $reqs['Writable Directory'] = is_writable(__DIR__);
    return $reqs;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $step === 3) {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? 'helpdesk_gobcl');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');
    $site_url = rtrim(trim($_POST['site_url'] ?? ''), '/');
    $admin_pass = trim($_POST['admin_pass'] ?? 'admin123');
    
    if (empty($db_user)) $errors[] = 'El usuario de BD es obligatorio';
    if (empty($site_url)) $site_url = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . dirname($_SERVER['SCRIPT_NAME']);
    
    if (empty($errors)) {
        try {
            $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$db_name`");
            
            $sql = file_get_contents(__DIR__ . '/database.sql');
            $sql = preg_replace('/CREATE DATABASE.*?;/s', '', $sql);
            $sql = preg_replace('/USE.*?;/s', '', $sql);
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            foreach ($statements as $stmt) {
                if (!empty($stmt) && !preg_match('/^--/', $stmt)) {
                    try { $pdo->exec($stmt); } catch (Exception $e) {}
                }
            }
            
            $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'admin'")->execute([$hash]);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'supervisor'")->execute([password_hash($admin_pass, PASSWORD_DEFAULT)]);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'tecnico'")->execute([password_hash($admin_pass, PASSWORD_DEFAULT)]);
            
            $dirs = ['includes', 'api', 'assets/css', 'assets/js', 'assets/img', 'uploads'];
            foreach ($dirs as $dir) { if (!is_dir(__DIR__ . '/' . $dir)) mkdir(__DIR__ . '/' . $dir, 0755, true); }
            
            $config = "<?php\n// Configuración - " . date('Y-m-d H:i:s') . "\n";
            $config .= "define('DB_HOST', " . var_export($db_host, true) . ");\n";
            $config .= "define('DB_NAME', " . var_export($db_name, true) . ");\n";
            $config .= "define('DB_USER', " . var_export($db_user, true) . ");\n";
            $config .= "define('DB_PASS', " . var_export($db_pass, true) . ");\n";
            $config .= "define('DB_CHARSET', 'utf8mb4');\n";
            $config .= "define('SITE_URL', " . var_export($site_url, true) . ");\n";
            $config .= "define('SITE_PATH', " . var_export(__DIR__, true) . ");\n";
            $config .= "define('TIMEZONE', 'America/Santiago');\n";
            $config .= "date_default_timezone_set(TIMEZONE);\n";
            $config .= "if (session_status() === PHP_SESSION_NONE) session_start();\n";
            file_put_contents(__DIR__ . '/includes/config.php', $config);
            
            // Crear directorio para uploads de logos
            if (!is_dir(__DIR__ . '/assets/img')) {
                mkdir(__DIR__ . '/assets/img', 0755, true);
            }
            
            file_put_contents(__DIR__ . '/.installed', date('Y-m-d H:i:s'));
            
            $success[] = '¡Instalación completada exitosamente!';
            $step = 4;
        } catch (PDOException $e) { $errors[] = 'Error BD: ' . $e->getMessage(); }
        catch (Exception $e) { $errors[] = 'Error: ' . $e->getMessage(); }
    }
}

$reqs = checkRequirements();
$allOk = !in_array(false, $reqs, true);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador - Mesa de Ayuda GdC</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-[#1a3a6c] to-[#1a1a2e] min-h-screen p-4 md:p-8">
    <div class="max-w-3xl mx-auto">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><span class="text-3xl">🏛️</span></div>
            <h1 class="text-3xl font-bold text-white">Gobierno de Chile</h1>
            <p class="text-blue-200 mt-1">Instalador - Mesa de Ayuda TI v2.0</p>
        </div>
        <div class="flex items-center justify-center gap-2 mb-8">
            <?php for ($i = 1; $i <= 4; $i++): ?>
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold <?= $i < $step ? 'bg-green-500 text-white' : ($i === $step ? 'bg-[#d4272e] text-white' : 'bg-gray-300 text-gray-600') ?>"><?= $i < $step ? '✓' : $i ?></div>
            <?php if ($i < 4): ?><div class="w-8 md:w-16 h-1 <?= $i < $step ? 'bg-green-500' : 'bg-gray-600' ?>"></div><?php endif; ?>
            <?php endfor; ?>
        </div>
        <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <?php if (!empty($errors)): ?><div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"><?php foreach ($errors as $e): ?><p>❌ <?= htmlspecialchars($e) ?></p><?php endforeach; ?></div><?php endif; ?>
            <?php if (!empty($success)): ?><div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4"><?php foreach ($success as $s): ?><p>✅ <?= htmlspecialchars($s) ?></p><?php endforeach; ?></div><?php endif; ?>

            <?php if ($step === 1): ?>
            <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 1: Verificación de Requisitos</h2>
            <div class="space-y-2 mb-6">
                <?php foreach ($reqs as $name => $ok): ?>
                <div class="flex items-center gap-3 p-3 rounded-lg <?= $ok ? 'bg-green-50' : 'bg-red-50' ?>">
                    <span><?= $ok ? '✅' : '❌' ?></span><span class="text-sm font-medium"><?= $name ?></span>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if ($allOk): ?><a href="?step=2" class="block w-full bg-[#1a3a6c] text-white text-center py-3 rounded-lg font-medium">Continuar →</a><?php else: ?><p class="text-yellow-700 bg-yellow-50 p-3 rounded-lg text-sm">⚠️ Debe cumplir todos los requisitos.</p><?php endif; ?>

            <?php elseif ($step === 2): ?>
            <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 2: Términos y Condiciones</h2>
            <div class="bg-gray-50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto text-sm text-gray-700">
                <p><strong>LICENCIA DE USO - GOBIERNO DE CHILE</strong></p>
                <p class="mt-2">Este software es propiedad del Gobierno de Chile y está destinado para uso institucional.</p>
                <p class="mt-2">Al instalar este sistema, usted acepta los términos de uso, confidencialidad de información, respaldos periódicos y cumplimiento de la Ley 19.628 sobre Protección de Vida Privada.</p>
            </div>
            <label class="flex items-center gap-2 mb-6"><input type="checkbox" id="acceptLicense" class="w-4 h-4"><span class="text-sm">Acepto los términos y condiciones</span></label>
            <a id="btnContinue" href="?step=3" class="block w-full bg-[#1a3a6c] text-white text-center py-3 rounded-lg font-medium opacity-50 pointer-events-none">Continuar →</a>
            <script>document.getElementById('acceptLicense').addEventListener('change',function(){var b=document.getElementById('btnContinue');b.classList.toggle('opacity-50');b.classList.toggle('pointer-events-none');});</script>

            <?php elseif ($step === 3): ?>
            <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 3: Configuración</h2>
            <form method="POST" action="?step=3" class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Host BD</label><input type="text" name="db_host" value="localhost" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre BD</label><input type="text" name="db_name" value="helpdesk_gobcl" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario BD *</label><input type="text" name="db_user" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Contraseña BD</label><input type="password" name="db_pass" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">URL del Sitio</label><input type="url" name="site_url" value="http://<?= $_SERVER['HTTP_HOST'] ?? 'localhost' ?><?= dirname($_SERVER['SCRIPT_NAME']) ?>" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"></div>
                <hr class="my-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Contraseña admin</label><input type="password" name="admin_pass" value="admin123" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"><p class="text-xs text-gray-500 mt-1">Para: admin, supervisor, tecnico</p></div>
                <button type="submit" class="w-full bg-[#d4272e] text-white py-3 rounded-lg font-medium">🔧 Instalar Sistema</button>
            </form>

            <?php elseif ($step === 4): ?>
            <div class="text-center py-6">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-4xl">✅</span></div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">¡Instalación Completada!</h2>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <h3 class="font-semibold text-blue-800 mb-2">🔐 Credenciales:</h3>
                    <p class="text-sm text-blue-700"><strong>Admin:</strong> admin / (su contraseña)</p>
                    <p class="text-sm text-blue-700"><strong>Supervisor:</strong> supervisor / (su contraseña)</p>
                    <p class="text-sm text-blue-700"><strong>Técnico:</strong> tecnico / (su contraseña)</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left text-sm">
                    <p class="font-semibold text-yellow-800">⚠️ Elimine install.php por seguridad</p>
                </div>
                <a href="index.php" class="inline-block bg-[#1a3a6c] text-white px-8 py-3 rounded-lg font-medium mr-2">🚀 Portal Ciudadano</a>
                <a href="login.php" class="inline-block bg-[#d4272e] text-white px-8 py-3 rounded-lg font-medium">🔐 Acceder</a>
            </div>
            <?php endif; ?>
        </div>
        <p class="text-center text-blue-200 text-xs mt-6">© <?= date('Y') ?> Gobierno de Chile — Mesa de Ayuda TI</p>
    </div>
</body>
</html>
