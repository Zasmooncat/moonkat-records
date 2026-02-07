import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Releases from "./pages/Releases";
import Artists from "./pages/Artists";
import Merch from "./pages/Merch";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import { useEffect } from "react";

import Promo from "./pages/Promo";

// ScrollToTop component to handle scroll on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const MainContent = () => {
  return (
    <Layout>
      <Home />
      <Releases />
      <Artists />
      <Merch />
      <Contact />
    </Layout>
  );
};

function App() {
  useEffect(() => {
    // Force scroll to top on page refresh (initial load)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/promo/:slug" element={<Promo />} />
      </Routes>
    </Router>
  );
}

export default App;
