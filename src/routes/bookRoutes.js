import { Router } from "express";
import { createBook, deleteBook, getAllBooks, getBooksByUser } from "../controllers/bookController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const bookRouter = Router()

bookRouter.post('/create-book', protectedRoute, createBook)
bookRouter.get('/all-books', protectedRoute, getAllBooks)
bookRouter.get('/user-books', protectedRoute, getBooksByUser)
bookRouter.delete('/delete-book/:id', protectedRoute, deleteBook)

export default bookRouter