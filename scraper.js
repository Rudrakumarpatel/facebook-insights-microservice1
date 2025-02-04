const puppeteer = require('puppeteer');
const { uploadToGridFS } = require('./services/gridfs'); // Import GridFS upload utility
const {downloadImage} = require('./services/downloadImage.js');

async function scrapeFacebookPage(username) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Visit the Facebook page
    await page.goto(`https://www.facebook.com/${username}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
    });

    try {
        await page.waitForSelector('title', { timeout: 5000 });

        // Scrape basic page data
        const data = await page.evaluate(() => {
            // Scraping the page name from the title
            const pageName = document.title.split(" |")[0] || 'Unknown Page';

            // Scraping the profile picture using <image> tag with preserveAspectRatio="xMidYMid slice"
            const profilePic = document.querySelector('image[preserveAspectRatio="xMidYMid slice"]') ? document.querySelector('image[preserveAspectRatio="xMidYMid slice"]').getAttribute('xlink:href') : null;

            // Scraping the followers count from the <a> tag that contains href with "followers/"
            const followersLink = document.querySelector('a[href*="followers/"]');
            const followers = followersLink ? parseInt(followersLink.innerText.replace(/[^\d]/g, '')) : 0;

            // Scraping the likes count from the <a> tag that contains href with "friends_likes/"
            const likesLink = document.querySelector('a[href*="friends_likes/"]');
            const likes = likesLink ? parseInt(likesLink.innerText.replace(/[^\d]/g, '')) : 0;

            // Scraping the category (if available)
            const category = document.querySelector('div[data-testid="category"]') ? document.querySelector('div[data-testid="category"]').innerText : 'Unknown Category';

            return {
                page_name: pageName,
                profile_pic_url: profilePic,
                followers: followers,
                likes: likes,
                category: category,
                posts: [],  // Placeholder for posts data
                followers_type: 'Active',
            };
        });

        // Check if profile pic URL is available and upload it to MongoDB
        if (data.profile_pic_url) {
            const imagePath = './image/profile_pic.jpg';  // The path where the image is saved locally
            await downloadImage(data.profile_pic_url, imagePath);  // Download the image
            const uploadedFile = await uploadToGridFS(imagePath);  // Upload the image to GridFS
            data.profile_pic_url = uploadedFile.filename;  // Save the filename in the data
        }

        // Scrape the top 25 posts and their comments (as before)
        const postsData = await page.evaluate(() => {
            let posts = [];
            const postElements = document.querySelectorAll('div[data-testid="post_message"]');  // Scraping the posts using the correct selector

            postElements.forEach((postElement) => {
                const postId = postElement.getAttribute('id') || 'Unknown Post ID';
                const postContent = postElement.innerText || 'No Content';

                // Collect comments for this post
                let comments = [];
                const commentElements = postElement.querySelectorAll('div[data-testid="comment"]');  // Scraping comments under each post

                commentElements.forEach((commentElement) => {
                    const commentText = commentElement.innerText || 'No Comment Text';
                    comments.push(commentText);
                });

                posts.push({ post_id: postId, post_content: postContent, comments: comments });
            });

            return posts;
        });

        // Store the posts in the data object
        data.posts = postsData;

        await browser.close();
        return data;
    } catch (error) {
        console.error('Error scraping Facebook page:', error);
        await browser.close();
        throw new Error('Failed to scrape page data');
    }
}

module.exports = scrapeFacebookPage;
