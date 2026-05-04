const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const { isLoggedIn } = require('../middleware/auth');

router.get('/books', isLoggedIn, async (req, res) => {
    try {
        const books = await Book.find({ createdBy: req.user._id }).populate('createdBy');
        res.render('books/index', { books });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/book/new', isLoggedIn, (req, res) => {
    res.render('books/new');
});

router.post('/book', isLoggedIn, async (req, res) => {
    try {
        const newBook = new Book({
            ...req.body.book,
            createdBy: req.user._id
        });
        await newBook.save();
        res.redirect(`/books`);
    } catch (err) {
        console.error(err);
        res.redirect('/book/new');
    }
});

router.get('/books/:id', isLoggedIn, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('createdBy');
        if (!book || !book.createdBy.equals(req.user._id)) {
            return res.status(404).send('Book not found or unauthorized');
        }
        res.render('books/show', { book });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/books/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.createdBy.equals(req.user._id)) {
            return res.status(404).send('Book not found or unauthorized');
        }
        res.render('books/edit', { book });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/books/:id', isLoggedIn, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.createdBy.equals(req.user._id)) {
            return res.status(404).send('Book not found or unauthorized');
        }
        // Exclude title from updates to fulfill the "Title field must NOT be editable after creation" constraint
        const { title, ...updateData } = req.body.book;
        
        await Book.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
        res.redirect(`/books/${req.params.id}`);
    } catch (err) {
        res.redirect(`/books/${req.params.id}/edit`);
    }
});

router.delete('/books/:id', isLoggedIn, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.createdBy.equals(req.user._id)) {
            return res.status(404).send('Book not found or unauthorized');
        }
        await Book.findByIdAndDelete(req.params.id);
        res.redirect('/books');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
