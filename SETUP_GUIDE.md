# GroceryShop Setup Guide

This guide will walk you through setting up your GroceryShop app with GitHub, Firebase, and Netlify.

## Prerequisites

- Node.js 18 or higher installed
- Git installed
- GitHub account
- Firebase account
- Netlify account

## Step 1: GitHub Setup

### 1.1 Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository: `groceryshop`
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 1.2 Push Your Local Repository to GitHub

GitHub will show you commands. Use these in your terminal:

```bash
cd /path/to/groceryshop
git remote add origin https://github.com/YOUR-USERNAME/groceryshop.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 2: Firebase Setup

### 2.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `groceryshop` (or your preferred name)
4. You can disable Google Analytics for now (optional)
5. Click "Create project" and wait for it to complete

### 2.2 Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register app with nickname: `GroceryShop Web`
3. **Check** "Also set up Firebase Hosting" (optional but recommended)
4. Click "Register app"
5. **Copy the Firebase configuration** - you'll need this next!

### 2.3 Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable the sign-in methods you want (Email/Password, Google, etc.)

#### Enable Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **Test mode** for development (change to production rules later)
4. Choose a location (us-central1 or closest to you)
5. Click "Enable"

#### Enable Storage
1. Go to **Build > Storage**
2. Click "Get started"
3. Start in **Test mode** for development
4. Click "Done"

#### Enable Functions (Optional)
1. Go to **Build > Functions**
2. Click "Get started"
3. Follow the setup instructions if you plan to use Cloud Functions

### 2.4 Configure Environment Variables

1. In your `groceryshop` folder, create a file named `.env.local`
2. Copy the contents from `.env.example`
3. Fill in your Firebase configuration values from Step 2.2:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. **IMPORTANT**: The `.env.local` file is already in `.gitignore` and will NOT be committed to GitHub

## Step 3: Install Dependencies and Test Locally

```bash
cd groceryshop
npm install
npm run dev
```

Your app should now be running at `http://localhost:5173`

## Step 4: Netlify Setup

### 4.1 Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select the `groceryshop` repository
6. Netlify will auto-detect the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"

### 4.2 Configure Environment Variables in Netlify

1. In your Netlify site dashboard, go to **Site configuration > Environment variables**
2. Click "Add a variable" and add each Firebase environment variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Use the same values from your `.env.local` file

### 4.3 Trigger a New Deployment

1. Go to **Deploys** tab
2. Click "Trigger deploy" > "Deploy site"
3. Wait for the deployment to complete
4. Your app will be live at `https://your-site-name.netlify.app`

### 4.4 Optional: Custom Domain

1. In Netlify dashboard, go to **Domain management**
2. Click "Add a domain"
3. Follow the instructions to set up your custom domain

## Step 5: Continuous Deployment

Now whenever you push changes to your `main` branch on GitHub, Netlify will automatically:
1. Pull the latest code
2. Run `npm install`
3. Run `npm run build`
4. Deploy the new version

## Firebase Security Rules

### Important: Update Security Rules for Production

The default "test mode" rules allow anyone to read/write to your database. Before going to production, update your security rules:

#### Firestore Rules (Build > Firestore Database > Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (Build > Storage > Rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Development Workflow

1. Make changes locally
2. Test with `npm run dev`
3. Commit changes: `git add . && git commit -m "your message"`
4. Push to GitHub: `git push`
5. Netlify automatically deploys your changes

## Next Steps

Your GroceryShop app is now set up with:
- ✅ Vite + React 19
- ✅ Material UI with custom theme
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Cloud Storage
- ✅ Cloud Functions (configured)
- ✅ GitHub version control
- ✅ Netlify continuous deployment

You can now start building your app! The basic structure is in place, and you can:
- Add authentication components
- Create your database collections in Firestore
- Build your grocery shop features
- Deploy automatically with every push

## Troubleshooting

### Build fails on Netlify
- Check that all environment variables are set correctly
- Check the build logs for specific errors
- Ensure `package.json` has all necessary dependencies

### Firebase errors
- Verify your Firebase config in `.env.local`
- Check Firebase console for service status
- Review security rules if you get permission errors

### Local development issues
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Clear browser cache
- Check console for errors

## Need Help?

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material UI Documentation](https://mui.com/)
- [Netlify Documentation](https://docs.netlify.com/)
