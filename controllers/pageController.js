const scraper = require('../scraper');
const Page = require('../models/Page'); // Assuming you have a Page model
const { generateAISummary } = require('../services/aiSummary');

module.exports = {
    getPage: async (req, res) => {
        const { username } = req.params;

        try {
            let pageData = await scraper(username);

            // Handle followers conversion:
            pageData.followers = pageData.followers || '0';
            const followerMatch = pageData.followers.match(/([\d.]+)([KM]?)/);
            if (followerMatch) {
                let count = parseFloat(followerMatch[1]);
                const multiplier = followerMatch[2] === 'K' ? 1000 : followerMatch[2] === 'M' ? 1000000 : 1;
                pageData.followers = count * multiplier;
            } else {
                pageData.followers = 0;
            }

            pageData.likes =  pageData.likes || '0';
            const LikesMatch = pageData.likes.match(/([\d.]+)([KM]?)/);
            if (LikesMatch) {
                let count = parseFloat(LikesMatch[1]);
                const multiplier = LikesMatch[2] === 'K' ? 1000 : LikesMatch[2] === 'M' ? 1000000 : 1;
                pageData.likes = count * multiplier;
            } else {
                pageData.likes = 0;
            }

            pageData.category = pageData.category || 'Unknown Category';
            pageData.followers_type = pageData.followers_type || 'Active';

            const page = new Page(pageData);
            await page.save();

            res.json(pageData);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error scraping the page');
        }
    },

    generateAISummary: async (req, res) => {
        const { page_name, followers, likes, category, followers_type } = req.body;

        try {
            const summary = await generateAISummary({ page_name, followers, likes, category, followers_type });
            res.json({ summary });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error generating AI summary');
        }
    }
};

