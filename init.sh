#!/bin/bash
set -e

echo "=== Space Game Dev Environment Init ==="

# --- Node / npm ---
echo "Checking Node..."
node --version || { echo "ERROR: Node not found. Install via nvm or nodejs.org"; exit 1; }
npm --version

# --- Bun ---
echo "Checking Bun..."
bun --version || { echo "ERROR: Bun not found. Install via: curl -fsSL https://bun.sh/install | bash"; exit 1; }

# --- Install dependencies ---
echo "Installing npm dependencies..."
npm install

# --- TypeScript check ---
echo "Running type check..."
npx tsc --noEmit && echo "✓ Type check passed" || { echo "ERROR: Type errors found. Fix before building."; exit 1; }

# --- Test suite ---
echo "Running tests..."
npm test && echo "✓ Tests passed" || { echo "ERROR: Tests failed."; exit 1; }

# --- Browser build smoke test ---
echo "Checking Vite build..."
npm run build && echo "✓ Browser build OK" || { echo "ERROR: Vite build failed."; exit 1; }

# --- Terminal entry point check ---
echo "Checking terminal entry point..."
bun --check terminal.ts && echo "✓ Terminal entry OK" || { echo "ERROR: terminal.ts has issues."; exit 1; }

echo ""
echo "=== Environment ready ==="
