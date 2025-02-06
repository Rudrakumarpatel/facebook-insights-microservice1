const puppeteer = require('puppeteer');
const { uploadToGridFS } = require('./services/gridfs');
const { downloadImage } = require('./services/downloadImage.js');

async function scrapeFacebookPage(username) {
    const browser = await puppeteer.launch({ headless: true, timeout: 0 }); // Headless for production
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    try {
        const url = `https://www.facebook.com/${username}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('title', { timeout: 10000 });

        const data = await page.evaluate(() => {
            const pageName = document.title.split(" |")[0] || 'Unknown Page';

            const profilePic = document.querySelector('image[preserveAspectRatio="xMidYMid slice"]') ? document.querySelector('image[preserveAspectRatio="xMidYMid slice"]').getAttribute('xlink:href') : null;

            let followers = 0;
            const followersLink = Array.from(document.querySelectorAll('a[href*="followers/"]')).find(link => link.textContent.includes("followers"));
            if (followersLink) {
                const followerCountText = followersLink.textContent.trim();
                const match = followerCountText.match(/([\d.]+[KM]?)/);
                if (match) {
                    followers = match[1];
                }
            }
            
            let Likes = 0;
            const LikesLink = Array.from(document.querySelectorAll('a[href*="friends_likes/"]')).find(link => link.textContent.includes("Likes"));
            if (LikesLink) {
                const LikesCountText = LikesLink.textContent.trim();
                const match = LikesCountText.match(/([\d.]+[KM]?)/);
                if (match) {
                    Likes = match[1];
                }
            }

            const categoryElement = document.getElementsByClassName('xzsf02u x6prxxf xvq8zen x126k92a')[0];
            const category = categoryElement ? categoryElement.innerText : 'Unknown Category';

            return {
                page_name: pageName,
                profile_pic_url: profilePic,
                followers: followers,
                likes: Likes,
                category: category,
                posts: [],
                followers_type: 'Active',
            };
        });

        if (data.profile_pic_url) {
            const imagePath = './image/profile_pic.jpg'; // Make sure this directory exists
            try {
                await downloadImage(data.profile_pic_url, imagePath);
                const uploadedFile = await uploadToGridFS(imagePath);
                data.profile_pic_url = uploadedFile.filename;
            } catch (imageError) {
                console.error("Error downloading or uploading image:", imageError);
            }
        }

        const postsData = await page.evaluate(() => {
            const posts = [];
            const postElements = document.getElementsByClassName('html-div xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd');

            for (const postElement of postElements) {
                
                if (postElement) {
                    let i = 1;
                    const postContent = postElement.innerText || 'No Content';
                    if (!postContent) return; 

                    const postId = postContent ? i++ : 0;
                    
                    const comments = [];
                    const commentElements = postElement.getElementsByClassName('xwib8y2 xn6708d x1ye3gou x1y1aw1k');
                    for(const commentElement of commentElements)
                    {
                        if (commentElement) {
                            const commentText = commentElement.innerText || 'No Comment Text';
                            comments.push(commentText);
                        }
                    };

                    posts.push({ post_id: postId, post_content: postContent, comments: comments });
                }
            }
            return posts;
        });

        data.posts = postsData;

        await browser.close();
        return data;

    } catch (error) {
        console.error('Error scraping Facebook page:', error);
        await browser.close();
        throw error;
    }
}

module.exports = scrapeFacebookPage;
