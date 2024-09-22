const express = require('express');
const router = express.Router();
const Review = require('../models/review');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Post a new review or edit an existing one by the same user
router.post('/', async (req, res) => {
    const { rating, title, comment, user } = req.body;

    try {
        // Check if the user has already commented on the product
        const existingReview = await Review.findOne({ user });

        if (existingReview) {
            // User already commented, return existing review for editing
            return res.status(400).json({
                message: 'You have already commented on this product.',
                review: existingReview,
            });
        }

        // Otherwise, create a new review
        const newReview = new Review({ rating, title, comment, user });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Like a review
router.post('/like/:id', async (req, res) => {
    const { user } = req.body;

    try {
        const review = await Review.findById(req.params.id);

        // Check if the user has already liked the review
        if (review.likedBy.includes(user)) {
            return res.status(400).json({ message: 'You have already liked this review.' });
        }

        // Otherwise, update the like count and add user to likedBy array
        review.likes += 1;
        review.likedBy.push(user);
        const updatedReview = await review.save();

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an existing review
router.put('/:id', async (req, res) => {
    const { rating, title, comment, user } = req.body;

    try {
        const review = await Review.findOne({ _id: req.params.id, user });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or you do not have permission to edit this review.' });
        }

        // Update review fields
        review.rating = rating;
        review.title = title;
        review.comment = comment;

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a review
router.delete('/:id', async (req, res) => {
    // console.log("Delete request received for review id:", req.params.id); // Add this log
    const { user } = req.body;

    try {
        const review = await Review.findOne({ _id: req.params.id, user });

        if (!review) {
            // console.log('Review not found or no permission to delete');
            return res.status(404).json({ message: 'Review not found or you do not have permission to delete this review.' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully.' });
    } catch (error) {
        // console.error('Error while deleting review:', error); // Log any server-side errors
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
