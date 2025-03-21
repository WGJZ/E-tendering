# E-Tendering System Deployment Checklist

## Backend (Render) Deployment

### Prerequisites
- GitHub repository is up to date
- Django project has been configured for production
- CORS settings are correct with no trailing slashes

### Environment Variables
Ensure the following environment variables are set in Render:

- `DEBUG`: Set to `False` for production
- `ALLOWED_HOSTS`: Include your Render domain and any custom domains
- `CORS_ALLOWED_ORIGINS`: Include your Vercel frontend URL (no trailing slash)
- `DATABASE_URL`: Automatically configured by Render when using their PostgreSQL
- `SECRET_KEY`: Generate a secure random key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service key (for file uploads)

### Steps
1. Push all changes to GitHub
2. Login to Render Dashboard
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure the environment variables
6. Set the build command to `./build.sh`
7. Set the start command to `cd backend && gunicorn --workers=4 etendering.wsgi`
8. Choose an appropriate instance type
9. Click "Create Web Service"
10. Wait for the build to complete
11. Test the API endpoints

## Frontend (Vercel) Deployment

### Prerequisites
- GitHub repository is up to date
- Frontend code uses centralized API service
- Environment variable templates are in place (`.env.production.example`)
- `vercel.json` configuration is present

### Environment Variables
Ensure the following environment variables are set in Vercel:

- `REACT_APP_API_URL`: The full URL to your backend API (e.g., `https://e-tendering-backend.onrender.com/api`)
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Steps
1. Push all changes to GitHub
2. Login to Vercel Dashboard
3. Create a new project
4. Import your GitHub repository
5. Configure the environment variables
6. Set the Framework Preset to "Create React App"
7. Set the Root Directory to "frontend"
8. Click "Deploy"
9. Wait for the build to complete
10. Test the frontend application

## Post-Deployment Testing

### API Connectivity
- Verify public tenders can be viewed
- Test user login functionality
- Ensure CORS is properly configured

### Authentication
- Test login for city officials
- Test login for company representatives
- Verify authentication token is being stored

### Core Functionality
- Create a test tender
- Submit a test bid
- Test the complete tender lifecycle

### Error Handling
- Ensure API errors are properly displayed
- Verify authentication errors are handled gracefully
- Check that the application falls back to sample data when needed

## Troubleshooting Common Issues

### CORS Errors
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Ensure frontend is making requests to the correct API URL
- Verify no trailing slashes in CORS settings

### 401 Unauthorized Errors
- Check if the token is being sent with the request
- Verify token format in localStorage
- Test API endpoint directly using tools like Postman

### Login Issues
- Verify the login API endpoint is correct
- Check if the user credentials are valid
- Ensure the backend is processing authentication correctly 