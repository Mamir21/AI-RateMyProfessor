'use client';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '../services/auth';
import { Box, Typography } from '@mui/material';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../navbar.css';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        alert('Signed in successfully');
        router.push('/home');
      }
    } catch (error) {
      alert('Error signing in with Google: ' + error.message);
    }
  };

  return (
    <div className='login'>
      <nav>
      <img src='/images/logo.png' className="logo" /> 
      <Box
        position="absolute"
        top="30px"
        right="20px"
        borderRadius="50%"
        sx={{
          '@keyframes buttonGlow': {
            '0%': { boxShadow: '0 0 5px #4b5cf3' },
            '50%': { boxShadow: '0 0 20px #4b5cf3' },
            '100%': { boxShadow: '0 0 5px #4b5cf3' },
          },
          animation: 'buttonGlow 2s infinite',
          cursor: 'pointer', 
          '&:hover': {
            backgroundColor: '#3a4ecf', 
            transition: 'background-color 0.3s',
          },
        }}
      >
        <a className="btn" onClick={handleGoogleSignIn}>Login</a>
      </Box>
      </nav>
      <Box
        width="100vw" 
        height="100vh" 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        gap={2}
      >
        <Typography
          fontSize="40px"
          color="lightblue"
          position="relative"
          sx={{
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
            '@keyframes textGlow': {
              '0%': { textShadow: '0 0 5px lightblue' },
              '50%': { textShadow: '0 0 20px lightblue' },
              '100%': { textShadow: '0 0 5px lightblue' },
            },
            animation: 'fadeInUp 2s ease-out, textGlow 2s infinite', 
          }}
        >
          Welcome To
        </Typography>
        <Typography 
          position="relative" 
          fontSize="75px" 
          color="lightblue"
          sx={{
            '@keyframes textGlow': {
              '0%': { textShadow: '0 0 5px lightblue' },
              '50%': { textShadow: '0 0 20px lightblue' },
              '100%': { textShadow: '0 0 5px lightblue' },
            },
            animation: 'textGlow 2s infinite',
          }}
        >
          Chatterbot
        </Typography>
      </Box>
    </div>
  );
}
