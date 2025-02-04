const mongoose = require('mongoose');

// Page Schema
const PageSchema = new mongoose.Schema({
    page_name: String,
    page_url: String,
    profile_pic: String,
    email: String,
    website: String,
    category: String,
    followers: Number,
    likes: Number,
    created_at: { type: Date, default: Date.now },
    posts: [{
        post_id: String,
        post_content: String,
        created_at: Date
    }],
    followers_data: [{
        follower_name: String,
        follower_profile_pic: String,
        follower_id: String
    }]
});

const Page = mongoose.model('Page', PageSchema);
module.exports = Page;
