import mongoose from 'mongoose';

const { Schema } = mongoose;

const SubcategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        description: {
            type: String
        },
        totalTests: {
            type: Number,
            default: 0
        },
        exam: {
            type: Schema.Types.ObjectId,
            ref: 'Exam',
            required: true
        }
    },
    { timestamps: true }
);

const SubcategoryModel = mongoose.model('Subcategory', SubcategorySchema);

export default SubcategoryModel;
