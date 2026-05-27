import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/producto/:slug" element={<ProductDetail />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default App;
