import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { urlFor } from "../sanity/client";
import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause, FaTimes } from "react-icons/fa";
import { FaBandcamp, FaSpotify, FaApple } from "react-icons/fa6";

const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const ReleaseModal = ({ release, onClose }) => {
    const { playPlaylist, currentTrack, isPlaying, togglePlay, audioRef } = usePlayer();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const canvasRef = useRef(null);
    const waveformDataRef = useRef([]);
    const modalRef = useRef(null);

    // Animate in
    useEffect(() => {
        gsap.fromTo(
            ".release-modal",
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out" }
        );
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    // Handle browser/mobile back button (popstate)
    useEffect(() => {
        window.history.pushState({ modalOpen: true }, "");

        const handlePopState = () => {
            onClose();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            if (window.history.state?.modalOpen) {
                window.history.back();
            }
        };
    }, [onClose]);

    // Determine if this release is currently active in the player
    const isThisRelease = currentTrack && (
        (release.audioUrl && currentTrack.src === release.audioUrl) ||
        (release.tracks && release.tracks.some(t => t.url === currentTrack.src))
    );

    const isPlayingThis = isThisRelease && isPlaying;

    // Build the playlist from this release
    const buildPlaylist = () => {
        if (release.tracks && release.tracks.length > 0) {
            return release.tracks.map(t => ({
                title: t.title,
                artist: release.artist?.name,
                src: t.url,
                cover: release.cover,
            }));
        } else if (release.audioUrl) {
            return [{
                title: release.title,
                artist: release.artist?.name,
                src: release.audioUrl,
                cover: release.cover,
            }];
        }
        return [];
    };

    const handlePlayPause = () => {
        const playlist = buildPlaylist();
        if (playlist.length === 0) return;

        if (isThisRelease) {
            togglePlay();
        } else {
            playPlaylist(playlist, 0);
        }
    };

    // ── Waveform: generate once per track ────────────────────────────────────
    useEffect(() => {
        if (!currentTrack) return;
        const generateWaveform = async () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const response = await fetch(currentTrack.src);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const rawData = audioBuffer.getChannelData(0);
                const samples = 200;
                const blockSize = Math.floor(rawData.length / samples);
                const amplitudeData = [];
                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) sum += Math.abs(rawData[i * blockSize + j]);
                    amplitudeData.push(sum / blockSize);
                }
                const max = Math.max(...amplitudeData);
                waveformDataRef.current = amplitudeData.map(v => v / max);
            } catch {
                waveformDataRef.current = Array(100).fill(0).map(() => Math.random() * 0.5 + 0.2);
            }
        };
        generateWaveform();
    }, [currentTrack]);

    // ── Waveform: redraw on progress ─────────────────────────────────────────
    const validDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

    useEffect(() => {
        if (!canvasRef.current || waveformDataRef.current.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();

        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const W = rect.width, H = rect.height;
            ctx.clearRect(0, 0, W, H);
            const numBars = waveformDataRef.current.length;
            const barWidth = W / numBars;
            const barGap = 0.5;
            const actualBarWidth = barWidth - barGap;
            const progressX = validDuration > 0 ? (currentTime / validDuration) * W : 0;

            for (let i = 0; i < numBars; i++) {
                const barHeight = waveformDataRef.current[i] * H * 0.8;
                const x = i * barWidth;
                const y = (H - barHeight) / 2;
                ctx.fillStyle = x < progressX ? "#ec4899" : "#e4e4e7";
                ctx.fillRect(x, y, actualBarWidth, barHeight);
            }
        };
        draw();

        const onResize = () => { resize(); draw(); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [currentTime, validDuration]);

    // ── Sync time from audioRef ───────────────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTime = () => setCurrentTime(audio.currentTime);
        const onMeta = () => setDuration(audio.duration || 0);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onMeta);
        if (audio.duration) { setDuration(audio.duration); setCurrentTime(audio.currentTime); }
        return () => {
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("loadedmetadata", onMeta);
        };
    }, [audioRef, currentTrack]);

    if (!release) return null;

    const hasAudio = release.audioUrl || (release.tracks && release.tracks.length > 0);
    const displayDescription = release.description || release.promoDescription || null;
    const formattedDate = release.releaseDate
        ? new Date(release.releaseDate).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
        : null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            {/* FLOATING CLOSE BUTTON — Always visible on screen, especially when scrolling on mobile */}
            <button
                onClick={onClose}
                className="fixed top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:text-pink-400 hover:border-pink-500/50 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95"
                aria-label="Cerrar modal"
            >
                <FaTimes size={16} />
            </button>

            <div
                ref={modalRef}
                className="release-modal relative bg-zinc-900 border border-white/10 text-white max-w-xl w-full mx-auto rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE BUTTON INSIDE CARD */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors bg-black/70 border border-white/20 p-2.5 rounded-full z-50 shadow-lg active:scale-95"
                    aria-label="Cerrar modal"
                >
                    <FaTimes size={15} />
                </button>

                {/* COVER */}
                <div className="relative w-full overflow-hidden rounded-t-2xl">
                    {release.cover ? (
                        <img
                            src={urlFor(release.cover).width(800).url()}
                            alt={release.title}
                            className="w-full object-cover"
                        />
                    ) : (
                        <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center">
                            <span className="text-zinc-600 text-xs uppercase tracking-widest">No cover</span>
                        </div>
                    )}
                    {/* Gradient overlay at bottom of cover */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent" />
                </div>

                {/* CONTENT */}
                <div className="px-7 pb-7 -mt-6 relative z-10">

                    {/* TITLE + ARTIST */}
                    <div className="mb-1">
                        <h3 className="text-2xl font-bold tracking-tight text-white uppercase titulo leading-tight">
                            {release.title}
                        </h3>
                        <p className="text-pink-400 font-mono tracking-widest uppercase text-sm mt-1">
                            {release.artist?.name}
                        </p>
                    </div>

                    {/* RELEASE DATE */}
                    {formattedDate && (
                        <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1 mb-4">
                            {formattedDate}
                        </p>
                    )}

                    <div className="h-px w-full bg-gradient-to-r from-pink-500/50 via-white/10 to-transparent mb-5" />

                    {/* DESCRIPTION */}
                    {displayDescription && (
                        <p className="text-zinc-300 text-sm leading-relaxed font-sans opacity-90 mb-6 whitespace-pre-wrap">
                            {displayDescription}
                        </p>
                    )}

                    {/* STREAMING LINKS */}
                    {(release.bandcamp || release.spotify || release.appleMusic) && (
                        <div className="flex gap-4 mb-6">
                            {release.bandcamp && (
                                <a
                                    href={release.bandcamp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Bandcamp"
                                    className="text-zinc-400 hover:text-pink-400 transition-all transform hover:scale-110"
                                >
                                    <FaBandcamp size={22} />
                                </a>
                            )}
                            {release.spotify && (
                                <a
                                    href={release.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Spotify"
                                    className="text-zinc-400 hover:text-green-400 transition-all transform hover:scale-110"
                                >
                                    <FaSpotify size={22} />
                                </a>
                            )}
                            {release.appleMusic && (
                                <a
                                    href={release.appleMusic}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Apple Music"
                                    className="text-zinc-400 hover:text-pink-300 transition-all transform hover:scale-110"
                                >
                                    <FaApple size={22} />
                                </a>
                            )}
                        </div>
                    )}

                    {/* AUDIO PLAYER */}
                    {hasAudio && (
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-3">
                                Audio Preview
                            </p>

                            <div className="flex items-center gap-4">
                                {/* Play/Pause button */}
                                <button
                                    onClick={handlePlayPause}
                                    className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border transition-all ${
                                        isPlayingThis
                                            ? "bg-pink-600 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                                            : "border-white/20 text-white hover:border-pink-400 hover:text-pink-400"
                                    }`}
                                >
                                    {isPlayingThis ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                                </button>

                                {/* Waveform canvas */}
                                <div className="flex-1 h-10 rounded-md overflow-hidden bg-black/20">
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full h-full cursor-pointer"
                                        onClick={(e) => {
                                            if (!isThisRelease || !audioRef.current) return;
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const percent = (e.clientX - rect.left) / rect.width;
                                            audioRef.current.currentTime = percent * duration;
                                        }}
                                    />
                                </div>

                                {/* Timer */}
                                <span className="text-xs font-mono text-zinc-500 tabular-nums shrink-0">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Track list (if multi-track) */}
                            {release.tracks && release.tracks.length > 1 && (
                                <div className="mt-4 space-y-1">
                                    {release.tracks.map((t, i) => {
                                        const isActiveTrack = currentTrack?.src === t.url;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => playPlaylist(buildPlaylist(), i)}
                                                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                                                    isActiveTrack
                                                        ? "bg-pink-600/20 text-pink-300"
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                                }`}
                                            >
                                                <span className="text-zinc-600">{i + 1}.</span>
                                                <span className="truncate">{t.title}</span>
                                                {isActiveTrack && isPlaying && (
                                                    <span className="ml-auto text-pink-400">▶</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReleaseModal;
