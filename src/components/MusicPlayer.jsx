import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaVolumeDown } from "react-icons/fa";
import { gsap } from "gsap";

const MusicPlayer = forwardRef(({ tracks }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolume, setShowVolume] = useState(false);

    const audioRef = useRef(null);
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const titleContainerRef = useRef(null);

    useImperativeHandle(ref, () => containerRef.current);

    // Guard clause: if no tracks, don't render or render placeholder
    if (!tracks || tracks.length === 0) return null;

    const currentTrack = tracks[currentTrackIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(error => {
                console.log("Autoplay prevented:", error);
                setIsPlaying(false);
            });
        }
    }, [currentTrackIndex]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) setIsMuted(false);
        if (newVolume === 0) setIsMuted(true);
    };

    useEffect(() => {
        // Dynamic Marquee logic
        const textEl = textRef.current;
        const containerEl = titleContainerRef.current;

        if (!textEl || !containerEl) return;

        // Reset position
        gsap.set(textEl, { x: 0 });
        gsap.killTweensOf(textEl);

        const textWidth = textEl.scrollWidth;
        const containerWidth = containerEl.offsetWidth;

        if (textWidth > containerWidth) {
            const scrollDist = textWidth - containerWidth;
            // Use a timeline for better control (delay at start/end)
            const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 1 });

            tl.to(textEl, {
                x: -scrollDist,
                duration: scrollDist / 20, // Adjust speed based on distance
                ease: "power1.inOut",
                delay: 1 // Hang at the start
            }).to({}, { duration: 1 }); // Hang at the end
        }
    }, [currentTrackIndex, isPlaying]); // Re-run when track changes or starts playing

    return (
        <div
            ref={containerRef}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full py-3 px-5 transition-all hover:bg-black/60 hover:border-white/30 opacity-0 invisible"
        >
            <audio
                ref={audioRef}
                src={currentTrack.src}
                onEnded={handleNext}
            />

            {/* Controls */}
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition-colors">
                    <FaStepBackward size={12} />
                </button>

                <button
                    onClick={togglePlay}
                    className="text-white hover:text-purple-400 transition-colors w-8 h-8 flex items-center justify-center border border-white/20 rounded-full mx-1"
                >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                </button>

                <button onClick={handleNext} className="text-zinc-400 hover:text-white transition-colors">
                    <FaStepForward size={12} />
                </button>
            </div>

            {/* Track Info (Dynamic Marquee) */}
            <div
                ref={titleContainerRef}
                className="overflow-hidden w-32 md:w-48 h-5 relative flex items-center mask-image-linear-gradient"
            >
                <div ref={textRef} className="whitespace-nowrap text-xs font-mono text-zinc-300 uppercase tracking-widest absolute left-0">
                    <span className="font-bold text-white">{currentTrack.artist}</span> - {currentTrack.title}
                </div>
            </div>

            {/* Visualizer (CSS Animation) */}
            <div className={`flex gap-1 items-end h-4 ${isPlaying ? "opacity-100" : "opacity-30"}`}>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 bg-purple-400 rounded-t-sm ${isPlaying ? "animate-equalizer" : "h-1"}`}
                        style={{
                            height: isPlaying ? "auto" : "20%",
                            animationDuration: `${0.4 + Math.random() * 0.4}s`,
                            animationDelay: `${Math.random() * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* Volume Control */}
            <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
            >
                <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-white transition-colors ml-2">
                    {isMuted || volume === 0 ? <FaVolumeMute size={14} /> : volume < 0.5 ? <FaVolumeDown size={14} /> : <FaVolumeUp size={14} />}
                </button>

                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 p-2 rounded-lg transition-all duration-300 ${showVolume ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-purple-500 -rotate-90 origin-bottom translate-y-12 translate-x-1"
                        style={{ width: "80px", height: "4px" }}
                    />
                    {/* Spacer for rotation */}
                    <div className="h-20 w-4"></div>
                </div>
            </div>

        </div>
    );
});

export default MusicPlayer;
