#!/bin/bash

# ShipNovo Quality Gate Script
# Runs backend tests, frontend lint, and production build verification.

echo "🔍 Starting Quality Gate Checks..."

# 1. Backend Tests
echo "🐘 Running Backend RBAC Tests..."
cd backend && php artisan test --filter="PaymentRbacTest|AnalyticsRbacTest"
if [ $? -ne 0 ]; then
    echo "❌ Backend tests failed!"
    exit 1
fi

# 2. Frontend Lint
echo "💅 Running Frontend Lint..."
cd ../frontend && npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Frontend lint failed!"
    exit 1
fi

# 3. Frontend Build
echo "🏗️  Verifying Frontend Build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ All Quality Gates Passed! Ready for demo."
