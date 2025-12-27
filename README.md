# Zoho Social Automation

Browser automation to automatically post RSS feed items from CION BPO blog to Zoho Social.

## How It Works

1. Receives webhook trigger from Make.com when new blog post is published
2. Logs into Zoho Social using Puppeteer
3. Navigates to RSS feed page
4. Clicks the topmost (most recent) blog post
5. Clicks "Create new post" icon
6. Clicks "Post Now" to publish to all connected platforms

## Environment Variables

- `ZOHO_EMAIL` - Zoho Social login email
- `ZOHO_PASSWORD` - Zoho Social login password
- `PORT` - Server port (default: 3000)

## Endpoints

- `POST /post-to-zoho` - Trigger posting automation
- `GET /health` - Health check

## Deployment

Deployed on Render.com with automatic builds from GitHub.
