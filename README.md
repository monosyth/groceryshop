# GrozeryShop

A modern web application built with React, Firebase, and Material UI for tracking grocery receipts, analyzing spending, and generating recipe ideas from your groceries.

## Features

- 📸 **Receipt Upload**: Snap photos of grocery receipts for automatic parsing
- 📊 **Analytics Dashboard**: Track spending trends, categories, and stores
- 🛍️ **Item Management**: Browse and search all grocery items across receipts
- 👨‍🍳 **Recipe Generator**: Get AI-powered recipe suggestions based on your groceries
  - Select specific receipts or upload pantry photos
  - Gemini AI suggests real recipes from popular cooking sites
  - Smart ingredient matching with pantry staples consideration
- 📝 **Recipe Import**: Paste recipes from any website to extract ingredients
- 🛒 **Shopping List**: Create shopping lists from recipe ingredients
  - Check off items as you shop
  - Get store suggestions based on your shopping history
- 📖 **My Recipes**: Save and reference recipes while cooking

## Tech Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Material UI (MUI)
- **AI**: Google Gemini API for recipe generation and image analysis
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

### Deploying Firestore Security Rules

**IMPORTANT**: You must deploy the Firestore security rules for the shopping list and saved recipes features to work.

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the project (if not already done):
```bash
firebase init firestore
# Select your Firebase project
# Accept the default firestore.rules file
```

4. Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

The `firestore.rules` file contains security rules that ensure:
- Users can only read/write their own data
- All collections require authentication
- Shopping list items, saved recipes, and receipts are user-specific

## Environment Variables

Required environment variables (set in `.env.local`):

### Firebase Configuration
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Gemini AI Configuration (Required for Recipe Feature)
```
VITE_GEMINI_API_KEY
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

**Note**: The Recipe feature requires a Gemini API key. Without it, you can still use all other features of the app.

## Deployment

The app is configured for automatic deployment to Netlify. Every push to the `main` branch will trigger a new deployment.

## License

Private project
