const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let db;

try {
    let serviceAccount;

    // Option 1: Use Base64 encoded JSON from Environment Variable (Best for Deployment/Security)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        serviceAccount = JSON.parse(buffer.toString('utf8'));
        console.log('🔥 Loaded Firebase credentials from Environment Variable');
    }
    // Option 2: Use a service account key file (Legacy/Local Dev)
    else {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
        serviceAccount = require(path.resolve(__dirname, serviceAccountPath));
        console.log(`🔥 Loaded Firebase credentials from file: ${serviceAccountPath}`);
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('✅ Firebase Admin initialized successfully');

} catch (error) {
    console.error('⚠️ Firebase Admin initialization failed:', error.message);
    console.log('   Please ensure FIREBASE_SERVICE_ACCOUNT_BASE64 is set in .env OR "serviceAccountKey.json" is present.');
}

module.exports = { admin, db };
