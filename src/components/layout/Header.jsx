import { useState } from "react";
import SendDemosModal from "../SendDemosModal";
import { FaInstagram, FaSpotify, FaApple, FaYoutube, FaBandcamp } from "react-icons/fa";

const Header = () => {
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 left-0 z-50 pointer-events-none opacity-0">
      <div className="flex justify-between items-start px-5 md:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">

        {/* LOGO / BRANDING */}
        <h1
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-sm font-bold cursor-pointer font-heading tracking-widest text-white pointer-events-auto mt-2"
        >
          MOONKAT RECORDS
        </h1>

        {/* SOCIAL ICONS (Always Visible) */}
        <div className="flex gap-4 md:gap-6 text-zinc-400 pointer-events-auto mt-2">
          <a href="https://www.instagram.com/moonkat_records/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><FaInstagram size={18} /></a>
          <a href="https://open.spotify.com/intl-es/artist/4TpaRMxJFAVHyLunW3UvwW" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><FaSpotify size={18} /></a>
          <a href="https://music.apple.com/es/artist/mooncat/152398714" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><FaApple size={18} /></a>
          <a href="https://www.youtube.com/watch?v=IjWGeIfoeY0" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><FaYoutube size={18} /></a>
          <a href="https://moonkatrecords.bandcamp.com/music" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><FaBandcamp size={18} /></a>
        </div>
      </div>

      <SendDemosModal
        isOpen={isSendDemosOpen}
        onClose={() => setIsSendDemosOpen(false)}
      />

    </header>
  );
};

export default Header;