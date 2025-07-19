// src/components/VoiceSearch.js
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cssComponent/VoiceSearch.css';




export default function VoiceSearch() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = event => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      navigate(`/search?query=${encodeURIComponent(text)}`);
    };
    recognition.onerror = event => {
      console.error('Error en reconocimiento de voz:', event.error);
    };
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  return (
    <div className="voice-search">
      <button
        onClick={listening ? stopListening : startListening}
        className="btn-voice"
      >
        {listening ? '🛑 Detener' : '🎤 Hablar'}
      </button>
    </div>
  );
}
