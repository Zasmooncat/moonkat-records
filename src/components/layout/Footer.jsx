import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-24 px-8 bg-black text-white/60 text-center border-t border-gray-700 relative z-10">

      <p>© {new Date().getFullYear()} Moonkat Records. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
