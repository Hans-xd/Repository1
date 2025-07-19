// src/pages/LandingPage.js
import React, { useEffect, useState } from 'react';
import StatsOverview from '../components/StatsOverview';
import RecentPlaces from '../components/RecentPlaces';
import TopRatedPlaces from '../components/TopRatedPlaces';
import OnboardingModal from '../components/OnboardingModal';
import '../cssComponent/LandingPage.css'; // si tienes estilos específicos

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('seenOnboarding');
    if (!seen) setShowOnboarding(true);
  }, []);

  return (
    <main className="landing-page">
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      <section className="hero">
        <h1>Accesibilidad y Movilidad</h1>
        <p>Encuentra lugares inclusivos y planifica tu ruta</p>
        <a href="/search" className="btn-primary">Empezar</a>
      </section>

      <StatsOverview />
      <RecentPlaces />
      <TopRatedPlaces />
      {/* Opcional: sección “Cómo funciona” si la quieres incluir aquí */}
    </main>
  );
}
