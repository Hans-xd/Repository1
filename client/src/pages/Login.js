// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {

     await login({ username: usuario, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error iniciando sesión');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
        <div className="form-footer">
          <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="form-footer">
          <span>¿No tienes cuenta? </span>
          <a href="/register">Regístrate</a>
        </div>
      </form>
    </div>
  );
}
