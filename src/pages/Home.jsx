import { useState, useEffect } from "react";
import SubscribeModal from "../components/SubscribeModal";
import SendDemosModal from "../components/SendDemosModal";

import { fadeInUpScroll } from "../components/animations/gsapAnimations";
import video from "../assets/video/moonkat-render.mp4";
import { FaInstagram, FaSpotify, FaApple, FaYoutube } from "react-icons/fa";

const Home = () => {
  useEffect(() => {
    fadeInUpScroll(".home-title");
  }, []);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* ================= VIDEO BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-90"
        >
          <source src={video} type="video/mp4" />
          Tu navegador no soporta el video.
        </video>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* ================= CONTENIDO ================= */}
      <div className="relative z-10 min-h-screen parent md:grid text-white">

        {/* ===== DIV 2 : TEXTO + RRSS ===== */}
        <div className="div2 md:ps-16 md:mt-1 mt-10 text-center md:text-start order-3 md:order-none">
          <h1>MOONKAT RECORDS ®</h1>

          <p className="text-xs text-zinc-200 max-w-xs mx-auto md:mx-0">
            Drum&Bass / Jungle Label created for the underground music scene.
          </p>

          <div className="flex md:flex-col gap-4 mt-4 justify-center md:justify-start md:mt-6">
            <a
              href="https://www.instagram.com/moonkat_records/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-300 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={22} />
            </a>

            <a
              href="https://open.spotify.com/intl-es/artist/4TpaRMxJFAVHyLunW3UvwW"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-300 transition-colors"
              aria-label="Spotify"
            >
              <FaSpotify size={22} />
            </a>

            <a
              href="https://music.apple.com/es/artist/mooncat/152398714"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-300 transition-colors"
              aria-label="Apple Music"
            >
              <FaApple size={22} />
            </a>

            <a
              href="https://www.youtube.com/watch?v=IjWGeIfoeY0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-300 transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube size={22} />
            </a>
          </div>
        </div>

        {/* ===== DIV 3 : MENÚ DESKTOP ===== */}
        <nav className="div3 hidden md:block text-right mt-5 pe-16">
          <h2
            onClick={() => scrollToSection("releases")}
            className="pb-6 cursor-pointer hover:text-violet-300 transition-colors"
          >
            RELEASES
          </h2>

          <h2
            onClick={() => scrollToSection("artists")}
            className="pb-6 cursor-pointer hover:text-violet-300 transition-colors"
          >
            ARTISTS
          </h2>

          <h2
            onClick={() => setIsSendDemosOpen(true)}
            className="cursor-pointer hover:text-violet-300 transition-colors"
          >
            SEND DEMOS
          </h2>
        </nav>

        {/* ===== DIV 4 : CTA ===== */}
        <div className="div4 mt-20 md:mt-0 flex flex-col order-2 md:order-none">
          <h1 className="text-center text-3xl md:text-5xl font-bold pt-10">
            Subscribe to the promo list
          </h1>

          <p className="text-center mt-6 text-zinc-100">
            And get our music before it's released!
          </p>

          <button
            className="boton-elegante mx-auto my-8"
            onClick={() => setIsSubscribeOpen(true)}
          >
            subscribe
          </button>
        </div>
        <SubscribeModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
        />

        <SendDemosModal
          isOpen={isSendDemosOpen}
          onClose={() => setIsSendDemosOpen(false)}
        />

      </div>
    </section>
  );
};

export default Home;
