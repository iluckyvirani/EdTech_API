import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from '../config/emailConfig.js'
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';




export const registerUser = async (req, res) => {
    const { name, email, phone, password, password_confirmation } = req.body;

    try {
        // Check if email or phone already exists
        const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ status: "failed", message: "Email or phone number already exists" });
        }

        // Check if password and confirmation match
        if (password !== password_confirmation) {
            return res.status(400).json({ status: "failed", message: "Password and confirmation password do not match" });
        }
        // Read the HTML email template file
        const sourcePath = path.join(process.cwd(), 'EmailTemplate', 'Emailtemplate.html');

        if (!fs.existsSync(sourcePath)) {
            throw new Error(`HTML email template file not found at: ${sourcePath}`);
        }
        const source = fs.readFileSync(sourcePath, 'utf8');

        // Compile the Handlebars template
        const template = handlebars.compile(source);

        // Generate OTP (for demo, generating a 6-digit random number)
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const purpose = "Email Verification"
        const html = template({ otp, purpose });

        // Set OTP creation timestamp
        const otpCreatedAt = new Date();

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `${otp} is your OTP for email verification on EdTech`,
            html: html
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user data temporarily without JWT token or isUserVerified status
        const newUser = new UserModel({ name, email, phone, password: hashedPassword, otp, otpCreatedAt });
        await newUser.save();

        res.status(201).json({ status: "success", message: "OTP sent your email successfully", otp }); // Return OTP for testing/demo
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ status: "failed", message: "Unable to register user" });
    }
};


export const loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Find user by email or phone (identifier can be either)
        const user = await UserModel.findOne({ phone });
        console.log('hello', user)

        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ status: "failed", message: "Invalid credentials" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

        // Update user document with new OTP
        user.otp = otp;
        user.otpCreatedAt = new Date();
        await user.save();

        // Send OTP via email or SMS (you can modify this based on your configuration)
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "EdTech- New OTP for Login",
            html: `<h1>${otp}</h1>`
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }); // Adjust expiration as needed

        res.status(200).json({
            status: "success",
            message: "Login successful. OTP sent to your email for verification",
            token,
            otp,
            name: user.name // Include user's name in the response
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ status: "failed", message: "Unable to login user" });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user by email address
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Verify OTP (assuming 'otp' field is stored in the user document)
        if (user.otp !== otp) {
            return res.status(400).json({ status: "failed", message: "Invalid OTP" });
        }

        // Check OTP expiration
        const currentTime = new Date();
        const otpExpiration = new Date(user.otpCreatedAt);
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 15); // OTP expires after 15 minutes

        if (currentTime > otpExpiration) {
            return res.status(400).json({ status: "failed", message: "OTP has expired. Please request a new OTP." });
        }

        // Read the HTML email template file
        const sourcePath = path.join(process.cwd(), 'EmailTemplate', 'Verifyotptemplate.html');

        if (!fs.existsSync(sourcePath)) {
            throw new Error(`HTML email template file not found at: ${sourcePath}`);
        }
        const source = fs.readFileSync(sourcePath, 'utf8');
        const template = handlebars.compile(source);
        const html = template({ name: user.name }); // Assuming 'name' is a field in your UserModel


        // Send Email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "EdTech - OTP Successfully Verified",
            html: html
        });

        // Update isUserVerified status to true
        user.isUserVerified = true;
        await user.save();

        res.status(200).json({ status: "success", message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ status: "failed", message: "Unable to verify OTP" });
    }
};




export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id; // Access the user ID from req.user._id

        // Find user by ID
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 'failed', message: 'User not found' });
        }

        const { oldPassword, newPassword } = req.body;

        // Validate old password
        if (!oldPassword || typeof oldPassword !== 'string') {
            return res.status(400).json({ status: 'failed', message: 'Invalid old password' });
        }

        // Check if oldPassword matches the stored hashed password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ status: 'failed', message: 'Invalid old password' });
        }

        // Generate salt and hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ status: 'failed', message: 'Unable to change password' });
    }
};



export const ProfileUser = async (req, res) => {
    res.send({ "user": req.user })
}



export const sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if email is provided
        if (!email) {
            return res.status(400).json({ status: 'failed', message: 'Email field is required' });
        }

        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'failed', message: 'Email does not exist' });
        }

        // Read the HTML email template file
        const sourcePath = path.join(process.cwd(), 'EmailTemplate', 'Emailtemplate.html');

        if (!fs.existsSync(sourcePath)) {
            throw new Error(`HTML email template file not found at: ${sourcePath}`);
        }

        const source = fs.readFileSync(sourcePath, 'utf8');

        // Compile the Handlebars template
        const template = handlebars.compile(source);

        // Generate OTP (for demo, generating a 6-digit random number)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const purpose = 'Reset Password';
        const html = template({ otp, purpose });

        // Set OTP creation timestamp
        const otpCreatedAt = new Date();

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `${otp} is your OTP for password reset on EdTech`,
            html: html
        });

        user.otp = otp;
        user.otpCreatedAt = new Date();
        await user.save();

        // Respond with success message
        res.status(200).json({ status: 'success', message: 'Password reset email sent. Please check your email.', otp });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ status: 'failed', message: 'Failed to send password reset email' });
    }
};




export const userPasswordReset = async (req, res) => {
    const { otp, password, password_confirmation } = req.body;

    try {
        // Find user by OTP and ensure the OTP matches
        const user = await UserModel.findOne({ otp });
        console.log("jdj", user);

        if (!user) {
            return res.status(400).json({ status: 'failed', message: 'Invalid OTP' });
        }

        // Check if passwords are provided and match
        if (!password || !password_confirmation) {
            return res.status(400).json({ status: 'failed', message: 'All fields are required' });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ status: 'failed', message: 'New Password and Confirm New Password do not match' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password and clear the OTP
        user.password = hashedPassword;
        await user.save();

        // Respond with success message
        res.status(200).json({ status: 'success', message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ status: 'failed', message: 'Unable to reset password' });
    }
};




export const updateLoggedInUserProfile = async (req, res) => {
    const { name, email, phone, category, education, profilePicture } = req.body;
    const userId = req.user._id; // Get the user ID from the authenticated user

    try {
        // Find the user by ID
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 'failed', message: 'User not found' });
        }

        // Update user's profile fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (category) user.category = category;
        if (education) user.education = education;
        if (profilePicture) user.profilePicture = profilePicture; // Update profile picture URL

        // Save the updated user document
        await user.save();

        res.status(200).json({ status: 'success', message: 'User profile updated successfully', user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ status: 'failed', message: 'Unable to update user profile' });
    }
};