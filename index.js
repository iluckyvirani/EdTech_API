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
const port = process.env.port || 8080;
const mongodbURI = process.env.MONGOOSE_URI;
const server = app.listen(port, () => {
    console.log('server is up on port', port)
})

// Load Routes




// Database configuration and server startup
// Database configuration
mongoose.connect(mongodbURI)
    .then(() => console.log("MongoDB Successfully Connected"))
    .catch(err => console.log(err));

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.use(bodyParser.json());



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