<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (login($_POST['username'] ?? '', $_POST['password'] ?? '')) {
        header('Location: dashboard.php');
        exit;
    }
    $error = '❌ Credenciales inválidas. Verifique su usuario y contraseña.';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Mesa de Ayuda GdC</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-[#1a3a6c] via-blue-800 to-[#1a1a2e] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="text-3xl">🏛️</span>
            </div>
            <h1 class="text-2xl font-bold text-white">Gobierno de Chile</h1>
            <p class="text-blue-200 text-sm mt-1">Mesa de Ayuda - Acceso Funcionarios</p>
        </div>

        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
            
            <?php if ($error): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"><?= $error ?></div>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input type="text" name="username" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a6c] focus:border-transparent" placeholder="Ingrese su usuario">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input type="password" name="password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a6c] focus:border-transparent" placeholder="Ingrese su contraseña">
                </div>
                <button type="submit" class="w-full bg-[#1a3a6c] hover:bg-blue-900 text-white py-3 rounded-lg font-medium">Ingresar al Sistema</button>
            </form>

            <div class="mt-6 pt-6 border-t border-gray-100">
                <p class="text-xs text-gray-500 text-center mb-3">Credenciales de prueba:</p>
                <div class="grid grid-cols-3 gap-2 text-xs">
                    <div class="bg-gray-50 rounded-lg p-2 text-center">
                        <p class="font-semibold text-gray-700">Admin</p>
                        <p class="text-gray-500">admin</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-2 text-center">
                        <p class="font-semibold text-gray-700">Supervisor</p>
                        <p class="text-gray-500">supervisor</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-2 text-center">
                        <p class="font-semibold text-gray-700">Técnico</p>
                        <p class="text-gray-500">tecnico</p>
                    </div>
                </div>
                <p class="text-xs text-gray-400 text-center mt-2">Contraseña: admin123</p>
            </div>
        </div>

        <div class="text-center mt-6">
            <a href="index.php" class="text-blue-200 hover:text-white text-sm">← Volver al Portal Ciudadano</a>
        </div>
    </div>
</body>
</html>
