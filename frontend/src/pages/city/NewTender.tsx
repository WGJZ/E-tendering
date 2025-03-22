import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  styled,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  MenuItem,
  InputAdornment,
  Paper,
  Divider,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tenderAPI } from '../../api/apiService';

/**
 * NewTender Component
 * 
 * A comprehensive interface for creating new tender projects in the system.
 * This component handles the entire process of tender creation, including:
 * - Input validation
 * - Date management
 * - Budget handling
 * - Construction period settings
 * - API communication
 */

/**
 * PageContainer
 * Main container for the new tender page
 * Uses a gradient background and ensures full viewport height
 * Implements responsive design principles
 */
const PageContainer = styled('div')({
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(180deg, rgb(55.89, 202.64, 251.55) 0%, rgb(33.22, 120.47, 149.55) 100%)',
  display: 'flex',
  justifyContent: 'center',
  padding: '2vh 0',
});

/**
 * ContentWrapper
 * Contains the form elements with a semi-transparent background
 * Provides proper spacing and shadow effects
 * Ensures content is readable and well-organized
 */
const ContentWrapper = styled('div')({
  width: '90%',
  maxWidth: '1200px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

/**
 * FormSection
 * Organizes form fields in a vertical layout
 * Maintains consistent spacing between elements
 * Implements flex layout for better responsiveness
 */
const FormSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '2vh',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

/**
 * TenderForm Interface
 * Defines the structure of the tender form data
 * Each field corresponds to a specific aspect of the tender
 */
interface TenderForm {
  title: string;          // The official name of the tender project
  description: string;    // Detailed explanation of the tender requirements
  budget: string;         // Project budget in EUR
  notice_date: string;    // Official publication date of the tender
  close_date: string;     // Final date for accepting submissions
  winner_date: string;    // Planned date for winner announcement
  construction_start: string;  // Expected construction start date
  construction_end: string;    // Expected construction completion date
  requirements: string;   // Specific technical or legal requirements
  category: string;       // Classification category of the tender
}

const DEBUG = true; // Enable debug logging

// Add this utility function for debug logging
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

const TENDER_CATEGORIES = [
  'CONSTRUCTION',
  'INFRASTRUCTURE',
  'SERVICES',
  'TECHNOLOGY',
  'HEALTHCARE',
  'EDUCATION',
  'TRANSPORTATION',
  'ENVIRONMENT'
];

// Add display names for categories
const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  'CONSTRUCTION': 'Construction',
  'INFRASTRUCTURE': 'Infrastructure',
  'SERVICES': 'Services',
  'TECHNOLOGY': 'Technology',
  'HEALTHCARE': 'Healthcare',
  'EDUCATION': 'Education',
  'TRANSPORTATION': 'Transportation',
  'ENVIRONMENT': 'Environment'
};

/**
 * NewTender Component Implementation
 * Manages the state and behavior of the tender creation form
 */
const NewTender = () => {
  // Navigation hook for routing after form submission
  const navigate = useNavigate();

  /**
   * Form state management
   * Includes all fields necessary for tender creation
   * Initialized with empty values
   */
  const [formData, setFormData] = useState<TenderForm>({
    title: '',
    description: '',
    budget: '',
    notice_date: '',
    close_date: '',
    winner_date: '',
    construction_start: '',
    construction_end: '',
    requirements: '',
    category: '',
  });

  /**
   * Dialog state management
   * Controls the visibility of the confirmation dialog
   */
  const [openConfirm, setOpenConfirm] = useState(false);

  /**
   * Error state management
   * Handles display of error messages to the user
   */
  const [error, setError] = useState<string>('');

  /**
   * Handles form submission to create a new tender
   * Validates input, prepares data, and sends to backend
   * Provides error handling and user feedback
   */
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      debugLog('Token from localStorage:', token);

      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Extract user_id from JWT token
      let userId;
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          setError('Invalid token format. Please login again.');
          return;
        }
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        userId = tokenPayload.user_id;
        debugLog('User ID from token:', userId);
        
        if (!userId) {
          setError('User ID not found in token. Please login again.');
          return;
        }
      } catch (e) {
        debugLog('Token validation error:', e);
        setError('Token validation failed. Please login again.');
        return;
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        category: formData.category,
        requirements: formData.requirements,
        status: 'OPEN',
        notice_date: formData.notice_date ? new Date(formData.notice_date).toISOString() : null,
        submission_deadline: formData.close_date ? new Date(formData.close_date).toISOString() : null,
        winner_date: formData.winner_date ? new Date(formData.winner_date).toISOString() : null,
        construction_start: formData.construction_start ? new Date(formData.construction_start + 'T00:00:00').toISOString() : null,
        construction_end: formData.construction_end ? new Date(formData.construction_end + 'T00:00:00').toISOString() : null,
        created_by: userId
      };

      debugLog('Request data:', requestData);
      
      try {
        // Use the centralized API service instead of direct fetch
        const response = await tenderAPI.createTender(requestData);
        debugLog('Tender creation successful', response);
        
        // Even if the response is unusual, still redirect to browse page
        if (!response || (Array.isArray(response) && response.length === 0)) {
          debugLog('Warning: Received empty response from API, but continuing.');
        }
        
        navigate('/city/browse-tender');
      } catch (error) {
        debugLog('Tender creation failed:', error);
        if (error instanceof Error) {
          setError(`Failed to create tender: ${error.message}`);
        } else {
          setError('Failed to create tender: Unknown error');
        }
      }
    } catch (err) {
      debugLog('Error in handleSubmit:', err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  /**
   * Validates all form fields before submission
   * Checks for:
   * - Required fields
   * - Valid budget amount
   * - Logical date sequences
   * - Future dates where applicable
   * 
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.budget || !formData.notice_date) {
      setError('Please fill in all required fields');
      return false;
    }
    if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      setError('Please enter a valid budget amount');
      return false;
    }
    
    const now = new Date();
    const minValidYear = 2023; // Minimum valid year for dates
    
    if (formData.notice_date && new Date(formData.notice_date) < now) {
      setError('Notice date must be in the future');
      return false;
    }
    
    if (formData.close_date && new Date(formData.close_date) < new Date(formData.notice_date)) {
      setError('Close date must be after notice date');
      return false;
    }
    
    if (formData.winner_date && new Date(formData.winner_date) < new Date(formData.close_date)) {
      setError('Winner announcement date must be after close date');
      return false;
    }
    
    // Validate construction start date has a valid year
    if (formData.construction_start) {
      const startYear = new Date(formData.construction_start + 'T00:00:00').getFullYear();
      if (startYear < minValidYear || startYear > 2100) {
        setError(`Construction start date must have a valid year between ${minValidYear} and 2100`);
        return false;
      }
    }
    
    // Validate construction end date has a valid year
    if (formData.construction_end) {
      const endYear = new Date(formData.construction_end + 'T00:00:00').getFullYear();
      if (endYear < minValidYear || endYear > 2100) {
        setError(`Construction end date must have a valid year between ${minValidYear} and 2100`);
        return false;
      }
    }
    
    if (formData.construction_start && formData.construction_end && 
        new Date(formData.construction_end) < new Date(formData.construction_start)) {
      setError('Construction end date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      setOpenConfirm(true);
    }
  };

  /**
   * Formats date-time strings for display in the UI
   * 
   * @param {string} dateTimeStr - ISO date-time string
   * @returns {string} Localized date-time string
   */
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    
    try {
      // For date-only strings (like construction_start and construction_end), add time component
      if (dateTimeStr.length === 10 && dateTimeStr.includes('-')) {
        dateTimeStr = dateTimeStr + 'T00:00:00';
      }
      
      const date = new Date(dateTimeStr);
      
      // Verify date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString();
    } catch (error) {
      debugLog('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Typography variant="h4" sx={{ mb: 4, color: '#000', fontFamily: 'Outfit', fontWeight: 300 }}>
          Create New Tender
        </Typography>

        <FormSection>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <StyledTextField
            label="Tender Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <StyledTextField
            label="Category"
            fullWidth
            select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            {TENDER_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {CATEGORY_DISPLAY_NAMES[category]}
              </MenuItem>
            ))}
          </StyledTextField>

          <StyledTextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <StyledTextField
            label="Budget (EUR)"
            fullWidth
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
          />

          <StyledTextField
            label="Date of Tender Notice"
            type="datetime-local"
            fullWidth
            value={formData.notice_date}
            onChange={(e) => setFormData({ ...formData, notice_date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <StyledTextField
            label="Date of Tender Close"
            type="datetime-local"
            fullWidth
            value={formData.close_date}
            onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <StyledTextField
            label="Date of Disclosing Winner"
            type="datetime-local"
            fullWidth
            value={formData.winner_date}
            onChange={(e) => setFormData({ ...formData, winner_date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Terms of Construction</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledTextField
              label="Start Date"
              type="date"
              fullWidth
              value={formData.construction_start}
              onChange={(e) => {
                const date = e.target.value;
                debugLog('Construction start date:', date);
                
                // Basic validation to ensure year is reasonable
                const year = parseInt(date.split('-')[0]);
                if (year < 2023 || year > 2100) {
                  setError(`Please enter a valid year between 2023 and 2100`);
                  return;
                }
                
                setFormData({ ...formData, construction_start: date });
                setError(''); // Clear error if valid
              }}
              InputLabelProps={{
                shrink: true,
              }}
              // Add placeholder to show expected format
              placeholder="YYYY-MM-DD"
              required
              inputProps={{ min: "2023-01-01", max: "2100-12-31" }}
            />
            
            <StyledTextField
              label="End Date"
              type="date"
              fullWidth
              value={formData.construction_end}
              onChange={(e) => {
                const date = e.target.value;
                debugLog('Construction end date:', date);
                
                // Basic validation to ensure year is reasonable
                const year = parseInt(date.split('-')[0]);
                if (year < 2023 || year > 2100) {
                  setError(`Please enter a valid year between 2023 and 2100`);
                  return;
                }
                
                setFormData({ ...formData, construction_end: date });
                setError(''); // Clear error if valid
              }}
              InputLabelProps={{
                shrink: true,
              }}
              // Add placeholder to show expected format
              placeholder="YYYY-MM-DD"
              required
              inputProps={{ min: "2023-01-01", max: "2100-12-31" }}
            />
          </Box>

          <StyledTextField
            label="Requirements"
            fullWidth
            multiline
            rows={4}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/city')}
              sx={{ fontFamily: 'Outfit' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{ fontFamily: 'Outfit' }}
            >
              Create Tender
            </Button>
          </Box>
        </FormSection>

        {/* Confirmation dialog */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Tender Creation</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to create this tender?</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Title: {formData.title}</Typography>
              <Typography variant="subtitle1">Budget: €{formData.budget}</Typography>
              <Typography variant="subtitle1">
                Notice Date: {formatDateTime(formData.notice_date)}
              </Typography>
              <Typography variant="subtitle1">
                Close Date: {formatDateTime(formData.close_date)}
              </Typography>
              <Typography variant="subtitle1">
                Construction: {formatDateTime(formData.construction_start)} to {formatDateTime(formData.construction_end)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </ContentWrapper>
    </PageContainer>
  );
};

export default NewTender; 