import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../../assets/images/logos/moonkat-logo_pngf.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: "RELEASES", id: "releases" },
    { name: "ARTISTS", id: "artists" },
    { name: "CONTACT", id: "contact" }
  ];

  return (
    <header className="w-full  md:bg-zinc-100 py-2 px-4 mt-6 md:mt-0 bg-dark top-0 left-0 z-50 flex justify-between items-center">

      <img 
  src={logo} 
  alt="Moonkat Records Logo" 
  className="mx-auto h-11  md:invert drop-shadow-xl cursor-pointer" 
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
/>
      
      {/* Menú hamburguesa - solo visible en móvil */}
      <button
  onClick={toggleMenu}
  className="md:hidden fixed top-4 right-4 text-white z-50 flex items-center justify-center h-8 w-8"
  aria-label="Toggle menu"
>
  {isMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
</button>


      {/* Menú móvil */}
      <nav
  className={`fixed right-0.5 top-28 bg-dark transform transition-transform duration-300 ease-in-out md:hidden
  ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-full
  z-40`}
>
  <div className="flex items-center justify-center gap-8 h-full">
    {menuItems.map((item) => (
      <button
        key={item.name}
        onClick={() => scrollToSection(item.id)}
        className="text-white text-xl font-bold hover:text-violet-300 transition-colors"
      >
        {item.name}
      </button>
    ))}
  </div>
</nav>


      {/* Overlay cuando el menú está abierto */}
      {isMenuOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black bg-opacity-50  md:hidden z-30"
        />
      )}

      {/* Menú desktop - visible solo en pantallas medianas y grandes */}
      <nav className="hidden  gap-8 text-white">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => scrollToSection(item.id)}
            className="text-lg hover:text-violet-300 transition-colors"
          >
            {item.name}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;