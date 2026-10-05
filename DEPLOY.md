# Deploying the AERO2687 Study Web to GitHub Pages

The app is a static site: GitHub builds it and serves it free at
`https://<your-username>.github.io/<repo-name>/`. An Actions workflow in this
repo (`.github/workflows/deploy.yml`) runs tests + build and publishes on
**every push to `main`** — you never build by hand.

---

## One-time setup (~10 minutes)

**1. Identify yourself to git** (one-time per machine — replace with your details):

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
```

*(Use the email on your GitHub account, or GitHub's noreply email from
Settings → Emails, to keep your home address private.)*

**2. Create the repo on github.com:**

- Sign in → click **+** (top right) → **New repository**
- Repository name: `aero2687-study-web` (or anything)
- Visibility: **Public** (free plan) — or **Private** if you have GitHub Pro
  (free via the GitHub Student Developer Pack)
- ⚠ Do **not** tick "Add a README" or license — leave it empty
- Click **Create repository**

**3. Connect this folder and push the first version** (from the project root):

```bash
git init
git add .
git commit -m "Initial version: study web with AI tutor"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

The first `git push` opens a browser window — sign in to GitHub and
authorize **Git Credential Manager**. That's the only login you'll ever do
in the terminal.

**4. Turn on GitHub Pages:**

- Repo page → **Settings** → left sidebar **Pages**
- Under "Build and deployment", set **Source: GitHub Actions**
- (No other settings needed — the workflow supplies the build)

**5. Watch it go live:**

- Repo → **Actions** tab → the "Deploy to GitHub Pages" run should be green ✓
- Your site: `https://<your-username>.github.io/<repo-name>/`

---

## Everyday updates (one command)

Edit the app, then:

```bash
git add -A && git commit -m "What you changed" && git push
```

GitHub rebuilds and republishes automatically in ~1–2 minutes. Friends just
refresh the link — their keys, files, chats and progress are untouched by
updates (all data lives in their browser, keyed to the site, not the version).

## If an update ever breaks something (rollback)

```bash
git log --oneline          # find the last good commit
git revert <commit-id>     # creates an "undo" commit
git push                   # site redeploys the previous behavior
```

Or redeploy any older version: **Actions → select an old green run → Re-run
all jobs**.

## Backups

- **Code:** the git history *is* the backup — every version is on GitHub.
- **Your data (progress/files/chats/keys):** ⚙ AI settings → **Download
  backup** → keep the JSON somewhere safe (it contains your API key — treat
  it like a password). Restore on any browser via **Restore from file**.

## Public vs private — the short version

| | Free GitHub | GitHub Pro (free for students) |
|---|---|---|
| Private **repo** (hides source) | ✗ Pages needs public | ✓ |
| Private **link** (only friends open the site) | ✗ — Pages sites are always public by URL | ✗ same |

The app itself sends nothing to any server; a public link only exposes the
study content. Truly private links need Cloudflare Access / Netlify password
(pro) instead.

## Alternative: manual deploy

The old route still works if Actions is off: `npm run deploy` builds locally
and pushes `dist/` to a `gh-pages` branch (set Pages source to the
`gh-pages` branch). The Actions workflow is the better default.
