import express from 'express';
const router = express.Router();
import { registerUser, verifyOTP, loginUser, changePassword, ProfileUser,sendUserPasswordResetEmail,userPasswordReset,updateLoggedInUserProfile } from '../controllers/AuthController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';


// Public Routes
router.post('/register', registerUser)
router.post('/verify/otp', verifyOTP)
router.post('/login', loginUser)
router.post('/send-reset-password-email', sendUserPasswordResetEmail)
router.post('/reset-password', userPasswordReset)
// Protected Routes
router.post('/changepassword', checkUserAuth, changePassword)
router.get('/me',checkUserAuth, ProfileUser)
router.put('/update_profile',checkUserAuth, updateLoggedInUserProfile)






export default router