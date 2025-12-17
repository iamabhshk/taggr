# Taggr Setup Guide

This guide will walk you through setting up the Taggr development environment from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (https://git-scm.com/)
- **Firebase** account (https://firebase.google.com/)
- **npm** account (optional, for publishing packages)

## Step-by-Step Setup

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
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will be available at `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `taggr`

### 4. Set Up Firebase

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - (Optional) Enable Google Sign-In

4. Get Firebase Config (for Frontend):
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web" icon to add a web app
   - Copy the config object

5. Generate Service Account Key (for Backend):
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Extract these values:
     - `project_id` → FIREBASE_PROJECT_ID
     - `private_key` → FIREBASE_PRIVATE_KEY
     - `client_email` → FIREBASE_CLIENT_EMAIL

### 5. Configure Environment Variables

#### Frontend Environment (.env)

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
VITE_API_URL=http://localhost:5000/api
```

#### Backend Environment (.env)

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mongodb://localhost:27017/taggr
# Or for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/taggr?retryWrites=true&w=majority

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-change-this-in-production

# npm (optional, for package publishing)
NPM_AUTH_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
NPM_REGISTRY=https://registry.npmjs.org

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Never commit `.env` files to version control
- For `FIREBASE_PRIVATE_KEY`, ensure the newlines are properly escaped (`\n`)

### 6. Initialize the Database

The database will be automatically initialized when you start the backend server for the first time. MongoDB will create the `taggr` database and necessary collections automatically.

### 7. Start the Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Firebase Admin SDK initialized successfully
✅ All services initialized successfully
🚀 Server running on port 5000
📝 Environment: development
🔗 API: http://localhost:5000/api
📚 Health check: http://localhost:5000/api/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 8. Verify the Setup

1. **Check Backend Health:**
   - Open http://localhost:5000/api/health
   - You should see: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Check Frontend:**
   - Open http://localhost:3000
   - You should see the Taggr login page

3. **Create Test Account:**
   - Click "Sign up"
   - Create an account with email/password
   - You should be redirected to the dashboard

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: bad auth`
- Check your MongoDB credentials
- Ensure network access is configured in MongoDB Atlas

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`
- Ensure MongoDB service is running
- Check if port 27017 is accessible

### Firebase Issues

**Error:** `Firebase: Error (auth/invalid-api-key)`
- Verify your Firebase API key in frontend `.env`
- Check that all Firebase config values are correct

**Error:** `Firebase Admin SDK initialization failed`
- Verify the private key format (newlines should be `\n`)
- Ensure the service account has proper permissions

### CORS Issues

**Error:** `Access-Control-Allow-Origin`
- Check that `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Ensure no trailing slashes in the origin URL

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
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

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint -- --fix

# Format code with Prettier
npm run format
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

## Optional: Setting Up npm Publishing

To enable label publishing to npm:

1. Create npm account at https://www.npmjs.com/
2. Generate an access token:
   - Go to Account > Access Tokens
   - Generate new token (Automation type)
3. Add token to backend `.env`:
   ```env
   NPM_AUTH_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Next Steps

1. Read the [README.md](./README.md) for project overview
2. Review the [architecture documentation](./taggr-architecture.pdf)
3. Start building features!

## Getting Help

- Check existing issues: https://github.com/yourusername/taggr/issues
- Create new issue if needed
- Join our community Discord (link coming soon)

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [Express.js Documentation](https://expressjs.com/)

---

Happy coding! 🚀
