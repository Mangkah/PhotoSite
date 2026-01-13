
Upgraded Portfolio Gallery
=========================

How it works
------------
- This single-page site automatically reads image files in the repository's `/images` folder using the GitHub API.
- It classifies images into categories using filename heuristics. Rename files to include keywords for better categorization:
  - `portrait_*`, `people_*` => portraits
  - `landscape_*`, `scenery_*` => landscape
  - `ai_*`, `generated_*` => ai
  - `edit_*`, `before_*`, `after_*` => edits
- The UI includes filters, infinite scroll (loads BATCH_SIZE images per batch), smooth CSS transitions, and an animated lightbox.

Setup
-----
1. Edit `js/scripts.js` and set `GITHUB_USER` and `GITHUB_REPO` to your GitHub account and repo name.
2. Push this folder to your GitHub repository (repo must be public for the GitHub API to return images without auth).
3. Enable GitHub Pages in the repository settings (Branch: `main`, Folder: `/ (root)`) if you want to publish the site.
4. Place your image files into the `/images` folder in that repo (or upload via GitHub UI).

Notes
-----
- If your repo is private you will need to provide an access token and modify the fetch to include an Authorization header.
- For large galleries, consider hosting images on a CDN and referencing them instead.
