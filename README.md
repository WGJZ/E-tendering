# E-Tendering Application

A web application for managing tender submissions and bids.

## Project Structure

- `frontend/`: React application built with TypeScript
- `backend/`: Django REST API

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values in `.env`

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values in `.env`

4. Start the development server:
   ```
   npm start
   ```

## Deployment

### Backend Deployment (Render)

1. Push the code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure the service with the provided settings
5. Add the necessary environment variables

### Frontend Deployment (Vercel)

1. Push the code to GitHub
2. Create a new project on Vercel
3. Import your GitHub repository
4. Configure the project with the provided settings
5. Add the necessary environment variables
