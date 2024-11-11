import { catchAsyncError } from "../middlewares/catchAsyncError.js";  // Your custom async error catcher
import { ErrorHandler } from "../middlewares/error.js"; // Custom error handler
import { Job } from '../model/jobSchema.js';  // Your Job model

// Fetch all jobs that are not expired
export const getAllJobs = catchAsyncError(async (req, res, next) => {
    // Await the result of the find query to get jobs where 'expired' is false
    const jobs = await Job.find({ expired: false });

    // If no jobs are found, return a specific message
    if (!jobs || jobs.length === 0) {
        return next(new ErrorHandler('No active jobs found', 404));
    }

    // Send the response with the list of jobs
    res.status(200).json({
        success: true,
        jobs,
    });
});

export const postJobs = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;

    // Check if the user has the "Job Seeker" role
    if (role === "Job Seeker") {
        return next(new ErrorHandler("Job Seeker is not allowed to access this resource", 400));
    }

    // Destructure job details from the request body
    const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body;

    // Validate if all necessary fields are provided
    if (!title || !description || !category || !country || !city || !location) {
        return next(new ErrorHandler("Please provide full job details", 400));
    }

    // Validate salary fields
    if ((!salaryFrom || !salaryTo) && !fixedSalary) {
        return next(new ErrorHandler("Please either provide a fixed salary or a salary range", 400));
    }

    // Check for conflicting salary fields
    if (salaryFrom && salaryTo && fixedSalary) {
        return next(new ErrorHandler("Cannot enter both fixed salary and salary range together", 400));
    }

    // Ensure salary range is valid if provided
    if (salaryFrom && salaryTo && salaryFrom >= salaryTo) {
        return next(new ErrorHandler("Salary 'from' value must be less than the 'to' value", 400));
    }

    // Get the user ID of the person posting the job
    const postedBy = req.user._id;

    // Create a new job in the database
    const job = await Job.create({
        title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, postedBy,
    });

    // Return a success response with the created job
    res.status(201).json({
        success: true,
        message: "Job posted successfully",
        job,
    });
});


export const getmyJobs = catchAsyncError(async (req, res, next) => {
    const { } = req.user;
    if (role === "Job Seeker") {
        return next(
            new ErrorHandler(
                "Job Seeker is not allowed to access this resource",
                400
            )
        );
    }
    const myjobs = await Job.find({ postedBy: req.user._id });
    req.status(200).json({
        success: true,
        myjobs,
    });

})

export const updateJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user; // Assuming the role is in req.user (from authentication middleware)

    // Only allow users with a role other than 'Job Seeker' to update jobs
    if (role === "Job Seeker") {
        return next(new ErrorHandler(
            "Job Seeker is not allowed to access this resource!",
            403 // Forbidden error
        ));
    }

    const jobId = req.params.id;  // Assuming you're passing the job ID in the URL
    const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body;

    // Check if all required fields are provided
    if (!title || !description || !category || !country || !city || !location) {
        return next(new ErrorHandler("Please provide all the job details", 400));
    }

    if ((!salaryFrom || !salaryTo) && !fixedSalary) {
        return next(new ErrorHandler("Please either provide fixed salary or salary range", 400));
    }

    if (salaryFrom && salaryTo && fixedSalary) {
        return next(new ErrorHandler("Cannot provide both fixed salary and salary range", 400));
    }

    // Find the job by ID and update it
    const job = await Job.findByIdAndUpdate(
        jobId,  // Find job by ID
        { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo },  // New job details
        { new: true, runValidators: true }  // Options to return updated job and run validation
    );

    // If job not found, throw a 404 error
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Send back the updated job
    res.status(200).json({
        success: true,
        message: "Job updated successfully",
        job,
    });
});

export const deleteJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
        return next(
            new ErrorHandler(
                "Job Seeker is not allowed to access this resources!",
                400,
            )
        )
    }
    const { id } = req.params;
    let job = await Job.findById(id);
    if (!job) {
        return next(new ErrorHandler("Oops , Job not found", 404));

    }
    await job.deleteOne();
    res.status(200).json({
        success: true,
        message: "Job deleted Successfully"
    })

})