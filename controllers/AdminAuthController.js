import AdminModel from '../models/AdminModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



export const registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email or phone already exists
        const existingAdmin = await AdminModel.findOne({ $or: [{ email }] });
        if (existingAdmin) {
            return res.status(400).json({ status: "failed", message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user data temporarily without JWT token or isUserVerified status
        const newAdmin = new AdminModel({ email, password: hashedPassword });
        await newAdmin.save();

        res.status(201).json({ status: "success", message: "Admin Registered Successfully", newAdmin }); // Return OTP for testing/demo
    } catch (error) {
        console.error("Error registering Admin:", error);
        res.status(500).json({ status: "failed", message: "Unable to register Admin" });
    }
};


export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await AdminModel.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ status: "failed", message: "Invalid email or password" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ status: "failed", message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        res.status(200).json({ status: "success", message: "Admin logged in successfully", token });
    } catch (error) {
        console.error("Error logging in Admin:", error);
        res.status(500).json({ status: "failed", message: "Unable to log in Admin" });
    }
};