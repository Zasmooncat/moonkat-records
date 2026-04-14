
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
    return useContext(PlayerContext);
};

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Initialize Audio with CORS enabled immediately
    const audioRef = useRef(null);
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
    }

    // Play a playlist
    const playPlaylist = (tracks, startIndex = 0) => {
        if (!tracks || tracks.length === 0) return;
        
        // If same track in same playlist, toggle play
        if (currentTrack && tracks[startIndex] && currentTrack.src === tracks[startIndex].src) {
            togglePlay();
            return;
        }

        setPlaylist(tracks);
        setCurrentIndex(startIndex);
        setCurrentTrack(tracks[startIndex]);
        setIsPlaying(true);
    };

    // Play a track (backward compatibility or single tracks)
    const playTrack = (track) => {
        playPlaylist([track], 0);
    };

    const nextTrack = () => {
        if (playlist.length > 0 && currentIndex < playlist.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setCurrentTrack(playlist[nextIdx]);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    const prevTrack = () => {
        if (playlist.length > 0 && currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            setCurrentTrack(playlist[prevIdx]);
            setIsPlaying(true);
        }
    };

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    // Stop and close player
    const closePlayer = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
        setPlaylist([]);
        setCurrentIndex(0);
    };

    // Sync audio element with state
    useEffect(() => {
        const audio = audioRef.current;

        if (currentTrack) {
            // Only update src if changed, to prevent reload on toggle
            // Check against base URL without query params to avoid infinite reload loop if we appended timestamp
            const currentSrc = audio.src.split('?')[0];
            const newSrc = currentTrack.src.split('?')[0];

            if (currentSrc !== newSrc) {
                // FORCE FRESH FETCH with CORS headers by appending timestamp
                audio.src = `${currentTrack.src}?t=${Date.now()}`;
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

        const handleEnded = () => {
            if (playlist && playlist.length > 0 && currentIndex < playlist.length - 1) {
                const nextIdx = currentIndex + 1;
                setCurrentIndex(nextIdx);
                setCurrentTrack(playlist[nextIdx]);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        };
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
    }, [playlist, currentIndex]);

    const value = {
        currentTrack,
        isPlaying,
        playlist,
        currentIndex,
        playPlaylist,
        playTrack,
        pauseTrack,
        togglePlay,
        closePlayer,
        nextTrack,
        prevTrack,
        audioRef // Expose ref for progress bar component usage
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
