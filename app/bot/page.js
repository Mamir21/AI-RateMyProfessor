import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import ChatBot from '../components/botpage';


export default function Bot() {
  return (
    <ProtectedRoute>

      <Navbar />
      <>
      <ChatBot />
      </>

      </ProtectedRoute>
  )
}