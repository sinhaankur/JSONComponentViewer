# Deploying to Netlify

This project is a static site (HTML/JS/CSS only). You can deploy it to Netlify in a few clicks.

## Quick Deploy Steps

1. **Push all changes to GitHub**
   - Make sure your latest code is committed and pushed to the `main` branch.

2. **Sign in to Netlify**
   - Go to [Netlify](https://app.netlify.com/) and log in or create an account.

3. **Create a New Site**
   - Click "Add new site" → "Import an existing project".
   - Connect your GitHub account and select the `JSONComponentViewer` repository.

4. **Configure Build Settings**
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.`

5. **Deploy**
   - Click "Deploy site". Netlify will build and publish your site.
   - After deployment, you'll get a live URL. You can change the site name in settings.

## Optional: Custom Netlify Settings

If you want to add redirects or headers, create a `netlify.toml` file in the project root.

---

For more, see the [Netlify Docs](https://docs.netlify.com/).