# 🚀 VETORRE - Deployment Guide to Vercel

## ⚠️ IMPORTANT: Production vs Development

**Your current deployment is showing readable source code because it's in DEVELOPMENT mode!**

This guide will help you deploy the PRODUCTION build with minified/obfuscated code.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All commits are pushed to GitHub
- ✅ Terser is installed (`npm install -D terser`)
- ✅ Build works locally (`npm run build`)
- ✅ Environment variables are ready for Vercel

---

## 🔧 Step 1: Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Select your VETORRE project
3. Go to **Settings** → **General**

### Build & Output Settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**⚠️ CRITICAL:** Make sure it says `dist` not `src` or `.`

---

## 🔐 Step 2: Environment Variables

Go to **Settings** → **Environment Variables** and add:

### Required Variables:

```bash
# ⚠️ CRITICAL - Gemini API Key (for AI features)
# Get from: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSy...your-actual-key-here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Emails (comma-separated)
VITE_ADMIN_EMAILS=your-real-email@gmail.com,admin@example.com

# Google AdSense
VITE_ADSENSE_SLOT=5652456930
VITE_ADSENSE_SLOT_RSPV=2400574262
VITE_ADSENSE_SLOT_MCRSPV=5652456930

# Sentry (optional - can leave empty)
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

**⚠️ IMPORTANT NOTES:**

1. **GEMINI_API_KEY** is required for:
   - Generating slides
   - Creating tutorials
   - Generating courses
   - Creating images
   - Creating videos (Veo)

2. **Without GEMINI_API_KEY**, you'll get `500 Internal Server Error` when using AI features

3. Get your Gemini API key from: https://aistudio.google.com/apikey

**⚠️ NEVER commit these values to Git!**

---

## 🚢 Step 3: Deploy to Production

### Option A: Deploy from Vercel Dashboard

1. Go to your Vercel project
2. Click **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Make sure it says: `Building... npm run build`
5. Wait for deployment to complete (usually 1-2 minutes)

### Option B: Deploy from Git

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push

# Vercel will auto-deploy from main branch
```

### Option C: Deploy from CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## ✅ Step 4: Verify Security After Deployment

After deployment completes:

### 1. Open Your Production Site

```
https://your-app-name.vercel.app
```

### 2. Open Browser DevTools

- Press `F12` or right-click → Inspect
- Go to **Sources** tab

### 3. Check Code is Minified

Look at the JavaScript files. They should look like:

```javascript
✅ GOOD (Production - Minified):
function a(){const b=c(d);return e(f,{g:h})}

❌ BAD (Development - Readable):
function handleAdminLogin() {
  const user = getCurrentUser();
  return verifyAdminRole(user);
}
```

### 4. Verify No Source Maps

- In Sources tab, you should NOT see:
  - ❌ `components/` folder
  - ❌ `services/` folder
  - ❌ `*.tsx` or `*.ts` files
  - ❌ `node_modules/` folder

- You SHOULD only see:
  - ✅ `index.html`
  - ✅ `assets/index-XXXX.js` (minified)
  - ✅ `assets/index-XXXX.css`

---

## 🔍 Troubleshooting

### Problem: Code is still readable after deployment

**Cause:** Vercel is building in development mode or source maps are enabled.

**Solution:**

1. Check `vercel.json` has:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

2. Check `vite.config.ts` has:
   ```typescript
   build: {
     sourcemap: false,
     minify: 'terser'
   }
   ```

3. Rebuild and redeploy:
   ```bash
   npm run build
   git add .
   git commit -m "Fix production build"
   git push
   ```

### Problem: Build fails on Vercel

**Error:** `terser not found`

**Solution:** Make sure `package.json` has:
```json
{
  "devDependencies": {
    "terser": "^5.36.0"
  }
}
```

Then commit and push:
```bash
git add package.json package-lock.json
git commit -m "Add terser dependency"
git push
```

### Problem: Environment variables not working

**Cause:** Variables not set in Vercel dashboard.

**Solution:**

1. Go to Vercel → Settings → Environment Variables
2. Add ALL required variables from Step 2
3. Redeploy the application

---

### Problem: 500 Error when using AI features (Slides, Tutorial, Course)

**Error in Console:**
```
POST /api/gemini 500 (Internal Server Error)
```

**Cause:** `GEMINI_API_KEY` environment variable is missing or invalid.

**Solution:**

1. **Get your Gemini API Key:**
   - Go to https://aistudio.google.com/apikey
   - Click "Create API Key"
   - Copy the key (starts with `AIzaSy...`)

2. **Add to Vercel:**
   - Go to Vercel Dashboard
   - Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** `AIzaSy...your-key-here`
     - **Environment:** Production, Preview, Development (select all)

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Wait for deployment to finish

4. **Test:**
   - Try generating slides/tutorial/course again
   - Should work now without 500 errors

**Additional Checks:**

- Verify the API key is valid (test in AI Studio)
- Check Gemini API quotas aren't exceeded
- Make sure key has correct permissions enabled

---

## 📊 Deployment Comparison

| Aspect | Development (Local) | Production (Vercel) |
|--------|---------------------|---------------------|
| Code | Readable TypeScript | Minified JavaScript |
| Source Maps | ✅ Enabled | ❌ Disabled |
| console.log | ✅ Active | ❌ Removed |
| Variable Names | `handleAdminLogin` | `a`, `b`, `c` |
| File Size | ~909 KB | ~883 KB |
| Security | ❌ Low | ✅ High |

---

## 🎯 Expected Results After Correct Deployment

1. ✅ App loads normally at your Vercel URL
2. ✅ All features work (login, tools, admin panel)
3. ✅ Code in browser is minified and unreadable
4. ✅ No TypeScript files visible
5. ✅ No console.log output in browser
6. ✅ Admin panel only accessible with correct email
7. ✅ Database protected by RLS policies

---

## 📝 Post-Deployment Security Checklist

After successful deployment:

- [ ] Verify code is minified in browser DevTools
- [ ] Test admin login works
- [ ] Test non-admin user cannot access admin features
- [ ] Check Supabase RLS policies are active
- [ ] Verify ads.txt is accessible: `https://your-app.vercel.app/ads.txt`
- [ ] Test newsletter subscription
- [ ] Test cookie consent banner
- [ ] Monitor Vercel logs for errors

---

## 🆘 Need Help?

If deployment fails or code is still readable:

1. Check Vercel build logs for errors
2. Run `npm run build` locally to test
3. Verify all environment variables are set
4. Check that Git has latest code: `git status`
5. Review [SECURITY.md](./SECURITY.md) for detailed security guide

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push

# Vercel will automatically:
# 1. Pull latest code from GitHub
# 2. Run npm install
# 3. Run npm run build
# 4. Deploy dist/ folder
# 5. Update live site
```

**⏱️ Deployment Time:** Usually 1-3 minutes

**📧 Notifications:** Vercel sends email when deployment succeeds/fails

---

**Last Updated:** December 26, 2025
**Version:** 1.0
