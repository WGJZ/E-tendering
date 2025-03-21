import React, { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Box, styled, TextField, Typography, Link } from '@mui/material';
import { authAPI } from '../api/apiService';

// create a custom button container
const StyledButtonContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(217, 217, 217, 0.4)',
  borderRadius: '1.5vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(217, 217, 217, 0.5)',
  },
  transition: 'all 0.3s ease',
}));

// create a custom input box style
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(217, 217, 217, 0.4)',
    borderRadius: '1.5vw',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#000',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 200,
  },
  '& .MuiOutlinedInput-input': {
    color: '#000',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 200,
    fontSize: 'clamp(16px, 2vw, 24px)',
  },
});

const ButtonText = styled('div')({
  color: '#000000',
  fontSize: 'clamp(16px, 2vw, 24px)',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 200,
  whiteSpace: 'nowrap',
});

const ErrorText = styled(Typography)({
  color: '#ff0000',
  fontSize: 'clamp(14px, 1.5vw, 18px)',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 200,
  marginTop: '1vh',
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { userType } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError('Enter the username and password for your account');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Attempting to login as ${userType} with username: ${formData.username}`);
      
      // Make sure user_type is uppercase
      const uppercaseUserType = userType?.toUpperCase();
      console.log(`User type for API request: ${uppercaseUserType}`);
      
      // Using the same approach as the successful test function
      const apiUrl = process.env.REACT_APP_API_URL || 'https://e-tendering-backend.onrender.com/api';
      const endpoint = `${apiUrl}/auth/login/`;
      
      console.log(`Sending direct login request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          user_type: uppercaseUserType
        }),
      });
      
      console.log('Login response status:', response.status);
      
      const loginData = await response.json();
      console.log('Login response data:', loginData);
      
      if (response.ok) {
        console.log('Login successful:', loginData);
        
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userType', loginData.user_type || uppercaseUserType);
        
        if (userType === 'city') {
          navigate('/city');
        } else if (userType === 'company') {
          navigate('/company');
        }
      } else {
        setError(loginData.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // This is a debugging function to test the raw API call
  const testDirectApiCall = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Testing direct API call with formData:', formData);
      
      // Try with both API URLs to ensure we're reaching the correct endpoint
      const apiUrl = process.env.REACT_APP_API_URL || 'https://e-tendering-backend.onrender.com/api';
      const endpoint = `${apiUrl}/auth/login/`;
      
      console.log(`Sending direct request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          user_type: userType?.toUpperCase()
        }),
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        // Save the token from successful login
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user_type || userType?.toUpperCase());
        
        setError('Direct API call successful. Login successful!');
        
        // Navigate to the appropriate route
        setTimeout(() => {
          if (userType === 'city') {
            navigate('/city');
          } else if (userType === 'company') {
            navigate('/company');
          }
        }, 1000);
      } else {
        setError(`Direct API call failed: ${data.message || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Direct API call error:', error);
      setError(`Direct API call error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(180deg, #37CAFB 0%, #217895 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '90%',
          height: '90vh',
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: 'row'
          },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2vw',
        }}
      >
        {/* left icon */}
        <Box
          sx={{
            width: { xs: '70%', md: '40%' },
            aspectRatio: '1/1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/icon1.png"
            alt="City Buildings"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* right form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: { xs: '90%', md: '45%' },
            display: 'flex',
            flexDirection: 'column',
            gap: '2vh',
          }}
        >
          <ButtonText sx={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
            {userType?.toUpperCase()}
          </ButtonText>

          <StyledTextField
            fullWidth
            label="USERNAME"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={!!error}
          />

          <StyledTextField
            fullWidth
            type="password"
            label="PASSWORD"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!error}
          />

          {error && <ErrorText>{error}</ErrorText>}
          
          {/* Login button - full width for both city and company */}
          <StyledButtonContainer
            onClick={handleSubmit}
            sx={{
              width: '100%',
              height: '5vh',
              minHeight: '40px',
            }}
          >
            <ButtonText>LOGIN</ButtonText>
          </StyledButtonContainer>
          
          {/* Test API button - for debugging purposes */}
          <StyledButtonContainer
            onClick={testDirectApiCall}
            sx={{
              width: '100%',
              height: '5vh',
              minHeight: '40px',
              bgcolor: 'rgba(190, 190, 190, 0.4)',
              mt: 1,
            }}
          >
            <ButtonText>TEST LOGIN API</ButtonText>
          </StyledButtonContainer>
          
          {/* Only show registration link for company users */}
          {userType === 'company' && (
            <Box sx={{ 
              mt: 2, 
              width: '100%',
              textAlign: 'center',
              backgroundColor: 'rgba(217, 217, 217, 0.4)',
              borderRadius: '1.5vw',
              padding: '10px',
            }}>
              <ButtonText sx={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}>
                Don't have an account?{' '}
                <RouterLink 
                  to="/register/company" 
                  style={{ 
                    color: '#000000',
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                  }}
                >
                  Register as Company
                </RouterLink>
              </ButtonText>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm; 