@echo off
echo 🚀 Starting Vercel deployment process...

REM Check if Git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add all files to Git
echo 📝 Adding all files to Git...
git add .
echo ✅ Files added to staging

REM Check if there are changes to commit
git diff-index --quiet HEAD -- 2>nul
if %errorlevel% neq 0 (
    echo 💾 Creating commit...
    git commit -m "Deploy to Vercel: H-S Management CRM"
    echo ✅ Commit created
) else (
    echo ✅ No changes to commit
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Remote origin already exists
) else (
    echo ⚠️  No remote origin found
    echo Please add your GitHub repository as remote:
    echo git remote add origin https://github.com/YOUR_USERNAME/h-s-management-crm.git
)

echo.
echo 🎯 Next Steps:
echo 1. Create a GitHub repository at: https://github.com/new
echo 2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/h-s-management-crm.git
echo 3. Push to GitHub: git push -u origin main
echo 4. Deploy to Vercel: https://vercel.com/new
echo.
echo 📖 See VERCEL_DEPLOYMENT_STEPS.md for detailed instructions
pause 