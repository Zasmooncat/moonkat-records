import { useState, useEffect, useRef } from "react";
import { fadeInUp, fadeInUpStagger, fadeInUpStaggerLoad } from "../components/animations/gsapAnimations";
import { gsap } from "gsap";
import fondo from "../assets/images/fondo/textura_industrial.jpg"
import fondovideo from "../assets/video/amoeba3D.mp4"
import logo from "../assets/images/logos/isotipo2.png";
import hoverVideo from "../assets/video/hover.mp4";

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
      const tl = gsap.timeline();

      // 0. Set initial states
      gsap.set([titleLines, textRef.current], { x: 100, opacity: 0 });
      gsap.set(buttonsRef.current, { opacity: 0 });
      gsap.set(navItems, { opacity: 0 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0.8 });

      // 1. Start: Title & Logo (Duration 0.5s)
      tl.addLabel("start");

      tl.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, "start");

      tl.to(titleLines, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0
      }, "start");

      // 2. Text (Starts after Title ends: 0.5s)
      tl.to(textRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "start+=0.5");

      // 3. Buttons (Starts after Text ends: 1.0s)
      tl.to(buttonsRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "start+=1.0");

      // 4. Nav (Starts after Buttons end: 1.5s -> Ends at 2.0s)
      if (navItems.length > 0) {
        tl.to(navItems, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(navItems, { clearProps: "opacity" });
          }
        }, "start+=1.5");
      }

    });

    return () => ctx.revert();
  }, []);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen text-white px-6 md:px-14 md:py-10 overflow-hidden flex items-center justify-center">

      {/* ===== BACKGROUND IMAGE ===== */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondo})` }}
      />
      <video
        className="absolute  inset-0 w-full h-full object-cover z-0 opacity-80"
        src={fondovideo}
        autoPlay
        loop
        muted
      ></video>

      {/* ===== DARK OVERLAY ===== */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/20" />


      {/* ================= MAIN GRID ================= */}
      <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center w-full max-w-7xl">
        {/* ===== LEFT COLUMN ===== */}

        <div className="flex flex-col justify-center">
          <img
            ref={logoRef}
            src={logo}
            alt="Moonkat Records Logo"
            className="h-9 mb-10 drop-shadow-xl self-start cursor-pointer opacity-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <h1 ref={titleRef} className="text-4xl uppercase md:text-7xl font-bold leading-tight tracking-wider">
            <div className="inline-block">Drum & Bass</div> <br />
            <div className="inline-block">Underground</div> <br />
            <div className="inline-block">Culture</div>
          </h1>

          <div ref={textRef} className="opacity-0">
            <p className="mt-8 max-w-lg text-zinc-300 text-lg leading-relaxed border-t border-white/20 pt-6">
              <span className="font-bold text-white">Moonkat Records ®</span> — Independent label focused on dubby, deep, emotional and futuristic Drum & Bass and Jungle music.
            </p>
            <p className="mt-4 max-w-lg text-purple-300 text-lg leading-relaxed">
              Hit subscribe to get promos.
            </p>
          </div>
          <div ref={buttonsRef} className="mt-10 flex gap-6 items-center opacity-0">
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
          {[
            { name: "RELEASES", id: "releases" },
            { name: "ARTISTS", id: "artists" },
            { name: "MERCH", id: "merch" },
            { name: "CONTACT", id: "contact" }
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => !item.disabled && scrollToSection(item.id)}
              className={`
                 group relative aspect-square bg-black/40 backdrop-blur-md border border-white/20 
                 flex flex-col justify-between p-6 cursor-pointer overflow-hidden transition-all duration-300
                 hover:bg-white/5 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
                 ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
               `}
            >
              <video
                src={hoverVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 mix-blend-screen"
              />

              <div className="relative z-10 flex justify-between items-start">
                <div className="w-2 h-2 bg-zinc-600 rounded-full group-hover:bg-white transition-colors"></div>
              </div>

              <h3 className="relative z-10 font-heading tracking-widest text-right group-hover:text-purple-200 transition-colors uppercase self-end">
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