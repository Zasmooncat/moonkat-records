import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-8 bg-dark text-light text-center mt-12 border-t border-gray-700">
      
      <p>© {new Date().getFullYear()} Moonkat Records. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
