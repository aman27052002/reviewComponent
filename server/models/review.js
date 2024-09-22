// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    user: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],  
    date: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
