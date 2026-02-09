import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { client, urlFor } from '../sanity/client';
import FlickeringTitle from '../components/FlickeringTitle';
import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause } from "react-icons/fa";


gsap.registerPlugin(ScrollTrigger);

const Releases = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const [releases, setReleases] = useState([]);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    client
      .fetch(`
        *[_type == "release"] | order(releaseDate desc){
          _id,
          title,
          bandcamp,
          releaseDate,
          cover,
          "audioUrl": audioPreview.asset->url,
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

  const handlePlayClick = (e, release) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!release.audioUrl) {
      console.warn("No audio preview available for this release");
      return;
    }

    playTrack({
      title: release.title,
      artist: release.artist?.name,
      src: release.audioUrl,
      cover: release.cover // Optional: if we want to show cover in player later
    });
  };

  const isCurrentTrack = (release) => {
    return currentTrack && currentTrack.src === release.audioUrl;
  };

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
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-pink-900/20 via-pink-400/30 to-black" />




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

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto pb-32"> {/* Added padding bottom for player space */}
        {releases.map((r, i) => {
          const isPlayingThis = isCurrentTrack(r) && isPlaying;

          return (
            <div
              key={r._id}
              ref={(el) => (cardsRef.current[i] = el)}
              className="group flex flex-col relative"
            >
              {/* Image Card (Styled like Home Nav) */}
              {/* Wrapper for hover effect on the whole card, but click action specific */}
              <div className="relative">
                <a
                  href={r.bandcamp}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative w-full aspect-square bg-gradient-to-br from-white/10 via-transparent to-pink-300/20 backdrop-blur border-r-2 border-b-2 border-white/20 overflow-hidden transition-all duration-500 hover:bg-white/[0.07] hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] rounded-2xl group-card"
                >
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
                </a>

                {/* PLAY BUTTON OVERLAY */}
                {r.audioUrl && (
                  <button
                    onClick={(e) => handlePlayClick(e, r)}
                    className={`absolute bottom-4 right-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-300
                            ${isPlayingThis
                        ? "bg-purple-600 text-white opacity-100 scale-100 shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                        : "bg-black/40 text-white opacity-100 hover:bg-purple-500/80 hover:scale-110 shadow-lg"
                      }
                        `}
                  >
                    {isPlayingThis ? <FaPause size={14} /> : <FaPlay size={14} className="ml-1" />}
                  </button>
                )}
              </div>

              {/* Content Below */}
              <a
                href={r.bandcamp}
                target="_blank"
                rel="noreferrer"
                className="flex bg-gradient-to-br from-black/50 to-black/20 mt-2 rounded md:p-4 p-2 backdrop-blur-md flex-col hover:bg-white/5 transition-colors"
              >
                <h3 className="text-xs font-sans-custom font-bold tracking-widest text-zinc-100 group-hover:text-pink-200 transition-colors uppercase leading-tight">
                  {r.title}
                </h3>

                <p className="text-sm bebas mt-1 text-zinc-400 group-hover:text-zinc-200 uppercase tracking-wider ">
                  {r.artist?.name}
                </p>
              </a>
            </div>
          )
        })}
      </div>
    </section >
  );
};

export default Releases;
