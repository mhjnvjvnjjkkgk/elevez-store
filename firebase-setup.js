#!/usr/bin/env node

// Firebase Setup Helper Script
console.log('=== Elevez Firebase Setup Helper ===\n');

console.log('Step 1: Install Firebase CLI (if not already done)');
console.log('Run in your terminal:');
console.log('npm install -g firebase-tools\n');

console.log('Step 2: Login to Firebase');
console.log('Run in your terminal:');
console.log('firebase login\n');

console.log('Step 3: Initialize Firebase in your project');
console.log('Navigate to your project directory and run:');
console.log('cd "d:\\wbeiste\\elevez (1)"');
console.log('firebase init\n');

console.log('During initialization, select these features:');
console.log('- Firestore Database');
console.log('- Hosting\n');

console.log('Step 4: Configure for your Elevez app');
console.log('For Hosting, when prompted:');
console.log('- Public directory: dist');
console.log('- Single-page app: Yes');
console.log('- GitHub auto deploy: No\n');

console.log('Step 5: Deploy your app');
console.log('Run these commands:');
console.log('npm run build');
console.log('firebase deploy\n');

console.log('=== Setup Complete ===');