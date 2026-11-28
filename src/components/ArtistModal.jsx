import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { urlFor } from "../sanity/client";
import {
    FaInstagram,
    FaBandcamp,
    FaSoundcloud,
    FaSpotify,
    FaYoutube,
    FaFacebook,
    FaXTwitter,
    FaLink
} from "react-icons/fa6";

const ArtistModal = ({ artist, onClose }) => {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        gsap.fromTo(
            ".artist-modal",
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
        );
    }, []);

    const handleClose = () => {
        onCloseRef.current();
    };

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // Handle browser/mobile back button (popstate)
    useEffect(() => {
        window.history.pushState({ modal: "artist" }, "");

        const handlePopState = () => {
            handleClose();
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const getSocialIcon = (url) => {
        if (!url) return <FaLink />;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("instagram.com")) return <FaInstagram size={20} />;
        if (lowerUrl.includes("bandcamp.com")) return <FaBandcamp size={20} />;
        if (lowerUrl.includes("soundcloud.com")) return <FaSoundcloud size={20} />;
        if (lowerUrl.includes("spotify.com")) return <FaSpotify size={20} />;
        if (lowerUrl.includes("youtube.com")) return <FaYoutube size={20} />;
        if (lowerUrl.includes("facebook.com")) return <FaFacebook size={20} />;
        if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return <FaXTwitter size={20} />;
        return <FaLink size={18} />;
    };

    if (!artist) return null;

    // Sanity might return links as an object { platform: url } or an array of strings/objects
    // Let's normalize it to an array of URLs for the icon detector
    const links = Array.isArray(artist.links)
        ? artist.links
        : (artist.links && typeof artist.links === 'object' ? Object.values(artist.links) : []);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleClose}
        >
            {/* FLOATING CLOSE BUTTON — Always visible on screen */}
            <button
                onClick={handleClose}
                className="fixed top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:text-pink-400 hover:border-pink-500/50 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 text-lg"
                aria-label="Cerrar modal"
            >
                ✕
            </button>

            <div
                className="artist-modal relative bg-zinc-900 border border-white/10 text-white max-w-xl w-full mx-auto p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors bg-black/70 border border-white/20 p-2.5 rounded-full z-50 shadow-lg active:scale-95"
                    aria-label="Cerrar modal"
                >
                    ✕
                </button>

                {/* IMAGE */}
                <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-xl border border-white/5 bg-zinc-800">
                    <img
                        src={artist.image ? urlFor(artist.image).width(600).url() : ""}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                    />
                </div>

                {/* INFO */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-3xl font-bold tracking-tight text-white mb-1 uppercase titulo">{artist.name}</h3>
                        <p className="text-sm text-pink-400 font-mono tracking-widest uppercase">{artist.location}</p>
                    </div>

                    {/* LINKS */}
                    {links.length > 0 && (
                        <div className="flex gap-4">
                            {links.map((url, idx) => (
                                <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-pink-400 transform hover:scale-110 transition-all duration-300"
                                    title={url}
                                >
                                    {getSocialIcon(url)}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-pink-500/50 via-white/10 to-transparent mb-6" />

                <p className="text-zinc-300 text-sm leading-relaxed font-sans opacity-90">
                    {artist.bio}
                </p>
            </div>
        </div>
    );
};

export default ArtistModal;
