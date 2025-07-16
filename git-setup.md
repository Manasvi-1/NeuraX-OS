# Git Setup Instructions

## Current Issue
The Git repository has lock files preventing operations. Here's how to fix it:

## Solution - Run these commands in Replit Shell:

### Step 1: Clean up lock files
```bash
rm -f .git/config.lock
rm -f .git/index.lock
```

### Step 2: Check Git status
```bash
git status
```

### Step 3: Check if remote exists
```bash
git remote -v
```

### Step 4: Remove existing remote (if any)
```bash
git remote remove origin
```

### Step 5: Add the correct remote
```bash
git remote add origin https://github.com/Manasvi-1/ai-os.git
```

### Step 6: Verify remote is added
```bash
git remote -v
```

### Step 7: Push to GitHub
```bash
git push -u origin main
```

## If you get authentication errors:

### Option A: Use Personal Access Token
```bash
git remote set-url origin https://Manasvi-1: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@github.com/Manasvi-1/ai-os.git
git push -u origin main
```

### Option B: Configure Git credentials
```bash
git config --global user.name "Manasvi Gowda P"
git config --global user.email "your-email@example.com"
```

## Alternative: Force push (if needed)
```bash
git push -f origin main
```

## Check if push was successful:
Visit: https://github.com/Manasvi-1/ai-os