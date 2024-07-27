import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/examRoutes.js';
import subcategoryexam from './routes/subcategoryexamRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';
import MockTests from './routes/mocktestsRoutes.js';
import router from './router/route.js'; // Ensure this path is correct

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const mongodbURI = process.env.MONGOOSE_URI;

// Middleware configuration
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // Less information exposed about the stack
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", AdminRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/subcategory', subcategoryexam);
app.use('/api/mocktest', MockTests);
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
    res.status(201).json("GET request");
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).send({ message: 'Something went wrong!' });
});

// Database configuration and server startup
async function connect() {
    try {
        await mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Successfully Connected");

        const server = app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        });

        // Graceful shutdown
        const gracefulShutdown = () => {
            server.close(() => {
                console.log('Server is shutting down...');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed.');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
}

connect();
