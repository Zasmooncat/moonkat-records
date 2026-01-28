import { useEffect } from "react";
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
    useEffect(() => {
        gsap.fromTo(
            ".artist-modal",
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
        );
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
            onClick={onClose}
        >
            <div
                className="artist-modal relative bg-zinc-900 border border-white/10 text-white max-w-xl w-full mx-auto p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-50"
                >
                    ✕
                </button>

                {/* IMAGE */}
                <div className="relative  w-full mb-6 overflow-hidden rounded-xl border border-white/5">
                    <img
                        src={artist.image ? urlFor(artist.image).width(800).url() : ""}
                        alt={artist.name}
                        className="w-full h-full object-cover"
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
