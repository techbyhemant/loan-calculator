# GitHub Actions Setup for Autonomous Blog Engine

## Required GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### GROQ_API_KEY
Your Groq API key from console.groq.com
Used for: Topic discovery (AI) + Blog post generation

### REPLICATE_API_TOKEN
Your Replicate API token from replicate.com/account/api-tokens
Used for: Featured image generation (Flux Schnell)

## How the Schedule Works

The workflow runs every Monday, Wednesday, and Friday at 1:00 AM UTC (6:30 AM IST).

The scheduler.ts script handles the phase logic:
- Posts 1-36: Sprint phase (3x/week, Mon/Wed/Fri)
- Posts 37+: Maintenance phase (1x/week, only processes on Mondays)

So the GitHub Action runs 3x/week throughout, but after post 36 the
scheduler detects it's maintenance phase and skips Wed/Fri automatically.

## Manual Trigger

To generate a post immediately (outside the schedule):
1. Go to GitHub repo → Actions → LastEMI Autonomous Blog Engine
2. Click "Run workflow"
3. Click "Run workflow" again (green button)

## Monitoring

The system writes to these files on every run:
- data/blog-queue.json — upcoming posts to be generated
- data/published-topics.json — all published keywords
- data/publish-log.json — full generation history with quality scores

## What Happens After Generation

The GitHub Action:
1. Runs the scheduler
2. If a post was generated: commits content/blog/[slug].mdx and public/images/blog/[slug].webp
3. Pushes to main branch
4. Vercel auto-deploys (since it watches main branch)

So the full flow is:
GitHub Action generates post → auto-commits → Vercel deploys → live in ~2 minutes

No manual steps required. You only need to:
- Review published posts periodically (weekly)
- Submit new URLs to Google Search Console (or set up auto-submission)
