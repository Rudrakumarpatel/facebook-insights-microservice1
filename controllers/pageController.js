const scraper = require('../scraper');
const Page = require('../models/Page');
const { generateAISummary } = require('../services/aiSummary');

module.exports = {
    getPage: async (req, res) => {
        const { username } = req.params;

        try {
            // Scrape the page data
            let pageData = await scraper(username);

            // Ensure the data is valid (fallback to default values if necessary)
            pageData.followers = isNaN(pageData.followers) ? 0 : pageData.followers;
            pageData.likes = isNaN(pageData.likes) ? 0 : pageData.likes;
            pageData.category = pageData.category || 'Unknown Category';
            pageData.followers_type = pageData.followers_type || 'Active';

            // Save scraped data to MongoDB
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
