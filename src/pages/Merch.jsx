import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fondo from "../assets/images/fondo/textura_industrial.jpg";
import FlickeringTitle from '../components/FlickeringTitle';

// Images
import camisetaLogo from "../assets/images/merch/camiseta_logo.png";
import camisetaUndergroundBlack from "../assets/images/merch/camiseta_underground_black.png";
import sudaderaLogo from "../assets/images/merch/sudadera_logo.png";
import sudaderaUndergroundBlack from "../assets/images/merch/sudadera_underground_black.png";
import sudaderaUndergroundGreen from "../assets/images/merch/sudadera_underground_green.png";

gsap.registerPlugin(ScrollTrigger);

const merchItems = [
    {
        id: 1,
        title: "Logo T-Shirt",
        price: 25,
        image: camisetaLogo,
        type: "T-Shirt",
        color: "Black",
        link: "https://moonkatrecords.bandcamp.com/merch"
    },
    {
        id: 2,
        title: "Underground T-Shirt",
        price: 25,
        image: camisetaUndergroundBlack,
        type: "T-Shirt",
        color: "Black",
        link: "https://moonkatrecords.bandcamp.com/merch"
    },
    {
        id: 3,
        title: "Logo Sweatshirt",
        price: 45,
        image: sudaderaLogo,
        type: "Sweatshirt",
        color: "Black",
        link: "https://moonkatrecords.bandcamp.com/merch"
    },
    {
        id: 4,
        title: "Underground Sweatshirt",
        price: 45,
        image: sudaderaUndergroundBlack,
        type: "Sweatshirt",
        color: "Black",
        link: "https://moonkatrecords.bandcamp.com/merch"
    },
    {
        id: 5,
        title: "Underground Sweatshirt",
        price: 45,
        image: sudaderaUndergroundGreen,
        type: "Sweatshirt",
        color: "Green",
        link: "https://moonkatrecords.bandcamp.com/merch"
    }
];

export default function Merch() {
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardsRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="merch" className="relative min-h-screen border-t border-white/10 px-6 py-20 flex flex-col items-center bg-zinc-800 overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${fondo})` }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-900/90" />

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                <FlickeringTitle
                    text="MERCH"
                    className="text-6xl md:text-8xl mb-6 tracking-widest justify-center w-full flex"
                />

                {/* Subtitle */}
                <div className="relative z-10 max-w-7xl mx-auto mb-16 flex justify-center px-2">
                    <p className="text-sm md:text-base text-zinc-400 font-mono tracking-[0.2em] uppercase opacity-60">
                        INCOMING
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12 pb-20">
                    {merchItems.map((item, index) => (
                        <div
                            key={item.id}
                            ref={el => cardsRef.current[index] = el}
                            className="group flex flex-col relative"
                        >
                            {/* Card Container */}
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block relative w-full aspect-[4/5] bg-gradient-to-br from-white/10 via-white/5 to-pink-300/10 backdrop-blur-sm border border-white/10 overflow-hidden transition-all duration-500 hover:border-pink-300/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] rounded-2xl group-card"
                            >
                                {/* Liquid Reflection Overlay */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                {/* Image */}
                                <div className="absolute inset-0 p-8 flex items-center justify-center">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10"
                                    />
                                </div>

                                {/* Tags (Top Right) */}
                                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                                </div>
                            </a>

                            {/* Info Below */}
                            <div className="mt-4 px-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-sans-custom font-bold tracking-wider text-zinc-100 group-hover:text-pink-200 transition-colors uppercase">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm font-mono text-zinc-500 uppercase mt-1">
                                            {item.type} <span className="text-zinc-700 mx-2">|</span> {item.color}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}