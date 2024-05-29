const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type. Only jpg, jpeg, and png files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('image');

const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const fileName = `${req.file.originalname.split(' ').join('_')}_${Date.now()}.webp`;
    const filePath = path.join('images', fileName);

    try {
        await sharp(req.file.buffer)
            .resize(800)
            .toFormat('webp', {quality: 80})
            .toFile(filePath);

        req.file.path = filePath;
        req.file.filename = fileName;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    upload,
    processImage
};
