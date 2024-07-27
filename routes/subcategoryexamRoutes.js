// Subcategory of exams routes
import express from 'express';
import multer from 'multer';
import {
    getSubcategoryById,
    getAllSubcategories
} from '../controllers/ExamController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });




// GET /api/subcategories/:id
router.get('/:id', getSubcategoryById);

// GET /api/subcategories
router.get('/', getAllSubcategories);



export default router;
