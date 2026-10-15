<?php
require_once __DIR__ . '/includes/connection.php'; require_once __DIR__ . '/includes/auth.php'; require_once __DIR__ . '/includes/functions.php'; requireRole(['admin']);
$pdo = getDB(); $section = $_GET['s'] ?? 'users'; $message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['create_user'])) { 
        $passValidation = validatePassword($_POST['password']);
        if ($passValidation === true) {
            $pdo->prepare("INSERT INTO usuarios (username, password, full_name, email, role, active) VALUES (?, ?, ?, ?, ?, 1)")->execute([$_POST['username'],password_hash($_POST['password'],PASSWORD_DEFAULT),$_POST['full_name'],$_POST['email'],$_POST['role']]); 
            $message = '✅ Usuario creado';
        } else {
            $message = '❌ ' . $passValidation;
        }
    }
    if (isset($_POST['toggle_user'])) $pdo->prepare("UPDATE usuarios SET active = NOT active WHERE id = ?")->execute([$_POST['user_id']]);
    if (isset($_POST['create_cat'])) { $pdo->prepare("INSERT INTO categorias (nombre, descripcion, visibilidad) VALUES (?, ?, ?)")->execute([$_POST['nombre'],$_POST['descripcion'],$_POST['visibilidad']]); $message = '✅ Categoría creada'; }
    if (isset($_POST['toggle_cat'])) $pdo->prepare("UPDATE categorias SET active = NOT active WHERE id = ?")->execute([$_POST['cat_id']]);
    if (isset($_POST['create_dept'])) { $pdo->prepare("INSERT INTO departamentos (nombre, codigo) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['codigo']]); $message = '✅ Departamento creado'; }
    if (isset($_POST['create_loc'])) { $pdo->prepare("INSERT INTO ubicaciones (nombre, direccion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['direccion']]); $message = '✅ Ubicación creada'; }
    if (isset($_POST['create_team'])) { $pdo->prepare("INSERT INTO equipos_soporte (nombre, descripcion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['descripcion']]); $message = '✅ Equipo creado'; }
    if (isset($_POST['create_tt'])) { $pdo->prepare("INSERT INTO tipos_ticket (nombre, descripcion) VALUES (?, ?)")->execute([$_POST['nombre'],$_POST['descripcion']]); $message = '✅ Tipo creado'; }
    if (isset($_POST['save_config'])) { foreach($_POST['config'] as $k=>$v) $pdo->prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?")->execute([$k,$v,$v]); $message = '✅ Configuración guardada'; }
    
    // Upload logo
    if (isset($_POST['upload_logo']) && isset($_FILES['logo']) && $_FILES['logo']['error'] === 0) {
        $allowed = ['jpg','jpeg','png','svg','gif'];
        $ext = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
        if (in_array($ext, $allowed)) {
            $uploadDir = __DIR__ . '/assets/img/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $filename = 'logo_' . time() . '.' . $ext;
            if (move_uploaded_file($_FILES['logo']['tmp_name'], $uploadDir . $filename)) {
                $logoUrl = 'assets/img/' . $filename;
                $pdo->prepare("INSERT INTO configuracion (clave, valor) VALUES ('logo_url', ?) ON DUPLICATE KEY UPDATE valor = ?")->execute([$logoUrl, $logoUrl]);
                $message = '✅ Logo subido exitosamente';
            }
        } else {
            $message = '❌ Formato no permitido. Use: ' . implode(', ', $allowed);
        }
    }
    
    // Save translation
    if (isset($_POST['save_translation'])) {
        $pdo->prepare("INSERT INTO translations (language, key_name, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?")
            ->execute([$_POST['lang'], $_POST['key'], $_POST['value'], $_POST['value']]);
        $message = '✅ Traducción guardada';
    }
}

$users = $pdo->query("SELECT * FROM usuarios ORDER BY role")->fetchAll();
$categories = $pdo->query("SELECT * FROM categorias ORDER BY nombre")->fetchAll();
$departments = $pdo->query("SELECT * FROM departamentos ORDER BY nombre")->fetchAll();
$locations = $pdo->query("SELECT * FROM ubicaciones ORDER BY nombre")->fetchAll();
$teams = $pdo->query("SELECT * FROM equipos_soporte ORDER BY nombre")->fetchAll();
$ticketTypes = $pdo->query("SELECT * FROM tipos_ticket ORDER BY nombre")->fetchAll();
$configRows = $pdo->query("SELECT * FROM configuracion")->fetchAll();
$config = []; foreach($configRows as $r) $config[$r['clave']] = $r['valor'];
$audit = $pdo->query("SELECT a.*, u.full_name FROM auditoria a JOIN usuarios u ON a.usuario_id = u.id ORDER BY a.timestamp DESC LIMIT 50")->fetchAll();
$translations = $pdo->query("SELECT * FROM translations ORDER BY language, key_name")->fetchAll();
$templates = $pdo->query("SELECT * FROM email_templates ORDER BY nombre")->fetchAll();

$sections = ['users'=>'Usuarios','categories'=>'Categorías','departments'=>'Departamentos','locations'=>'Sedes','teams'=>'Equipos','ticketTypes'=>'Tipos','site'=>'Sitio / Logo','security'=>'Seguridad','passwordPolicy'=>'Políticas Clave','ticketConfig'=>'Tickets','smtp'=>'SMTP','templates'=>'Plantillas','translations'=>'Traducciones','audit'=>'Auditoría'];
$pageTitle = '⚙️ Admin'; $current = 'admin';
require_once __DIR__ . '/includes/header.php'; require_once __DIR__ . '/includes/sidebar.php';
?>
<h1 class="text-2xl font-bold mb-1">⚙️ Administración</h1><p class="text-gray-500 text-sm mb-6">Configuración del sistema</p>
<?php if($message):?><div class="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm"><?= $message?></div><?php endif;?>
<div class="grid lg:grid-cols-4 gap-6">
    <nav class="lg:col-span-1 bg-white rounded-xl p-2 space-y-0.5 h-fit max-h-[80vh] overflow-y-auto"><?php foreach($sections as $k=>$v):?><a href="?s=<?= $k?>" class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs <?= $section===$k?'bg-[#1a3a6c] text-white':'text-gray-600 hover:bg-gray-50'?>"><?= $v?></a><?php endforeach;?></nav>
    <div class="lg:col-span-3">
<?php if($section==='users'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><div class="flex justify-between mb-4"><h2 class="font-semibold">Usuarios</h2><button onclick="document.getElementById('m').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-3 py-2 rounded-lg text-sm">+ Nuevo</button></div><table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="text-left px-3 py-2">Usuario</th><th class="text-left px-3 py-2 hidden md:table-cell">Nombre</th><th class="text-left px-3 py-2">Rol</th><th class="text-left px-3 py-2">Estado</th><th class="px-3 py-2"></th></tr></thead><tbody class="divide-y"><?php foreach($users as $u):?><tr class="hover:bg-gray-50"><td class="px-3 py-2 font-medium"><?= e($u['username'])?></td><td class="px-3 py-2 hidden md:table-cell"><?= e($u['full_name'])?></td><td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"><?= e($u['role'])?></span></td><td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs <?= $u['active']?'bg-green-50 text-green-700':'bg-red-50 text-red-700'?>"><?= $u['active']?'Activo':'Inactivo'?></span></td><td class="px-3 py-2 text-center"><form method="POST"><input type="hidden" name="user_id" value="<?= $u['id']?>"><button type="submit" name="toggle_user" class="text-gray-400 hover:text-[#1a3a6c]">⚡</button></form></td></tr><?php endforeach;?></tbody></table></div>
<div id="m" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"><h2 class="font-bold mb-4">Nuevo Usuario</h2><form method="POST" class="space-y-3"><input required name="username" placeholder="Usuario *" class="w-full px-3 py-2 border rounded-lg text-sm"><input required type="password" name="password" placeholder="Contraseña *" class="w-full px-3 py-2 border rounded-lg text-sm"><p class="text-xs text-gray-500">Debe cumplir políticas de seguridad</p><input required name="full_name" placeholder="Nombre *" class="w-full px-3 py-2 border rounded-lg text-sm"><input required type="email" name="email" placeholder="Correo *" class="w-full px-3 py-2 border rounded-lg text-sm"><select name="role" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="admin">Admin</option><option value="supervisor">Supervisor</option><option value="tecnico">Técnico</option></select><div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#m').classList.add('hidden')" class="px-4 py-2 border rounded-lg text-sm">Cancelar</button><button type="submit" name="create_user" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div></form></div></div>
<?php elseif($section==='categories'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><div class="flex justify-between mb-4"><h2 class="font-semibold">Categorías</h2><button onclick="document.getElementById('mc').classList.remove('hidden')" class="bg-[#1a3a6c] text-white px-3 py-2 rounded-lg text-sm">+ Nueva</button></div><div class="space-y-2"><?php foreach($categories as $c):?><div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"><div><p class="font-medium text-sm"><?= e($c['nombre'])?></p><p class="text-xs text-gray-500"><?= e($c['descripcion'])?></p></div><div class="flex items-center gap-2"><span class="text-xs bg-gray-100 px-2 py-0.5 rounded"><?= e($c['visibilidad'])?></span><span class="text-xs px-2 py-0.5 rounded <?= $c['active']?'bg-green-50 text-green-700':'bg-red-50 text-red-700'?>"><?= $c['active']?'Activa':'Inactiva'?></span><form method="POST"><input type="hidden" name="cat_id" value="<?= $c['id']?>"><button type="submit" name="toggle_cat" class="text-gray-400 hover:text-[#1a3a6c]">⚡</button></form></div></div><?php endforeach;?></div></div>
<div id="mc" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"><h2 class="font-bold mb-4">Nueva Categoría</h2><form method="POST" class="space-y-3"><input required name="nombre" placeholder="Nombre *" class="w-full px-3 py-2 border rounded-lg text-sm"><input name="descripcion" placeholder="Descripción" class="w-full px-3 py-2 border rounded-lg text-sm"><select name="visibilidad" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="both">Ambas</option><option value="external">Externa</option><option value="internal">Interna</option></select><div class="flex justify-end gap-2"><button type="button" onclick="this.closest('#mc').classList.add('hidden')" class="px-4 py-2 border rounded-lg text-sm">Cancelar</button><button type="submit" name="create_cat" class="px-5 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm font-medium">Crear</button></div></form></div></div>
<?php elseif(in_array($section,['departments','locations','teams','ticketTypes'])):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4"><?= $sections[$section]?></h2><div class="space-y-2"><?php $items = $section==='departments'?$departments:($section==='locations'?$locations:($section==='teams'?$teams:$ticketTypes)); foreach($items as $item):?><div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"><div><p class="font-medium text-sm"><?= e($item['nombre'])?></p><?php if(isset($item['descripcion'])):?><p class="text-xs text-gray-500"><?= e($item['descripcion'])?></p><?php endif;?></div></div><?php endforeach;?></div></div>
<?php elseif($section==='site'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border space-y-6">
    <div><h2 class="font-semibold mb-4">Configuración del Sitio</h2>
    <form method="POST" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Marca</label><input type="text" name="config[brand_name]" value="<?= e($config['brand_name']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Título de Ventana</label><input type="text" name="config[window_title]" value="<?= e($config['window_title']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Correo de Soporte Central</label><input type="email" name="config[support_email]" value="<?= e($config['support_email']??'soporte@gob.cl')?>" class="w-full px-3 py-2 border rounded-lg text-sm"><p class="text-xs text-gray-500 mt-1">Recibirá notificación de cada nuevo ticket</p></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label><select name="config[timezone]" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="America/Santiago" <?= ($config['timezone']??'')==='America/Santiago'?'selected':''?>>America/Santiago</option><option value="America/Punta_Arenas" <?= ($config['timezone']??'')==='America/Punta_Arenas'?'selected':''?>>America/Punta_Arenas</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Entradas por Página</label><input type="number" name="config[default_page_size]" value="<?= e($config['default_page_size']??'15')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
    </form></div>
    <hr>
    <div><h2 class="font-semibold mb-4">🖼️ Logo Institucional</h2>
    <?php if(!empty($config['logo_url'])):?>
    <div class="mb-4 p-4 bg-gray-50 rounded-lg text-center"><img src="<?= e($config['logo_url'])?>" alt="Logo" class="max-h-24 mx-auto"></div>
    <?php endif;?>
    <form method="POST" enctype="multipart/form-data" class="space-y-3">
        <input type="file" name="logo" accept=".jpg,.jpeg,.png,.svg,.gif" required class="w-full px-3 py-2 border rounded-lg text-sm">
        <p class="text-xs text-gray-500">Formatos: JPG, PNG, SVG, GIF</p>
        <button type="submit" name="upload_logo" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Subir Logo</button>
    </form></div>
</div>
<?php elseif($section==='security'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4">Seguridad</h2><form method="POST" class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">reCAPTCHA Status</label><select name="config[recaptcha_enabled]" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="0" <?= ($config['recaptcha_enabled']??'0')==='0'?'selected':''?>>Desactivado</option><option value="1" <?= ($config['recaptcha_enabled']??'0')==='1'?'selected':''?>>Activado</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Máx. intentos login</label><input type="number" name="config[max_login_attempts]" value="<?= e($config['max_login_attempts']??'5')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">reCAPTCHA Site Key</label><input type="text" name="config[recaptcha_site_key]" value="<?= e($config['recaptcha_site_key']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">reCAPTCHA Private Key</label><input type="password" name="config[recaptcha_private_key]" value="<?= e($config['recaptcha_private_key']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    </div>
    <div><label class="block text-sm font-medium text-gray-700 mb-1">Minutos de bloqueo IP</label><input type="number" name="config[ip_lock_minutes]" value="<?= e($config['ip_lock_minutes']??'15')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    <button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
</form></div>
<?php elseif($section==='passwordPolicy'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4">🔐 Políticas de Contraseñas</h2><form method="POST" class="space-y-4">
    <div><label class="block text-sm font-medium text-gray-700 mb-1">Longitud Mínima</label><input type="number" name="config[password_min_length]" value="<?= e($config['password_min_length']??'8')?>" min="4" max="50" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    <label class="flex items-center gap-2"><input type="checkbox" name="config[password_require_uppercase]" value="1" <?= ($config['password_require_uppercase']??'1')==='1'?'checked':''?> class="rounded"><span class="text-sm">Requerir al menos una letra mayúscula</span></label>
    <label class="flex items-center gap-2"><input type="checkbox" name="config[password_require_numbers]" value="1" <?= ($config['password_require_numbers']??'1')==='1'?'checked':''?> class="rounded"><span class="text-sm">Requerir al menos un número</span></label>
    <label class="flex items-center gap-2"><input type="checkbox" name="config[password_require_special]" value="1" <?= ($config['password_require_special']??'0')==='1'?'checked':''?> class="rounded"><span class="text-sm">Requerir al menos un carácter especial (!@#$%...)</span></label>
    <input type="hidden" name="config[password_require_uppercase]" value="<?= isset($_POST['config']['password_require_uppercase'])?'1':'0'?>">
    <input type="hidden" name="config[password_require_numbers]" value="<?= isset($_POST['config']['password_require_numbers'])?'1':'0'?>">
    <input type="hidden" name="config[password_require_special]" value="<?= isset($_POST['config']['password_require_special'])?'1':'0'?>">
    <button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar Políticas</button>
</form></div>
<?php elseif($section==='ticketConfig'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4">Configuración de Tickets</h2><form method="POST" class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Orden de Respuestas</label><select name="config[ticket_response_order]" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="newest" <?= ($config['ticket_response_order']??'')==='newest'?'selected':''?>>Más reciente primero</option><option value="oldest" <?= ($config['ticket_response_order']??'')==='oldest'?'selected':''?>>Más antigua primero</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Entradas por Página</label><input type="number" name="config[ticket_entries_per_page]" value="<?= e($config['ticket_entries_per_page']??'15')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">SLA (horas)</label><input type="number" name="config[ticket_sla_hours]" value="<?= e($config['ticket_sla_hours']??'24')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Cierre auto (días)</label><input type="number" name="config[ticket_auto_close_days]" value="<?= e($config['ticket_auto_close_days']??'7')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    </div>
    <label class="flex items-center gap-2"><input type="checkbox" name="config[ticket_allow_attachments]" value="1" <?= ($config['ticket_allow_attachments']??'1')==='1'?'checked':''?> class="rounded"><span class="text-sm">Permitir adjuntos</span></label>
    <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Máx. adjuntos</label><input type="number" name="config[ticket_max_attachments]" value="<?= e($config['ticket_max_attachments']??'5')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tamaño máx. (MB)</label><input type="number" name="config[ticket_max_file_size_mb]" value="<?= e($config['ticket_max_file_size_mb']??'10')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    </div>
    <div><label class="block text-sm font-medium text-gray-700 mb-1">Extensiones permitidas</label><input type="text" name="config[ticket_allowed_extensions]" value="<?= e($config['ticket_allowed_extensions']??'pdf,jpg,jpeg,png,doc,docx')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div>
    <button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button>
</form></div>
<?php elseif($section==='smtp'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4">Configuración SMTP</h2><form method="POST" class="space-y-4"><div class="grid md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Host</label><input type="text" name="config[smtp_host]" value="<?= e($config['smtp_host']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Puerto</label><input type="number" name="config[smtp_port]" value="<?= e($config['smtp_port']??'587')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label><input type="text" name="config[smtp_user]" value="<?= e($config['smtp_user']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Remitente</label><input type="email" name="config[smtp_sender]" value="<?= e($config['smtp_sender']??'')?>" class="w-full px-3 py-2 border rounded-lg text-sm"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Encriptación</label><select name="config[smtp_encryption]" class="w-full px-3 py-2 border rounded-lg text-sm"><option value="TLS" <?= ($config['smtp_encryption']??'')==='TLS'?'selected':''?>>TLS</option><option value="SSL" <?= ($config['smtp_encryption']??'')==='SSL'?'selected':''?>>SSL</option></select></div></div><button type="submit" name="save_config" class="bg-[#1a3a6c] text-white px-5 py-2.5 rounded-lg text-sm font-medium">Guardar</button></form></div>
<?php elseif($section==='templates'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border">
    <h2 class="font-semibold mb-2">📧 Plantillas de Correo</h2>
    <p class="text-xs text-gray-500 mb-4">Variables disponibles: <code class="bg-gray-100 px-1 rounded">{TICKET_CODE}</code> <code class="bg-gray-100 px-1 rounded">{SOLICITANTE}</code> <code class="bg-gray-100 px-1 rounded">{ASUNTO}</code> <code class="bg-gray-100 px-1 rounded">{MENSAJE}</code> <code class="bg-gray-100 px-1 rounded">{LINK}</code></p>
    <div class="space-y-4"><?php foreach($templates as $t):?>
    <details class="border rounded-lg"><summary class="p-3 cursor-pointer hover:bg-gray-50 flex justify-between"><div><h3 class="font-medium text-sm"><?= e($t['nombre'])?></h3><p class="text-xs text-gray-500">Asunto: <?= e($t['asunto'])?></p></div><span class="text-xs px-2 py-0.5 rounded <?= $t['enabled']?'bg-green-50 text-green-700':'bg-gray-100'?>"><?= $t['enabled']?'Activa':'Inactiva'?></span></summary>
    <form method="POST" class="p-3 border-t space-y-2"><input type="hidden" name="template_id" value="<?= $t['id']?>"><input type="text" name="subject" value="<?= e($t['asunto'])?>" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Asunto"><textarea name="html" rows="4" class="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none" placeholder="HTML"><?= e($t['html_content'])?></textarea><textarea name="text" rows="2" class="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Texto plano"><?= e($t['text_content'])?></textarea><label class="flex items-center gap-2"><input type="checkbox" name="enabled" <?= $t['enabled']?'checked':''?> class="rounded"><span class="text-sm">Activa</span></label><button type="submit" name="update_template" class="px-4 py-2 bg-[#1a3a6c] text-white rounded-lg text-sm">Guardar</button></form></details>
    <?php endforeach;?></div>
</div>
<?php elseif($section==='translations'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border">
    <h2 class="font-semibold mb-4">🌐 Traducciones del Sistema</h2>
    <form method="POST" class="flex gap-2 mb-4"><input type="hidden" name="save_translation" value="1">
        <select name="lang" class="px-3 py-2 border rounded-lg text-sm"><option value="es">Español</option><option value="en">English</option></select>
        <input type="text" name="key" placeholder="Clave" required class="flex-1 px-3 py-2 border rounded-lg text-sm">
        <input type="text" name="value" placeholder="Valor" required class="flex-1 px-3 py-2 border rounded-lg text-sm">
        <button class="bg-[#1a3a6c] text-white px-4 py-2 rounded-lg text-sm">Agregar</button>
    </form>
    <table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="text-left px-3 py-2">Idioma</th><th class="text-left px-3 py-2">Clave</th><th class="text-left px-3 py-2">Valor</th></tr></thead><tbody class="divide-y"><?php foreach($translations as $tr):?><tr class="hover:bg-gray-50"><td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"><?= e($tr['language'])?></span></td><td class="px-3 py-2 font-mono text-xs"><?= e($tr['key_name'])?></td><td class="px-3 py-2"><?= e($tr['value'])?></td></tr><?php endforeach;?></tbody></table>
</div>
<?php elseif($section==='audit'):?>
<div class="bg-white rounded-xl p-6 shadow-sm border"><h2 class="font-semibold mb-4">Auditoría</h2><div class="space-y-2"><?php foreach($audit as $a):?><div class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"><div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">🛡️</div><div class="flex-1"><div class="flex items-center gap-2"><span class="text-xs font-mono bg-blue-50 text-[#1a3a6c] px-2 py-0.5 rounded"><?= e($a['accion'])?></span><span class="text-sm text-gray-700"><?= e($a['detalles'])?></span></div><p class="text-xs text-gray-400 mt-0.5"><?= e($a['full_name'])?> • <?= formatDate($a['timestamp'])?></p></div></div><?php endforeach;?></div></div>
<?php endif;?>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
