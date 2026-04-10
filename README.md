# JSON Component Viewer

Interactive web app to load JSON/CSV data and inspect it through visual tree layouts.

## Live Site

After GitHub Pages deploy succeeds, the site will be available at:

`https://sinhaankur.github.io/JSONComponentViewer/`

## UX Updates Done

- Added two complementary visualization modes: hierarchical tree and horizontal tree view.
- Added rich node type affordances with icons and value coloring for object/array/string/number/boolean/null.
- Improved navigation and readability with expand/collapse behavior, nested indentation, and selection highlighting.
- Added zoom controls with reset for easier exploration of deep/large structures.
- Added detail-focused interactions: selected node path/value visibility and quick copy/export actions.
- Added data input flexibility: file upload plus sample payload loading for fast evaluation.
- Added light/dark theme support and polished visual tokens for better contrast and accessibility.
- Added progress and feedback-oriented UI elements for smoother data exploration flow.

## Deployment (GitHub Pages)

This repository uses a GitHub Actions workflow to build and deploy static output from Next.js.

- Workflow file: `.github/workflows/deploy-pages.yml`
- Next.js static export config: `next.config.mjs`

### Publish Steps

1. Push to `main`.
2. Open GitHub repository settings:
   - Settings -> Pages
   - Build and deployment source: **GitHub Actions**
3. Watch workflow run in Actions tab (`Deploy Next.js to GitHub Pages`).
4. Open the published site URL shown above.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```
