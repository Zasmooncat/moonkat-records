import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Releases from "./pages/Releases";
import Artists from "./pages/Artists";

function App() {
  return (
    <Layout>
      <Home />
      <Releases />
      <Artists />
    </Layout>
  );
}

export default App;
