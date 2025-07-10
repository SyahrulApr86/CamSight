# Setup script untuk Git hooks menggunakan Husky (Windows PowerShell)

Write-Host "Setting up Git hooks with Husky..." -ForegroundColor Green

# Set git hooks directory
git config core.hooksPath .husky

Write-Host "✅ Git hooks setup completed!" -ForegroundColor Green
Write-Host "📝 Note: Pre-commit hooks will run TypeScript check and ESLint on frontend code" -ForegroundColor Yellow
Write-Host "🔧 For development only - not included in Docker builds" -ForegroundColor Blue

# Test if pre-commit hook exists
if (Test-Path ".husky/pre-commit") {
    Write-Host "✅ Pre-commit hook file found" -ForegroundColor Green
} else {
    Write-Host "❌ Pre-commit hook file not found" -ForegroundColor Red
} 