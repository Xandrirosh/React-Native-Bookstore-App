import cloudinary from "../lib/cloudinary.js";
import bookModel from "../models/book.js";

export const createBook = async (req, res) => {
    try {
        const { title, image, caption, rating } = req.body;
        if (!title || !image || !caption || !rating) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        // upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'bookWorm'
        });
        if (!uploadResponse) {
            return res.status(500).json({
                message: "Image upload failed",
                success: false,
                error: true
            });
        }
        const imageUrl = uploadResponse.secure_url;

        //save book to database
        const newBook = new bookModel({
            title,
            image: imageUrl,
            caption,
            rating,
            user: req.user._id
        });
        await newBook.save();

        return res.status(201).json({
            message: "Book created successfully",
            success: true,
            error: false,
            data: newBook
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export const getAllBooks = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await bookModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profileImage');

        const totalBooks = await bookModel.countDocuments();
        return res.status(200).json({
            message: "Books retrieved successfully",
            success: true,
            error: false,
            books,
            totalPages: Math.ceil(totalBooks / limit),
            currentPage: page,
            totalBooks
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export const getBooksByUser = async (req, res) => {
    try {
        const books = await bookModel.find({ user: req.user._id });
        return res.status(200).json({
            message: "Books retrieved successfully",
            success: true,
            error: false,
            data: books
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

export const deleteBook = async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                message: "Book not found",
                success: false,
                error: true
            });
        }
        // check if the user is the owner of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this book",
                success: false,
                error: true
            });
        }

        //delete image from cloudinary
        if (book.image && book.image.includes('res.cloudinary.com')) {
            const imagePublicId = book.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`bookWorm/${imagePublicId}`);
        }
        // delete book from database
        await bookModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: "Book deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}