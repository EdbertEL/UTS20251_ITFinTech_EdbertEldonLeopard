/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient } = require('mongodb');
// Load environment variables from your .env.local file
require('dotenv').config({ path: './.env.local' });

async function createAdmin() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found in .env.local. Please add it.');
        process.exit(1);
    }
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('paymentDB'); 
        const usersCollection = db.collection('users');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password';

        const result = await usersCollection.updateOne(
            { email: adminEmail },
            {
                $set: {
                    email: adminEmail,
                    password: adminPassword,
                    role: 'admin',
                },
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`✅ Successfully created a new admin user: ${adminEmail}`);
        } else {
            console.log(`✅ Successfully updated the admin user: ${adminEmail}`);
        }
    } catch (err) {
        console.error('❌ Failed to create admin user:', err);
    } finally {
        await client.close();
    }
}

createAdmin();