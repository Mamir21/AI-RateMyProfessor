import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from '../components/Navbar';
import Homepage from '../components/homepage';

export default function Home() {
  
  return (
    <ProtectedRoute>
      <Navbar />
      <>
      <Homepage />
      </>
    </ProtectedRoute>
  )
}