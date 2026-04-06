#!/bin/sh
set -e

echo "⏳ Applying database schema..."
npx prisma db push --skip-generate

echo "🌱 Running database seed..."
node dist/prisma/seed.js

echo "🚀 Starting application..."
exec node dist/src/main
