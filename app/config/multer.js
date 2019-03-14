const multer = require('multer');
let { uploadImagePath } = require('./config');
let { uploadDocumentPath } = require('./config');
const shortId = require('short-id');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("upload image path--->", file.fieldname)
        if (file.fieldname == 'profilePicture') {
            console.log("pic ->",file.fieldname)
            console.log(uploadImagePath);
            cb(null, uploadImagePath);
        }
        if (file.fieldname == 'documentOne') {
            console.log("first doc->",file.fieldname)
            console.log(uploadDocumentPath);
            cb(null, uploadDocumentPath);
        }
        if (file.fieldname == 'documentTwo') {
            console.log("second doc->",file.fieldname)
            console.log(uploadDocumentPath);
            cb(null, uploadDocumentPath);
        }

    },
    filename: function (req, file, cb) {
        // cb(null, file.fieldname + '-' + Date.now())
        cb(null, shortId.generate() + '_' + Date.now() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else { //reject a file
        cb(null, false)
    }
};

const fileUploadConfig = multer({
    storage: storage,
    limits:{
        fileSize:1024 * 1024 * 2 //max file size 5mb
    },
    // fileFilter:fileFilter
});

module.exports = fileUploadConfig;
