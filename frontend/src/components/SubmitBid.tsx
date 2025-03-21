import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Alert, Typography, CircularProgress } from '@mui/material';

interface SubmitBidProps {
  tenderId: number;
  onBidSubmitted?: () => void;
}

interface Bid {
  id: number;
  tender_id: number;
  company: number;
  bidding_price: string;
  status: string;
  submission_date: string;
  tender_title: string;
}

export default function SubmitBid({ tenderId, onBidSubmitted }: SubmitBidProps) {
  const [hasBid, setHasBid] = useState<boolean | null>(null); // null means loading
  const [error, setError] = useState('');

  
  useEffect(() => {
    const checkExistingBid = async () => {
      try {
        const token = localStorage.getItem('token');
        const companyId = localStorage.getItem('companyId');

        if (!token || !companyId) {
          setError('Authentication required');
          return;
        }

        const response = await fetch('http://localhost:8000/api/bids/my_bids/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check bid status');
        }

        const bids: Bid[] = await response.json();
        console.log('Retrieved bids:', bids);
        
        const existingBid = bids.find((bid: Bid) => Number(bid.tender_id) === Number(tenderId));
        console.log('Checking for tender:', tenderId, 'Found bid:', existingBid);
        
        setHasBid(!!existingBid);

        if (existingBid) {
          return;
        }
      } catch (err) {
        console.error('Error checking bid status:', err);
        setError('Failed to check bid status');
      }
    };

    checkExistingBid();
  }, [tenderId]);

  // loading state
  if (hasBid === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  // warnning message
  if (hasBid) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        You have already submitted a bid for this tender.
      </Alert>
    );
  }

  // error message
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // BidForm Module
  return <BidForm tenderId={tenderId} onBidSubmitted={onBidSubmitted} />;
}

function BidForm({ tenderId, onBidSubmitted }: SubmitBidProps) {
  const [biddingPrice, setBiddingPrice] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');

      if (!token || !companyId) {
        setError('Authentication required');
        return;
      }

      if (!biddingPrice || Number(biddingPrice) <= 0) {
        setError('Please enter a valid bidding price');
        return;
      }

      const formData = new FormData();
      formData.append('tender', tenderId.toString());
      formData.append('bidding_price', biddingPrice);
      if (document) {
        formData.append('documents', document);
      }
      if (additionalNotes) {
        formData.append('notes', additionalNotes);
      }

      console.log('Submitting bid with the following data:');
      console.log('Tender ID:', tenderId);
      console.log('Bidding Price:', biddingPrice);
      console.log('Document:', document?.name);
      console.log('Additional Notes:', additionalNotes || 'None');

      const response = await fetch('http://localhost:8000/api/bids/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit bid');
      }

      const data = await response.json();
      console.log('Bid submission response:', data);

      setSuccess('Bid submitted successfully');
      setBiddingPrice('');
      setDocument(null);
      setAdditionalNotes('');
      
      if (onBidSubmitted) {
        onBidSubmitted();
      }
    } catch (err) {
      console.error('Error submitting bid:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit bid');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6">Submit Bid</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        type="number"
        label="Bidding Price (€)"
        value={biddingPrice}
        onChange={(e) => setBiddingPrice(e.target.value)}
        fullWidth
        required
        sx={{ mt: 1 }}
      />

      <input
        type="file"
        onChange={(e) => setDocument(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
        id="bid-document"
      />
      <label htmlFor="bid-document">
        <Button
          component="span"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Upload Document
        </Button>
      </label>
      {document && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Selected file: {document.name}
        </Typography>
      )}

      <TextField
        label="Additional Notes"
        value={additionalNotes}
        onChange={(e) => setAdditionalNotes(e.target.value)}
        multiline
        rows={4}
        fullWidth
        sx={{ mt: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Submit Bid
      </Button>
    </Box>
  );
} 