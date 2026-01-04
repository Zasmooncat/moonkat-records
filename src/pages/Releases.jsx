import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import forgiven from "../assets/images/releases/forgiven.png";
import greenhorns from "../assets/images/releases/greenhorns.png";
import trouble from "../assets/images/releases/timesOfTrouble2.png";

gsap.registerPlugin(ScrollTrigger);

const releases = [
  {
    title: "Times of Trouble",
    artist: "Mooncat",
    date: "January 2026",
    img: trouble,
    link: "https://example.com/times-of-trouble",
  },
  {
    title: "Green Horns",
    artist: "Mooncat",
    date: "December 2025",
    img: greenhorns,
    link: "https://example.com/green-horns",
  },
  {
    title: "Forgiven (Mooncat Remix)",
    artist: "Kiamya, Mooncat",
    date: "November 2025",
    img: forgiven,
    link: "https://example.com/forgiven-mooncat-remix",
  },
];

const Releases = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ===== TITLE LETTER BY LETTER ===== */
      const letters = titleRef.current.querySelectorAll(".letter");

      gsap.fromTo(
        letters,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          stagger: {
            each: 0.06,
            onStart() {
              gsap.fromTo(
                this.targets(),
                { opacity: 0.2 },
                {
                  opacity: 1,
                  duration: 0.15,
                  repeat: 1,
                  yoyo: true,
                }
              );
            },
          },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      /* ===== RELEASE CARDS FADE IN ===== */
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="releases"
      className="px-8 pt-20 bg-zinc-200 min-h-screen "
    >
      {/* TITLE */}
      <h2
        ref={titleRef}
        className="text-6xl text-center md:text-start mb-12 font-bold text-zinc-800 flex flex-wrap "
      >
        {"RELEASES".split("").map((char, i) => (
          <span key={i} className="letter inline-block">
            {char}
          </span>
        ))}
      </h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 md:gap-6">
        {releases.map((release, index) => (
          <a
            key={index}
            href={release.link}
            target="_blank"
            rel="noopener noreferrer"
            ref={(el) => (cardsRef.current[index] = el)}
            className="overflow-hidden flex flex-col mb-10 cursor-pointer"
          >
            <img
              src={release.img}
              alt={release.title}
              className="object-cover mb-3 transition-transform duration-700 ease-out hover:scale-105"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              {release.title}
            </h3>
            <p className="text-gray-500">{release.artist}</p>
            <p className="text-gray-400 text-sm">{release.date}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Releases;
