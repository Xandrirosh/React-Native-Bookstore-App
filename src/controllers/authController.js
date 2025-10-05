import bcrypt from 'bcryptjs';
import userModel from '../models/user.js'
import jwt from 'jsonwebtoken'

// Generate JWT Token   
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15d' })
}

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters long" })
        }

        const existingEmail = await userModel.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" })
        }

        const existingUSername = await userModel.findOne({ username })
        if (existingUSername) {
            return res.status(400).json({ message: "Username already exists" })
        }

        //get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataars/svg?seed=${username}`;
        const newUSer = new userModel({
            username,
            email,
            password,
            profileImage
        })
        const savedUser = await newUSer.save()

        //generate token
        const token = generateToken(savedUser._id)

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            error: false,
            data: {
                savedUser: {
                    _id: savedUser._id,
                    username: savedUser.username,
                    email: savedUser.email,
                    profileImage: savedUser.profileImage,
                    createdAt: savedUser.createdAt
                },
                token
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({
                message: "Invalid credentials",
                success: false,
                error: true
            });
        }
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false,
                error: true
            });
        }

        const accessToken = generateToken(user._id)

        return res.status(201).json({
            message: "Login successfully",
            success: true,
            error: false,
            data: {
                savedUser: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt
                },
                accessToken
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('accessToken');
        return res.status(200).json({
            message: "User logged out successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}
export default {
    register,
    login,
    logout
};
