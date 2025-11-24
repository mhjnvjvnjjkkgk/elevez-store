// Builder.io Webhook Handler
// Automatically syncs Builder.io changes to GitHub and triggers Vercel deployment

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const app = express();
const PORT = 3003;

app.use(express.json());

// Webhook endpoint for Builder.io
app.post('/builder-webhook', async (req, res) => {
  try {
    console.log('🎨 Builder.io webhook received!');
    console.log('Event:', req.body.type);
    
    const { type, data } = req.body;
    
    // Only process publish events
    if (type !== 'publish') {
      console.log('ℹ️ Ignoring non-publish event');
      return res.json({ success: true, message: 'Event ignored' });
    }
    
    console.log('📝 Content published:', data?.name || 'Unknown');
    
    // Step 1: Fetch latest content from Builder.io
    console.log('📥 Fetching content from Builder.io...');
    const content = await fetchBuilderContent();
    
    // Step 2: Save to local file
    console.log('💾 Saving content locally...');
    await saveBuilderContent(content);
    
    // Step 3: Commit to GitHub
    console.log('📦 Committing to GitHub...');
    await commitToGitHub();
    
    // Step 4: Push to GitHub (triggers Vercel auto-deploy)
    console.log('🚀 Pushing to GitHub...');
    await pushToGitHub();
    
    console.log('✅ Deployment pipeline triggered!');
    console.log('🌐 Your changes will be live in 1-2 minutes');
    
    res.json({
      success: true,
      message: 'Content synced and deployed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fetch content from Builder.io API
async function fetchBuilderContent() {
  const apiKey = '273eceb4203548428b50f961521eccd0';
  const response = await fetch(
    `https://cdn.builder.io/api/v3/content/page?apiKey=${apiKey}&limit=100`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Builder.io content');
  }
  
  const data = await response.json();
  return data.results || [];
}

// Save Builder.io content to local file
async function saveBuilderContent(content) {
  const filePath = path.join(process.cwd(), 'builder-content.json');
  await fs.writeFile(
    filePath,
    JSON.stringify(content, null, 2),
    'utf8'
  );
  console.log(`✅ Saved ${content.length} pages to builder-content.json`);
}

// Commit changes to Git
async function commitToGitHub() {
  try {
    // Add all changes
    await execAsync('git add .');
    
    // Commit with timestamp
    const timestamp = new Date().toLocaleString();
    const message = `🎨 Builder.io content update - ${timestamp}`;
    await execAsync(`git commit -m "${message}"`);
    
    console.log('✅ Changes committed');
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('ℹ️ No changes to commit');
    } else {
      throw error;
    }
  }
}

// Push to GitHub (triggers Vercel deployment)
async function pushToGitHub() {
  try {
    // Try main branch first
    await execAsync('git push origin main');
    console.log('✅ Pushed to main branch');
  } catch (error) {
    // Try master branch if main fails
    try {
      await execAsync('git push origin master');
      console.log('✅ Pushed to master branch');
    } catch (error2) {
      throw new Error('Failed to push to GitHub: ' + error2.message);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Builder.io Webhook Handler',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎨 Builder.io Webhook Handler Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Webhook URL: http://localhost:${PORT}/builder-webhook`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Ready to receive Builder.io webhooks');
  console.log('📝 Workflow: Builder.io → Webhook → GitHub → Vercel\n');
});

export default app;
