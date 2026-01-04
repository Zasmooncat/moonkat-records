import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";

// Registrar plugins una sola vez
gsap.registerPlugin(ScrollTrigger);

/**
 * Fade in + desplazamiento vertical (on load)
 * Útil para títulos o hero sections
 */
export const fadeInUp = (element, options = {}) => {
  if (!element) return;

  gsap.from(element, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    ...options,
  });
};

/**
 * Fade in + desplazamiento vertical con ScrollTrigger
 * Para un solo elemento
 */
export const fadeInUpScroll = (element, options = {}) => {
  if (!element) return;

  gsap.from(element, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    ...options,
  });
};

/**
 * Fade in + desplazamiento vertical en cascada (stagger)
 * Ideal para grids (releases, artists, cards)
 */
export const fadeInUpStagger = (elements, options = {}) => {
  if (!elements || !elements.length) return;

  gsap.from(elements, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.15,
    scrollTrigger: {
      trigger: elements[0],
      start: "top 85%",
      toggleActions: "play none none none",
    },
    ...options,
  });
};

/**
 * Animación de entrada lateral
 */
export const fadeInSideScroll = (element, direction = "left", options = {}) => {
  if (!element) return;

  const xValue = direction === "left" ? -80 : 80;

  gsap.from(element, {
    x: xValue,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    ...options,
  });
};

/**
 * Hover effect premium (scale + glow)
 * Se aplica una sola vez por elemento
 */
export const hoverScaleGlow = (element) => {
  if (!element) return;

  gsap.set(element, { transformOrigin: "center" });

  element.addEventListener("mouseenter", () => {
    gsap.to(element, {
      scale: 1.04,
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.35)", // glow violeta
      duration: 0.3,
      ease: "power2.out",
    });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, {
      scale: 1,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.3,
      ease: "power2.out",
    });
  });
};
