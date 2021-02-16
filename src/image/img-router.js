const createUUID = require('uuid-v4');
const express = require('express');
const multer = require('multer');
const firebase = require('../firebase');
const imgRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

imgRouter.route('/').post(upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send('Error: No files found');
  } else {
    const blob = firebase.bucket.file(`images/${req.file.originalname}`);

    const blobWriter = blob.createWriteStream({
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: createUUID(),
        },
      },
    });

    blobWriter.on('error', (err) => {
      console.log(err);
    });

    blobWriter.on('finish', () => {
      const publicUrl =
        `https://firebasestorage.googleapis.com/v0/b/${firebase.bucket.name}/o/` +
        encodeURIComponent(`${blob.name}`) +
        '?alt=media';
      res.status(200).send(publicUrl);
    });

    blobWriter.end(req.file.buffer);
  }
});
module.exports = imgRouter;
