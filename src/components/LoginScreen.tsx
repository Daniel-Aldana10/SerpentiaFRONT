import React, { useState } from 'react';
import type { Screen } from '../App';
import './AuthScreen.css';
import { loginUser } from '../api/ApiAuth';
import { useUser } from '../context/UserContext';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLogin }) => {
  const { refreshUsername } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { username, password } = formData;
      if (username.length < 3 || username.length > 15) {
        throw new Error('El nombre de usuario debe tener entre 3 y 15 caracteres.');
      }
      // Llamada real a la API
      const token = await loginUser({ username, password });
      refreshUsername();
      onLogin(token);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <button 
            className="back-button"
            onClick={() => onNavigate('welcome')}
          >
            ← Volver
          </button>
          <h1 className="auth-title">
            <span className="serpent-icon">🐍</span>
            Iniciar Sesión
          </h1>
        </div>

        {/* ✅ ABRIR FORMULARIO */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Tu nombre de usuario"
              required
              className={error ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              className={error ? 'error' : ''}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary full-width"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="form-footer">
            <p>
              ¿No tienes cuenta?{' '}
              <button 
                type="button"
                className="link-button"
                onClick={() => onNavigate('register')}
              >
                Regístrate aquí
              </button>
            </p>
          </div>

          <div className="demo-info">
            <p><strong>Demo:</strong> demo@serpentia.com / demo123</p>
          </div>
        </form>
        {/* ✅ CERRAR FORMULARIO */}
      </div>
    </div>
  );
};

export default LoginScreen;