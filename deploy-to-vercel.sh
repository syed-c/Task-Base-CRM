#!/bin/bash

# H - S Management CRM - Vercel Deployment Script
echo "🚀 Starting Vercel deployment process..."

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if files are staged
if git diff --cached --quiet; then
    echo "📝 Adding all files to Git..."
    git add .
    echo "✅ Files added to staging"
else
    echo "✅ Files already staged"
fi

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
else
    echo "💾 Creating commit..."
    git commit -m "Deploy to Vercel: H-S Management CRM"
    echo "✅ Commit created"
fi

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote origin already exists"
else
    echo "⚠️  No remote origin found"
    echo "Please add your GitHub repository as remote:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/h-s-management-crm.git"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/h-s-management-crm.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Deploy to Vercel: https://vercel.com/new"
echo ""
echo "📖 See VERCEL_DEPLOYMENT_STEPS.md for detailed instructions" 