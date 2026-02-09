import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { PlayerProvider } from "../../context/PlayerContext";
import GlobalMusicPlayer from "../GlobalMusicPlayer";

const Layout = ({ children }) => {
  return (
    <PlayerProvider>
      <Header />
      <main className=""> {/* padding-top para que no tape el header fijo */}
        {children}
      </main>
      <GlobalMusicPlayer />
      <Footer />
    </PlayerProvider>
  );
};

export default Layout;
