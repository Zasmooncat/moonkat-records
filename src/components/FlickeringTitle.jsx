import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FlickeringTitle = ({ text, className = "", showUnderline = false, Tag = "h2" }) => {
    const containerRef = useRef(null);
    const textContainerRef = useRef(null);
    const underlineRef = useRef(null);

    useEffect(() => {
        const letters = textContainerRef.current.children;
        const ctx = gsap.context(() => {
            // Master timeline for the whole title
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "play none none reverse" // Changed to play/reverse for smoother scroll interaction
                }
            });

            // Underline Animation
            if (showUnderline && underlineRef.current) {
                gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: "left" });
                masterTl.to(underlineRef.current, {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power2.inOut"
                }, 0.5); // Start after some letters appear
            }

            // Staggered Character Fade-in
            gsap.set(letters, { autoAlpha: 0, y: 10 }); // Start slightly lower

            masterTl.to(letters, {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set(letters, { clearProps: "all" });
                }
            }, 0);
        }, containerRef);

        return () => ctx.revert();
    }, [text, showUnderline]);

    return (
        <div ref={containerRef} className={`relative z-10 w-fit ${className}`}>
            <Tag
                ref={textContainerRef}
                className="font-bold titulo text-white flex flex-wrap"
            >
                {text.split("").map((char, i) => (char === " " ? (
                    <span key={i} className="inline-block">&nbsp;</span>
                ) : (
                    <span key={i} className="inline-block">
                        {char}
                    </span>
                )))}
            </Tag>
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
