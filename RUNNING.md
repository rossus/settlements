# Running Settlements

## One-Click Start (Easiest!)

**Windows:**
```
Double-click START.bat
```

**Linux/Mac:**
```bash
./START.sh
```

The script will:
- Ask if you want to use port 8080 or a custom port
- Start the web server automatically
- Open the game in your browser

**Requirements:** Node.js must be installed ([Download here](https://nodejs.org/))

---

## Manual Start (Alternative)

Settlements uses JSON for terrain data, which requires a web server to run properly.

### Option 1: Simple HTTP Server (Easiest)

```bash
# If you have Node.js installed:
npx http-server -p 8080

# Or with Python 3:
python -m http.server 8080

# Or with Python 2:
python -m SimpleHTTPServer 8080
```

Then open: **http://localhost:8080**

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 3: Other Web Servers

Any web server will work:
- XAMPP
- WAMP
- MAMP
- nginx

---

## Why Do I Need a Web Server?

Settlements loads terrain data from JSON files using the `fetch()` API. Modern browsers block fetch requests to local files (file:// URLs) for security reasons. A local web server serves files over HTTP, allowing fetch to work properly.

---

## First-Time Setup

### Check if Node.js is installed:

```bash
node --version
```

### If not installed:

Download from: https://nodejs.org/

No installation required for `npx` - it comes with Node.js!

---

## Development Workflow

```bash
# Start server
npx http-server -p 8080

# Open in browser
# http://localhost:8080

# Make changes to terrain data
# Edit src/data/terrainData.json

# Refresh browser to see changes
# No server restart needed!
```

---

## Troubleshooting

### "Failed to load terrain data"

**Cause:** Not running from a web server

**Solution:** Use one of the server options above

### "Port 8080 already in use"

**Solution:** Use a different port:
```bash
npx http-server -p 3000
```

### Changes not appearing

**Solution:** Hard refresh the browser:
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

---

## Testing Without a Browser

Test the terrain system from command line:

```bash
node test-json-loading.js
```

This validates the JSON structure without needing a browser.

---

## Production Deployment

For deploying Settlements to a web host:

1. Upload all files to your web server
2. Ensure `src/data/terrainData.json` is accessible
3. No build step required!

Works on:
- GitHub Pages
- Netlify
- Vercel
- Any static file host

---

## Questions?

See the main [README.md](README.md) for more information.
