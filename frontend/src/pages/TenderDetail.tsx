import React, { useState, useEffect } from 'react';
import {
  Box,
  styled,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';

const PageContainer = styled('div')({
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #37CAFB 0%, #217895 100%)',
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

const TopSection = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '2rem',
});

const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
});

const ImageContainer = styled('div')({
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  overflow: 'hidden',
  marginBottom: '1rem',
});

const TenderInfoCard = styled(Paper)({
  padding: '1.5rem',
  marginBottom: '2rem',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
});

interface Tender {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  requirements: string;
  notice_date: string;
  submission_deadline: string;
  status: 'OPEN' | 'CLOSED' | 'AWARDED';
}

interface Bid {
  id: string;
  company_name: string;
  bidding_price: number;
  documents: string;
  submission_date: string;
  status: string;
  is_winner?: boolean;
}

const TenderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tenderId } = useParams<{ tenderId: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'city' | 'company' | 'public'>('public');
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectWinnerDialogOpen, setSelectWinnerDialogOpen] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    // Determine user type from URL or token
    const path = window.location.pathname;
    if (path.includes('/city/')) {
      setUserType('city');
    } else if (path.includes('/company/')) {
      setUserType('company');
    } else {
      setUserType('public');
    }

    // Determine user role from localStorage
    setUserRole(localStorage.getItem('userRole'));

    fetchTenderAndBids();
  }, [tenderId]);

  const fetchTenderAndBids = async () => {
    try {
      setLoading(true);
      let headers = {};
      const token = localStorage.getItem('token');
      
      if (token) {
        headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      // Determine the endpoint based on user authentication
      const tenderEndpoint = token
        ? `http://localhost:8000/api/tenders/${tenderId}/`
        : `http://localhost:8000/api/tenders/public/${tenderId}/`;

      // Fetch tender details
      const tenderResponse = await fetch(tenderEndpoint, { headers });

      if (!tenderResponse.ok) {
        throw new Error('Failed to fetch tender details');
      }

      const tenderData = await tenderResponse.json();
      setTender(tenderData);

      // Only fetch bids if user is authenticated
      if (token) {
        // Fetch bids for this tender
        const bidsEndpoint = `http://localhost:8000/api/tenders/${tenderId}/bids/`;
        const bidsResponse = await fetch(bidsEndpoint, { headers });

        if (bidsResponse.ok) {
          const bidsData = await bidsResponse.json();
          setBids(bidsData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load tender details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = () => {
    navigate(`/company/submit-bid/${tenderId}`);
  };

  const handleGoBack = () => {
    if (userType === 'city') {
      navigate('/city');
    } else if (userType === 'company') {
      navigate('/company/browse-tenders');
    } else {
      navigate('/public/tenders');
    }
  };

  const handleViewDocument = (documentUrl: string) => {
    setDocumentPreviewUrl(documentUrl);
    setDocumentPreviewOpen(true);
  };

  const isDeadlinePassed = (deadline: string): boolean => {
    return new Date(deadline) < new Date();
  };

  const handleSelectWinner = (bidId: string) => {
    setSelectedBidId(bidId);
    setSelectWinnerDialogOpen(true);
  };

  const confirmSelectWinner = async () => {
    if (!selectedBidId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/bids/${selectedBidId}/select_winner/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to select winner');
      }
      
      // 关闭对话框
      setSelectWinnerDialogOpen(false);
      // 显示成功消息
      setActionSuccess('Winner selected successfully!');
      // 重新获取数据
      fetchTenderAndBids();
    } catch (err) {
      console.error('Error selecting winner:', err);
      setError('Failed to select winner. Please try again.');
      setSelectWinnerDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <TopSection>
          <ImageContainer>
            <img
              src="/icon1.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </ImageContainer>
          <Typography variant="h4" sx={{ color: '#217895', fontFamily: 'Outfit', fontWeight: 300 }}>
            Tender Details
          </Typography>
        </TopSection>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <HeaderSection>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
          >
            Back
          </Button>
          
          {userType === 'company' && tender?.status === 'OPEN' && !isDeadlinePassed(tender.submission_deadline) && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmitBid}
            >
              Submit Bid
            </Button>
          )}
        </HeaderSection>

        {tender && (
          <TenderInfoCard>
            <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Outfit', fontWeight: 400 }}>
              {tender.title}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Budget</Typography>
                <Typography variant="body1">€{tender.budget}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                <Typography variant="body1">{tender.category}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip 
                  label={tender.status} 
                  color={
                    tender.status === 'OPEN' ? 'success' : 
                    tender.status === 'AWARDED' ? 'primary' : 'default'
                  }
                  size="small" 
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Notice Date</Typography>
                <Typography variant="body1">{formatDate(tender.notice_date)}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Submission Deadline</Typography>
                <Typography variant="body1">
                  {formatDate(tender.submission_deadline)}
                  {isDeadlinePassed(tender.submission_deadline) && (
                    <Chip 
                      size="small" 
                      label="Passed" 
                      color="default" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Description</Typography>
              <Typography variant="body1" paragraph>{tender.description}</Typography>
            </Box>
            
            {tender.requirements && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Requirements</Typography>
                <Typography variant="body1">{tender.requirements}</Typography>
              </Box>
            )}
          </TenderInfoCard>
        )}

        {/* Only show bids if user is authenticated and there are bids to show */}
        {userType !== 'public' && bids.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">
              Submitted Bids ({bids.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Bid Amount (EUR)</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Status</TableCell>
                    {userRole === 'CITY' && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.company_name}</TableCell>
                      <TableCell>€{bid.bidding_price}</TableCell>
                      <TableCell>{formatDate(bid.submission_date)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={bid.status}
                          color={
                            bid.status === 'ACCEPTED' ? 'success' :
                            bid.status === 'REJECTED' ? 'error' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      {userRole === 'CITY' && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {bid.documents && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                onClick={() => handleViewDocument(bid.documents)}
                              >
                                Document
                              </Button>
                            )}
                            {userRole === 'CITY' && tender?.status === 'OPEN' && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleSelectWinner(bid.id)}
                              >
                                Select as Winner
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {userType === 'public' && (
          <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Interested in bidding?</Typography>
            <Typography paragraph>
              You need to be registered and logged in as a company to submit bids.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/auth/company')}
            >
              Log in as Company
            </Button>
          </Box>
        )}
      </ContentWrapper>

      {/* Document Preview Dialog */}
      <Dialog 
        open={documentPreviewOpen} 
        onClose={() => setDocumentPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {documentPreviewUrl ? (
            documentPreviewUrl.endsWith('.pdf') ? (
              <iframe 
                src={`http://localhost:8000${documentPreviewUrl}`}
                style={{ width: '100%', height: '70vh' }}
                title="Document Preview"
              />
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={`http://localhost:8000${documentPreviewUrl}`}
                  alt="Document Preview"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              </Box>
            )
          ) : (
            <Typography>No document available to preview.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentPreviewOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            href={`http://localhost:8000${documentPreviewUrl}`}
            target="_blank"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加选择中标者的确认对话框 */}
      <Dialog
        open={selectWinnerDialogOpen}
        onClose={() => setSelectWinnerDialogOpen(false)}
      >
        <DialogTitle>Confirm Selection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to select this bid as the winner? This action will close the tender and notify all bidders.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectWinnerDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={confirmSelectWinner}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加成功消息显示 */}
      {actionSuccess && (
        <Alert 
          severity="success" 
          sx={{ mt: 2, mb: 2 }}
          onClose={() => setActionSuccess('')}
        >
          {actionSuccess}
        </Alert>
      )}
    </PageContainer>
  );
};

export default TenderDetail; 