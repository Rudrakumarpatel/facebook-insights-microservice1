const { MongoClient } = require('mongodb');
const Grid = require('gridfs-stream');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection URL (use your MongoDB Atlas URI here)
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });

let gfs;


client.connect((err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }

    console.log('Connected to MongoDB');
    const db = client.db();  
    gfs = Grid(db, MongoClient);  
    gfs.collection('fs');  
});


function uploadToGridFS(filePath) {
    return new Promise((resolve, reject) => {
        if (!gfs) {
            return reject('GridFS not initialized.');
        }

        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        
        const writeStream = gfs.createWriteStream({
            filename: fileName,
            content_type: 'image/jpeg', 
        });

        fileStream.pipe(writeStream);

        writeStream.on('close', (file) => {
            console.log('File saved to MongoDB with filename:', file.filename);
            resolve(file);  
        });

        writeStream.on('error', (err) => {
            reject('Error uploading file to GridFS:', err);
        });
    });
}

module.exports = { uploadToGridFS };

