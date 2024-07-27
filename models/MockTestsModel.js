import mongoose from 'mongoose';

const { Schema } = mongoose;

const MockSchema = new Schema(
    {
        TestName: {
            type: String,
            required: true
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
        },
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true
        }
    },
    { timestamps: true }
);

const MockTestModel = mongoose.model('Mocktest', MockSchema);

export default MockTestModel;
