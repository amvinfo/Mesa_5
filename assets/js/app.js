/**
 * Mesa de Ayuda GdC - JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts
    setTimeout(function() {
        document.querySelectorAll('.animate-slide').forEach(function(el) {
            if (el.closest('form') === null) {
                el.style.transition = 'opacity 0.5s';
                el.style.opacity = '0';
                setTimeout(function() { el.remove(); }, 500);
            }
        });
    }, 5000);

    // Close modals on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.fixed.inset-0').forEach(function(modal) {
                modal.classList.add('hidden');
            });
        }
    });

    // Close modals on backdrop click
    document.querySelectorAll('.fixed.inset-0').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });
});
