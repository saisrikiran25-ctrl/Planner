# GitHub Pages Deployment Guide for Planner App

This guide will walk you through the process of deploying your Academic Schedule Planner app to GitHub Pages.

## Overview

Your app is now configured to automatically deploy to GitHub Pages using GitHub Actions. The deployment will happen automatically whenever you push changes to the `main` branch.

## Deployment Setup Steps

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/saisrikiran25-ctrl/Planner
2. Click on **Settings** (in the top navigation bar)
3. In the left sidebar, scroll down and click on **Pages** (under "Code and automation")
4. Under **Source**, select **GitHub Actions** from the dropdown menu
5. Click **Save**

### Step 2: Merge This Pull Request

1. Review this pull request containing the GitHub Actions workflow
2. Click the **Merge pull request** button
3. Confirm the merge

### Step 3: Automatic Deployment

Once merged to the `main` branch:
1. GitHub Actions will automatically trigger the deployment workflow
2. You can monitor the deployment progress by:
   - Going to the **Actions** tab in your repository
   - Clicking on the running "Deploy to GitHub Pages" workflow
   - Watching the build and deploy steps complete

### Step 4: Access Your Deployed App

After successful deployment (usually takes 2-5 minutes), your app will be available at:

**🌐 https://saisrikiran25-ctrl.github.io/Planner/**

## How It Works

### GitHub Actions Workflow

The deployment uses a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **Triggers** on:
   - Every push to the `main` branch
   - Manual trigger via the Actions tab (workflow_dispatch)

2. **Build Process**:
   - Checks out the code
   - Sets up Node.js environment
   - Installs dependencies with `npm ci`
   - Builds the app with `npm run build`
   - Creates a production-ready build in the `dist` folder

3. **Deployment**:
   - Uploads the built files as a Pages artifact
   - Deploys to GitHub Pages

### Configuration Already in Place

Your repository already has the necessary configuration:

- ✅ **package.json**: 
  - `homepage` set to `https://saisrikiran25-ctrl.github.io/Planner`
  - `gh-pages` package installed
  - Build scripts configured

- ✅ **vite.config.ts**: 
  - Base path set to `/Planner/` (matches your repo name)

## Manual Deployment (Alternative Method)

If you prefer to deploy manually from your local machine instead of using GitHub Actions:

```bash
# Install dependencies (if not already done)
npm install

# Build and deploy to GitHub Pages
npm run deploy
```

This will build the app and push it to the `gh-pages` branch, which will then be served by GitHub Pages.

**Note**: If using manual deployment, you still need to enable GitHub Pages in Settings, but select the `gh-pages` branch as the source instead of GitHub Actions.

## Updating Your App

To update your deployed app:

1. Make your changes to the code
2. Commit and push to the `main` branch
3. GitHub Actions will automatically rebuild and redeploy

## Troubleshooting

### Deployment Failed

- Check the **Actions** tab to see the error logs
- Common issues:
  - Build errors: Fix any TypeScript or build errors in your code
  - Node version mismatch: Workflow uses Node 20
  - Missing dependencies: Ensure all dependencies are in package.json

### App Not Loading

- Ensure the base path in `vite.config.ts` matches your repository name
- Check browser console for errors
- Verify GitHub Pages is enabled in Settings and set to the correct source

### 404 Error

- Make sure the `base` in `vite.config.ts` is set to `/Planner/`
- Verify your repository name hasn't changed

## API Keys and Environment Variables

**Important**: Your app uses the Gemini API. For security:

- ✅ Environment variables are handled during build time
- ✅ Users will need to provide their own API key when using the app
- ⚠️ Never commit API keys to the repository

The app is designed to prompt users for their API key, keeping it secure and client-side only.

## Next Steps

1. Follow the setup steps above to enable GitHub Pages
2. Merge this pull request
3. Wait for the deployment to complete
4. Visit your live app at: https://saisrikiran25-ctrl.github.io/Planner/
5. Share the link with others!

---

**Need Help?** 
- Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
- Review the [GitHub Actions workflow runs](https://github.com/saisrikiran25-ctrl/Planner/actions)
