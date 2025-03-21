# E-Tendering System Frontend

This is the frontend application for the E-Tendering System.

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Environment Configuration

Create a `.env.local` file (for local development) or `.env.production` file (for production) with the following variables:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For production, replace the API URL with your deployed backend URL.

### Running Locally

```bash
npm start
# or
yarn start
```

### Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment to Vercel

This frontend application is configured for easy deployment to Vercel.

### Setup

1. Create an account on [Vercel](https://vercel.com) if you don't have one.
2. Install the Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`

### Environment Variables

Add the following environment variables in the Vercel project settings:

- `REACT_APP_API_URL`: The URL of your deployed backend API (e.g., `https://your-backend.onrender.com/api`)
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Deploy

You can deploy either through the Vercel dashboard by connecting your GitHub repository or using the CLI:

```bash
vercel
```

For production deployments:

```bash
vercel --prod
```

### Custom Domain

If you have a custom domain, you can configure it in the Vercel project settings under the "Domains" section.

## Features

- User authentication (login/register)
- Role-based access control (City Officials, Company Representatives, Public)
- Tender management for city officials
- Bid submission for companies
- Public tender viewing

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios for API communication
