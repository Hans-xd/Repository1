// src/pages/HomePage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/global.css";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import FeaturedPlaces from "../components/FeaturedPlaces";
import HowItWorks from "../components/HowItWorks";
import { fetchRecommendations } from "../api/recommendations";

import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [reviewsView, setReviewsView] = useState([]);
  const [nearbyReviews, setNearbyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const serviceRef = useRef(null);
  const navigate = useNavigate();

  // 1) Espera a que window.google esté listo, luego inicializa PlacesService y carga reseñas
  useEffect(() => {
    let intervalId = null;

    const initAndLoadReviews = async () => {
      // Inicializa PlacesService en un div oculto
      const div = document.createElement("div");
      serviceRef.current = new window.google.maps.places.PlacesService(div);

      try {
        const res = await fetch("/api/reviews", { credentials: "include" });
        const reviews = await res.json();

        const promises = reviews.map((r) => {
          const userPhotoUrl = r.photoUrl;
          return new Promise((resolve) => {
            serviceRef.current.getDetails(
              {
                placeId: r.placeId,
                fields: ["name", "formatted_address", "photos"],
              },
              (place, status) => {
                let placePhotoUrl = "";
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK &&
                  place.photos?.length
                ) {
                  placePhotoUrl = place.photos[0].getUrl({ maxWidth: 400 });
                }
                resolve({
                  ...r,
                  name: place.name,
                  address: place.formatted_address,
                  placePhotoUrl,
                  userPhotoUrl,
                });
              }
            );
          });
        });

        const views = await Promise.all(promises);
        setReviewsView(views);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    // Si ya existe window.google, inicializa de una vez; si no, poll cada 100ms
    if (window.google && !serviceRef.current) {
      initAndLoadReviews();
    } else {
      intervalId = setInterval(() => {
        if (window.google && !serviceRef.current) {
          clearInterval(intervalId);
          initAndLoadReviews();
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // 2) Carga recomendaciones o, si no hay, reseñas cercanas
  useEffect(() => {
    if (!user?.disabilityType) return;

    fetchRecommendations(user.disabilityType)
      .then((data) => {
        if (data.length > 0) {
          setRecommendedPlaces(data);
        } else if (navigator.geolocation) {
          setLoadingNearby(true);
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const { latitude, longitude } = coords;
              fetch(
                `/api/reviews/nearby?lat=${latitude}&lng=${longitude}`,
                { credentials: "include" }
              )
                .then((res) => res.json())
                .then(async (reviews) => {
                  const promises = reviews.map((r) => {
                    const userPhotoUrl = r.photoUrl;
                    return new Promise((resolve) => {
                      serviceRef.current.getDetails(
                        {
                          placeId: r.placeId,
                          fields: ["name", "formatted_address", "photos"],
                        },
                        (place, status) => {
                          let placePhotoUrl = "";
                          if (
                            status ===
                              window.google.maps.places.PlacesServiceStatus.OK &&
                            place.photos?.length
                          ) {
                            placePhotoUrl = place.photos[0].getUrl({
                              maxWidth: 400,
                            });
                          }
                          resolve({
                            ...r,
                            name: place.name,
                            address: place.formatted_address,
                            placePhotoUrl,
                            userPhotoUrl,
                            nameP: r.nameP,
                            lastName: r.lastName,
                          });
                        }
                      );
                    });
                  });
                  const views = await Promise.all(promises);
                  setNearbyReviews(views);
                })
                .catch((err) =>
                  console.error("Error al cargar reseñas cercanas:", err)
                )
                .finally(() => setLoadingNearby(false));
            },
            (err) => {
              console.error("Error geolocalización:", err);
              setLoadingNearby(false);
            }
          );
        }
      })
      .catch((err) =>
        console.error("Error al cargar recomendaciones:", err)
      );
  }, [user]);

  // 3) Opciones del slider para reseñas
  const reviewSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  if (authLoading || loadingReviews || loadingNearby) {
    return <p>Cargando…</p>;
  }

  return (
    <div className="home-page flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <main className="flex-grow p-4">
        <HowItWorks />

        <FeaturedPlaces />
        <hr style={{ margin: "2rem 1rem", border: "1px solid #d1d1d1" }} />

        {/* Reseñas destacadas como carrusel */}
        <section className="reviews-section" style={{ marginBottom: "2rem" }}>
          <h3>Reseñas destacadas</h3>
          <Slider {...reviewSettings} className="reviews-carousel">
            {reviewsView.map((r) => (
              <div key={r.placeId} className="review-slide">
                <div
                  className="review-card"
                  onClick={() => navigate(`/place/${r.placeId}`)}
                >
                  {r.placePhotoUrl && (
                    <img
                      src={r.placePhotoUrl}
                      alt={r.name}
                      style={{
                        borderRadius: "8px 8px 0 0",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div className="review-content">
                    <h4>{r.name}</h4>
                    <p className="address">{r.address}</p>
                    <div className="rating">
                      {(() => {
                        const full = Math.floor(r.rating);
                        const half = r.rating - full === 0.5;
                        const empty = 5 - full - (half ? 1 : 0);
                        return (
                          <>
                            {[...Array(full)].map((_, i) => (
                              <span key={i} className="star filled">
                                ★
                              </span>
                            ))}
                            {half && (
                              <span className="star half">★</span>
                            )}
                            {[...Array(empty)].map((_, i) => (
                              <span key={i} className="star">☆</span>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                    <div className="reviewer">
                      {r.userPhotoUrl && (
                        <img
                          src={process.env.PUBLIC_URL + r.userPhotoUrl}
                          alt={`${r.nameP} ${r.lastName}`}
                        />
                      )}
                      <div className="reviewer-info">
                        <strong>
                          {r.nameP} {r.lastName}
                        </strong>
                        <small>
                          {new Date(r.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </small>
                      </div>
                    </div>
                    <p className="comment">{r.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* Recomendaciones personalizadas o reseñas cercanas */}
        {user?.disabilityType &&
          (recommendedPlaces.length > 0 ? (
            <section className="recommendations mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Recomendaciones para ti
              </h2>
              <div className="reviews-grid">
                {recommendedPlaces.map((place) => (
                  <div key={place.id} className="review-card">
                    {place.photoUrl && (
                      <img src={place.photoUrl} alt={place.name} />
                    )}
                    <div className="review-content">
                      <h4>{place.name}</h4>
                      <p className="comment">{place.description}</p>
                      <button onClick={() => navigate(`/places/${place.id}`)}>
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="nearby mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Reseñas cercanas
              </h2>
              <div className="reviews-grid">
                {nearbyReviews.map((r) => (
                  <div key={r.placeId} className="review-card">
                    {r.placePhotoUrl && (
                      <img src={r.placePhotoUrl} alt={r.name} />
                    )}
                    <div className="review-content">
                      <h4>{r.name}</h4>
                      <p className="address">{r.address}</p>
                      <div className="rating">
                        {(() => {
                          const full = Math.floor(r.rating);
                          const half = r.rating - full === 0.5;
                          const empty = 5 - full - (half ? 1 : 0);
                          return (
                            <>
                              {[...Array(full)].map((_, i) => (
                                <span key={i} className="star filled">
                                  ★
                                </span>
                              ))}
                              {half && (
                                <span className="star half">★</span>
                              )}
                              {[...Array(empty)].map((_, i) => (
                                <span key={i} className="star">☆</span>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                      <p className="comment">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              
            </section>
            
          ))}<br/><br/>
      </main>
      <br/><br/>
      <Footer />
    </div>
  );
}
