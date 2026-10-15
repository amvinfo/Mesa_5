import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      window.location.hash = '#/dashboard';
    } else {
      setError('Credenciales inválidas. Verifique su usuario y contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gob-blue via-blue-800 to-gob-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Gobierno de Chile</h1>
          <p className="text-blue-200 text-sm mt-1">Mesa de Ayuda - Acceso Funcionarios</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 animate-fade-in">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-blue focus:border-transparent"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gob-blue focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-gob-blue hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-colors">
              Ingresar al Sistema
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Credenciales de prueba:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-700">Admin</p>
                <p className="text-gray-500">admin</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-700">Supervisor</p>
                <p className="text-gray-500">supervisor</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-700">Técnico</p>
                <p className="text-gray-500">tecnico</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Contraseña: admin123</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="#/" className="text-blue-200 hover:text-white text-sm transition-colors">
            ← Volver al Portal Ciudadano
          </a>
        </div>
      </div>
    </div>
  );
}
