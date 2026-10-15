<?php
$current = $current ?? '';
$user = currentUser();
?>
<aside id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-[#1a1a2e] text-white z-50 transform -translate-x-full lg:translate-x-0 transition-transform">
    <div class="flex flex-col h-full">
        <div class="p-4 border-b border-white/10 flex items-center gap-3">
            <div class="w-9 h-9 bg-[#d4272e] rounded-lg flex items-center justify-center"><span class="text-lg">🏛️</span></div>
            <div><h2 class="text-sm font-bold">GdC | HELPDESK</h2><p class="text-xs text-gray-400">Mesa de Ayuda TI</p></div>
        </div>
        <div class="px-4 py-3 border-b border-white/10">
            <p class="text-sm font-medium truncate"><?= e($user['fullName']) ?></p>
            <p class="text-xs text-gray-400 capitalize"><?= e($user['role'] === 'admin' ? 'Administrador' : $user['role']) ?></p>
        </div>
        <nav class="flex-1 py-2 overflow-y-auto">
            <?php
            $items = [
                ['dashboard', '📊', 'Resumen', 'dashboard.php'],
                ['tickets', '🎫', 'Tickets', 'tickets.php'],
                ['board', '📌', 'Pizarra', 'board.php'],
                ['news', '📰', 'Noticias', 'news.php'],
                ['notifications', '🔔', 'Notificaciones', 'notifications.php'],
                ['emails', '✉️', 'Correos', 'emails.php'],
                ['knowledge', '📚', 'Conocimiento', 'knowledge.php'],
            ];
            if (isAdmin()) $items[] = ['admin', '⚙️', 'Admin', 'admin.php'];
            $items[] = ['profile', '🔄', 'Mi Perfil', 'profile.php'];
            foreach ($items as $i):
            ?>
            <a href="<?= $i[3] ?>" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white <?= $current===$i[0]?'bg-white/10 border-r-3 border-[#d4272e]':'hover:bg-white/5' ?>"><span><?= $i[1] ?></span><?= $i[2] ?></a>
            <?php endforeach; ?>
        </nav>
        <div class="p-4 border-t border-white/10 space-y-1">
            <a href="index.php" class="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded">🌐 Portal</a>
            <a href="logout.php" class="flex items-center gap-3 px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-white/5 rounded">🚪 Salir</a>
        </div>
    </div>
</aside>
<div class="lg:ml-64">
    <header class="bg-white shadow-sm border-b sticky top-0 z-30">
        <div class="flex items-center justify-between h-14 px-4">
            <button onclick="document.getElementById('sidebar').classList.toggle('-translate-x-full')" class="lg:hidden text-gray-600 p-1">☰</button>
            <div class="hidden lg:block"><h2 class="text-sm font-medium text-gray-600"><?= e($pageTitle) ?></h2></div>
            <div class="flex items-center gap-3">
                <a href="notifications.php" class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">🔔<?php if ($unreadNotifs > 0): ?><span class="absolute top-0 right-0 w-4 h-4 bg-[#d4272e] text-white text-[10px] rounded-full flex items-center justify-center"><?= $unreadNotifs ?></span><?php endif; ?></a>
                <div class="flex items-center gap-2 pl-3 border-l"><div class="w-8 h-8 bg-[#1a3a6c] rounded-full flex items-center justify-center text-white text-xs font-bold"><?= strtoupper(substr($user['fullName'], 0, 1)) ?></div><span class="hidden sm:block text-sm font-medium"><?= e($user['fullName']) ?></span></div>
            </div>
        </div>
    </header>
    <main class="p-4 md:p-6 lg:p-8">
