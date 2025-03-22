import React, { useState, useEffect } from 'react';
import {
  Box,
  styled,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDate } from '../../utils/dateUtils';
import { deleteTender } from '../../utils/api';
import { tenderAPI } from '../../api/apiService';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled('div')({
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(180deg, rgb(55.89, 202.64, 251.55) 0%, rgb(33.22, 120.47, 149.55) 100%)',
  display: 'flex',
  justifyContent: 'center',
  padding: '2vh 0',
});

const ContentWrapper = styled('div')({
  width: '90%',
  maxWidth: '1200px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

const SearchContainer = styled(Box)({
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  alignItems: 'center',
});

const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
});

interface Tender {
  tender_id: string;
  title: string;
  description: string;
  budget: string;
  notice_date: string;
  close_date: string;
  winner_date: string;
  status: string;
  category: string;
  created_by: number;
}

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

const BrowseTender = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOnlyOpenTenders, setShowOnlyOpenTenders] = useState<boolean>(false);
  const [selectedTender, setSelectedTender] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('CITY'); // Default to CITY to enable delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const [categories] = useState<string[]>([
    'CONSTRUCTION',
    'INFRASTRUCTURE',
    'SERVICES',
    'TECHNOLOGY',
    'HEALTHCARE',
    'EDUCATION',
    'TRANSPORTATION',
    'ENVIRONMENT'
  ]);

  const fetchTenders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        return;
      }
      
      console.log('Fetching tenders...');
      setLoading(true);
      
      try {
        const data = await tenderAPI.getAllTenders();
        console.log('Raw API response:', data);
        
        if (Array.isArray(data)) {
          if (data.length === 0) {
            console.log('No tenders found in the database');
            
            // Add mock data if no tenders found (temporary solution)
            console.log('Adding mock tenders for testing');
            const mockTenders = createMockTenders();
            setTenders(mockTenders);
            setFilteredTenders(mockTenders);
            setLoading(false);
            return;
          }
          
          const mappedData = data.map(item => {
            console.log('Processing tender item:', item);
            
            // Convert ID to string if needed
            const tenderId = item.id ? String(item.id) : '';
            
            return {
              tender_id: tenderId,
              title: item.title || '',
              description: item.description || '',
              budget: item.budget || '0',
              notice_date: item.notice_date || '',
              close_date: item.submission_deadline || '',
              winner_date: item.winner_date || '',
              status: item.status || 'PENDING',
              category: item.category || 'General',
              created_by: item.created_by
            };
          });
          
          console.log('Mapped tender data:', mappedData);
          setTenders(mappedData);
          setFilteredTenders(mappedData);
        } else {
          console.error('Received data is not an array:', data);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('API error:', error);
        if (error instanceof Error) {
          setError(`Failed to load tenders: ${error.message}`);
        } else {
          setError('Failed to load tenders. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchTenders:', error);
      setLoading(false);
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Function to create mock tenders for testing
  const createMockTenders = () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setDate(now.getDate() + 30);
    
    return [
      {
        tender_id: '1',
        title: 'Mock Tender 1: City Park Renovation',
        description: 'Renovation of main city park including landscaping and new playground equipment.',
        budget: '250000',
        notice_date: now.toISOString(),
        close_date: nextWeek.toISOString(),
        winner_date: nextMonth.toISOString(),
        status: 'OPEN',
        category: 'CONSTRUCTION',
        created_by: 1
      },
      {
        tender_id: '2',
        title: 'Mock Tender 2: Municipal Building Repairs',
        description: 'Structural repairs and facade restoration for the main municipal building.',
        budget: '500000',
        notice_date: now.toISOString(),
        close_date: nextWeek.toISOString(),
        winner_date: nextMonth.toISOString(),
        status: 'OPEN',
        category: 'INFRASTRUCTURE',
        created_by: 1
      },
      {
        tender_id: '3',
        title: 'Mock Tender 3: Public Transit Expansion',
        description: 'Expansion of public transit routes to newly developed areas of the city.',
        budget: '750000',
        notice_date: now.toISOString(),
        close_date: nextWeek.toISOString(),
        winner_date: nextMonth.toISOString(),
        status: 'OPEN',
        category: 'TRANSPORTATION',
        created_by: 1
      }
    ];
  };

  useEffect(() => {
    // Check if user is logged in and has token
    const token = localStorage.getItem('token');
    if (token) {
      // Get user type from local storage or decode from token
      // For now we'll force CITY to enable delete
      setUserRole('CITY');
    }
    
    fetchTenders();
  }, []);

  useEffect(() => {
    let filtered = tenders;
    
    if (selectedCategory) {
      filtered = filtered.filter(tender => tender.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(tender =>
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.tender_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTenders(filtered);
  }, [searchTerm, selectedCategory, tenders]);

  const handleDeleteClick = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/tenders/${selectedTenderId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete tender');
      }

      // If deletion was successful, refresh the tender list
      await fetchTenders();
      setDeleteConfirmOpen(false);
      setSelectedTenderId('');
      
      // Show success message
      setDeleteSuccess(true);
    } catch (err) {
      console.error('Error deleting tender:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete tender');
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <Typography variant="h4" sx={{ color: '#000', fontFamily: 'Outfit', fontWeight: 300 }}>
            Browse Tenders
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/city/new-tender')}
            sx={{ fontFamily: 'Outfit' }}
          >
            New Tender
          </Button>
        </HeaderSection>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {deleteSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Tender successfully deleted.
          </Alert>
        )}

        <SearchContainer>
          <TextField
            placeholder="Search by title or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Filter by Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {CATEGORY_DISPLAY_NAMES[category]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SearchContainer>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tender ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Notice Date</TableCell>
                  <TableCell>Close Date</TableCell>
                  <TableCell>Winner Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Category</TableCell>
                  {userRole === 'CITY' && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.tender_id}>
                    <TableCell>{tender.tender_id}</TableCell>
                    <TableCell>{tender.title}</TableCell>
                    <TableCell>{formatDate(tender.notice_date)}</TableCell>
                    <TableCell>{formatDate(tender.close_date)}</TableCell>
                    <TableCell>{formatDate(tender.winner_date)}</TableCell>
                    <TableCell>{tender.status}</TableCell>
                    <TableCell>{CATEGORY_DISPLAY_NAMES[tender.category] || tender.category}</TableCell>
                    {userRole === 'CITY' && (
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteClick(tender.tender_id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredTenders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={userRole === 'CITY' ? 8 : 7} align="center">
                      No tenders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this tender?</Typography>
            <Typography variant="caption" color="error">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </ContentWrapper>
    </PageContainer>
  );
};

export default BrowseTender; 