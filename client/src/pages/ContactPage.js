// src/pages/ContactPage.js
import React, { useState } from 'react';
import '../cssComponent/ContactPage.css';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const onSubmit = e => {
    e.preventDefault();
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setName('');
          setEmail('');
          setMessage('');
        } else setStatus('error');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  };

  return (
    <main className="contact-page">
      <h1>Contáctanos</h1>
      <form onSubmit={onSubmit} className="contact-form">
        <label>
          Nombre:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Correo electrónico:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mensaje:
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows="4"
            required
          />
        </label>
        <button type="submit" className="btn-primary">Enviar</button>
        {status === 'success' && <p className="success">Mensaje enviado. ¡Gracias!</p>}
        {status === 'error' && <p className="error">Hubo un error, intenta de nuevo.</p>}
      </form>
    </main>
  );
}
