# GrozeryShop

A modern web application built with React, Firebase, and Material UI for tracking grocery receipts and spending.

## Tech Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Material UI (MUI)
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore
  - Cloud Storage
  - Cloud Functions
- **Deployment**: Netlify
- **Version Control**: GitHub

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Then edit .env.local with your Firebase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Setup Instructions

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete instructions on setting up GitHub, Firebase, and Netlify.

## Project Structure

```
grozeryshop/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── App.jsx         # Main app component
│   ├── firebase.js     # Firebase configuration
│   ├── index.css       # Global styles
│   ├── main.jsx        # App entry point
│   └── theme.js        # Material UI theme
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── index.html          # HTML template
├── netlify.toml        # Netlify configuration
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firebase Services

This app is configured to use:

- **Authentication**: User login and registration
- **Firestore**: NoSQL database for app data
- **Storage**: File and image storage
- **Functions**: Serverless backend functions

## Environment Variables

Required environment variables (set in `.env.local`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Deployment

The app is configured for automatic deployment to Netlify. Every push to the `main` branch will trigger a new deployment.

## License

Private project
