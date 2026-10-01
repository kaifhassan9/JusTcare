"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  requiresPrescription: boolean;
  stockCount: number;
  description: string | null;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const { cart , addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
const isInCart = product ? cart.some((item) => item.id === product.id) : false;

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
const [deleteError, setDeleteError] = useState("");

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.product) {
          setProduct(data.product);
          setSimilarProducts(data.similarProducts || []);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    }
  }

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  // Submit Review Handler
  async function handleSubmitReview() {
    if (newRating === 0 || submittingReview) return;

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setReviewMessage(data?.error || "Failed to submit review.");
        return;
      }

      setNewRating(5);
      setNewComment("");
      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewMessage("Something went wrong.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // Delete Review Handler
async function handleDeleteReview(reviewId: number) {
  setDeletingId(reviewId);
  setDeleteError("");

  try {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });

    if (response.status === 401) {
      setDeleteError("LOGIN_REQUIRED");
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setDeleteError(data?.error || "Failed to delete review.");
      return;
    }

    setConfirmDeleteId(null);
    fetchReviews();
  } catch (err) {
    console.error("Delete review error:", err);
    setDeleteError("Something went wrong while deleting.");
  } finally {
    setDeletingId(null);
  }
} 
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <section className="flex min-h-[60vh] items-center justify-center">
          <p className="text-lg font-semibold text-[#5A564A]">Loading product...</p>
        </section>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <section className="flex min-h-[60vh] items-center justify-center px-4 sm:px-6">
          <div className="rounded-3xl border border-[#D5CDBF] bg-white p-8 sm:p-12 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold text-[#2C3325]">Product Not Found</h1>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#6B7256] hover:underline"
            >
              ← Back to Products
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const totalPrice = product.price * quantity;

   const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        requiresPrescription: product.requiresPrescription,
      },
      quantity
    );
  };

  const getRatingCount = (stars: number) =>
    reviews.filter((r) => Math.round(r.rating) === stars).length;

  const getPercentage = (stars: number) =>
    totalReviews ? Math.round((getRatingCount(stars) / totalReviews) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2C3325] font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-[#2C3325] flex items-center gap-2 overflow-x-auto">
          <Link href="/" className="hover:text-[#6B7256] transition-colors">Home</Link>
          <span className="text-[#9E9584]">/</span>
          <Link href="/products" className="hover:text-[#6B7256] transition-colors">Products</Link>
          <span className="text-[#9E9584]">/</span>
          <span className="font-bold text-[#2C3325] truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-8 lg:gap-12 rounded-3xl border border-[#D5CDBF] bg-white p-6 sm:p-10 shadow-sm md:grid-cols-2 items-center">

          {/* Product Image */}
          <div className="relative flex min-h-[350px] sm:min-h-[420px] items-center justify-center rounded-2xl bg-[#FAF8F5] p-8 overflow-hidden group">
            {product.image?.startsWith("http") ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-8xl sm:text-9xl transition-transform duration-300 group-hover:scale-110">
                {product.image}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7256]">
              {product.category}
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3325]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {product.stockCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B7256]/15 border border-[#6B7256]/30 px-3 py-1 text-xs font-bold text-[#6B7256]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6B7256]"></span>
                  ✓ In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1 text-xs font-bold text-red-600">
                  Out of Stock
                </span>
              )}

              {product.requiresPrescription && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B7355]/15 border border-[#8B7355]/30 px-3 py-1 text-xs font-bold text-[#8B7355]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B7355]"></span>
                  Prescription Required
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9E9584]">Price</p>
              <p className="mt-1 text-3xl font-extrabold text-[#2C3325]">₹{product.price}</p>

              {quantity > 1 && (
                <p className="mt-1.5 text-xs font-medium text-[#5A564A]">
                  ₹{product.price} × {quantity} ={" "}
                  <span className="font-extrabold text-[#2C3325]">₹{totalPrice}</span>
                </p>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#5A564A]">
              {product.description ||
                "This product is available from our pharmacy. Please check the product information and follow the appropriate instructions before use."}
            </p>

            <div className="mt-6">
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} min={1} max={10} />
            </div>

              <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stockCount === 0 || isInCart}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.99] bg-[#6B7256] hover:bg-[#525841] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInCart ? "✓ Added " : "🛒 Add to Cart"}
            </button>

            {product.requiresPrescription && (
              <div className="mt-4 rounded-2xl border border-[#8B7355]/30 bg-[#8B7355]/10 p-4 text-xs leading-relaxed text-[#2C3325] flex items-start gap-2">
                <span>⚠️</span>
                <span>A valid prescription may be required. Our pharmacy team will verify it before fulfilling the order.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#2C3325] mb-6">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group rounded-2xl border border-[#D5CDBF] bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FAF8F5]">
                  {item.image?.startsWith("http") ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-5xl">{item.image}</span>
                  )}
                </div>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7256]">
                  {item.category}
                </p>

                <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[#2C3325] group-hover:text-[#6B7256] transition-colors">
                  {item.name}
                </h3>

                <p className="mt-2 text-lg font-extrabold text-[#2C3325]">
                  ₹{item.price}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/*  Reviews Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-[#D5CDBF] bg-white p-6 sm:p-8 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#EBE5D8]">
            <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#2C3325]">
              Customer Reviews
            </h2>

            <button
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                setReviewMessage("");
              }}
              className="flex items-center gap-2 text-sm font-bold text-[#6B7256] hover:text-[#525841] transition"
            >
              <span className="text-base"><i className="fa-regular fa-pen-to-square"></i></span>
              {showReviewForm ? "Close Form" : "Write a Review"}
            </button>
          </div>

          {/* Form */}
          {showReviewForm && (
            <div className="my-6 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-5 shadow-inner">
              <p className="text-sm font-bold text-[#2C3325] mb-3">Write a review</p>

              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className={`text-2xl transition ${
                      star <= newRating ? "text-[#6B7256]" : "text-[#D5CDBF]"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product (optional)"
                rows={3}
                className="w-full rounded-xl border border-[#D5CDBF] bg-white px-4 py-3 text-sm text-[#2C3325] font-medium placeholder-[#9E9584] outline-none focus:border-[#6B7256]"
              />

              {reviewMessage && (
                <p className="mt-2 text-xs font-semibold text-red-600">{reviewMessage}</p>
              )}

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={newRating === 0 || submittingReview}
                className="mt-3 rounded-xl bg-[#6B7256] px-5 py-2 text-xs font-bold text-white hover:bg-[#525841] disabled:opacity-50 transition"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="my-8 grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-8">
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#EBE5D8] pb-6 md:pb-0 md:pr-8">
              <span className="text-5xl font-extrabold text-[#2C3325]">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
              <div className="my-2 flex gap-1 text-[#6B7256] text-lg">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </div>
              <span className="text-xs text-[#9E9584] font-medium">
                {totalReviews} Ratings, {reviews.length} Reviews
              </span>
            </div>

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
                    <span className="w-8 text-right text-[#9E9584]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

                   {/* Review List */}
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-[#9E9584] py-8">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#D5CDBF]">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-[#D5CDBF] bg-[#FAF8F5] p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE5D8] text-xs font-bold text-[#6B7256]">
                          {(r.user?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#2C3325] leading-tight truncate max-w-[100px]">
                            {r.user?.name || "Anonymous"}
                          </h4>
                          <p className="text-[10px] text-[#9E9584]">
                            Posted on {new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 rounded-lg bg-[#6B7256] px-2 py-0.5 text-xs font-bold text-white">
                          {r.rating} ★
                        </span>

                        <button
                          onClick={() => { setConfirmDeleteId(r.id); setDeleteError(""); }}
                          title="Delete review"
                          className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 active:bg-red-200 transition"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#2C3325] leading-relaxed line-clamp-3">
                      {r.comment || "No written review provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Delete Review Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            {deleteError === "LOGIN_REQUIRED" ? (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6B7256]/10 text-2xl">
                  🔒
                </div>

                <h3 className="mt-4 text-center text-lg font-bold text-[#2C3325]">
                  Please log in
                </h3>
                <p className="mt-1.5 text-center text-sm text-[#5A564A]">
                  You need to be logged in to delete a review.
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => { setConfirmDeleteId(null); setDeleteError(""); }}
                    className="flex-1 rounded-full border border-[#D5CDBF] py-2.5 text-sm font-bold text-[#2C3325] hover:bg-[#FAF8F5] transition"
                  >
                    Cancel
                  </button>
                    
                    <Link
                    href={`/login?redirect=/products/${productId}`}
                    className="flex-1 rounded-full bg-[#6B7256] py-2.5 text-sm font-bold text-white text-center hover:bg-[#525841] transition"
                  >
                    Log In
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
                  🗑️
                </div>

                <h3 className="mt-4 text-center text-lg font-bold text-[#2C3325]">
                  Are you sure?
                </h3>
                <p className="mt-1.5 text-center text-sm text-[#5A564A]">
                  Do you really want to delete this review?
                </p>

                {deleteError && (
                  <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center text-xs font-semibold text-red-600">
                    {deleteError}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => { setConfirmDeleteId(null); setDeleteError(""); }}
                    className="flex-1 rounded-full border border-[#D5CDBF] py-2.5 text-sm font-bold text-[#2C3325] hover:bg-[#FAF8F5] transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleDeleteReview(confirmDeleteId)}
                    disabled={deletingId === confirmDeleteId}
                    className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}