const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log();
        console.log(file.fieldname);
        let destinationPath = 'uploads/';

        if (file.fieldname === 'avatar') {
            destinationPath += 'profile/'
        } else if (file.fieldname === 'products') {
            destinationPath += 'products/'
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.fieldname +
            '-' +
            Date.now() +
            '.' +
            file.originalname.split('.')[file.originalname.split('.').length - 1]
        );   // 고유 user id
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) { //res
        let ext = path.extname(file.originalname);

        console.log(ext);

        if (file.fieldname === 'avatar') {
            if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                return callback(new Error('Only Images are allowed'));
            }
            if (file.fileSize < 110 * 110 * 2) {
                return callback(new Error('File size exceeds 2 MB'));
            }
        }
        if (file.fieldname === 'products') {
            if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                return callback(new Error('Only Images are allowed'));
            }
            // if (file.fileSize > 1024 * 1024 * 15) {
            //     return callback(new Error('File size exceeds 15 MB'));
            // }
        }
        callback(null, true);
    },
    limits: function (req, file, callback) {
        console.log(file.fieldname);
        if (file.fieldname === 'avatar') {
            if (req.fileSize < 2) {
                return callback(new Error('File size exceeds 2 MB'));
            }
        }
        if (file.fieldname === 'products') {
            if (file.fileSize < 1024 * 1024 * 15) {
                return callback(new Error('File size exceeds 15 MB'));
            }
        }
        callback(null, true);
    }

});

module.exports = upload;