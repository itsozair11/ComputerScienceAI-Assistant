"use client"

import { useState } from 'react';
import { auth } from './config/firebase';  // Import Firebase auth for authentication checks
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-in and sign-up
  const [error, setError] = useState(null);

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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" mb={3}>
        <h1>Welcome to CS AI Assistant</h1>
      </Typography>
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
      />
      <TextField
        label="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        fullWidth
        margin="normal"
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
    </Box>
  );
}
