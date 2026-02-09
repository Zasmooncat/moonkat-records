import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause } from "react-icons/fa";
import { gsap } from "gsap";
import WaveSurfer from 'wavesurfer.js';

const GlobalMusicPlayer = () => {
    const { currentTrack, isPlaying, togglePlay: togglePlayContext, audioRef } = usePlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const containerRef = useRef(null);
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    // Custom togglePlay with AC resume
    const togglePlay = () => {
        // Ensure AudioContext is resumed on user interaction
        if (wavesurferRef.current) {
            try {
                const ac = wavesurferRef.current.backend?.ac || (wavesurferRef.current).ac;
                if (ac && ac.state === 'suspended') {
                    ac.resume();
                }
            } catch (e) {
                // Ignore errors
            }
        }
        togglePlayContext();
    };

    // Calculate progress for CSS fallback
    const validDuration = (Number.isFinite(duration) && duration > 0) ? duration : 0;
    const progressPercent = validDuration > 0 ? (currentTime / validDuration) * 100 : 0;

    // Debug Logs
    useEffect(() => {
        console.log("Player Debug:", {
            isPlaying,
            currentTime,
            duration,
            validDuration,
            progressPercent,
            hasAudioRef: !!audioRef.current,
            audioSrc: audioRef.current?.src,
            wsReady: !!wavesurferRef.current
        });
    }, [currentTime, duration, isPlaying]);

    // Initial Hide
    useEffect(() => {
        if (!containerRef.current) return;
        gsap.set(containerRef.current, { y: "100%" });
    }, []);

    // Slide Up/Down Animation
    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            if (currentTrack) {
                gsap.to(containerRef.current, { y: "0%", duration: 0.5, ease: "power3.out" });
            } else {
                gsap.to(containerRef.current, { y: "100%", duration: 0.5, ease: "power3.in" });
            }
        }, containerRef);
        return () => ctx.revert();
    }, [currentTrack]);



    // Slide Up/Down Animation
    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            if (currentTrack) {
                gsap.to(containerRef.current, { y: "0%", duration: 0.5, ease: "power3.out" });
            } else {
                gsap.to(containerRef.current, { y: "100%", duration: 0.5, ease: "power3.in" });
            }
        }, containerRef);
        return () => ctx.revert();
    }, [currentTrack]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current || !audioRef.current) return;

        // Destroy previous instance
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#e4e4e7', // zinc-200
            progressColor: '#ec4899', // pink-500
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 3,
            responsive: true,
            height: 40,
            normalize: true,
            // Use the shared audio element to stay in sync with Context
            media: audioRef.current,
        });

        // Immediately load the current track if available (fix for re-mounts/HMR)
        if (currentTrack) {
            wavesurferRef.current.load(currentTrack.src);
        }

        const ws = wavesurferRef.current;

        // Sync volume to 0? No, we use media so we hear what audio plays.
        // But we don't want WaveSurfer to control volume separately if it's just visualizing.
        // With 'media', volume is controlled by the audio element.

        ws.on('ready', () => {
            setDuration(ws.getDuration());
        });

        // We don't need manual timeupdate sync as 'media' handles it.
        // We DO need to update our React `currentTime` state for the Numbers.
        const updateTime = () => setCurrentTime(audioRef.current.currentTime);
        const updateDuration = () => setDuration(audioRef.current.duration || 0);

        // We can listen to the AUDIO element for these updates, or WaveSurfer events.
        // Listening to Audio element is safer as it's the source of truth.
        // (We already do this in the OTHER useEffect, so we don't need to do it here!)

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [audioRef]);

    // Sync Audio Events ONLY for Time Display (State)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);

        // Initialize state immediately in case audio is already loaded
        if (audio.duration) {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [audioRef]);

    // Load track (Logic handled by Context setting audio.src?)
    // Context sets audio.src. WaveSurfer with `media` option *should* pick it up.
    // BUT we usually need to call load() if we want it to fetch peaks immediately?
    // Actually, with `media`, we don't strictly need load() for playback, 
    // but for waveform generation, it needs to analyze the file.
    // If we call currentTrack.src, it might re-fetch.
    // Let's try calling it to be sure.
    useEffect(() => {
        if (currentTrack && wavesurferRef.current) {
            // Check if src is already set to avoid double load?
            // wavesurferRef.current.load(currentTrack.src);
            // Actually, if audio.src is set by Context, we might just need to tell WS?
            // WaveSurfer V7 with media usually auto-detects src changes?
            // Let's manually load to be safe for visualization.
            wavesurferRef.current.load(currentTrack.src);
        }
    }, [currentTrack]);


    if (!currentTrack) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-0 left-0 w-full z-[100] bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col justify-center h-auto min-h-[120px] md:h-24 py-4 md:py-0 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-14 h-full relative gap-4 md:gap-4">

                {/* Waveform Background Container */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none md:pointer-events-auto">
                </div>

                {/* Top Row (Mobile): Controls + Info + Timer */}
                <div className="w-full flex items-center justify-between md:w-auto md:justify-start gap-4 z-10 shrink-0">

                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/20 hover:border-pink-400 hover:text-pink-400 text-white transition-all transform hover:scale-105 shrink-0"
                        >
                            {isPlaying ? <FaPause size={12} className="md:text-sm" /> : <FaPlay size={12} className="ml-1 md:text-sm" />}
                        </button>

                        <div className="flex flex-col overflow-hidden max-w-[200px] md:max-w-none">
                            <span className="text-[10px] md:text-sm text-zinc-400 font-mono tracking-widest uppercase mb-1">
                                Now Playing
                            </span>
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-sm md:text-lg font-bold text-white tracking-wide truncate">
                                <span className="text-pink-300 truncate">{currentTrack.artist}</span>
                                <span className="hidden md:inline text-zinc-500 mx-1">//</span>
                                <span className="truncate">{currentTrack.title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timer (Right aligned in top row) */}
                    <div className="md:hidden text-xs font-mono text-zinc-500 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Bottom Row (Mobile) / Right Col (Desktop): Waveform & CSS Progress Fallback */}
                {/* Fixed height h-10 to match WaveSurfer config (40px) */}
                <div className="w-full md:flex-1 h-10 relative group z-10 min-h-[40px] rounded-md overflow-hidden bg-white/5" >
                    {/* CSS Progress Bar (Fallback/Underlay) */}
                    <div
                        className="absolute top-0 left-0 h-full bg-pink-500/20 pointer-events-none transition-all duration-100 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                    />

                    {/* WaveSurfer Container */}
                    <div ref={waveformRef} className="w-full h-full cursor-pointer relative z-20" />
                </div>

                {/* Desktop Timer */}
                <div className="hidden md:block text-xs font-mono text-zinc-500 z-10 tabular-nums shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

            </div>
        </div>
    );
};

const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default GlobalMusicPlayer;
