import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Releases from "./pages/Releases";
import Artists from "./pages/Artists";
import Merch from "./pages/Merch";
import Contact from "./pages/Contact";

function App() {
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
