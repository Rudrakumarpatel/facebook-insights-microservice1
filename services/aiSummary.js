const openai = require('openai');

openai.apiKey = process.env.OPENAI_API_KEY;

async function generateAISummary(pageData) {
    const prompt = `Summarize the Facebook page ${pageData.page_name} with ${pageData.followers} followers, ${pageData.likes} likes, in the ${pageData.category} category.`;

    try {
        const summary = await openai.Completion.create({
            engine: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 100
        });
        return summary.choices[0].text.trim();
    } catch (error) {
        console.error('Error generating AI summary:', error);
        throw error;
    }
}

module.exports = { generateAISummary };
