import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { client, urlFor } from "../sanity/client";
import FlickeringTitle from '../components/FlickeringTitle';
import fondo from "../assets/images/fondo/textura_industrial.jpg";

import ArtistModal from "../components/ArtistModal";

gsap.registerPlugin(ScrollTrigger);

const Artists = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Fetch Sanity artists
  useEffect(() => {
    client
      .fetch(`*[_type == "artist"]{_id, name, bio, links, image, location}`)
      .then(setArtists)
      .catch(console.error);
  }, []);

  // GSAP
  useEffect(() => {
    if (!artists.length) return;

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
  }, [artists]);

  return (
    <>
      <section ref={sectionRef} id="artists" className="relative mb-5 pt-10 px-6 md:px-14  overflow-hidden">

        {/* ===== BACKGROUND IMAGE ===== */}
        {/* <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${fondo})` }}
        /> */}

        {/* ===== DARK OVERLAY ===== */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/30 via-black/60 to-pink-900/20" />


        <FlickeringTitle
          text="ARTISTS"
          showUnderline={true}
          className="text-4xl md:text-7xl max-w-7xl mx-auto tracking-widest mb-16 tracking-tighter"
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
          {artists.map((artist, i) => (
            <div
              key={artist._id}
              ref={(el) => (cardsRef.current[i] = el)}
              onClick={() => setSelectedArtist(artist)}
              className="group flex flex-col gap-5 cursor-pointer"
            >
              {/* Image Card (Styled like Home Nav) */}
              <div className="relative aspect-square bg-gradient-to-br from-white/10 via-transparent to-pink-300/20 backdrop-blur border-r-2 border-b-2 border-white/20 overflow-hidden transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-white/60 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] rounded-2xl">
                {/* Liquid Reflection Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                <img
                  src={urlFor(artist.image).width(600).url()}
                  alt={artist.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-0"
                />
                {/* Technical Dot */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-zinc-600 rounded-full group-hover:bg-white transition-colors z-20"></div>
              </div>

              {/* Content Below */}
              <div className="flex flex-col">
                <h3 className="font-sans-custom tracking-widest text-white group-hover:text-pink-200 transition-colors uppercase text-sm leading-tight">
                  {artist.name}
                </h3>

                {artist.location && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse"></span>
                    <span className="text-xs bebas text-zinc-400 group-hover:text-white transition-colors uppercase">
                      {artist.location}
                    </span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {selectedArtist && (
        <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      )}
    </>
  );
};

export default Artists;
