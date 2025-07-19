// src/components/InfoTooltip.js
import React, { useState } from 'react';
import './InfoTooltip.css';

export default function InfoTooltip({ label, content }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span className="info-icon" onClick={() => setOpen(true)}>❔</span>
      {open && (
        <div className="info-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="info-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
            <h3>{label}</h3>
            <p>{content}</p>
          </div>
        </div>
      )}
    </>
  );
}
