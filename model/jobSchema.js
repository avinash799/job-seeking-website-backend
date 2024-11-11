import mongoose from "mongoose";

const jobschema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide job title"],
        minLength: [3, "Job Title must contain at least 3 character"],
        maxLength: [50, "Job title cannot exceed 50 character "]

    },
    description: {
        type: String,
        required: [true, "Please provide job description"],
        minLength: [3, "Job description must contain at least 50 characters"],
        maxLength: [350, "Job description cannot exceed 350 characters "],
    },
    category: {
        type: String,
        required: [true, "Job category is required"]
    },
    country: {
        type: String,
        required: [true, "Job country is required"],
    },
    city: {
        type: String,
        required: [true, "Job city is required"],
    },
    location: {
        type: String,
        required: [true, "Please provide exact location"],
        minLength: [50, "Job location must contain at least 50 characters"],

    },
    fixedSalary: {
        type: Number,
        minLength: [4, "Fixed Salary must contain at least 4 digits!"],
        maxLength: [9, "Fixed salary cannot exceed 9 digits!"]
    },
    salaryFrom: {
        type: Number,
        minLength: [4, "Salary from must contain at least 4 digits"],
        maxLength: [9, "Salary from cannot exceed 9 digits"],
    },
    salaryTo: {
        type: Number,
        minLength: [4, "salaryto must contain at least 4 digits!"],
        maxLength: [9, "salaryto cannot exceed 9 digits"]
    },
    expired: {
        type: Boolean,
        default: false,
    },
    jobpostedOn: {
        type: Date,
        default: Date.now,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

export const Job = mongoose.model("Job", jobschema);