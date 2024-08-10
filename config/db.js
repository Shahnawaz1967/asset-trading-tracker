// D2nYZ8p4Ofw5zwkd
// ashahnawaz010
// mongodb+srv://ashahnawaz010:D2nYZ8p4Ofw5zwkd@cluster0.stluo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI,
        );
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;


