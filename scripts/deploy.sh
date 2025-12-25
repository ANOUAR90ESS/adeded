#!/bin/bash

# VETORRE Deployment Script
# This script helps deploy VETORRE to production safely

set -e  # Exit on error

echo "🚀 VETORRE Deployment Script"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if required tools are installed
echo "1️⃣  Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js installed"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm installed"

if ! command -v git &> /dev/null; then
    print_warning "Git not installed (optional)"
else
    print_success "Git installed"
fi

echo ""
echo "2️⃣  Checking environment variables..."

# Check if .env or env.d.tsx exists
if [ ! -f "env.d.tsx" ] && [ ! -f ".env" ]; then
    print_error "No environment configuration found"
    echo "   Please create env.d.tsx or .env from env.example.tsx"
    exit 1
fi
print_success "Environment configuration found"

echo ""
echo "3️⃣  Running security checks..."

# Run npm audit
echo "   Running npm audit..."
if npm audit --audit-level=moderate; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities detected"
    echo "   Run 'npm audit fix' to fix them"
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "4️⃣  Installing dependencies..."
npm ci
print_success "Dependencies installed"

echo ""
echo "5️⃣  Running type check..."
if npx tsc --noEmit; then
    print_success "Type check passed"
else
    print_warning "Type check failed"
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "6️⃣  Building application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

echo ""
echo "7️⃣  Deployment options:"
echo "   1) Deploy to Vercel (requires Vercel CLI)"
echo "   2) Preview build locally"
echo "   3) Exit"
echo ""
read -p "Select option (1-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."

        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not installed"
            echo "   Install with: npm install -g vercel"
            exit 1
        fi

        read -p "Deploy to production? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel --prod
        else
            vercel
        fi
        print_success "Deployment complete!"
        ;;
    2)
        echo ""
        echo "📦 Starting local preview..."
        npm run preview
        ;;
    3)
        echo ""
        print_success "Build artifacts ready in ./dist"
        echo "   You can deploy manually using your preferred method"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "============================"
echo "✨ Deployment process complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify deployment at your domain"
echo "   2. Test authentication flow"
echo "   3. Test payment flow with test cards"
echo "   4. Configure Stripe webhook"
echo "   5. Check Sentry for errors"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
