# Taggr Setup Guide

This guide will walk you through setting up the Taggr development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**
- **Firebase** account

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taggr.git
cd taggr
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install CLI dependencies (optional)
cd ../packages/cli
npm install
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. MongoDB will be available at the default port

#### Option B: MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Configure network access
4. Get your connection string

### 4. Set Up Firebase

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication (Email/Password, optionally Google Sign-In)
4. Get Firebase config for frontend
5. Generate Service Account Key for backend

### 5. Configure Environment Variables

#### Frontend Environment

Create `frontend/.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=your_backend_api_url
```

#### Backend Environment

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
JWT_SECRET=your_super_secret_key
CORS_ORIGIN=your_frontend_url
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Never commit `.env` files to version control
- For `FIREBASE_PRIVATE_KEY`, ensure the newlines are properly escaped (`\n`)

### 6. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Development Workflow

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## Troubleshooting

### MongoDB Connection Issues

- Check your MongoDB credentials
- Ensure network access is configured in MongoDB Atlas
- Verify MongoDB service is running (for local setup)

### Firebase Issues

- Verify your Firebase API key in frontend `.env`
- Check that all Firebase config values are correct
- Ensure the private key format is correct (newlines should be `\n`)

### CORS Issues

- Check that `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Ensure no trailing slashes in the origin URL

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)

---

Happy coding! 🚀
