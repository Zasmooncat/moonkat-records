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

import audio1 from "../assets/audio/LoveYouDontKnowMe_feat_Mrkickz_mst-6.mp3";
import audio2 from "../assets/audio/mooncat-horizons_ms4.mp3";
import audio3 from "../assets/audio/Mooncat - Green Horns.mp3";
import audio4 from "../assets/audio/forgiven_kiamya_Mooncat_remix.mp3";

const Home = () => {
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tracks = [
    {
      title: "Love You Don't Know Me (Mooncat Remix)",
      artist: "Mr.Kickz",
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

  const [videoReady, setVideoReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsReady(true);
    });
  }, []);

  useEffect(() => {
    // Initial Load Animations
    if (!videoReady || !fontsReady) return;

    const titleRefWords = titleRef.current ? titleRef.current.querySelectorAll(".word-wrapper") : [];
    const textChars = textRef.current ? textRef.current.querySelectorAll(".char") : [];
    const buttons = buttonsRef.current;
    const navItems = navRef.current ? navRef.current.children : [];
    const logoEl = logoRef.current;
    const headerEl = headerRef.current;
    const playerEl = playerRef.current;

    // Global Header (Layout component)
    const globalHeader = document.querySelector("header.fixed");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Initial State: Hide all
      gsap.set([logoEl, headerEl, globalHeader, playerEl, titleRef.current, textRef.current, ...Array.from(titleRefWords), ...Array.from(textChars), buttons, ...Array.from(navItems)], {
        autoAlpha: 0
      });

      // 2. PHASE 1: Title Words Entrance (Word by Word)
      tl.set(titleRef.current, { autoAlpha: 1 }); // Show container
      tl.fromTo(titleRefWords,
        {
          autoAlpha: 0,
          y: "100vh"
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.15,
          stagger: 0.15,
          ease: "power2.inOut"
        }
      );

      // 3. PHASE 2: Text Letter Flicker (Simultaneous Start)
      tl.set(textRef.current, { autoAlpha: 1 }, "phase2Start"); // Show container
      tl.add("phase2Start", "+=0.05");
      Array.from(textChars).forEach((char) => {
        const charTl = gsap.timeline();
        const flickerCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < flickerCount; i++) {
          charTl.to(char, {
            autoAlpha: Math.random() > 0.5 ? 0.9 : 0.1,
            duration: 0.02 + Math.random() * 0.04,
          }).to(char, {
            autoAlpha: 0,
            duration: 0.01 + Math.random() * 0.03,
          });
        }
        charTl.to(char, { autoAlpha: 1, duration: 0.1, ease: "power2.out" });

        tl.add(charTl, "phase2Start");
      });

      // 4. PHASE 3: Logo, Header, Player, Buttons and Nav Fade-in
      tl.to([logoEl, headerEl, globalHeader, playerEl, buttons, navRef.current, ...Array.from(navItems)], {
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        onComplete: () => {
          // No clearProps on the containers that have opacity-0 class 
          // to avoid them jumping back to hidden. Just clear children.
          gsap.set([...Array.from(titleRefWords), ...Array.from(textChars)], { clearProps: "all" });
        }
      }, "+=0.1");

    });

    return () => ctx.revert();
  }, [videoReady]);

  // Fallback: Start animation even if video fails to load after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      // Different offsets for different sections
      const offset = (id === 'releases' || id === 'artists') ? 120 : 0;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const navLinks = [
    { name: "RELEASES", id: "releases", video: hoverVideoReleases },
    { name: "ARTISTS", id: "artists", video: hoverVideoArtists },
    { name: "MERCH", id: "merch", video: hoverVideoMerch },
    { name: "CONTACT", id: "contact", video: hoverVideoContact }
  ];

  return (
    <section className="relative min-h-screen text-white px-6 md:px-14 md:py-10 overflow-hidden flex md:items-center items-start justify-center">

      {/* ===== BACKGROUND IMAGE ===== */}
      {/* <div
        className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${fondo})` }}
      /> */}
      <video
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${videoReady ? 'opacity-80' : 'opacity-0'}`}
        src={fondovideo}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoReady(true)}
      ></video>

      {/* ===== DARK OVERLAY ===== */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/20 to-black transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`} />


      {/* ================= MOBILE HEADER (LOGO + HAMBURGER) ================= */}
      <div ref={headerRef} className="absolute top-20 left-6 right-6 flex md:hidden items-center justify-between z-50 opacity-0">
        <img
          src={logo}
          alt="Moonkat Records Logo"
          className="h-8 drop-shadow-xl cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
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
              className="text-3xl titulo font-bold text-white hover:text-pink-100 transition-colors tracking-widest uppercase"
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
      <div className="relative z-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center w-full max-w-7xl pt-40 md:pt-0">
        {/* ===== LEFT COLUMN ===== */}

        <div className="flex flex-col justify-center">
          {/* Desktop Logo Only */}

          <img
            ref={logoRef}
            src={logo}
            alt="Moonkat Records Logo"
            className="hidden md:block h-9 mb-10 drop-shadow-xl self-start cursor-pointer transition-transform hover:scale-105 opacity-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <h1 ref={titleRef} className="titulo text-3xl uppercase md:text-6xl font-bold leading-tight tracking-wider opacity-0">
            <div className="flex flex-wrap gap-x-4">
              {["Drum", "&", "Bass"].map((word, i) => (
                <span key={i} className="word-wrapper inline-block">{word}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 text-pink-100">
              {["Underground"].map((word, i) => (
                <span key={i} className="word-wrapper inline-block">{word}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4">
              {["Culture"].map((word, i) => (
                <span key={i} className="word-wrapper inline-block">{word}</span>
              ))}
            </div>
          </h1>

          <div ref={textRef} className="bebas opacity-0">
            <p className="mt-8 max-w-lg text-zinc-300 leading-relaxed border-t border-white/20 pt-6">
              {"Moonkat Records ® — Independent label focused on deep, dubbed, emotional and futuristic Drum & Bass / Jungle music.".split("").map((char, i) => (
                <span key={i} className="char inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </p>
            <p className="mt-4 max-w-lg text-pink-200 text-lg leading-relaxed">
              {"Hit subscribe to get promos.".split("").map((char, i) => (
                <span key={i} className="char inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </p>
          </div>
          <div ref={buttonsRef} className="mt-8 md:mt-10 flex gap-6 items-center font-sans-custom opacity-0">
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
        <div ref={navRef} className="hidden md:grid grid-cols-2 gap-4 w-full max-w-lg ml-auto opacity-0">
          {navLinks.map((item) => (
            <div
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className={`
                 group relative aspect-square bg-gradient from-white/50 via-transparent to-white/50 backdrop-blur-xl
                 border-t border-l border-white/50 border-r border-b border-white/5
                 flex flex-col justify-between p-7 cursor-pointer overflow-hidden transition-all duration-500
                 hover:bg-white/[0.07] hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]
                  rounded-2xl
               `}
            >
              {/* Liquid Reflection Overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <video
                src={item.video}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 mix-blend-screen scale-110 group-hover:scale-100 transition-transform duration-1000"
              />

              <div className="relative z-10 flex flex-col h-full justify-end">
                <h3 className=" font-zen text-pink-100 tracking-[0.2em] text-right group-hover:text-white transition-colors uppercase text-sm md:text-base leading-none">
                  {item.name}
                </h3>
                {/* <div className="h-[1px] w-0 group-hover:w-12 bg-pink-400 mt-2 self-end transition-all duration-500 opacity-0 group-hover:opacity-100" /> */}
              </div>
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

      <MusicPlayer ref={playerRef} tracks={tracks} />

    </section>
  );
};

export default Home;