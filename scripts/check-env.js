#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Required environment variables
const REQUIRED_VARS = {
  frontend: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ADMIN_EMAILS',
  ],
  backend: [
    'GEMINI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  optional: [
    'VITE_SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_APP_VERSION',
  ],
};

function printHeader(text) {
  console.log(`\n${colors.blue}${text}${colors.reset}`);
  console.log('='.repeat(text.length));
}

function printSuccess(text) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), 'env.d.tsx');
  const dotEnvPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    console.log(`Using env.d.tsx configuration`);
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = {};

    // Extract variable assignments
    const regex = /export const (\w+) = ['"](.+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      vars[match[1]] = match[2];
    }

    return vars;
  } else if (fs.existsSync(dotEnvPath)) {
    console.log(`Using .env configuration`);
    const content = fs.readFileSync(dotEnvPath, 'utf8');
    const vars = {};

    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        vars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });

    return vars;
  }

  return null;
}

function checkVariable(name, value) {
  if (!value || value === 'your_value_here' || value.includes('your-')) {
    return 'missing';
  }

  // Additional validation
  if (name.includes('URL') && !value.startsWith('http')) {
    return 'invalid';
  }

  if (name.includes('EMAIL') && !value.includes('@')) {
    return 'invalid';
  }

  return 'ok';
}

function main() {
  printHeader('🔍 VETORRE Environment Check');

  const envVars = loadEnvFile();

  if (!envVars) {
    printError('No environment configuration found!');
    console.log('\nPlease create one of:');
    console.log('  - env.d.tsx (copy from env.example.tsx)');
    console.log('  - .env (copy from .env.example)');
    process.exit(1);
  }

  let hasErrors = false;
  let hasWarnings = false;

  // Check required frontend variables
  printHeader('\n📱 Frontend Variables (Required)');
  REQUIRED_VARS.frontend.forEach(varName => {
    const status = checkVariable(varName, envVars[varName]);

    if (status === 'ok') {
      printSuccess(`${varName}`);
    } else if (status === 'missing') {
      printError(`${varName} - NOT SET`);
      hasErrors = true;
    } else {
      printError(`${varName} - INVALID FORMAT`);
      hasErrors = true;
    }
  });

  // Check required backend variables
  printHeader('\n🔧 Backend Variables (Required)');
  REQUIRED_VARS.backend.forEach(varName => {
    const status = checkVariable(varName, envVars[varName]);

    if (status === 'ok') {
      printSuccess(`${varName}`);
    } else if (status === 'missing') {
      printError(`${varName} - NOT SET`);
      hasErrors = true;
    } else {
      printError(`${varName} - INVALID FORMAT`);
      hasErrors = true;
    }
  });

  // Check optional variables
  printHeader('\n🎨 Optional Variables (Recommended)');
  REQUIRED_VARS.optional.forEach(varName => {
    const status = checkVariable(varName, envVars[varName]);

    if (status === 'ok') {
      printSuccess(`${varName}`);
    } else {
      printWarning(`${varName} - Not configured`);
      hasWarnings = true;
    }
  });

  // Summary
  printHeader('\n📊 Summary');

  if (hasErrors) {
    printError('Configuration has errors - please fix before deploying');
    console.log('\nSee env.example.tsx for reference');
    process.exit(1);
  } else if (hasWarnings) {
    printWarning('Some optional features not configured');
    printSuccess('All required variables are set');
    console.log('\nYou can deploy, but consider configuring optional features');
  } else {
    printSuccess('All variables configured correctly!');
    console.log('\n🚀 Ready to deploy to production');
  }

  console.log('');
}

main();
