// Subcategory of exams routes
import express from 'express';
import {
    getMockTestById,
    getAllMockTests
} from '../controllers/ExamController.js';

const router = express.Router();




// GET /api/mockTest/:id
router.get('/:id', getMockTestById);

// GET /api/getAllMockTests
router.get('/', getAllMockTests);



export default router;
