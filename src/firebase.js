const admin = require('firebase-admin');

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    '/Users/blakefitzpatrick/pick-it-up-897da-firebase-adminsdk-n2gyz-c9ad90c42c.json'
  ),
  storageBucket: 'pick-it-up-897da.appspot.com/',
});
// Cloud storage
const bucket = admin.storage().bucket();
module.exports = {
  bucket,
};
