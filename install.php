<?php
/**
 * ============================================
 * INSTALADOR - MESA DE AYUDA GOBIERNO DE CHILE
 * Versión 2.0
 * ============================================
 * Este instalador configura la base de datos,
 * crea la estructura de carpetas y genera el
 * archivo de configuración.
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$errors = [];
$success = [];

// Verificar requisitos
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

// Procesar instalación
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $step === 3) {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? 'helpdesk_gobcl');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');
    $site_url = rtrim(trim($_POST['site_url'] ?? ''), '/');
    $admin_pass = trim($_POST['admin_pass'] ?? 'admin123');
    
    if (empty($db_user)) {
        $errors[] = 'El usuario de base de datos es obligatorio';
    }
    if (empty($site_url)) {
        $site_url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
    }
    
    if (empty($errors)) {
        try {
            // Conectar a MySQL
            $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            // Crear base de datos
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$db_name`");
            
            // Importar SQL
            $sql = file_get_contents(__DIR__ . '/database.sql');
            // Remover CREATE DATABASE y USE del SQL
            $sql = preg_replace('/CREATE DATABASE.*?;/s', '', $sql);
            $sql = preg_replace('/USE.*?;/s', '', $sql);
            
            // Ejecutar cada statement
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            foreach ($statements as $stmt) {
                if (!empty($stmt) && !preg_match('/^--/', $stmt)) {
                    try { $pdo->exec($stmt); } catch (Exception $e) { /* ignorar duplicados */ }
                }
            }
            
            // Actualizar contraseñas con hash
            $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'admin'")->execute([$hash]);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'supervisor'")->execute([password_hash($admin_pass, PASSWORD_DEFAULT)]);
            $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'tecnico'")->execute([password_hash($admin_pass, PASSWORD_DEFAULT)]);
            
            // Crear estructura de carpetas
            $dirs = ['includes', 'api', 'assets/css', 'assets/js', 'assets/img', 'uploads'];
            foreach ($dirs as $dir) {
                if (!is_dir(__DIR__ . '/' . $dir)) {
                    mkdir(__DIR__ . '/' . $dir, 0755, true);
                }
            }
            
            // Crear .htaccess para uploads
            file_put_contents(__DIR__ . '/uploads/.htaccess', "Options -Indexes\n<FilesMatch \"\\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi)$\">\nDeny from all\n</FilesMatch>");
            
            // Generar config.php
            $config = "<?php\n";
            $config .= "// Configuración generada por el instalador - " . date('Y-m-d H:i:s') . "\n";
            $config .= "define('DB_HOST', " . var_export($db_host, true) . ");\n";
            $config .= "define('DB_NAME', " . var_export($db_name, true) . ");\n";
            $config .= "define('DB_USER', " . var_export($db_user, true) . ");\n";
            $config .= "define('DB_PASS', " . var_export($db_pass, true) . ");\n";
            $config .= "define('DB_CHARSET', 'utf8mb4');\n";
            $config .= "define('SITE_URL', " . var_export($site_url, true) . ");\n";
            $config .= "define('SITE_PATH', " . var_export(__DIR__, true) . ");\n";
            $config .= "define('TIMEZONE', 'America/Santiago');\n";
            $config .= "date_default_timezone_set(TIMEZONE);\n";
            $config .= "session_start();\n";
            
            file_put_contents(__DIR__ . '/includes/config.php', $config);
            
            // Marcar como instalado
            file_put_contents(__DIR__ . '/.installed', date('Y-m-d H:i:s'));
            
            $success[] = '¡Instalación completada exitosamente!';
            $step = 4;
            
        } catch (PDOException $e) {
            $errors[] = 'Error de base de datos: ' . $e->getMessage();
        } catch (Exception $e) {
            $errors[] = 'Error: ' . $e->getMessage();
        }
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
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #1a3a6c 0%, #1a1a2e 100%); min-height: 100vh; }
        .step-active { background: #d4272e; color: white; }
        .step-done { background: #16a34a; color: white; }
        .step-pending { background: #e5e7eb; color: #6b7280; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="text-3xl">🏛️</span>
            </div>
            <h1 class="text-3xl font-bold text-white">Gobierno de Chile</h1>
            <p class="text-blue-200 mt-1">Instalador - Mesa de Ayuda TI v2.0</p>
        </div>

        <!-- Steps indicator -->
        <div class="flex items-center justify-center gap-2 mb-8">
            <?php for ($i = 1; $i <= 4; $i++): ?>
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold <?= $i < $step ? 'step-done' : ($i === $step ? 'step-active' : 'step-pending') ?>">
                        <?= $i < $step ? '✓' : $i ?>
                    </div>
                    <?php if ($i < 4): ?>
                        <div class="w-8 md:w-16 h-1 <?= $i < $step ? 'bg-green-500' : 'bg-gray-600' ?>"></div>
                    <?php endif; ?>
                </div>
            <?php endfor; ?>
        </div>
        <div class="flex justify-between text-xs text-blue-200 mb-8 px-4">
            <span>Requisitos</span><span>Licencia</span><span>Configuración</span><span>Finalizar</span>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            
            <?php if (!empty($errors)): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <?php foreach ($errors as $e): ?><p>❌ <?= htmlspecialchars($e) ?></p><?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    <?php foreach ($success as $s): ?><p>✅ <?= htmlspecialchars($s) ?></p><?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ($step === 1): ?>
                <!-- Step 1: Requirements -->
                <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 1: Verificación de Requisitos</h2>
                <p class="text-gray-600 mb-6">Se verifican los requisitos del servidor para la instalación.</p>
                
                <div class="space-y-2 mb-6">
                    <?php foreach ($reqs as $name => $ok): ?>
                        <div class="flex items-center gap-3 p-3 rounded-lg <?= $ok ? 'bg-green-50' : 'bg-red-50' ?>">
                            <span class="text-lg"><?= $ok ? '✅' : '❌' ?></span>
                            <span class="text-sm font-medium <?= $ok ? 'text-green-800' : 'text-red-800' ?>"><?= $name ?></span>
                            <span class="ml-auto text-xs <?= $ok ? 'text-green-600' : 'text-red-600' ?>"><?= $ok ? 'OK' : 'FALLA' ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if ($allOk): ?>
                    <a href="?step=2" class="block w-full bg-[#1a3a6c] hover:bg-blue-900 text-white text-center py-3 rounded-lg font-medium transition-colors">
                        Continuar →
                    </a>
                <?php else: ?>
                    <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                        ⚠️ Debe cumplir todos los requisitos antes de continuar.
                    </div>
                <?php endif; ?>

            <?php elseif ($step === 2): ?>
                <!-- Step 2: License -->
                <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 2: Términos y Condiciones</h2>
                <div class="bg-gray-50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto text-sm text-gray-700 space-y-2">
                    <p><strong>LICENCIA DE USO - GOBIERNO DE CHILE</strong></p>
                    <p>Este software es propiedad del Gobierno de Chile y está destinado para uso institucional.</p>
                    <p>Al instalar este sistema, usted acepta:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4">
                        <li>Usar el sistema conforme a las normativas institucionales</li>
                        <li>Mantener la confidencialidad de la información gestionada</li>
                        <li>Realizar respaldos periódicos de la base de datos</li>
                        <li>No modificar el código fuente sin autorización</li>
                        <li>Cumplir con la Ley 19.628 sobre Protección de Vida Privada</li>
                    </ul>
                    <p class="mt-3">Este sistema incluye módulos de gestión de tickets, base de conocimiento, pizarra colaborativa, zona de noticias, notificaciones, registro de correos y panel de administración.</p>
                </div>
                <label class="flex items-center gap-2 mb-6 cursor-pointer">
                    <input type="checkbox" id="acceptLicense" class="w-4 h-4 rounded" onchange="document.getElementById('btnContinue').disabled = !this.checked">
                    <span class="text-sm text-gray-700">Acepto los términos y condiciones</span>
                </label>
                <a id="btnContinue" href="?step=3" class="block w-full bg-[#1a3a6c] hover:bg-blue-900 text-white text-center py-3 rounded-lg font-medium transition-colors opacity-50 pointer-events-none" onclick="this.classList.remove('opacity-50','pointer-events-none')">
                    Continuar →
                </a>

            <?php elseif ($step === 3): ?>
                <!-- Step 3: Configuration -->
                <h2 class="text-xl font-bold text-gray-800 mb-4">Paso 3: Configuración</h2>
                <p class="text-gray-600 mb-6">Ingrese los datos de conexión a la base de datos.</p>
                
                <form method="POST" action="?step=3" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Host de Base de Datos</label>
                        <input type="text" name="db_host" value="localhost" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Base de Datos</label>
                        <input type="text" name="db_name" value="helpdesk_gobcl" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Usuario de Base de Datos *</label>
                        <input type="text" name="db_user" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña de Base de Datos</label>
                        <input type="password" name="db_pass" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">URL del Sitio</label>
                        <input type="url" name="site_url" value="http://<?= $_SERVER['HTTP_HOST'] ?? 'localhost' ?><?= dirname($_SERVER['SCRIPT_NAME']) ?>" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                    </div>
                    <hr class="my-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña para cuentas de administrador</label>
                        <input type="password" name="admin_pass" value="admin123" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4272e] focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">Se aplicará a: admin, supervisor, tecnico</p>
                    </div>
                    <button type="submit" class="w-full bg-[#d4272e] hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
                        🔧 Instalar Sistema
                    </button>
                </form>

            <?php elseif ($step === 4): ?>
                <!-- Step 4: Complete -->
                <div class="text-center py-6">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-4xl">✅</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">¡Instalación Completada!</h2>
                    <p class="text-gray-600 mb-6">El sistema ha sido instalado correctamente.</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <h3 class="font-semibold text-blue-800 mb-2">🔐 Credenciales de Acceso:</h3>
                        <div class="text-sm text-blue-700 space-y-1">
                            <p><strong>Administrador:</strong> admin / (la contraseña que definió)</p>
                            <p><strong>Supervisor:</strong> supervisor / (la contraseña que definió)</p>
                            <p><strong>Técnico:</strong> tecnico / (la contraseña que definió)</p>
                        </div>
                    </div>

                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left text-sm">
                        <p class="font-semibold text-yellow-800 mb-1">⚠️ IMPORTANTE:</p>
                        <ul class="list-disc list-inside text-yellow-700 space-y-1">
                            <li>Elimine el archivo <code class="bg-yellow-100 px-1 rounded">install.php</code> por seguridad</li>
                            <li>Configure el SMTP en el panel de administración</li>
                            <li>Cambie las contraseñas por defecto</li>
                        </ul>
                    </div>

                    <a href="index.php" class="inline-block bg-[#1a3a6c] hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                        🚀 Ir al Portal Ciudadano
                    </a>
                    <a href="login.php" class="inline-block ml-2 bg-[#d4272e] hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                        🔐 Acceder como Funcionario
                    </a>
                </div>
            <?php endif; ?>
        </div>

        <p class="text-center text-blue-200 text-xs mt-6">© <?= date('Y') ?> Gobierno de Chile — Mesa de Ayuda TI</p>
    </div>
</body>
</html>
