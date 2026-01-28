import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { client, urlFor } from "../sanity/client";
import fondo from "../assets/images/fondo/textura_industrial.jpg";
import fondovideo from "../assets/video/amoeba3D2.mp4";

gsap.registerPlugin(ScrollTrigger);

const Releases = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  const [releases, setReleases] = useState([]);

  useEffect(() => {
    client
      .fetch(`
        *[_type == "release"] | order(releaseDate desc){
          _id,
          title,
          bandcamp,
          releaseDate,
          cover,
          artist->{
            name
          }
        }
      `)
      .then(setReleases)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!releases.length) return;

    const ctx = gsap.context(() => {
      const letters = titleRef.current.querySelectorAll(".letter");

      gsap.fromTo(
        letters,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none play none",
          },
        }
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none play none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [releases]);

  return (
    <section ref={sectionRef} id="releases" className=" px-6 md:px-14 py-20 min-h-screen relative overflow-hidden">

      {/* ===== BACKGROUND IMAGE ===== */}
      {/* <div
        className="absolute inset-0 z-0 bg-cover opacity-50 bg-center"
        style={{ backgroundImage: `url(${fondo})` }}
      /> */}
      {/* <video
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
              src={fondovideo}
              autoPlay
              loop
              muted
            ></video> */}
      {/* ===== DARK OVERLAY ===== */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-pink-900/20 via-black/60 to-black" />


      <h2
        ref={titleRef}
        className="relative z-10 text-4xl md:text-6xl max-w-7xl mx-auto tracking-wider md:text-7xl flex font-bold titulo text-white mb-16 tracking-tighter"
      >
        {"RELEASES".split("").map((c, i) => (
          <span key={i} className=" cursor-default inline-block hover:text-pink-200 transition-colors duration-300">
            {c}
          </span>
        ))}
      </h2>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
        {releases.map((r, i) => (
          <a
            key={r._id}
            ref={(el) => (cardsRef.current[i] = el)}
            href={r.bandcamp}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col cursor-pointer"
          >
            {/* Image Card (Styled like Home Nav) */}
            <div className="relative aspect-square w-full bg-black/10 backdrop-blur-md border border-white/20 overflow-hidden transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
              <img
                src={urlFor(r.cover).width(600).url()}
                alt={r.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Technical Dot */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-zinc-600 rounded-full group-hover:bg-white transition-colors z-20"></div>
            </div>

            {/* Content Below */}
            <div className="flex bg-black/30 p-4 border border-white/20 backdrop-blur-md flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xs font-sans-custom tracking-widest text-white group-hover:text-pink-200 transition-colors uppercase  leading-tight">
                  {r.title}
                </h3>

              </div>
              <p className="text-sm bebas text-zinc-400 group-hover:text-zinc-200 uppercase tracking-wider">
                {r.artist?.name}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Releases;
