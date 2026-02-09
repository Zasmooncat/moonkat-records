
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
    return useContext(PlayerContext);
};

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // Initialize Audio with CORS enabled immediately
    const audioRef = useRef(null);
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
    }

    // Play a track: sets track and immediately plays
    const playTrack = (track) => {
        // If same track, toggle play
        if (currentTrack && currentTrack.src === track.src) {
            togglePlay();
            return;
        }

        // New track
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    // Sync audio element with state
    useEffect(() => {
        const audio = audioRef.current;

        if (currentTrack) {
            // Only update src if changed, to prevent reload on toggle
            if (audio.src !== currentTrack.src) {
                audio.src = currentTrack.src;
                audio.load();
            }

            if (isPlaying) {
                audio.play().catch(e => console.error("Playback error:", e));
            } else {
                audio.pause();
            }
        } else {
            audio.pause();
            audio.src = "";
        }
    }, [currentTrack, isPlaying]);

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => setIsPlaying(false);
        const handlePause = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('play', handlePlay);
        };
    }, []);

    const value = {
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        togglePlay,
        audioRef // Expose ref for progress bar component usage
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
