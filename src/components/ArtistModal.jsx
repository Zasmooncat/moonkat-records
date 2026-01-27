import { useEffect } from "react";
import { gsap } from "gsap";
import { urlFor } from "../sanity/client";

const ArtistModal = ({ artist, onClose }) => {
    useEffect(() => {
        gsap.fromTo(
            ".artist-modal",
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
        );
    }, []);

    if (!artist) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="artist-modal relative bg-zinc-900 text-white max-w-xl w-full mx-4 p-6 rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                {/* IMAGE */}
                <img
                    src={artist.image ? urlFor(artist.image).width(800).url() : ""}
                    alt={artist.name}
                    className="w-full h-full object-cover rounded-lg mb-4"
                />

                {/* INFO */}
                <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{artist.location}</p>

                <p className="text-gray-300 text-sm leading-relaxed">
                    {artist.bio}
                </p>

                {/* LINKS */}
                {artist.links && (
                    <div className="flex gap-4 mt-4 flex-wrap">
                        {Object.entries(artist.links).map(([key, url]) => (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-400 hover:text-violet-300 text-sm capitalize"
                            >
                                {key}
                            </a>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ArtistModal;
