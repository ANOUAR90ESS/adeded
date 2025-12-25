#!/bin/bash

# Script to test Stripe webhook locally
# Requires Stripe CLI: https://stripe.com/docs/stripe-cli

set -e

echo "🔗 Stripe Webhook Tester"
echo "========================"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not installed"
    echo ""
    echo "Install instructions:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Windows: scoop install stripe"
    echo "  Linux: See https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✓ Stripe CLI installed"
echo ""

# Login to Stripe
echo "1️⃣  Logging in to Stripe..."
stripe login

echo ""
echo "2️⃣  Select test mode:"
echo "   1) Local development (http://localhost:3000)"
echo "   2) Custom URL"
echo ""
read -p "Select option (1-2): " option

case $option in
    1)
        URL="http://localhost:3000/api/webhook"
        ;;
    2)
        read -p "Enter webhook URL: " URL
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "3️⃣  Starting webhook listener..."
echo "   Forwarding to: $URL"
echo ""
echo "⚠️  IMPORTANT: Copy the webhook signing secret below"
echo "   and add it to your environment as STRIPE_WEBHOOK_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

stripe listen --forward-to "$URL"

echo ""
echo "Webhook listener stopped"
