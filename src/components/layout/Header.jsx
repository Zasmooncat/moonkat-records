import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../../assets/images/logos/moonkat-logo.svg";
import SendDemosModal from "../SendDemosModal";
import { FaInstagram, FaSpotify, FaApple, FaYoutube, FaBandcamp } from "react-icons/fa";



const Header = () => {
  const [isSendDemosOpen, setIsSendDemosOpen] = useState(false);

  return (
    <header className=" fixed bg-black/50 w-full top-0  left-0 z-50 flex justify-between ">

          <h1 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="my-4 text-sm font-bold ms-5 md:ms-4 cursor-pointer">MOONKAT RECORDS</h1>

          

      <nav className=" flex  md:gap-8 text-white pe-4">

        <div className="flex text-sm md:text-base gap-3 md:gap-6 my-4 text-zinc-400">

          <a href="https://www.instagram.com/moonkat_records/" target="_blank" className="hover:text-white transition-colors"><FaInstagram size={24} /></a>
          <a href="https://open.spotify.com/intl-es/artist/4TpaRMxJFAVHyLunW3UvwW" target="_blank" className="hover:text-white transition-colors"><FaSpotify size={24} /></a>
          <a href="https://music.apple.com/es/artist/mooncat/152398714" target="_blank" className="hover:text-white transition-colors"><FaApple size={24} /></a>
          <a href="https://www.youtube.com/watch?v=IjWGeIfoeY0" target="_blank" className="hover:text-white transition-colors"><FaYoutube size={24} /></a>
          <a href="https://moonkatrecords.bandcamp.com/music" target="_blank" className="hover:text-white transition-colors"><FaBandcamp size={24} /></a>

        </div>

      </nav>

      <SendDemosModal
        isOpen={isSendDemosOpen}
        onClose={() => setIsSendDemosOpen(false)}
      />

    </header>
  );
};

export default Header;