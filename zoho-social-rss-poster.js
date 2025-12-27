const puppeteer = require('puppeteer');

async function postRSSItemToZohoSocial() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Step 1: Login to Zoho Social
        console.log('Step 1: Logging in to Zoho Social...');
        await page.goto('https://social.zoho.com/login', { waitUntil: 'networkidle2' });
        
        await page.type('input[name="LOGIN_ID"]', process.env.ZOHO_EMAIL);
        await page.type('input[name="PASSWORD"]', process.env.ZOHO_PASSWORD);
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('✓ Logged in successfully');
        
        // Step 2: Navigate to RSS page
        console.log('Step 2: Navigating to RSS feed page...');
        await page.goto('https://social.zoho.com/social/cionbpo/1594769000000022017/Home.do#posts/rss', { waitUntil: 'networkidle2' });
        await page.waitForTimeout(3000);
        console.log('✓ RSS page loaded');
        
        // Step 3: Click the topmost (most recent) blog post
        console.log('Step 3: Clicking topmost RSS post...');
        
        // Try multiple selectors to find the first RSS item
        const firstPost = await page.$('.feed-item:first-child') || 
                         await page.$('.rss-item:first-child') ||
                         await page.$('[class*="feed"]:first-child') ||
                         await page.$('div[class*="post"]:first-child');
        
        if (!firstPost) {
            console.log('✗ No RSS feed items found');
            return { success: false, message: 'No RSS feed items found' };
        }
        
        await firstPost.click();
        await page.waitForTimeout(2000);
        console.log('✓ Clicked topmost post');
        
        // Step 4: Click "Create new post" icon then "Post Now"
        console.log('Step 4: Looking for Create new post icon...');
        
        // Try multiple selectors for the create post icon
        const createPostIcon = await page.$('[title="Create new post"]') ||
                              await page.$('.create-post-icon') ||
                              await page.$('button[aria-label*="Create"]') ||
                              await page.$('button:has-text("Create")') ||
                              await page.$('[class*="create-post"]');
        
        if (!createPostIcon) {
            console.log('✗ Create post icon not found');
            return { success: false, message: 'Create post icon not found' };
        }
        
        await createPostIcon.click();
        await page.waitForTimeout(2000);
        console.log('✓ Clicked create post icon');
        
        // Click "Post Now" button
        console.log('Looking for Post Now button...');
        const postNowButton = await page.$('button:has-text("Post Now")') ||
                             await page.$('.post-now-button') ||
                             await page.$('[class*="post-now"]') ||
                             await page.$('button[aria-label*="Post Now"]');
        
        if (!postNowButton) {
            console.log('✗ Post Now button not found');
            return { success: false, message: 'Post Now button not found' };
        }
        
        await postNowButton.click();
        await page.waitForTimeout(3000);
        console.log('✓ Clicked Post Now button');
        
        console.log('✓ Successfully posted RSS item to Zoho Social');
        return { success: true, message: 'Posted to Zoho Social' };
        
    } catch (error) {
        console.error('✗ Error posting to Zoho Social:', error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

// Webhook server to receive triggers from Make.com
const express = require('express');
const app = express();
app.use(express.json());

app.post('/post-to-zoho', async (req, res) => {
    console.log('Received webhook trigger from Make.com');
    const result = await postRSSItemToZohoSocial();
    res.json(result);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Zoho Social RSS poster is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Zoho Social RSS poster listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/post-to-zoho`);
});

module.exports = { postRSSItemToZohoSocial };
