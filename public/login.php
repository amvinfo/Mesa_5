<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

if (isLoggedIn()) { header('Location: dashboard.php'); exit; }

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (login($_POST['username'] ?? '', $_POST['password'] ?? '')) {
        header('Location: dashboard.php'); exit;
    }
    $error = '❌ Credenciales inválidas';
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
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><span class="text-3xl">🏛️</span></div>
            <h1 class="text-2xl font-bold text-white">Gobierno de Chile</h1>
            <p class="text-blue-200 text-sm mt-1">Mesa de Ayuda - Acceso Funcionarios</p>
        </div>
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
            <?php if ($error): ?><div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"><?= $error ?></div><?php endif; ?>
            <form method="POST" class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label><input type="text" name="username" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Usuario"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><input type="password" name="password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Contraseña"></div>
                <button type="submit" class="w-full bg-[#1a3a6c] text-white py-3 rounded-lg font-medium">Ingresar</button>
            </form>
            <div class="mt-6 pt-6 border-t text-center">
                <p class="text-xs text-gray-500 mb-2">Credenciales: admin/supervisor/tecnico - admin123</p>
                <a href="index.php" class="text-blue-600 text-sm">← Volver al Portal</a>
            </div>
        </div>
    </div>
</body>
</html>
