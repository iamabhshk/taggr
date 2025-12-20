# Taggr - Custom Labels Platform

> **Create Once, Use Everywhere**

Taggr is a private, user-owned label management system that allows developers to create, manage, and distribute custom text labels across all their projects. Inspired by Salesforce's custom labels feature, Taggr maintains a single source of truth for your label ecosystem.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## What is Taggr?

Taggr helps you manage all your application labels (text strings, messages, UI copy) in one central place. Instead of hardcoding text throughout your codebase, you can:

- **Create labels** with categories and tags for easy organization
- **Manage versions** with semantic versioning and changelogs
- **Pull labels** directly into your projects using the CLI
- **Collaborate** with your team through workspaces
- **Track usage** with analytics on how often labels are used

## Features

### 🔒 Private Label Management
Each user's labels are completely private and secure. Your labels are only accessible to you unless you explicitly share them through workspaces. All data is encrypted and stored securely.

### 🖥️ CLI Tool
Pull labels directly into your project using our command-line interface. No need to manually copy-paste or maintain separate files. The CLI includes:
- **Version tracking** - Know exactly which version of each label you're using
- **Build-time validation** - Fail builds if labels are outdated (CI/CD integration)
- **Auto-sync mode** - Automatically sync labels when they change in the cloud
- **Integrity checks** - Detect and prevent manual edits to label files
- Simply run `taggr pull --all` and your labels are ready to use in your codebase.

### 📦 Version Control
Track changes to your labels with semantic versioning (major.minor.patch). Each version includes a changelog, so you can see exactly what changed and when. Perfect for maintaining consistency across deployments.

### 🎨 Beautiful UI
Modern, responsive interface built with Material-UI. Intuitive design makes it easy to create, edit, and manage hundreds of labels without getting lost. Clean, professional interface that works on all devices.

### 🌙 Dark Mode
Full dark mode support for comfortable late-night coding sessions. Automatically syncs with your system preferences or can be toggled manually.

### 🔍 Real-time Search
Search and filter labels instantly by name, category, or tags. Find exactly what you need in milliseconds, even with thousands of labels. Debounced search ensures smooth performance.

### 📥 Import/Export
Bulk operations for efficient label management. Import labels from JSON files or export your entire label collection for backup or migration. Perfect for onboarding new team members or migrating between projects.

### 🔐 Firebase Authentication
Secure user authentication powered by Firebase. Support for email/password and Google Sign-In. All authentication is handled securely with industry-standard practices.

### 👥 Team Workspaces
Collaborate with team members through shared workspaces. Invite team members with different permission levels (Owner, Admin, Editor, Viewer). All workspace members can access and manage shared labels together.

### 📊 Usage Analytics
Track how often your labels are used via CLI pulls. See which labels are most popular and identify unused labels that can be cleaned up. Analytics help you understand your label usage patterns.

### 🔑 Token Management
Generate secure API tokens for CLI access. Each token can be named and managed independently. Regenerate tokens anytime for security, and revoke tokens you no longer need.

### 🏷️ Categories & Tags
Organize labels with categories and tags for easy navigation. Filter by category or search by tags to quickly find related labels. Perfect for large projects with hundreds of labels.

### 📝 Rich Metadata
Add descriptions, categories, and tags to each label for better organization. Metadata helps team members understand the context and purpose of each label.

### 🚀 Production Ready
Built with scalability and security in mind. Handles thousands of labels efficiently, with proper error handling, rate limiting, and security best practices. Ready for production use from day one.

## Quick Start

### 1. Create an Account

Sign up at the Taggr web application to get started.

### 2. Generate a Token

1. Navigate to the **Tokens** section in your dashboard
2. Click **Generate New Token**
3. Give it a name (e.g., "My Development Token")
4. Copy the token immediately - you won't be able to see it again!

### 3. Install the CLI

```bash
npm install -g @taggr/cli
```

### 4. Login with Your Token

```bash
taggr login <your-token>
```

### 5. Pull Your Labels

```bash
taggr pull --all
```

This creates a `./taggr` folder in your project with:
- `labels.json` - All your labels in one file
- `labels.d.ts` - TypeScript definitions for autocomplete
- `.taggr.json` - Metadata file tracking versions and sync status (automatically managed)

### 6. Use in Your Code

```javascript
import labels from './taggr/labels.json';

console.log(labels.welcomeMessage);
console.log(labels.submitButton);

// Or destructure what you need
const { myLabel, submitButton } = labels;
```

## How It Works

### Creating Labels

1. Log in to your Taggr dashboard
2. Click **Create Label**
3. Fill in:
   - **Name** (kebab-case, e.g., `welcome-message`)
   - **Display Name** (human-readable, e.g., "Welcome Message")
   - **Value** (the actual text content)
   - **Category** (optional, for organization)
   - **Tags** (optional, for filtering)

### Managing Labels

- **Search** - Use the search bar to find labels by name or content
- **Filter** - Filter by category or tags
- **Edit** - Click any label to edit its value
- **Delete** - Remove labels you no longer need

### Team Collaboration

1. Create a **Workspace** from the Team section
2. **Invite members** by email with roles:
   - **Owner** - Full control
   - **Admin** - Can manage members and labels
   - **Editor** - Can create and edit labels
   - **Viewer** - Read-only access
3. All workspace members can access shared labels

### CLI Commands

```bash
# Authentication
taggr login <token>        # Authenticate with your API token
taggr logout               # Remove saved credentials
taggr whoami               # Check which account you're logged in as

# Managing Labels
taggr list                 # List all your labels
taggr pull --all           # Pull all labels to your project
taggr pull <label-name>    # Pull a specific label
taggr sync                 # Force sync all labels (alias for pull --all)

# Version Control & Validation
taggr check                # Check if labels are up-to-date
taggr check --strict       # Fail build if labels are outdated (for CI/CD)
taggr status               # Show sync status and label versions

# Auto-Sync
taggr watch                # Watch for label changes and auto-sync
taggr watch --interval 30  # Custom poll interval (default: 30 seconds)
```

### Advanced Features

#### Version Tracking
The CLI automatically tracks which version of each label you're using. This ensures your team stays in sync and prevents outdated labels in production.

#### Build-Time Validation
Use `taggr check --strict` in your CI/CD pipeline to fail builds if labels are outdated. This prevents deploying stale labels to production.

```bash
# In your CI/CD pipeline
taggr check --strict
```

#### Auto-Sync Mode
Run `taggr watch` to automatically sync labels when they change in the cloud. Perfect for development!

```bash
taggr watch
```

#### Check Sync Status
Use `taggr status` to see when labels were last synced and which versions you're using.

```bash
taggr status
```

## Project Structure

```
taggr/
├── frontend/          # React frontend application
├── backend/           # Express backend API
└── packages/
    └── cli/           # CLI tool for pulling labels
```

## Technology Stack

- **Frontend**: React 18+ with TypeScript, Material-UI
- **Backend**: Express.js with TypeScript, MongoDB
- **Authentication**: Firebase
- **CLI**: TypeScript, npm package

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Salesforce's custom labels feature
- Built with modern web technologies
- Community-driven development

---

**Taggr** - Create Once, Use Everywhere 🏷️
