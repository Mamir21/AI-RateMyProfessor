import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import Homepage from '../components/homepage';

export default function Home() {
  return (
    <ProtectedRoute>

      <Navbar />
      <>
      <Homepage />
      </>
      <Footer />

    </ProtectedRoute>
  )
}