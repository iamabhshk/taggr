# Taggr - Custom Labels Platform

> **Create Once, Use Everywhere**

Taggr is a private, user-owned label management system that allows developers to create, manage, and distribute custom text labels as npm packages across all their projects. Inspired by Salesforce's custom labels feature, Taggr maintains a single source of truth for your label ecosystem.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- ✅ **Private Label Management** - Each user's labels are completely private and secure
- ✅ **npm Package Distribution** - Auto-publish labels as npm packages
- ✅ **Version Control** - Semantic versioning with changelog support
- ✅ **Beautiful UI** - Modern, responsive interface with Chakra UI
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Real-time Search** - Search and filter labels instantly
- ✅ **Import/Export** - Bulk operations for label management
- ✅ **Firebase Authentication** - Secure user authentication
- ✅ **RESTful API** - Well-documented API endpoints
- ✅ **Production Ready** - Built with scalability and security in mind

## Architecture

Taggr follows a modern client-server architecture:

```
┌──────────────────────────────────────┐
│         Frontend (React)             │
│   - Chakra UI for components         │
│   - TanStack Query for data fetching │
│   - Zustand for state management     │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│      Backend API (Express)           │
│   - RESTful endpoints                │
│   - Firebase Admin SDK               │
│   - Input validation with Zod        │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│          Data Layer                  │
│   - MongoDB (labels & users)         │
│   - Firebase Auth (authentication)   │
│   - npm Registry (distribution)      │
└──────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Chakra UI
- **State Management**: TanStack Query + Zustand
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest

### Infrastructure
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Railway/Render
- **Database Hosting**: MongoDB Atlas
- **Authentication**: Firebase (managed)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Firebase project with Admin SDK credentials
- npm account (for package publishing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taggr.git
   cd taggr
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure environment variables**

   **Frontend** (`frontend/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:5000/api
   ```

   **Backend** (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/taggr
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   JWT_SECRET=your_secret_key
   NPM_AUTH_TOKEN=your_npm_token
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## Project Structure

```
taggr/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Common components (Navbar, Sidebar)
│   │   │   └── labels/      # Label-specific components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and Firebase services
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Theme and global styles
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic services
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── .prettierrc
├── README.md
└── taggr-architecture.pdf    # Complete architecture documentation
```

## Development

### Available Scripts

**Frontend**:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

**Backend**:
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm start        # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
npm test         # Run tests
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks (optional)

### Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push to main

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Configure environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Copy connection string to `DATABASE_URL`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Label Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/labels` | Get all labels | Yes |
| POST | `/api/labels` | Create new label | Yes |
| GET | `/api/labels/:id` | Get single label | Yes |
| PATCH | `/api/labels/:id` | Update label | Yes |
| DELETE | `/api/labels/:id` | Delete label | Yes |
| POST | `/api/labels/:id/publish` | Publish to npm | Yes |
| GET | `/api/labels/:id/versions` | Get version history | Yes |
| GET | `/api/labels/search` | Search labels | Yes |
| POST | `/api/labels/bulk/export` | Export all labels | Yes |
| POST | `/api/labels/bulk/import` | Import labels | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PATCH | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/stats` | Get user statistics | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |

For detailed API documentation, see the [API Specifications](./docs/api-specs.md) (in production, use Swagger UI).

## Usage Example

### Creating and Using a Label

1. **Create a label in Taggr**:
   ```
   Name: work-status
   Display Name: Work Status
   Value: "You are currently working"
   Category: status
   Tags: ["work", "status"]
   ```

2. **Publish to npm** (generates package `@username/work-status`)

3. **Install in your project**:
   ```bash
   npm install @username/work-status
   ```

4. **Use in your code**:
   ```javascript
   import label from '@username/work-status';
   console.log(label.value); // "You are currently working"
   ```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@taggr.dev or open an issue on GitHub.

## Acknowledgments

- Inspired by Salesforce's custom labels feature
- Built with modern web technologies
- Community-driven development

---

**Taggr** - Create Once, Use Everywhere 🏷️
