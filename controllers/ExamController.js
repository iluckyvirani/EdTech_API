import ExamModel from '../models/ExamsModel.js';

import SubcategoryModel from '../models/SubcategoryExamsModel.js';
import MockTestModel from '../models/MockTestsModel.js';
import cloudinary from '../cloudinaryConfig/cloudinaryConfig.js';


export const createExam = async (req, res) => {
    const { name, description } = req.body;
    const imageFile = req.file.path; // Assuming Multer saves the image temporarily on disk

    try {
        // Upload image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(imageFile, {
            folder: 'exam_images', // Optional: specify a folder in Cloudinary
            public_id: `exam_${Date.now()}`, // Optional: specify a public ID (unique identifier)
            overwrite: true // Overwrite existing image with the same public ID
        });

        // Save exam details in the database
        const exam = await ExamModel.create({
            name,
            image: result.secure_url, // Save the Cloudinary URL
            description
        });

        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
        console.error('Failed to create exam:', error);
        res.status(500).json({ message: 'Failed to create exam', error });
    }
};





export const updateExam = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const imageFile = req.file?.path; // Handle case where image might not be provided

    try {
        // Find the exam to update
        const exam = await ExamModel.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Prepare fields to update
        const updateFields = { name, description };

        if (imageFile) {
            // Upload new image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile, {
                folder: 'exam_images', // Optional: specify a folder in Cloudinary
                public_id: `exam_${id}`, // Optional: specify a public ID (unique identifier)
                overwrite: true // Overwrite existing image with the same public ID
            });

            // Update the image URL
            updateFields.image = result.secure_url;
        }

        // Update the exam in the database
        const updatedExam = await ExamModel.findByIdAndUpdate(id, updateFields, { new: true });

        res.status(200).json({ message: 'Exam updated successfully', updatedExam });
    } catch (error) {
        console.error('Failed to update exam:', error);
        res.status(500).json({ message: 'Failed to update exam', error: error.message });
    }
};





export const getExamById = async (req, res) => {
    const { id } = req.params;
    try {
        const exam = await ExamModel.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.status(200).json({ message: 'Exam found successfully', exam });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exam', error: error.message });
    }
};




export const getAllExams = async (req, res) => {
    try {
        const exams = await ExamModel.find();
        res.status(200).json({ message: 'Exams found successfully', exams });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exams', error: error.message });
    }
};




export const deleteExam = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExam = await ExamModel.findByIdAndDelete(id);
        if (!deletedExam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.status(200).json({ message: 'Exams deleted successfully', deletedExam });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam', error: error.message });
    }
};









// Subcategory of exams 


// Create a new subcategory
export const createSubcategory = async (req, res) => {
    const { name, description, totalTests, examId } = req.body;
    const imageFile = req.file?.path; // Handle case where image might not be provided

    try {
        let imageUrl = ''; // Default to empty if no image is uploaded

        if (imageFile) {
            // Upload image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile, {
                folder: 'subcategory_images', // Optional: specify a folder in Cloudinary
                public_id: `subcategory_${Date.now()}`, // Optional: specify a public ID (unique identifier)
                overwrite: true // Overwrite existing image with the same public ID
            });

            // Set the image URL
            imageUrl = result.secure_url;
        }

        // Create the subcategory with the provided data and image URL
        const subcategory = await SubcategoryModel.create({
            name,
            image: imageUrl,
            description,
            totalTests,
            exam: examId // Assign exam ID to the subcategory
        });

        res.status(201).json({ message: 'Subcategory created successfully', subcategory });
    } catch (error) {
        console.error('Failed to create subcategory:', error);
        res.status(500).json({ message: 'Failed to create subcategory', error: error.message });
    }
};

// Update an existing subcategory by ID
export const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, totalTests } = req.body;
    const imageFile = req.file?.path; // Handle case where image might not be provided

    try {
        // Find the subcategory to update
        const subcategory = await SubcategoryModel.findById(id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Prepare fields to update
        const updateFields = { name, description, totalTests };

        if (imageFile) {
            // Upload new image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile, {
                folder: 'subcategory_images', // Optional: specify a folder in Cloudinary
                public_id: `subcategory_${id}`, // Optional: specify a public ID (unique identifier)
                overwrite: true // Overwrite existing image with the same public ID
            });

            // Update the image URL
            updateFields.image = result.secure_url;
        }

        // Update the subcategory in the database
        const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(id, updateFields, { new: true });

        res.status(200).json({ message: 'Subcategory updated successfully', subcategory: updatedSubcategory });
    } catch (error) {
        console.error('Failed to update subcategory:', error);
        res.status(500).json({ message: 'Failed to update subcategory', error: error.message });
    }
};

// Delete a subcategory by ID
export const deleteSubcategory = async (req, res) => {
    const { id } = req.params;

    try {
        await SubcategoryModel.findByIdAndDelete(id);
        res.status(200).json({ status:200,  message: 'Subcategory of exam deleted successfully' });
    } catch (error) {
        console.error('Failed to delete subcategory:', error);
        res.status(500).json({ message: 'Failed to delete subcategory', error });
    }
};

// Get a subcategory by ID
export const getSubcategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const subcategory = await SubcategoryModel.findById(id).populate('exam');

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({ message: 'Subcategory of exam found successfully', subcategory });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        res.status(500).json({ message: 'Failed to get subcategory', error });
    }
};

// Get all subcategories
export const getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await SubcategoryModel.find().populate('exam');
        res.status(200).json({
            message: 'Subcategories of exams found successfully',
            subcategory: subcategories
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({
            message: 'Failed to get subcategories',
            error: error.message
        });
    }
};







// Mocktest of exams 






// Create a new mockTest
export const createMockTest = async (req, res) => {
    const { TestName, description, totalTests, examId, subcategoryId } = req.body;

    try {
        const mockTest = await MockTestModel.create({
            TestName,
            description,
            totalTests,
            exam: examId, // Assign exam ID to the Mocktest
            subcategory: subcategoryId // Assign subcategory ID to the Mocktest
        });

        res.status(201).json({ message: 'MockTest of exam created successfully', mockTest });
    } catch (error) {
        console.error('Failed to create MockTest:', error);
        res.status(500).json({ message: 'Failed to create MockTest', error });
    }
};



// Update an existing MockTest by ID
export const updateMockTest = async (req, res) => {
    const { id } = req.params;
    const { TestName, description, totalTests, examId, subcategoryId } = req.body;

    try {
        const updatedMockTest = await MockTestModel.findByIdAndUpdate(
            id,
            { TestName, description, totalTests, examId, subcategoryId },
            { new: true }
        );

        res.status(200).json({ message: 'MockTest of exam updated successfully', MockTest: updatedMockTest });
    } catch (error) {
        console.error('Failed to update MockTest:', error);
        res.status(500).json({ message: 'Failed to update MockTest', error });
    }
};

// Delete a MockTest by ID
export const deleteMockTest = async (req, res) => {
    const { id } = req.params;

    try {
        await MockTestModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'MockTest of exam deleted successfully' });
    } catch (error) {
        console.error('Failed to delete MockTest:', error);
        res.status(500).json({ message: 'Failed to delete MockTest', error });
    }
};

// Get a MockTest by ID
export const getMockTestById = async (req, res) => {
    const { id } = req.params;

    try {
        const MockTest = await MockTestModel.findById(id).populate('exam');

        if (!MockTest) {
            return res.status(404).json({ message: 'MockTest not found' });
        }

        res.status(200).json({ message: 'MockTest of exam found successfully', MockTest });
    } catch (error) {
        console.error('Error fetching MockTest:', error);
        res.status(500).json({ message: 'Failed to get MockTest', error });
    }
};

// Get all MockTests
export const getAllMockTests = async (req, res) => {
    try {
        const MockTests = await MockTestModel.find().populate('exam');
        res.status(200).json(MockTests);
        res.status(200).json({ message: 'MockTests of exams found successfully', MockTests });
    } catch (error) {
        console.error('Error fetching MockTests:', error);
        res.status(500).json({ message: 'Failed to get MockTests', error });
    }
};