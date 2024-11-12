import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { ErrorHandler } from "../middlewares/error.js"
import { User } from '../model/userSchema.js';
import { sendToken } from '../utils/jwtToken.js'
import bcrypt from 'bcryptjs';


// export const register = catchAsyncError(async (req, res) => {
//     try {
//         const { name, phone, role, email, password } = req.body;
//         if (!name || !phone || !role || !email || !password) {
//             return next(new ErrorHandler("Please fill full registration form "))
//         }
//         const isEmail = await User.findOne({ email });
//         if (isEmail) {
//             return next(new ErrorHandler("email already exists"));
//         }
//         const user = await User.create({
//             name, phone, role, email, password
//         })
//         // res.status(200).json({
//         //     success: true,
//         //     message: "User registered",
//         //     user,
//         // })
//         sendToken(user, 200, res, "User registered successfully!")
//     } catch (error) {
//         // Log the error for debugging purposes
//         console.error("Registration error:", error);

//         // Pass the error to the next middleware (global error handler)
//         next(error);
//     }
// })
export const register = catchAsyncError(async (req, res, next) => {
    const { name, phone, role, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !phone || !role || !email || !password) {
        return next(new ErrorHandler("Please fill the full registration form", 400)); // Returning error if any field is missing
    }

    // Check if email already exists
    const isEmail = await User.findOne({ email });
    if (isEmail) {
        return next(new ErrorHandler("Email already exists", 400));
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with hashed password
    const user = await User.create({
        name, phone, role, email, password: hashedPassword
    });

    // Send token and success response
    sendToken(user, 200, res, "User registered successfully!");
});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return next(
            new ErrorHandler("Please provide email, password and role.", 400)
        );
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 400));
    }
    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 400));

    }
    if (user.role !== role) {
        return next(new ErrorHandler("User with this role not found", 400));
    }
    sendToken(user, 200, res, "User logged in successfully!");
});

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(201).cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "User logout Successfully",
    })
})

export const getUser = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    req.status(200).json({
        success: true,
        user,
    });
});