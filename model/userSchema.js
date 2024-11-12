import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: [3, "Name must contain at least 3 character"],
        maxLength: [30, "Name cannot exceed 30 character!"],

    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        validate: [validator.isEmail, "Please provide a valid email!"]
    },
    phone: {
        type: Number,
        required: [true, "Please provide your phone number"],
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
        minLength: [3, "Password must contain at least 3 character"],
        maxLength: [100, "Password cannot exceed 30 character!"],
        select: false,
    },
    role: {
        type: String,
        required: [true, "Please provide your role"],
        enum: ["Job Seeker", "Employer"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


//hooks -> middlewares  ->event-> save delete etc 
//arrow function use nhi krte hai kyuki current context pta nhi hota hai
//mongoose hooks provide krta hai
userSchema.pre("save", async function (next) {
    //jab password modified nhi hoga tb use krenge
    // Only hash if the password is modified
    if (!this.isModified("password")) return next();
    //modified nhi rahega toh below walla use krenge
    this.password = await bcrypt.hash(this.password, 10)
    next();
})
//custom methods  userSchema me object hota hai methods //check password 
//mongoose methods deta hai
// Method to check password correctness 
//compare hoga toh time lagega es liye async function ka use krenge
userSchema.methods.isPasswordCorrect = async function
    (password) {
    //return and true and false
    return await bcrypt.compare(password, this.password)
}

//hooks -> middlewares  ->event-> save delete etc 
//arrow function use nhi krte hai kyuki current context pta nhi hota hai
//save mongoose hooks provide krta hai
//Yeh hook MongoDB ke Mongoose library mein diya gaya
userSchema.pre("save", async function (next) {
    //jab password modified nhi hoga tb use krenge
    // Only hash if the password is modified
    if (!this.isModified("password")) return next(); //modified nhi rahega toh below walla use krenge
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
//custom methods  userSchema me object hota hai methods //check password 
//mongoose methods deta hai
// Method to check password correctness
userSchema.methods.isPasswordCorrect = async function
    (password) {
    //return and true and false
    return await bcrypt.compare(password, this.password)
}

//jwt bearer token hota hai -> jo usko bear krta usko data bhej dega
//jwt token dono
// Method to generate access token
// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {

//             _id: this._id,
//             email: this.email,
//             username: this.username,
//             fullName: this.fullName

//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         //expiresIn object ke andar jata hai
//         {
//             expiresIn: process.env.JWT_EXPIRE
//         }
//     )
// }
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.JWT_SECRET_KEY,  // Use the correct JWT_SECRET_KEY from .env
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'  // JWT expiration (7 days in this case)
        }
    );
};



//both are jwt token->refersh token and access token
userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {

            _id: this._id,
            // email:this.email,
            // username:this.username,
            // fullName:this.fullName

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export const User = mongoose.model("User", userSchema);