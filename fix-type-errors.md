# TypeScript Error Fixes

## Issue
The TypeScript error occurs because `tender.id` is typed as `string | number` in the Tender interface, but some API functions expect strictly a `string` parameter.

## Changes Required

1. Update all navigation functions that use tender.id to explicitly convert to string:

   ```tsx
   // In BrowseTenders.tsx
   navigate(`/tenders/${String(tender.id)}`);
   navigate(`/company/submit-bid/${String(tender.id)}`);
   ```

2. Update all API calls that use tender.id to explicitly convert to string:

   ```tsx
   // In SelectWinner.tsx
   await bidAPI.getTenderBids(String(tender.id));
   ```

3. Type issue in PublicTenders.tsx:

   ```tsx
   // Fix in PublicTenders.tsx - Line 166:
   // Replace
   tender.id.toLowerCase().includes(search.toLowerCase())
   // With
   String(tender.id).toLowerCase().includes(search.toLowerCase())
   ```

4. Fix in CityDashboard.tsx:

   ```tsx
   // Where API calls are made with tender.id, use String conversion
   handleDelete(String(tender.id))
   handleStatusMenuOpen(e, String(tender.id))
   ```

## Root Cause
The main issue is that the backend API endpoints expect string parameters, but the Tender interface allows both string and number types. To provide a more thorough fix:

1. Use consistent types throughout the application
2. Ensure all ID parameters are properly converted to the expected type before use
3. Be explicit with type conversions at API boundaries 