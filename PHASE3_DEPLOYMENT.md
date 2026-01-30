# Phase 3: Gemini AI Integration - Deployment Guide

This guide will walk you through deploying the Cloud Function that automatically analyzes receipts using Google Gemini AI.

## Prerequisites

- Node.js 18 or higher
- Firebase CLI installed globally
- Google Cloud account (for Gemini API)
- Firebase Blaze plan (pay-as-you-go, required for Cloud Functions)

---

## Step 1: Upgrade to Firebase Blaze Plan

Cloud Functions require the Blaze (pay-as-you-go) plan.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **groceryshop-b3e6e** project
3. Click the gear icon (⚙️) → **Usage and billing**
4. Click **Modify plan**
5. Select **Blaze** plan
6. Add a billing account (credit card required)
7. **Don't worry**: Firebase has a generous free tier. You won't be charged unless you exceed:
   - 2 million function invocations/month
   - 400,000 GB-seconds compute time/month
   - For typical usage with a few receipts per day, you'll stay within free tier

---

## Step 2: Install Firebase CLI

If you haven't already:

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

---

## Step 3: Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate.

---

## Step 4: Initialize Firebase in Your Project

Navigate to your project:

```bash
cd groceryshop
```

Initialize Firebase (if not already done):

```bash
firebase init
```

When prompted:
- **Which Firebase features?** Select:
  - ✅ Functions
  - ✅ Hosting (if not already)
- **Use an existing project**: Select **groceryshop-b3e6e**
- **Language**: JavaScript
- **ESLint**: No (we already have it)
- **Install dependencies**: Yes
- **Public directory**: dist (should already be set)
- **Single-page app**: Yes
- **GitHub deploys**: No

**Important**: The init process will create a `functions` folder. We already created one with our code, so you may see a conflict. Choose to **keep the existing files**.

---

## Step 5: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"** or **"Create API Key"**
3. Select **"Create API key in new project"** (or use existing project)
4. **Copy the API key** - you'll need it in the next step
5. Keep this key secret!

**Note**: Gemini API has a generous free tier:
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day
- Perfect for receipt analysis!

---

## Step 6: Add Gemini API Key as Firebase Secret

Firebase uses Secret Manager to securely store API keys.

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

When prompted:
- Paste your Gemini API key
- Press Enter

Verify it was set:

```bash
firebase functions:secrets:access GEMINI_API_KEY
```

---

## Step 7: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

---

## Step 8: Deploy the Cloud Function

Deploy only the functions:

```bash
firebase deploy --only functions
```

This will:
- Upload your Cloud Function code
- Set up the Firestore trigger
- Configure the secret (GEMINI_API_KEY)
- Make the function live

**Deployment takes 2-5 minutes**. You'll see output like:

```
✔  functions[analyzeReceipt(us-central1)] Successful create operation.
Function URL: https://us-central1-groceryshop-b3e6e.cloudfunctions.net/analyzeReceipt
```

---

## Step 9: Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **groceryshop-b3e6e**
3. Go to **Functions** in the left sidebar
4. You should see **analyzeReceipt** listed
5. Status should be **"Healthy"**

---

## Step 10: Test the Function

1. Go to your live app: https://grozeryshop.netlify.app/
2. Upload a receipt
3. The function should automatically trigger!
4. Watch the logs:

```bash
firebase functions:log
```

Or view logs in Firebase Console:
- Go to **Functions** → **analyzeReceipt** → **Logs** tab

You should see:
```
Analyzing receipt: [receipt-id]
Gemini response: {...}
Receipt [receipt-id] analyzed successfully
```

5. Check Firestore:
   - Go to **Firestore Database** → **receipts** collection
   - Open your uploaded receipt document
   - You should see:
     - `metadata.analysisStatus`: "completed"
     - `items`: Array of extracted items
     - `storeInfo`: Store name, date, location
     - `summary`: Subtotal, tax, total

---

## Troubleshooting

### Error: "Billing account not configured"

Your Firebase project needs to be on the Blaze plan. See Step 1.

### Error: "Secret GEMINI_API_KEY not found"

Run:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

### Function not triggering

Check that the Firestore trigger path matches:
- Go to Firebase Console → Functions
- Click **analyzeReceipt**
- Verify "Event type" is **"document.create"**
- Verify "Document path" is **"receipts/{receiptId}"**

### Gemini API errors

Check your API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify the API key is active
3. Check you haven't exceeded rate limits

### "Permission denied" errors

Update Firestore rules to allow Cloud Functions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /receipts/{receiptId} {
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null
                                   && resource.data.userId == request.auth.uid;
      // Allow Cloud Functions to update receipts
      allow update: if request.auth == null; // Cloud Functions run without auth
    }
  }
}
```

---

## Cost Estimation

**Gemini API (Free Tier)**:
- 1,500 requests/day free
- Each receipt = 1 request
- You can analyze 1,500 receipts/day for free

**Cloud Functions (Free Tier)**:
- 2 million invocations/month free
- 400,000 GB-seconds/month free
- Typical usage: ~10-50 receipts/day = well within free tier

**Realistic costs**: $0/month for typical personal use!

---

## What Happens After Upload

1. User uploads receipt → Image goes to Storage, document created in Firestore
2. **Firestore trigger fires** → `analyzeReceipt` function runs
3. Function downloads image from Storage
4. Function sends image to Gemini API with prompt
5. Gemini extracts: store name, date, items, prices, total
6. Function updates receipt document with extracted data
7. User sees parsed data in Dashboard (Phase 4)

---

## Next Steps

- **Phase 4**: Update Dashboard to display receipts with parsed data
- **Phase 5**: Add search and filtering
- **Phase 6**: Add analytics and charts

---

## Useful Commands

```bash
# View function logs
firebase functions:log

# Deploy only functions
firebase deploy --only functions

# Delete a function
firebase functions:delete analyzeReceipt

# View secrets
firebase functions:secrets:access GEMINI_API_KEY

# Update secret
firebase functions:secrets:set GEMINI_API_KEY
```

---

Your AI-powered receipt analysis is now live! 🤖✨
