import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductReview.css';

const ProductReview = () => {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ id: '', rating: 0, title: '', comment: '' });
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUser = 'currentuser'; // Simulating logged-in user

  // Fetch reviews from backend
  useEffect(() => {
    axios.get('http://localhost:3000/api/reviews')
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });
  }, []);

  // Handle new review submission
  const handleReviewSubmit = () => {
    if (editMode) {
      // Update the existing review
      axios.put(`http://localhost:3000/api/reviews/${newReview.id}`, {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        user: currentUser
      }).then(response => {
        setReviews(reviews.map(review => 
          review._id === response.data._id ? response.data : review
        ));
        setShowReviewForm(false);
        setNewReview({ id: '', rating: 0, title: '', comment: '' });
        setEditMode(false);
      }).catch(error => {
        console.error('Error updating review:', error);
        setErrorMessage('Failed to update review. Please try again.');
      });
    } else {
      // Post a new review
      axios.post('http://localhost:3000/api/reviews', {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        user: currentUser
      }).then(response => {
        setReviews([...reviews, response.data]);
        setShowReviewForm(false);
        setNewReview({ id: '', rating: 0, title: '', comment: '' });
      }).catch(error => {
        if (error.response && error.response.data.review) {
          setNewReview({
            id: error.response.data.review._id,
            rating: error.response.data.review.rating,
            title: error.response.data.review.title,
            comment: error.response.data.review.comment
          });
          setEditMode(true);
          setShowReviewForm(true);
          setErrorMessage(error.response.data.message);
        } else {
          console.error('Error submitting review:', error);
        }
      });
    }
  };

  // Handle like button click
  const handleLike = (id) => {
    axios.post(`http://localhost:3000/api/reviews/like/${id}`, { user: currentUser })
      .then(response => {
        setReviews(reviews.map(review => 
          review._id === id ? { ...review, likes: response.data.likes } : review
        ));
      })
      .catch(error => {
        if (error.response) {
          setErrorMessage(error.response.data.message);
        }
      });
  };

  // Handle star rating click
  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  // Function to start editing a review
  const handleEdit = (review) => {
    setNewReview({
      id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
    setEditMode(true);
    setShowReviewForm(true);
  };

  // Handle delete review
  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/api/reviews/${id}`, {
      data: { user: currentUser }  // Pass 'user' in the data object
    })
      .then(() => {
        setReviews(reviews.filter(review => review._id !== id));
      })
      .catch(error => {
        console.error('Error deleting review:', error);
      });
  };
  

  return (
    <div className="product-reviews">
      <h2>Ratings & Reviews</h2>
      <div className="rating-summary">
        <div className="write-review">
          <button onClick={() => setShowReviewForm(!showReviewForm)}>
            {editMode ? 'Edit Your Review' : 'Write Review'}
          </button>
          {showReviewForm && (
            <div className="review-form">
              <h4>{editMode ? 'Edit your review' : 'How would you like to rate this product?'}</h4>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${newReview.rating >= star ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Review Title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              />
              <textarea
                placeholder="Write your comment..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              ></textarea>
              <button onClick={handleReviewSubmit}>
                {editMode ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`star ${review.rating >= star ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="review-title">{review.title}</span>
            </div>
            <p>{review.comment}</p>
            <div className="review-footer">
              <span>{review.user}</span> | <span>{review.date}</span> | 
              <span className="like-button" onClick={() => handleLike(review._id)}>
                👍 {review.likes}
              </span>
              <button onClick={() => handleEdit(review)}>Edit</button>
              <button onClick={() => handleDelete(review._id)}>Delete</button> {/* Add delete button */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReview;
