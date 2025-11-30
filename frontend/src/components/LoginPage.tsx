import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, CircularProgress, 
  Avatar, Container, Fade 
} from '@mui/material';
import { Lock, HowToReg } from '@mui/icons-material';

interface LoginProps {
  onLogin: (walletAddress: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enter' | 'verify' | 'success'>('enter');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!walletAddress.trim()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate verification (real: CAPTCHA or simple check)
    setTimeout(() => {
      if (walletAddress.includes('addr_test1') || walletAddress.length > 50) {
        setStep('verify');
        setTimeout(() => {
          setStep('success');
          setTimeout(() => {
            onLogin(walletAddress);
          }, 1500);
        }, 2000);
      } else {
        setError('Enter a valid Cardano wallet address');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Fade in={true} timeout={800}>
          <Paper elevation={10} sx={{ 
            p: 4, 
            background: 'linear-gradient(145deg, #f0f2f5 0%, #e8eaf6 100%)'
          }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ 
              mx: 'auto', 
              bgcolor: '#1a237e', 
              width: 80, height: 80, mb: 2 
            }}>
              <Lock sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom color="#1a237e">
              Agent Forces
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Cardano AI Assistant
            </Typography>
          </Box>

          {step === 'enter' && (
            <>
              <TextField
                fullWidth
                label="Enter Wallet Address"
                placeholder="addr_test1q..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                sx={{ mb: 3 }}
                error={!!error}
                helperText={error}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading || !walletAddress.trim()}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1.1rem',
                  bgcolor: '#1a237e'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </>
          )}

          {step === 'verify' && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 3, color: '#1a237e' }} />
              <Typography variant="h6" gutterBottom>
                Verifying Wallet...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Checking if you're human 🤖
              </Typography>
            </Box>
          )}

          {step === 'success' && (
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                mx: 'auto', 
                bgcolor: '#4caf50', 
                width: 80, height: 80, mb: 3 
              }}>
                <HowToReg sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom color="#4caf50">
                Successfully Logged In! ✅
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Redirecting to dashboard...
              </Typography>
            </Box>
          )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;