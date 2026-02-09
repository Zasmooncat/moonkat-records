import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause } from "react-icons/fa";
import { gsap } from "gsap";
import WaveSurfer from 'wavesurfer.js';

const GlobalMusicPlayer = () => {
    const { currentTrack, isPlaying, togglePlay, audioRef } = usePlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const containerRef = useRef(null);
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);

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

    // Initialize WaveSurfer
    useEffect(() => {
        if (!waveformRef.current || !audioRef.current) return;

        // Destroy previous instance if exists to prevent duplicates
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
        }

        wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#e4e4e7', // zinc-200
            progressColor: '#a855f7', // purple-400
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 3,
            responsive: true,
            height: 40, // Match container height (h-10 = 40px)
            normalize: true, // Maximize waveform height
            // Use the shared audio element to stay in sync with Context
            media: audioRef.current,
        });

        // Events
        const ws = wavesurferRef.current;

        // When ready, set duration
        ws.on('ready', () => {
            setDuration(ws.getDuration());
        });

        // On seek, update time state
        ws.on('interaction', () => {
            setCurrentTime(ws.getCurrentTime());
        });

        // Time update logic is handled by the media element naturally, 
        // but we need to update our React state for numbers
        ws.on('timeupdate', (time) => {
            setCurrentTime(time);
        });

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [audioRef]); // Run once on mount (or if ref changes)

    // Load track into WaveSurfer when currentTrack changes
    useEffect(() => {
        if (currentTrack && wavesurferRef.current) {
            // Because we are using the 'media' option with audioRef, 
            // WaveSurfer automatically visualizes whatever the audio element plays.
            // But we need to make sure the audio element has the src set (Context does this).
            // However, WaveSurfer sometimes needs a nudge or reload if using Pre-decoded data,
            // but with 'media' element, it draws from the stream/file.
            // NOTE: For 'media' option, we might not need to call load() explicitly if audio.src is set,
            // BUT WaveSurfer docs say: "If you're using a media element... you don't need to call load()".
            // Let's verify if `load()` is needed. Usually `load(url)` fetches data for peaks.
            // If we want the waveform to show up BEFORE playing, we might need to fetch the blob or use the URL.

            // To be safe and ensure the waveform draws nicely:
            wavesurferRef.current.load(currentTrack.src);
        }
    }, [currentTrack]);


    if (!currentTrack) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-0 left-0 w-full z-[100] h-20 md:h-24 bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col justify-center"
        >
            <div className="flex items-center justify-between px-6 md:px-14 h-full relative">

                {/* Waveform Background Container */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none md:pointer-events-auto">
                    {/* Only visible on desktop usually, but user wanted it global? 
                        Let's keep it in the flow or absolute. 
                        Design: User said "waveform progress bar".
                        Let's put it in the middle or full width? 
                        Previous design was full width top bar. 
                        Beatport style usually is a large waveform.
                        Let's place it nicely.
                    */}
                </div>

                {/* Left: Play/Pause & Info */}
                <div className="flex items-center gap-6 z-10 shrink-0">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:border-purple-400 hover:text-purple-400 text-white transition-all transform hover:scale-105"
                    >
                        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-1" />}
                    </button>

                    <div className="flex flex-col">
                        <span className="text-xs md:text-sm text-zinc-400 font-mono tracking-widest uppercase mb-1">
                            Now Playing
                        </span>
                        <div className="flex items-center gap-2 text-sm md:text-lg font-bold text-white tracking-wide">
                            <span className="text-purple-300">{currentTrack.artist}</span>
                            <span className="text-zinc-500 mx-1">//</span>
                            <span>{currentTrack.title}</span>
                        </div>
                    </div>
                </div>

                {/* Center/Right: Waveform */}
                {/* We make this take remaining space */}
                <div className="hidden md:block flex-1 mx-4 md:mx-10 h-10 relative group min-w-[200px]" >
                    <div ref={waveformRef} className="w-full h-full cursor-pointer" />
                </div>

                {/* Mobile Time / Right side placeholder */}
                <div className="text-xs font-mono text-zinc-500 z-10 tabular-nums shrink-0">
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
