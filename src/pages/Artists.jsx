import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import artistsVideo from "../assets/video/logovid.mp4";

import mooncat from "../assets/images/artists/mooncat.webp";
import isaacMaya from "../assets/images/artists/isaacmaya.webp";
import noHumanSound from "../assets/images/artists/no-human-sound.webp";
import kiamya from "../assets/images/artists/kiamya.webp";
import mrKickz from "../assets/images/artists/mr-kickz.webp";

gsap.registerPlugin(ScrollTrigger);

const artists = [
    { name: "Mooncat", location: "Spain", img: mooncat, link: "#" },
    { name: "Isaac Maya", location: "Mexico", img: isaacMaya, link: "#" },
    { name: "No Human Sound", location: "Spain", img: noHumanSound, link: "#" },
    { name: "Kiamya", location: "Spain", img: kiamya, link: "#" },
    { name: "Mr. Kickz", location: "Rep. Dominicana", img: mrKickz, link: "#" },
];

const Artists = () => {
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

            /* ===== CARDS FADE IN ===== */
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
            id="artists"
            className="relative min-h-screen overflow-hidden"
        >
            {/* ===== VIDEO BACKGROUND ===== */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50"
                >
                    <source src={artistsVideo} type="video/mp4" />
                </video>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="relative z-10 px-6 md:px-8 pt-24 pb-24">
                {/* TITLE */}
                <h2
                    ref={titleRef}
                    className="text-center md:text-start text-6xl font-bold text-zinc-100 mb-16 flex flex-wrap gap-x-1"
                >
                    {"ARTISTS".split("").map((char, i) => (
                        <span key={i} className="letter inline-block">
                            {char}
                        </span>
                    ))}
                </h2>

                {/* CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {artists.map((artist, index) => (
                        <a
                            key={index}
                            href={artist.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            ref={(el) => (cardsRef.current[index] = el)}
                            className="group flex flex-col"
                        >
                            <div className="overflow-hidden mb-4">
                                <img
                                    src={artist.img}
                                    alt={artist.name}
                                    className="w-full h-60 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            </div>

                            <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors">
                                {artist.name}
                            </h3>
                            <p className="text-gray-400 text-sm">{artist.location}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Artists;
