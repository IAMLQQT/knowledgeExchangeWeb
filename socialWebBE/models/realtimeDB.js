const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
var serviceAccount = require('../utils/serviceAccountKey.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL:
    'https://ptit-social-web-default-rtdb.firebaseio.com/',
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();
module.exports = { db };