import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Releases from "./pages/Releases";
import Artists from "./pages/Artists";
import Merch from "./pages/Merch";
import Contact from "./pages/Contact";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Force scroll to top on page refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <Home />
      <Releases />
      <Artists />
      <Merch />
      <Contact />
    </Layout>
  );
}

export default App;
