<?php
require_once __DIR__ . '/includes/connection.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireRole(['admin']);
$pdo = getDB();
$section = $_GET['s'] ?? 'users';
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Users
    if (isset($_POST['create_user'])) {
        $hash = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $pdo->prepare("INSERT INTO usuarios (username, password, full_name, email, role, active) VALUES (?, ?, ?, ?, ?, 1)")->execute([$_POST['username'],$hash,$_POST['full_name'],$_POST['email'],$_POST['role']]);
        $message = '✅ Usuario creado';
    }
    if (isset($_POST['toggle_user'])) { $pdo->prepare("UPDATE usuarios SET active = NOT active WHERE id = ?")->execute([$_POST['user_id']]); }
    // Categories
    if (isset($_POST['create_cat'])) { $pdo->prepare("INSERT INTO categorias (nombre, descripcion, visibilidad) VALUES (?, ?, ?)")->execute([$_POST['nombre'],$_POST['descripcion'],$_POST['visibilidad']]); $message = '✅ Categoría creada'; }
    if (isset($_POST['toggle_cat'])) { $pdo->prepare("UPDATE categorias SET active = NOT active WHERE id = ?")->execute([$_POST['cat_id']]); }
    // Departments
    if (isset($_POST['create_dept'])) { $pdo->prepare("INSERT INTO departamentos (nombre, codigo) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['codigo']]); $message = '✅ Departamento creado'; }
    if (isset($_POST['toggle_dept'])) { $pdo->prepare("UPDATE departamentos SET active = NOT active WHERE id = ?")->execute([$_POST['dept_id']]); }
    // Locations
    if (isset($_POST['create_loc'])) { $pdo->prepare("INSERT INTO ubicaciones (nombre, direccion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['direccion']]); $message = '✅ Ubicación creada'; }
    if (isset($_POST['toggle_loc'])) { $pdo->prepare("UPDATE ubicaciones SET active = NOT active WHERE id = ?")->execute([$_POST['loc_id']]); }
    // Teams
    if (isset($_POST['create_team'])) { $pdo->prepare("INSERT INTO equipos_soporte (nombre, descripcion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['descripcion']]); $message = '✅ Equipo creado'; }
    // Ticket Types
    if (isset($_POST['create_tt'])) { $pdo->prepare("INSERT INTO tipos_ticket (nombre, descripcion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['descripcion']]); $message = '✅ Tipo creado'; }
    // Config
    if (isset($_POST['save_config'])) {
        foreach ($_POST['config'] as $k => $v) {
            $pdo->prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?")->execute([$k, $v, $v]);
        }
        $message = '✅ Configuración guardada';
    }
    // Audit
    $pdo->prepare("INSERT INTO auditoria (accion, detalles, usuario_id) VALUES ('ADMIN_ACTION', ?, ?)")->execute(["Acción en $section", $_SESSION['user_id']]);
}

$users = $pdo->query("SELECT * FROM usuarios ORDER BY role, full_name")->fetchAll();
$categories = $pdo->query("SELECT * FROM categorias ORDER BY nombre")->fetchAll();
$departments = $pdo->query("SELECT * FROM departamentos ORDER BY nombre")->fetchAll();
$locations = $pdo->query("SELECT * FROM ubicaciones ORDER BY nombre")->fetchAll();
$teams = $pdo->query("SELECT * FROM equipos_soporte ORDER BY nombre")->fetchAll();
$ticketTypes = $pdo->query("SELECT * FROM tipos_ticket ORDER BY nombre")->fetchAll();
$configRows = $pdo->query("SELECT * FROM configuracion")->fetchAll();
$config = [];
foreach ($configRows as $r) $config[$r['clave']] = $r['valor'];
$audit = $pdo->query("SELECT a.*, u.full_name FROM auditoria a JOIN usuarios u ON a.usuario_id = u.id ORDER BY a.timestamp DESC LIMIT 50")->fetchAll();

$sections = ['users'=>'Usuarios','categories'=>'Categorías','departments'=>'Departamentos','locations'=>'Sedes','teams'=>'Equipos','ticketTypes'=>'Tipos Ticket','site'=>'Config. Sitio','security'=>'Seguridad','ticketConfig'=>'Config. Tickets','smtp'=>'SMTP','audit'=>'Auditoría'];

$pageTitle = '⚙️ Administración'; $current = 'admin';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>
<h1 class="text-2xl font-bold text-gray-800 mb-1">⚙️ Administración del Sistema</h1>
<p class="text-gray-500 text-sm mb-6">Configuración y gestión completa</p>
<?php if ($message): ?><div class="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm"><?= $message ?></div><?php endif; ?>
<div class="grid lg:grid-cols-4 gap-6">
    <nav class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-0.5 h-fit">
        <?php foreach ($sections as $k => $v): ?>
        <a href="?s=<?= $k ?>" class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs <?= $section===$k?'bg-[#1a3a6c] text-white':'text-gray-600 hover:bg-gray-50' ?>"><?= $v ?></a>
        <?php endforeach; ?>
    </nav>
    <div class="lg:col-span-3">
        <?php if ($section === 'users'): ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex justify-between mb-4"><h2 class="font-semibold">Usuarios</h2>
            <button onclick="document.getElementById('newUserModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-3 py-2 rounded-lg text-sm">+ Nuevo</button></div>
            <table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="text-left px-3 py-2">Usuario</th><th class="text-left px-3 py-2 hidden md:table-cell">Nombre</th><th class="text-left px-3 py-2">Rol</th><th class="text-left px-3 py-2">Estado</th><th class="px-3 py-2"></th></tr></thead>
            <tbody class="divide-y divide-gray-50">
            <?php foreach ($users as $u): ?>
            <tr class="hover:bg-gray-50"><td class="px-3 py-2 font-medium"><?= e($u['username']) ?></td><td class="px-3 py-2 hidden md:table-cell"><?= e($u['full_name']) ?></td><td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"><?= e($u['role']) ?></span></td><td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs <?= $u['active']?'bg-green-50 text-green-700':'bg-red-50 text-red-700' ?>"><?= $u['active']?'Activo':'Inactivo' ?></span></td><td class="px-3 py-2 text-center"><form method="POST"><input type="hidden" name="user_id" value="<?= $u['id'] ?>"><button type="submit" name="toggle_user" class="text-gray-400 hover:text-[#1a3a6c]">⚡</button></form></td></tr>
            <?php endforeach; ?>
            </tbody></table>
        </div>
        <div id="newUserModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 class="font-bold mb-4">Nuevo Usuario</h2>
                <form method="POST" class="space-y-3">
                    <input required name="username" placeholder="Usuario *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <input required type="password" name="password" placeholder="Contraseña *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <input required name="full_name" placeholder="Nombre Completo *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <input required type="email" name="email" placeholder="Correo *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <select name="role" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="admin">Administrador</option><option value="supervisor">Supervisor</option><option value="tecnico">Técnico</option></select>
                    <div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#newUserModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button><button type="submit" name="create_user" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div>
                </form>
            </div>
        </div>
        <?php elseif ($section === 'categories'): ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex justify-between mb-4"><h2 class="font-semibold">Categorías</h2>
            <button onclick="document.getElementById('newCatModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-3 py-2 rounded-lg text-sm">+ Nueva</button></div>
            <div class="space-y-2"><?php foreach ($categories as $c): ?>
            <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div><p class="font-medium text-sm"><?= e($c['nombre']) ?></p><p class="text-xs text-gray-500"><?= e($c['descripcion']) ?></p></div>
                <div class="flex items-center gap-2"><span class="text-xs bg-gray-100 px-2 py-0.5 rounded"><?= e($c['visibilidad']) ?></span><span class="text-xs px-2 py-0.5 rounded <?= $c['active']?'bg-green-50 text-green-700':'bg-red-50 text-red-700' ?>"><?= $c['active']?'Activa':'Inactiva' ?></span>
                <form method="POST"><input type="hidden" name="cat_id" value="<?= $c['id'] ?>"><button type="submit" name="toggle_cat" class="text-gray-400 hover:text-[#1a3a6c]">⚡</button></form></div>
            </div><?php endforeach; ?></div>
        </div>
        <div id="newCatModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 class="font-bold mb-4">Nueva Categoría</h2>
                <form method="POST" class="space-y-3">
                    <input required name="nombre" placeholder="Nombre *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <input name="descripcion" placeholder="Descripción" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <select name="visibilidad" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="both">Ambas</option><option value="external">Externa</option><option value="internal">Interna</option></select>
                    <div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#newCatModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button><button type="submit" name="create_cat" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div>
                </form>
            </div>
        </div>
        <?php elseif (in_array($section, ['departments','locations','teams','ticketTypes'])): 
            $items = $section==='departments'?$departments:($section==='locations'?$locations:($section==='teams'?$teams:$ticketTypes));
            $label = $sections[$section];
        ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex justify-between mb-4"><h2 class="font-semibold"><?= $label ?></h2>
            <button onclick="document.getElementById('newItemModal').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-3 py-2 rounded-lg text-sm">+ Nuevo</button></div>
            <div class="space-y-2"><?php foreach ($items as $item): ?>
            <div class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div><p class="font-medium text-sm"><?= e($item['nombre']) ?></p><?php if(isset($item['descripcion'])): ?><p class="text-xs text-gray-500"><?= e($item['descripcion']) ?></p><?php endif; ?><?php if(isset($item['direccion'])): ?><p class="text-xs text-gray-500"><?= e($item['direccion']) ?></p><?php endif; ?><?php if(isset($item['codigo'])): ?><p class="text-xs text-gray-500">Código: <?= e($item['codigo']) ?></p><?php endif; ?></div>
                <?php if(isset($item['active'])): ?>
                <div class="flex items-center gap-2"><span class="text-xs px-2 py-0.5 rounded <?= $item['active']?'bg-green-50 text-green-700':'bg-red-50 text-red-700' ?>"><?= $item['active']?'Activo':'Inactivo' ?></span>
                <form method="POST"><input type="hidden" name="<?= $section==='departments'?'dept_id':($section==='locations'?'loc_id':'') ?>" value="<?= $item['id'] ?>"><button type="submit" name="toggle_<?= $section==='departments'?'dept':($section==='locations'?'loc':'') ?>" class="text-gray-400 hover:text-[#1a3a6c]">⚡</button></form></div>
                <?php endif; ?>
            </div><?php endforeach; ?></div>
        </div>
        <div id="newItemModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 class="font-bold mb-4">Nuevo <?= rtrim($label, 's') ?></h2>
                <form method="POST" class="space-y-3">
                    <input required name="nombre" placeholder="Nombre *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <?php if($section==='departments'): ?><input required name="codigo" placeholder="Código *" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><?php endif; ?>
                    <?php if($section==='locations'): ?><input name="direccion" placeholder="Dirección" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><?php endif; ?>
                    <?php if(in_array($section,['teams','ticketTypes'])): ?><input name="descripcion" placeholder="Descripción" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><?php endif; ?>
                    <div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#newItemModal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button><button type="submit" name="create_<?= $section==='departments'?'dept':($section==='locations'?'loc':($section==='teams'?'team':'tt')) ?>" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div>
                </form>
            </div>
        </div>
        <?php elseif ($section === 'site' || $section === 'security' || $section === 'ticketConfig' || $section === 'smtp'): ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="font-semibold mb-4"><?= $sections[$section] ?></h2>
            <form method="POST" class="space-y-4">
                <?php if ($section === 'site'): ?>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Marca</label><input type="text" name="config[brand_name]" value="<?= e($config['brand_name'] ?? '') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Título de Ventana</label><input type="text" name="config[window_title]" value="<?= e($config['window_title'] ?? '') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label><select name="config[timezone]" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="America/Santiago" <?= ($config['timezone']??'')==='America/Santiago'?'selected':'' ?>>America/Santiago</option></select></div>
                <?php elseif ($section === 'security'): ?>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Máx. intentos login</label><input type="number" name="config[max_login_attempts]" value="<?= e($config['max_login_attempts'] ?? '5') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Minutos bloqueo IP</label><input type="number" name="config[ip_lock_minutes]" value="<?= e($config['ip_lock_minutes'] ?? '15') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <?php elseif ($section === 'ticketConfig'): ?>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">SLA (horas)</label><input type="number" name="config[ticket_sla_hours]" value="<?= e($config['ticket_sla_hours'] ?? '24') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Cierre automático (días)</label><input type="number" name="config[ticket_auto_close_days]" value="<?= e($config['ticket_auto_close_days'] ?? '7') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Máx. adjuntos</label><input type="number" name="config[ticket_max_attachments]" value="<?= e($config['ticket_max_attachments'] ?? '5') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                <?php elseif ($section === 'smtp'): ?>
                <div class="grid md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Host</label><input type="text" name="config[smtp_host]" value="<?= e($config['smtp_host'] ?? '') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Puerto</label><input type="number" name="config[smtp_port]" value="<?= e($config['smtp_port'] ?? '587') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label><input type="text" name="config[smtp_user]" value="<?= e($config['smtp_user'] ?? '') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                    <div><label class="block text-sm font-medium text-gray-700 mb-1">Remitente</label><input type="email" name="config[smtp_sender]" value="<?= e($config['smtp_sender'] ?? '') ?>" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></div>
                </div>
                <?php endif; ?>
                <button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
            </form>
        </div>
        <?php elseif ($section === 'audit'): ?>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="font-semibold mb-4">Registro de Auditoría</h2>
            <div class="space-y-2"><?php foreach ($audit as $a): ?>
            <div class="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">🛡️</div>
                <div class="flex-1"><div class="flex items-center gap-2"><span class="text-xs font-mono bg-blue-50 text-[#1a3a6c] px-2 py-0.5 rounded"><?= e($a['accion']) ?></span><span class="text-sm text-gray-700"><?= e($a['detalles']) ?></span></div><p class="text-xs text-gray-400 mt-0.5"><?= e($a['full_name']) ?> • <?= formatDate($a['timestamp']) ?></p></div>
            </div><?php endforeach; ?></div>
        </div>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
