import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { FaPlay, FaPause } from "react-icons/fa";
import { gsap } from "gsap";

const GlobalMusicPlayer = () => {
    const { currentTrack, isPlaying, togglePlay, audioRef } = usePlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const waveformDataRef = useRef([]);

    // Calculate progress for CSS fallback
    const validDuration = (Number.isFinite(duration) && duration > 0) ? duration : 0;
    const progressPercent = validDuration > 0 ? (currentTime / validDuration) * 100 : 0;

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

    // Generate static waveform from audio file (ONCE per track)
    useEffect(() => {
        if (!currentTrack) return;

        const generateWaveform = async () => {
            try {
                console.log("Generating waveform for:", currentTrack.src);
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const response = await fetch(currentTrack.src);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Extract amplitude data from first channel
                const rawData = audioBuffer.getChannelData(0);
                const samples = 200; // Number of bars (increased for thinner bars)
                const blockSize = Math.floor(rawData.length / samples);

                const amplitudeData = [];
                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[i * blockSize + j]);
                    }
                    amplitudeData.push(sum / blockSize);
                }

                // Normalize to 0-1 range
                const max = Math.max(...amplitudeData);
                waveformDataRef.current = amplitudeData.map(val => val / max);

                console.log("Waveform generated successfully");
            } catch (error) {
                console.error("Waveform generation error:", error);
                // Create placeholder waveform on error
                waveformDataRef.current = Array(100).fill(0).map(() => Math.random() * 0.5 + 0.2);
            }
        };

        generateWaveform();
    }, [currentTrack]); // Only regenerate when track changes

    // Draw waveform (updates on progress change)
    useEffect(() => {
        if (!canvasRef.current || waveformDataRef.current.length === 0) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');

        // Set canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resizeCanvas();

        const drawWaveform = () => {
            const rect = canvas.getBoundingClientRect();
            const WIDTH = rect.width;
            const HEIGHT = rect.height;

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            const numBars = waveformDataRef.current.length;
            const barWidth = WIDTH / numBars;
            const barGap = 0.5; // Reduced gap for thinner appearance
            const actualBarWidth = barWidth - barGap;

            for (let i = 0; i < numBars; i++) {
                const barHeight = waveformDataRef.current[i] * HEIGHT * 0.8;
                const x = i * barWidth;
                const y = (HEIGHT - barHeight) / 2;

                // Determine color based on progress
                const progressX = (currentTime / validDuration) * WIDTH;
                const barColor = x < progressX ? '#ec4899' : '#e4e4e7';

                canvasCtx.fillStyle = barColor;
                canvasCtx.fillRect(x, y, actualBarWidth, barHeight);
            }
        };

        drawWaveform();

        let resizeHandler = () => {
            resizeCanvas();
            drawWaveform();
        };
        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [currentTime, validDuration]); // Only redraw on progress change

    // Sync Audio Events for Time Display
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);

        // Initialize state immediately
        if (audio.duration) {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [audioRef]);

    if (!currentTrack) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-0 left-0 w-full z-[100] bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col justify-center h-auto min-h-[120px] md:h-24 py-4 md:py-0 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-14 h-full relative gap-4 md:gap-4">

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

                    {/* Mobile Timer */}
                    <div className="md:hidden text-xs font-mono text-zinc-500 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Waveform Canvas */}
                <div className="w-full md:flex-1 h-10 relative group z-10 min-h-[40px] rounded-md overflow-hidden bg-black/20">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            audioRef.current.currentTime = percent * duration;
                        }}
                    />
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
