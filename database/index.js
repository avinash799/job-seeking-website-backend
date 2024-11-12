import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const connectDB = async () => {
    try {
        const mongodbUri = process.env.MONGODB_URI;
        if (!mongodbUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        // Connect to MongoDB without the deprecated options
        const connectionInstance = await mongoose.connect(`${mongodbUri}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 5000, // Time to wait for server selection
            socketTimeoutMS: 45000,        // Timeout for socket connection
        });

        console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MONGODB CONNECTION failed', error.message || error);
        console.error(error.stack); // Log full error stack for debugging
        process.exit(1);  // Exit the process on failed connection
    }
};

export { connectDB };
