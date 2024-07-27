import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { registerAdmin, loginAdmin } from '../controllers/AdminAuthController.js';
import { getUserbyId, getAllUsers, updateUser, deleteUserById, updateUserProfilePicture } from '../controllers/UserController.js'
import {
    createExam,
    deleteExam,
    updateExam,
    getExamById,
    getAllExams,
} from '../controllers/ExamController.js';
import {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getSubcategoryById,
    getAllSubcategories
} from '../controllers/ExamController.js';
import {
    createMockTest,
    updateMockTest,
    deleteMockTest,
    getMockTestById,
    getAllMockTests
} from '../controllers/ExamController.js';
import checkAdminAuth from '../middlewares/checkAdminAuth.js';


const router = express.Router();
// Multer setup for file upload
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


// Public Routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/getUserById/:id', checkAdminAuth, getUserbyId);
router.get('/all/user', checkAdminAuth, getAllUsers);
router.put('/update/:id', checkAdminAuth, updateUser);
router.post('/updateProfilePicture/:id', upload.single('profilePicture'),checkAdminAuth, updateUserProfilePicture);
router.delete('/delete/:id', checkAdminAuth, deleteUserById);


// exams
// POST /api/exams
router.post('/add/exam', upload.single('image'),checkAdminAuth, createExam);

// PUT /api/exams/:id
router.put('/updateExamById/:id', upload.single('image'),checkAdminAuth, updateExam);

// GET /api/exams/:id
router.get('/getExamById/:id',checkAdminAuth, getExamById);

// GET /api/exams
router.get('/all/exams',checkAdminAuth, getAllExams);

// DELETE /api/exams/:id
router.delete('/deleteExamById/:id',checkAdminAuth, deleteExam);



// subcategories
// POST /api/subcategories
router.post('/add/subcategoryExam', upload.single('image'), checkAdminAuth,createSubcategory);

// PUT /api/subcategories/:id
router.put('/updateSubcategoryExamById/:id', upload.single('image'),checkAdminAuth, updateSubcategory);

// DELETE /api/subcategories/:id
router.delete('/deleteSubcategoryExamById/:id', checkAdminAuth, deleteSubcategory);

// GET /api/subcategories/:id
router.get('/getSubcategoryExamById/:id',checkAdminAuth, getSubcategoryById);

// GET /api/subcategories
router.get('/all/SubcategoryExams', checkAdminAuth, getAllSubcategories);


// mockTest

// POST /api/mockTest
router.post('/add/mockTest',checkAdminAuth, createMockTest);

// PUT /api/mockTest/:id
router.put('/updateMockTestById/:id', checkAdminAuth, updateMockTest);

// DELETE /api/mockTest/:id
router.delete('/deleteMockTestById/:id', checkAdminAuth,deleteMockTest);

// GET /api/mockTest/:id
router.get('/getMockTestById/:id', checkAdminAuth, getMockTestById);

// GET /api/getAllMockTests
router.get('/all/MockTest', checkAdminAuth, getAllMockTests);


export default router