import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    nombreP: '',
    apellidoP: '',
    apellidoS: '',
    email: '',
    password: '',
    confirm: '',
    photoUrl: '',
    nivel: '',
    discapacidad: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    console.log('[FRONT] Form data:', form);

    // Validación mínima en frontend
    if (
      !form.username ||
      !form.nombreP ||
      !form.apellidoP ||
      !form.email ||
      !form.password ||
      !form.confirm
    ) {
      return setError('Por favor completa todos los campos obligatorios.');
    }
    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden.');
    }

    try {
        console.log('[FRONT] Enviando fetch /api/register …');
        const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user:      form.username,
          password:  form.password,
          nombreP:   form.nombreP,
          apellidoP: form.apellidoP,
          apellidoS: form.apellidoS || null,
          email:     form.email
        })
      });

        console.log('[FRONT] status:', res.status);

    let data;
    if (!res.ok) {
    try { data = await res.json(); } catch (_) { data = null; }
    console.error('[FRONT] error body:', data);
    const err = await res.json();
    throw new Error(err.error || 'Registro fallido');
    }
    data = await res.json();
    console.log('[FRONT] success body:', data);

      // Éxito → redirige a login
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        {error && <div className="form-error">{error}</div>}

        <label>
          Usuario *
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Tu usuario"
          />
        </label>

        <label>
          Nombre completo *
          <input
            type="text"
            name="nombreP"
            value={form.nombreP}
            onChange={handleChange}
            placeholder="Tu nombre"
          />
        </label>

        <label>
          Apellido paterno *
          <input
            type="text"
            name="apellidoP"
            value={form.apellidoP}
            onChange={handleChange}
            placeholder="Apellido paterno"
          />
        </label>

        <label>
          Apellido materno
          <input
            type="text"
            name="apellidoS"
            value={form.apellidoS}
            onChange={handleChange}
            placeholder="Apellido materno"
          />
        </label>

        <label>
          Correo electrónico *
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>

        <label>
          Contraseña *
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </label>

        <label>
          Confirmar contraseña *
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="btn btn-primary">
          Registrarse
        </button>
      </form>
    </div>
  );
}
