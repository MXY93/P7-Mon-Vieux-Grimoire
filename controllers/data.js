/* const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');


exports.importData = (req, res, next) => {
    console.log('Import data route hit');
    const filePath = path.join(__dirname, '../../frontend/public/data/data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({error: 'Unable to read data file'});
        }

        const books = JSON.parse(data);
        Book.insertMany(books)
        .then(() => res.status(201).json({message: 'Data imported successfully'}))
        .catch(error => res.status(400).json({error}));
    })
} */