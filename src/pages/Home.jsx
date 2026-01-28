import { useState, useEffect, useRef } from "react";
import { fadeInUp, fadeInUpStagger, fadeInUpStaggerLoad } from "../components/animations/gsapAnimations";
import { gsap } from "gsap";
import { HiMenu, HiX } from "react-icons/hi";
import fondo from "../assets/images/fondo/textura_industrial.jpg"
import fondovideo from "../assets/video/amoeba3D.mp4"
import logo from "../assets/images/logos/Isotipo2.png";
import hoverVideoReleases from "../assets/video/glitchtd3.mp4";
import hoverVideoArtists from "../assets/video/glitchtd2.mp4";
import hoverVideoMerch from "../assets/video/glitchtd.mp4";
import hoverVideoContact from "../assets/video/glitchtd3.mp4";

import SubscribeModal from "../components/SubscribeModal";
import SendDemosModal from "../components/SendDemosModal";
import MusicPlayer from "../components/MusicPlayer";

import audio1 from "../assets/audio/LoveYouDontKnowMe_feat_Mrkickz_mst-6.wav";
import audio2 from "../assets/audio/mooncat-horizons_ms4.wav";
import audio3 from "../assets/audio/Mooncat - Green Horns.wav";
import audio4 from "../assets/audio/forgiven_kiamya_Mooncat_remix.wav";

const Home = () => {
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const navRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tracks = [
    {
      title: "Love You Don't Know Me (ft. Mr Kickz)",
      artist: "Moonkat",
      src: audio1
    },
    {
      title: "Horizons",
      artist: "Mooncat",
      src: audio2
    },
    {
      title: "Green Horns",
      artist: "Mooncat",
      src: audio3
    },
    {
      title: "Forgiven (Mooncat Remix)",
      artist: "Kiamya",
      src: audio4
    }
  ];

  useEffect(() => {
    // Initial Load Animations
    const titleLines = titleRef.current.children;
    const navItems = navRef.current ? navRef.current.children : [];

    const ctx = gsap.context(() => {
      const allElements = [
        logoRef.current,
        ...Array.from(titleLines),
        textRef.current,
        buttonsRef.current,
        ...Array.from(navItems)
      ].filter(el => el !== null);

      // 0. Initial state - Hidden
      gsap.set(allElements, { opacity: 0, visibility: "visible" });

      // 1. Independent Random Flickering for each element
      allElements.forEach((el) => {
        const tl = gsap.timeline({
          delay: Math.random() * 0.3 // Random start delay for each tube
        });

        const flickerCount = 4 + Math.floor(Math.random() * 4); // 4 to 8 flickers

        for (let i = 0; i < flickerCount; i++) {
          tl.to(el, {
            opacity: Math.random() > 0.6 ? 0.3 : 0.8,
            duration: 0.03 + Math.random() * 0.08,
            filter: Math.random() > 0.5 ? "drop-shadow(0 0 10px rgba(255,192,203,0.3))" : "none"
          })
            .to(el, {
              opacity: 0,
              duration: 0.02 + Math.random() * 0.05
            });
        }

        // Final turn on with a little "pop"
        tl.to(el, {
          opacity: 1,
          scale: 1.02,
          filter: "drop-shadow(0 0 15px rgba(255,192,203,0.6))",
          duration: 0.1,
          ease: "power2.out"
        })
          .to(el, {
            scale: 1,
            filter: "none",
            duration: 0.3,
            onComplete: () => {
              // Force visibility and clear GSAP styles so CSS hovers work
              gsap.set(el, { clearProps: "all", opacity: 1 });
            }
          });
      });
    });

    return () => ctx.revert();
  }, []);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { name: "RELEASES", id: "releases", video: hoverVideoReleases },
    { name: "ARTISTS", id: "artists", video: hoverVideoArtists },
    { name: "MERCH", id: "merch", video: hoverVideoMerch },
    { name: "CONTACT", id: "contact", video: hoverVideoContact }
  ];

  return (
    <section className="relative min-h-screen text-white px-6 md:px-14 md:py-10 overflow-hidden flex items-center justify-center">

      {/* ===== BACKGROUND IMAGE ===== */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondo})` }}
      />
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        src={fondovideo}
        autoPlay
        loop
        muted
      ></video>

      {/* ===== DARK OVERLAY ===== */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/20 to-black" />


      {/* ================= HAMBURGER MENU (MOBILE ONLY) ================= */}
      <div className="absolute top-20 right-6 md:hidden z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:text-pink-200 transition-colors p-2"
        >
          {isMenuOpen ? <HiX size={32} /> : <HiMenu size={32} />}
        </button>
      </div>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center transition-all duration-500 ease-in-out md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex flex-col gap-8 text-center px-10 font-sans">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.id)}
              className="text-4xl font-heading font-bold text-white hover:text-pink-100 transition-colors tracking-widest uppercase"
            >
              {link.name}
            </button>
          ))}

          <button
            onClick={() => { setIsMenuOpen(false); setIsSendDemosOpen(true); }}
            className="text-xl font-mono text-zinc-400 hover:text-white transition-colors mt-8 uppercase tracking-wider"
          >
            Send Demo
          </button>
        </div>
      </div>



      {/* ================= MAIN GRID ================= */}
      <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center w-full max-w-7xl">
        {/* ===== LEFT COLUMN ===== */}

        <div className="flex flex-col justify-center">
          <img
            ref={logoRef}
            src={logo}
            alt="Moonkat Records Logo"
            className="h-9 mb-10 drop-shadow-xl self-start cursor-pointer transition-transform hover:scale-105"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <h1 ref={titleRef} className="titulo text-3xl uppercase md:text-6xl font-bold leading-tight tracking-wider">
            <div className="inline-block">Drum & Bass</div> <br />
            <div className="inline-block text-pink-100">Underground</div> <br />
            <div className="inline-block">Culture</div>
          </h1>

          <div ref={textRef} className="bebas">
            <p className="mt-8 max-w-lg text-zinc-300  leading-relaxed border-t border-white/20 pt-6">
              <span className="font-bold text-white">Moonkat Records ®</span> — Independent label focused on deep, dubbed, emotional and futuristic Drum & Bass and Jungle music.
            </p>
            <p className="mt-4 max-w-lg text-pink-200 text-lg leading-relaxed">
              Hit subscribe to get promos.
            </p>
          </div>
          <div ref={buttonsRef} className="mt-10 flex gap-6 items-center font-sans-custom">
            <button
              className="boton-elegante"
              onClick={() => setIsSubscribeOpen(true)}
            >
              SUBSCRIBE
            </button>

            <span
              onClick={() => setIsSendDemosOpen(true)}
              className="cursor-pointer text-sm font-bold tracking-widest hover:text-violet-400 transition-colors uppercase"
            >
              Send Demo →
            </span>
          </div>



        </div>


        {/* ===== RIGHT COLUMN (NAVIGATION) ===== */}
        <div ref={navRef} className="hidden md:grid grid-cols-2 gap-4 w-full max-w-lg ml-auto">
          {navLinks.map((item) => (
            <div
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className={`
                 group relative aspect-square bg-zinc-900/60 backdrop-blur-md border border-white/20 
                 flex flex-col justify-between p-6 cursor-pointer overflow-hidden transition-all duration-300
                 hover:bg-white/5 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
               `}
            >
              <video
                src={item.video}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 mix-blend-screen"
              />

              <h3 className="relative text-pink-200 z-10 font-heading tracking-widest text-right group-hover:text-white transition-colors uppercase self-end">
                {item.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />

      <SendDemosModal
        isOpen={isSendDemosOpen}
        onClose={() => setIsSendDemosOpen(false)}
      />

      <MusicPlayer tracks={tracks} />

    </section>
  );
};

export default Home;