# Facebook Insights Microservice

A microservice designed to scrape insights from a given Facebook Page based on its username, store the data in MongoDB, and expose an API to retrieve the data. This service fetches essential details about Facebook pages such as the page name, profile picture, followers, likes, category, and posts (with comments).

## Project Structure

```bash
facebook-insights-microservice/
│
├── controllers/
│   └── pageController.js       
│
├── models/
│   └── pageModel.js            
│
├── services/
│   ├── gridfs.js              
│   └── scraper.js             
│
├── server.js                  
├── package.json               
└── .env                       
Installation
1. Clone the Repository

git clone https://github.com/Rudrakumar/facebook-insights-microservice.git
cd facebook-insights-microservice
2. Install Dependencies
Install all the necessary dependencies using npm:


npm install
3. Setup Environment Variables
Create a .env file in the root directory of the project and add the following variables:


MONGO_URI=mongodb+srv://yourMongoDBConnectionURI
OPENAI_API_KEY=yourOpenAIAPIKey  
4. Run the Application
To start the server, use the following command:

node server.js
The server will start running on http://localhost:5000.

API Endpoints
1. GET /pages/:username
This endpoint returns details about a Facebook page by scraping the data (or fetching from MongoDB if already available).

GET http://localhost:5000/pages/:username
Response (Example)

{
    "page_name": "boAt",
    "profile_pic_url": "profile_picture.jpg",
    "followers": 1200000,
    "likes": 500000,
    "category": "Lifestyle",
    "posts": [
        {
            "post_id": "12345",
            "post_content": "Sample Post Content",
            "comments": ["Great post!", "Love this!"]
        }
    ],
    "followers_type": "Active"
}
2. POST /pages/:username/summary
This endpoint generates an AI summary for the Facebook page using the OpenAI API (optional). It returns a brief summary of the page's insights.

POST http://localhost:5000/pages/:username/summary

{
    "page_name": "boAt",
    "followers": 1200000,
    "likes": 500000,
    "category": "Lifestyle",
    "followers_type": "Active"
}
