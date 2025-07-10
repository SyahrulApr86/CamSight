#!/bin/bash
# Setup script untuk Git hooks menggunakan Husky

echo "Setting up Git hooks with Husky..."

# Set git hooks directory
git config core.hooksPath .husky

# Make pre-commit script executable (untuk Unix/Linux)
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
    echo "✅ Pre-commit hook is now executable"
fi

echo "✅ Git hooks setup completed!"
echo "📝 Note: Pre-commit hooks will run TypeScript check and ESLint on frontend code"
echo "🔧 For development only - not included in Docker builds" 