import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className=""> {/* padding-top para que no tape el header fijo */}
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
