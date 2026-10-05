import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, ThumbsUp } from 'lucide-react';
import { api } from '../services/api';

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New review form
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [pizzaName, setPizzaName] = useState('Double Cupped Pepperoni & Hot Honey');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await api.getReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!name || !comment) return;

    try {
      setSubmitting(true);
      const res = await api.addReview({
        customer_name: name,
        rating,
        pizza_name: pizzaName,
        comment,
      });

      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          setShowAddModal(false);
          setName('');
          setComment('');
          loadReviews();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 bg-white border-t border-stone-200">
      <div className="container mx-auto px-4">
        
        {/* Title & Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Star className="w-4 h-4 fill-orange-600" />
              <span>Real Customer Love</span>
            </div>
            <h2 className="text-3xl font-black font-serif text-stone-900 tracking-tight">
              What Our Pizza Lovers Say
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Rated 4.9/5 based on over 3,500+ happy neighborhood orders.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 px-5 py-2.5 bg-stone-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-stone-50 rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold uppercase">
                    Verified Buyer
                  </span>
                </div>

                <p className="text-stone-700 text-sm italic leading-relaxed mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-200/60">
                <img
                  src={rev.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.customer_name}`}
                  alt={rev.customer_name}
                  className="w-10 h-10 rounded-full object-cover bg-stone-200 border border-white shadow-xs"
                />
                <div>
                  <h4 className="text-xs font-black text-stone-900">{rev.customer_name}</h4>
                  <p className="text-[11px] text-orange-600 font-medium">Ordered: {rev.pizza_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-black font-serif text-stone-900 mb-1">Share Your Experience</h3>
            <p className="text-xs text-stone-500 mb-4">How was your slice today?</p>

            {successMsg ? (
              <div className="py-8 text-center text-emerald-600 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <h4 className="font-bold text-sm">Thank You for Your Feedback!</h4>
                <p className="text-xs text-stone-500">Your review has been saved.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className={`p-2 rounded-xl border flex items-center gap-1 font-bold ${
                          rating >= num ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-stone-200 text-stone-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${rating >= num ? 'fill-amber-400' : ''}`} />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Gonzalez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Favorite Pizza Ordered</label>
                  <input
                    type="text"
                    value={pizzaName}
                    onChange={(e) => setPizzaName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the crust, sauce, flavor..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
