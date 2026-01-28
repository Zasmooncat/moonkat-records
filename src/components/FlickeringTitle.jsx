import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FlickeringTitle = ({ text, className = "", showUnderline = false }) => {
    const containerRef = useRef(null);
    const textContainerRef = useRef(null);
    const underlineRef = useRef(null);

    useEffect(() => {
        const letters = textContainerRef.current.children;
        const ctx = gsap.context(() => {
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "restart reset restart reset"
                }
            });

            // Underline Animation
            if (showUnderline && underlineRef.current) {
                gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: "left" });
                masterTl.to(underlineRef.current, {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power2.inOut"
                }, 0.3); // Start slightly after flicker begins
            }

            Array.from(letters).forEach((letter) => {
                // Set initial state
                gsap.set(letter, { opacity: 0 });

                const letterTl = gsap.timeline();

                // Random start within the first 0.3s
                letterTl.delay(Math.random() * 0.1);

                const flickerCount = 8 + Math.floor(Math.random() * 4); // 8-12 flickers

                for (let i = 0; i < flickerCount; i++) {
                    letterTl.to(letter, {
                        opacity: Math.random() > 0.9 ? 0.9 : 0.5,
                        duration: 0.01 + Math.random() * 0.01,
                        filter: Math.random() > 0.5 ? "drop-shadow(0 0 10px rgba(255,192,203,0.4))" : "none",
                        ease: "none"
                    })
                        .to(letter, {
                            opacity: 0,
                            duration: 0.02 + Math.random() * 0.03
                        });
                }

                // Final turn on
                letterTl.to(letter, {
                    opacity: 1,
                    filter: "drop-shadow(0 0 15px rgba(255,192,203,0.7))",
                    duration: 0.1,
                    ease: "power2.out"
                })
                    .to(letter, {
                        filter: "none",
                        duration: 0.3,
                        onComplete: () => {
                            // Clear only filters to keep letters visible even if they have hidden classes
                            gsap.set(letter, { clearProps: "filter", opacity: 1 });
                        }
                    });

                // Add to master timeline at the same position (start) 
                // but each has its own internal delay
                masterTl.add(letterTl, 0);
            });
        }, containerRef);

        return () => ctx.revert();
    }, [text, showUnderline]);

    return (
        <div ref={containerRef} className={`relative z-10 w-fit ${className}`}>
            <h2
                ref={textContainerRef}
                className="font-bold titulo text-white flex flex-wrap"
            >
                {text.split("").map((char, i) => (char === " " ? (
                    <span key={i} className="inline-block">&nbsp;</span>
                ) : (
                    <span key={i} className="inline-block opacity-0">
                        {char}
                    </span>
                )))}
            </h2>
            {showUnderline && (
                <div
                    ref={underlineRef}
                    className="h-[2px] w-full bg-pink-200 mt-2 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                />
            )}
        </div>
    );
};

export default FlickeringTitle;
