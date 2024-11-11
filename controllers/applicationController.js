import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandler } from "../middlewares/error.js";
import { Application } from "../model/applicationSchema.js";
export const employerGetAllApplications = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
        return next(
            new ErrorHandler(
                "Job Seeker is not allowed to access this resources!",
                400
            )
        )
    }
    const { _id } = req.user;
    const applications = await Application.find({ 'employerID.user': _id });
    res.status(200).json({
        success: true,
        applications,
    })
})

export const jobSeekerGetAllApplications = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        return next(
            new ErrorHandler(
                "Employer is not allowed to access this resources!",
                400,
            )
        )
    }
    const { _id } = req.user;
    const applications = await Application.find({ 'applicationID.user': _id });
    res.status(200).json({
        success: true,
        applications,
    })
})

export const jobSeekerDeleteApplication = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;

    // Check if the user is an employer and block them from accessing this route
    if (role === "Employer") {
        return next(new ErrorHandler("Employer is not allowed to delete applications", 400));
    }

    const { id } = req.params;

    // Find the application by its ID
    const application = await Application.findById(id);
    if (!application) {
        return next(new ErrorHandler("Application not found", 404));
    }

    // Optional: Check if the application belongs to the logged-in job seeker
    // if (application.user.toString() !== req.user.id) {
    //     return next(new ErrorHandler("You are not authorized to delete this application", 403));
    // }

    // Delete the application
    await application.deleteOne();

    // Send success response
    res.status(200).json({
        success: true,
        message: "Application deleted successfully",
    });
});


export const postApplication = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;

    // Check if the user is an Employer and block them from accessing the route
    if (role === "Employer") {
        return next(
            new ErrorHandler(
                "Employer is not allowed to access this resource",  // Removed extra '!'
                400
            )
        );
    }

    // Logic for posting an application 
    if (!req.file || !Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Resume File Required"));
    }
    const { resume } = req.files;
    // const { name } = req.body;
    const allowedFormats = ['image/png', "image/jpg", " image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
        AudioBufferSourceNode.includes(resume.mimetype)
        return next(new ErrorHandler("Invalid file type. Please upload your resume in a png, jpg or webp format", 400)
        )
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath
    );
    console.log(cloudinaryResponse);

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:", cloudinaryResponse.error || "Unknow cloudinary Error"
        )
        return next(new ErrorHandler("Failed to upload resume", 500));
    }
    const { name, email, coverLetter, phone, address, jobId } = req.body;
    const applicationID = {
        user: req.user._id,
        role: "Job Seeker",

    };
    if (!jobId) {
        return next(new ErrorHandler("Job not found!", 404));
    }
    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        return next(new ErrorHandler("Job not found", 404));
    }
    const employerID = {
        user: jobDetails.postedBy,
        role: "Employer",
    };
    if (!name || !email || !coverLetter || !phone || !address || !applicantID || !employerID || resume) {
        return next(new ErrorHandler("Please fill all field", 400));
    }
    const application = await Application.create({
        name,
        email,
        coverLetter,
        phone,
        address,
        applicationID,
        employerID,
        resume: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "Applications Submitted",
        application,
    });
});
