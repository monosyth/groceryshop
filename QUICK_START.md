# Quick Start Checklist

Follow these steps in order to get your GroceryShop app online:

## ☐ Step 1: GitHub (5 minutes)

1. Go to https://github.com/new
2. Name: `groceryshop`
3. Don't initialize with anything
4. Create repository
5. Run these commands in your terminal:

```bash
cd groceryshop
git remote add origin https://github.com/YOUR-USERNAME/groceryshop.git
git branch -M main
git push -u origin main
```

## ☐ Step 2: Firebase (10 minutes)

1. Go to https://console.firebase.google.com/
2. Create new project: `groceryshop`
3. Add web app (click `</>` icon)
4. Copy the config values
5. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database (Test mode)
   - Storage (Test mode)
6. Create `.env.local` file and paste your Firebase config

## ☐ Step 3: Test Locally (2 minutes)

```bash
cd groceryshop
npm install
npm run dev
```

Visit http://localhost:5173 - you should see your app!

## ☐ Step 4: Netlify (5 minutes)

1. Go to https://app.netlify.com/
2. "Add new site" > "Import from GitHub"
3. Select `groceryshop` repository
4. Deploy! (auto-detected from netlify.toml)
5. Add environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add all 6 Firebase variables from your `.env.local`
6. Trigger a new deploy

## ✅ Done!

Your app is now:
- Version controlled on GitHub
- Connected to Firebase backend
- Auto-deploying to Netlify

Every time you push to GitHub, Netlify will automatically deploy your changes!

## Next Steps

Start building your grocery shop features:
- Add authentication UI
- Create product listings
- Build shopping cart functionality
- Set up order management

See SETUP_GUIDE.md for detailed instructions and troubleshooting.
