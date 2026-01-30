import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";
import { gsap } from "gsap";

const MusicPlayer = forwardRef(({ tracks }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const titleContainerRef = useRef(null);

    useImperativeHandle(ref, () => containerRef.current);

    // Guard clause: if no tracks, don't render or render placeholder
    if (!tracks || tracks.length === 0) return null;

    const currentTrack = tracks[currentTrackIndex];

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [currentTrackIndex]);

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

    const handleProgressClick = (e) => {
        const progressBar = e.currentTarget;
        const clickX = e.clientX - progressBar.getBoundingClientRect().left;
        const width = progressBar.offsetWidth;
        const newTime = (clickX / width) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

            {/* Track Info with Integrated Progress Bar */}
            <div
                ref={titleContainerRef}
                onClick={handleProgressClick}
                className="overflow-hidden w-32 md:w-48 h-5 relative flex items-center mask-image-linear-gradient cursor-pointer group"
            >
                {/* Progress Background */}
                <div
                    className="absolute inset-0 bg-purple-700/60 transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                {/* Track Text */}
                <div ref={textRef} className="whitespace-nowrap text-xs font-mono text-zinc-300 uppercase tracking-widest absolute left-0 z-10 px-2">
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


        </div>
    );
});

export default MusicPlayer;
