<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();
$pdo = getDB();
$message = '';
$user = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
$user->execute([$_SESSION['user_id']]);
$user = $user->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_profile'])) {
        $pdo->prepare("UPDATE usuarios SET full_name = ?, email = ? WHERE id = ?")->execute([$_POST['full_name'], $_POST['email'], $_SESSION['user_id']]);
        $_SESSION['user_fullname'] = $_POST['full_name'];
        $_SESSION['user_email'] = $_POST['email'];
        $message = '✅ Datos actualizados correctamente';
    }
    if (isset($_POST['change_password'])) {
        if (password_verify($_POST['current_password'], $user['password'])) {
            if ($_POST['new_password'] === $_POST['confirm_password'] && strlen($_POST['new_password']) >= 6) {
                $hash = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
                $pdo->prepare("UPDATE usuarios SET password = ? WHERE id = ?")->execute([$hash, $_SESSION['user_id']]);
                $message = '✅ Contraseña actualizada correctamente';
            } else { $message = '❌ Las contraseñas no coinciden o son muy cortas'; }
        } else { $message = '❌ La contraseña actual es incorrecta'; }
    }
    $user = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    $user->execute([$_SESSION['user_id']]);
    $user = $user->fetch();
}

$pageTitle = '🔄 Mi Perfil'; $current = 'profile';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<h1 class="text-2xl font-bold text-gray-800 mb-1">Mi Perfil</h1>
<p class="text-gray-500 text-sm mb-6">Actualiza tu información personal y credenciales</p>
<?php if ($message): ?>
<div class="mb-6 px-4 py-3 rounded-lg <?= strpos($message,'✅')!==false?'bg-green-50 border border-green-200 text-green-800':'bg-red-50 border border-red-200 text-red-700' ?>"><?= $message ?></div>
<?php endif; ?>
<div class="space-y-6 max-w-3xl">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-800 mb-4">👤 Datos Personales</h2>
        <form method="POST" class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input type="text" name="full_name" value="<?= e($user['full_name']) ?>" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" value="<?= e($user['email']) ?>" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <input type="text" value="<?= e(ucfirst($user['role'])) ?>" disabled class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"></div>
            <button type="submit" name="update_profile" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Actualizar Datos</button>
        </form>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-800 mb-4">🔒 Cambiar Contraseña</h2>
        <form method="POST" class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <input type="password" name="current_password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <input type="password" name="new_password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
            <input type="password" name="confirm_password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"></div>
            <button type="submit" name="change_password" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Cambiar Contraseña</button>
        </form>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
