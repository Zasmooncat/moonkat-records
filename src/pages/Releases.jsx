import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { client, urlFor } from '../sanity/client';
import FlickeringTitle from '../components/FlickeringTitle';


gsap.registerPlugin(ScrollTrigger);

const Releases = () => {
  const sectionRef = useRef(null);
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
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "restart none none reset",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [releases]);

  return (
    <section ref={sectionRef} id="releases" className="mt-40 px-6 md:px-14  min-h-screen relative overflow-hidden">

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
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-pink-900/20 via-pink-500/40 to-black" />




      <FlickeringTitle
        text="RELEASES"
        // showUnderline={true}
        className="text-4xl md:text-7xl max-w-7xl mx-auto tracking-wider mb-6 tracking-tighter"
      />

      {/* GLOBAL BANDCAMP LINK */}
      <div className="relative z-10 max-w-7xl mx-auto mb-16 flex justify-center px-2">
        <p className="text-sm md:text-base text-zinc-400 font-mono tracking-[0.2em] uppercase opacity-60">
          Stream & Download in{" "}
          <a
            href="https://moonkatrecords.bandcamp.com/"
            target="_blank"
            rel="noreferrer"
            className="text-pink-300 hover:text-white transition-colors duration-300"
          >
            Bandcamp
          </a>
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
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
            <div className="relative w-40 md:w-full aspect-square bg-gradient-to-br from-white/10 via-transparent to-pink-300/20 backdrop-blur border-r-2 border-b-2 border-white/20 overflow-hidden transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-white/60 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] rounded-2xl">
              {/* Liquid Reflection Overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
              <img
                src={urlFor(r.cover).width(600).url()}
                alt={r.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-0"
              />
              {/* Technical Dot */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-zinc-600 rounded-full group-hover:bg-white transition-colors z-20"></div>
            </div>

            {/* Content Below */}
            <div className="flex bg-black/30 rounded-xl p-4 backdrop-blur-md flex-col">
              <h3 className="text-xs font-sans-custom tracking-widest text-white group-hover:text-pink-200 transition-colors uppercase  leading-tight">
                {r.title}
              </h3>


              <p className="text-sm bebas text-zinc-400 group-hover:text-zinc-200 uppercase tracking-wider mb-0">
                {r.artist?.name}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section >
  );
};

export default Releases;
