import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Confirmation from './pages/Confirmation';
import Track from './pages/Track';
import Book from './pages/Book';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/track" element={<Track />} />
                <Route path="/book" element={<Book />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </div>
  );
}
