const admin = require('firebase-admin');

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: 'pick-it-up-897da.appspot.com/',
});
// Cloud storage
const bucket = admin.storage().bucket();
module.exports = {
  bucket,
};
