"use client"

import { useState } from 'react';
import { auth } from './config/firebase';  // Import Firebase auth for authentication checks
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import MUI hook to access theme

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-in and sign-up
  const [error, setError] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false); // State to manage the "Forgot Password" flow

  const theme = useTheme(); // Access the current theme

  const handleAuth = async () => {
    try {
      setError(null);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email); // Send password reset email
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" mb={3}>
        <h1>Welcome to CS AI Assistant</h1>
      </Typography>

      {/* Toggle between Sign Up / Sign In and Forgot Password */}
      {!isResettingPassword ? (
        <>
          <Typography variant="h4" mb={3}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Typography>

          <TextField
            label="Email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            fullWidth
            margin="normal"
            sx={{
              input: {
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            fullWidth
            margin="normal"
            sx={{
              input: {
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            }}
          />
          {error && <Typography color="error">{error}</Typography>}

          <Button variant="contained" onClick={handleAuth} sx={{ mt: 2 }}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <Button
            variant="text"
            onClick={() => setIsSignUp(!isSignUp)}
            sx={{ mt: 2 }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>

          <Button
            variant="text"
            onClick={() => setIsResettingPassword(true)}  // Show password reset input
            sx={{ mt: 2 }}
          >
            Forgot Password?
          </Button>
        </>
      ) : (
        <Box mt={2}>
          <Typography variant="h4" mb={3}>Reset Password</Typography>
          <TextField
            label="Enter your email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            fullWidth
            margin="normal"
            sx={{
              input: {
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            }}
          />
          {error && <Typography color="error">{error}</Typography>}

          <Button variant="contained" onClick={handlePasswordReset} sx={{ mt: 2 }}>
            Send Reset Email
          </Button>

          <Button
            variant="text"
            onClick={() => setIsResettingPassword(false)}  // Go back to login
            sx={{ mt: 2 }}
          >
            Back to Sign In
          </Button>
        </Box>
      )}
    </Box>
  );
}
