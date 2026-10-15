import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a6c] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Gobierno de Chile</h1>
          <p className="text-blue-200 mt-2 text-lg">Mesa de Ayuda TI - Sistema PHP Instalable</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Sistema Instalado Exitosamente</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📦 Contenido del Paquete:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><code className="bg-blue-100 px-1 rounded">install.php</code> - Instalador del sistema</li>
              <li><code className="bg-blue-100 px-1 rounded">database.sql</code> - Script de base de datos</li>
              <li><code className="bg-blue-100 px-1 rounded">index.php</code> - Portal Ciudadano</li>
              <li><code className="bg-blue-100 px-1 rounded">login.php</code> - Acceso funcionarios</li>
              <li><code className="bg-blue-100 px-1 rounded">dashboard.php</code> - Panel con KPIs y gráficos</li>
              <li><code className="bg-blue-100 px-1 rounded">tickets.php</code> - Gestión con desglose inline</li>
              <li><code className="bg-blue-100 px-1 rounded">ticket-detail.php</code> - Vista detallada</li>
              <li><code className="bg-blue-100 px-1 rounded">board.php</code> - Pizarra colaborativa</li>
              <li><code className="bg-blue-100 px-1 rounded">news.php</code> - Zona de Noticias</li>
              <li><code className="bg-blue-100 px-1 rounded">notifications.php</code> - Notificaciones</li>
              <li><code className="bg-blue-100 px-1 rounded">emails.php</code> - Registro de Correos</li>
              <li><code className="bg-blue-100 px-1 rounded">knowledge.php</code> - Base de Conocimiento</li>
              <li><code className="bg-blue-100 px-1 rounded">profile.php</code> - Mi Perfil</li>
              <li><code className="bg-blue-100 px-1 rounded">admin.php</code> - Administración completa</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">🚀 Instalación Rápida:</h3>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Suba todos los archivos a <code className="bg-green-100 px-1 rounded">public_html/</code></li>
              <li>Acceda a <code className="bg-green-100 px-1 rounded">install.php</code> desde su navegador</li>
              <li>Complete los datos de conexión MySQL</li>
              <li>¡Sistema listo para usar!</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🔐 Credenciales por Defecto:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-yellow-100 rounded p-2"><p className="font-bold">Admin</p><p>admin</p></div>
              <div className="bg-yellow-100 rounded p-2"><p className="font-bold">Supervisor</p><p>supervisor</p></div>
              <div className="bg-yellow-100 rounded p-2"><p className="font-bold">Técnico</p><p>tecnico</p></div>
            </div>
            <p className="text-xs text-yellow-700 mt-2 text-center">Contraseña: admin123</p>
          </div>

          <div className="text-center">
            <a href="install.php" className="inline-block bg-[#d4272e] hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              🔧 Ir al Instalador (install.php)
            </a>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">© {new Date().getFullYear()} Gobierno de Chile — Mesa de Ayuda TI v2.0</p>
      </div>
    </div>
  );
}
