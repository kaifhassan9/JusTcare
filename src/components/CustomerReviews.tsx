"use client";

import { useState } from "react";

type Review = {
  id: number;
  userName: string;
  rating: number;
  date: string;
  packSize?: string;
  comment: string;
  likes: number;
};

interface CustomerReviewsProps {
  productId?: number;
  // Pass existing reviews fetched from your backend API
  initialReviews?: Review[];
}

export default function CustomerReviews({
  productId,
  initialReviews = [
    {
      id: 1,
      userName: "Anonymous",
      rating: 5,
      date: "May 21, 2026",
      packSize: "2×125 gm Soap",
      comment: "Superb product, very gentle on skin and long lasting.",
      likes: 3,
    },
    {
      id: 2,
      userName: "Anonymous",
      rating: 5,
      date: "Apr 19, 2026",
      packSize: "2×125 gm Soap",
      comment: "Smell and Quality is so good. Go for it without hesitation!",
      likes: 2,
    },
    {
      id: 3,
      userName: "Nani",
      rating: 4,
      date: "Mar 11, 2026",
      packSize: "125 gm Soap",
      comment: "Delivery was fast and packaging was intact.",
      likes: 1,
    },
  ],
}: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate dynamic stats from real reviews array
  const totalRatings = reviews.length;
  const averageRating = totalRatings
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
    : "0.0";

  const getRatingCount = (stars: number) =>
    reviews.filter((r) => Math.round(r.rating) === stars).length;

  const getPercentage = (stars: number) =>
    totalRatings ? Math.round((getRatingCount(stars) / totalRatings) * 100) : 0;

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const newEntry: Review = {
      id: Date.now(),
      userName: userName.trim() || "Anonymous",
      rating: newRating,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      comment: newComment,
      likes: 0,
    };

    // Replace this local state update with your backend API POST call
    // await fetch('/api/reviews', { method: 'POST', body: JSON.stringify({ productId, ...newEntry }) });
    setReviews([newEntry, ...reviews]);

    // Reset Form
    setNewComment("");
    setUserName("");
    setShowWriteForm(false);
    setIsSubmitting(false);
  };

  return (
    <section className="rounded-2xl border border-[#D5CDBF] bg-white p-6 sm:p-8 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EBE5D8]">
        <h2 className="text-xl font-bold text-[#2C3325]">Customer Reviews</h2>
        <button
          onClick={() => setShowWriteForm(!showWriteForm)}
          className="flex items-center gap-2 text-sm font-semibold text-[#6B7256] hover:text-[#525841] transition"
        >
          <span className="text-lg">✏️</span>
          {showWriteForm ? "Close Form" : "Write a Review"}
        </button>
      </div>

      {/* Write Review Collapsible Form */}
      {showWriteForm && (
        <form
          onSubmit={handleSubmitReview}
          className="my-6 rounded-xl border border-[#D5CDBF] bg-[#FAF8F5] p-5 shadow-inner"
        >
          <h3 className="text-sm font-bold text-[#2C3325] mb-3">Write Your Review</h3>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#5A564A] mb-1">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`text-2xl transition ${
                    star <= newRating ? "text-[#6B7256]" : "text-[#D5CDBF]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-[#D5CDBF] bg-white p-2.5 text-sm outline-none focus:border-[#6B7256]"
            />
          </div>

          <div className="mb-4">
            <textarea
              required
              rows={3}
              placeholder="Share your experience with this product..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-xl border border-[#D5CDBF] bg-white p-3 text-sm outline-none focus:border-[#6B7256]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#6B7256] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#525841] transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Rating Breakdown Section */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-8">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#EBE5D8] pb-6 md:pb-0 md:pr-8">
          <span className="text-5xl font-extrabold text-[#2C3325]">
            {averageRating}
          </span>
          <div className="my-2 flex gap-1 text-[#6B7256] text-lg">
            {"★".repeat(Math.round(Number(averageRating)))}
            {"☆".repeat(5 - Math.round(Number(averageRating)))}
          </div>
          <span className="text-xs text-[#8B8570] font-medium">
            {totalRatings} Ratings, {reviews.length} Reviews
          </span>
        </div>

        {/* Right: Star Progress Bars */}
        <div className="space-y-2 max-w-lg">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = getPercentage(stars);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-[#5A564A]">
                <span className="w-5 text-right flex items-center justify-end gap-0.5">
                  {stars} <span className="text-[10px]">★</span>
                </span>
                <div className="h-2 flex-1 rounded-full bg-[#EBE5D8] overflow-hidden">
                  <div
                    className="h-full bg-[#6B7256] transition-all duration-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#8B8570]">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Cards List (Horizontal Scrollable like Apollo UI) */}
      {reviews.length === 0 ? (
        <p className="text-center text-sm text-[#8B8570] py-8">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#D5CDBF]">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Card Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE5D8] text-xs font-bold text-[#6B7256]">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2C3325] leading-tight">
                          {rev.userName}
                        </h4>
                        <p className="text-[10px] text-[#8B8570]">
                          Posted on {rev.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5 rounded-lg bg-[#6B7256] px-2 py-0.5 text-xs font-bold text-white">
                        {rev.rating} ★
                      </span>
                      <button className="flex items-center gap-1 rounded-lg border border-[#D5CDBF] bg-white px-2 py-0.5 text-xs text-[#5A564A] hover:bg-[#EBE5D8] transition">
                        👍 <span className="text-[10px]">{rev.likes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Pack/Variant Detail */}
                  {rev.packSize && (
                    <p className="mt-3 text-[11px] font-medium text-[#8B8570]">
                      Pack: {rev.packSize}
                    </p>
                  )}

                  {/* Comment */}
                  <p className="mt-2 text-xs text-[#2C3325] line-clamp-3 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Action Button */}
      <div className="mt-6 flex justify-center">
        <button className="rounded-xl border border-[#6B7256] px-6 py-2.5 text-xs font-bold text-[#6B7256] hover:bg-[#6B7256] hover:text-white transition flex items-center gap-2">
          View All Reviews <span>›</span>
        </button>
      </div>
    </section>
  );
}