#!/usr/bin/env node

// Firebase Configuration Verification Script
console.log('=== Elevez Firebase Configuration Verification ===\n');

// Check if .env file exists
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('.env');
console.log('1. Checking for .env file...');
if (existsSync(envPath)) {
  console.log('   ✓ .env file found');
} else {
  console.log('   ✗ .env file not found');
  console.log('   Please create a .env file with your Firebase configuration');
}

// Check if firebaseConfig.ts exists
const configPath = resolve('firebaseConfig.ts');
console.log('\n2. Checking for Firebase configuration file...');
if (existsSync(configPath)) {
  console.log('   ✓ firebaseConfig.ts found');
} else {
  console.log('   ✗ firebaseConfig.ts not found');
}

// Check if Firebase is in package.json
import { readFileSync } from 'fs';

console.log('\n3. Checking package.json for Firebase dependency...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies.firebase) {
    console.log(`   ✓ Firebase dependency found: ${packageJson.dependencies.firebase}`);
  } else {
    console.log('   ✗ Firebase dependency not found in package.json');
  }
} catch (error) {
  console.log('   ✗ Could not read package.json');
}

// Check if node_modules/firebase exists
const nodeModulesPath = resolve('node_modules/firebase');
console.log('\n4. Checking for Firebase in node_modules...');
if (existsSync(nodeModulesPath)) {
  console.log('   ✓ Firebase installed in node_modules');
} else {
  console.log('   ✗ Firebase not found in node_modules');
  console.log('   Run "npm install" to install dependencies');
}

console.log('\n=== Verification Complete ===');