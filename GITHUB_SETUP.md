# GitHub Setup Guide for API Secure

## 📋 Pre-Upload Checklist

✅ All files updated with "API Secure" branding
✅ `.gitignore` configured
✅ `LICENSE` file created
✅ `README.md` updated
✅ GitHub templates created (`.github/` folder)

## 🚀 Steps to Upload to GitHub

### 1. Initialize Git Repository

```bash
cd "C:\Users\shouryaman.langeh\Documents\API Secure project Latest - Oneclick\API secure"
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: API Secure - API Security Testing Platform"
```

### 4. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `api-secure` (or your preferred name)
3. Description: "API Secure - Modern API security testing platform with AI-powered analysis"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have them)
6. Click **Create repository**

### 5. Connect and Push

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/api-secure.git
git branch -M main
git push -u origin main
```

## 📝 Important Notes

### Environment Variables

**DO NOT** commit `.env` files! They are already in `.gitignore`.

Create a `.env.example` file for reference:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# n8n Configuration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/endpoint
```

### Netlify Deployment

If deploying to Netlify:
- Connect your GitHub repo
- Netlify will auto-detect `netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist`

## 🔒 Security Reminders

- ✅ `.env` files are in `.gitignore`
- ✅ `node_modules` are ignored
- ✅ `dist` folder is ignored (builds on Netlify)
- ⚠️ Review your code for any hardcoded secrets before pushing

## 📦 What's Included

- ✅ Source code (`src/`)
- ✅ Configuration files (`vite.config.ts`, `tailwind.config.ts`, etc.)
- ✅ `package.json` with all dependencies
- ✅ `README.md` with full documentation
- ✅ `LICENSE` (MIT)
- ✅ `.github/` templates for issues and PRs
- ✅ `netlify.toml` for deployment
- ✅ `.gitignore` properly configured

## 🎉 You're Ready!

Your project is now ready to be uploaded to GitHub. Follow the steps above to push your code!
