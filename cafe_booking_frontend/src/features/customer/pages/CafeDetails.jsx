import { Clock, Globe, LayoutGrid, MapPin, Phone, Star, Users } from "lucide-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuth from "../../../hooks/useAuth";
import useRestaurants from "../../../hooks/useRestaurants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const CAFES_API_URL = `${API_BASE_URL}/cafes`;

export default function CafeDetails() {

    const {
      loading,
      error,
      fetchRestaurants,
      getRestaurantById,
      fetchLocations,
      getLocations,
      locationsLoading,
      locationsError,
      fetchTablesForLocation,
      getTablesForLocation,
      tablesLoading,
      tablesError,
      updateRestaurant,
    } = useRestaurants();
    const { access, first_name, last_name, isLoggedIn } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState("");
    const [reviewForm, setReviewForm] = useState({
      rating: "5",
      text: "",
    });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitError, setReviewSubmitError] = useState("");
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;
    const restaurant = getRestaurantById(id);
    const locations = getLocations(id);
    const primaryLocation = locations[0];
    const tables = primaryLocation?.location_id
      ? getTablesForLocation(primaryLocation.location_id)
      : null;

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    useEffect(() => {
      if (id) fetchLocations(id);
    }, [id, fetchLocations]);

    useEffect(() => {
      if (primaryLocation?.location_id) {
        fetchTablesForLocation(primaryLocation.location_id);
      }
    }, [primaryLocation?.location_id, fetchTablesForLocation]);

    useEffect(() => {
      if (!id) return;

      const fetchReviews = async () => {
        setReviewsLoading(true);
        setReviewsError("");

        try {
          const response = await axios.get(`${CAFES_API_URL}/restaurants/${id}/reviews/`);
          setReviews(response.data || []);
        } catch (err) {
          setReviewsError(
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Failed to load reviews"
          );
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchReviews();
    }, [id]);

    const handleReviewChange = (event) => {
      const { name, value } = event.target;
      setReviewForm((current) => ({ ...current, [name]: value }));
    };

    const handleReviewSubmit = async (event) => {
      event.preventDefault();
      setReviewSubmitError("");
      setReviewSubmitting(true);

      try {
        const response = await axios.post(`${CAFES_API_URL}/restaurants/${id}/reviews/`, {
          rating: Number(reviewForm.rating),
          text: reviewForm.text,
        }, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        const newReview = response.data;
        setReviews((current) => [newReview, ...current]);
        updateRestaurant(id, {
          rating: newReview.restaurant_rating,
          total_reviews: newReview.restaurant_total_reviews,
        });
        setReviewForm({ rating: "5", text: "" });
      } catch (err) {
        const data = err.response?.data;
        const firstFieldError = data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "";
        setReviewSubmitError(
          firstFieldError ||
          err.response?.data?.detail ||
          err.message ||
          "Failed to submit review"
        );
      } finally {
        setReviewSubmitting(false);
      }
    };
    
    if (loading || !id) {
      return <div className="p-6">Loading restaurant...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-600">Failed to load restaurant: {error}</div>;
    }

    if (!restaurant) {
      return <div className="p-6">Restaurant not found.</div>;
    }

  return (
    <div className="flex flex-col gap-6 flex-1 bg-[#FAF7F2] py-4 sm:py-6 px-4 sm:px-8 md:px-12 max-w-5xl w-full mx-auto min-w-0">

      {/* HERO */}
    <div
        className="relative rounded-2xl shadow overflow-hidden h-48 sm:h-64 bg-black/40 bg-cover bg-center bg-blend-overlay"
        style={{
        backgroundImage:"url('https://fruitbasket.limepack.com/blog/wp-content/uploads/2024/03/modern-cafe-house.jpg')",}}>
        <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex items-end p-6 text-white">
                <div className="flex w-full justify-between items-end flex-col md:flex-row gap-4">
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-start">
                        {restaurant.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                            <Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
                            <span className="font-medium">{restaurant.rating}</span>
                            <span className="text-sm text-white/80">({restaurant.total_reviews} reviews) • {restaurant.cuisine_type}</span>
                        </div>
                    </div>
                    <button className="d-btn d-btn-primary text-base font-normal rounded-xl w-full sm:w-auto shrink-0"
                    onClick={() => {navigate("booking")}}>
                        Book a Table
                    </button>
                </div>
            </div>
        </div>
 

      {/* ABOUT */}
      <div className="rounded-2xl text-start bg-white border border-[#E8DFD0] shadow p-4 sm:p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-3">About</p>
        <p className="text-[#7D6E5C] text-base leading-relaxed">
          A warm and inviting café nestled in the heart of downtown. We
          specialize in artisan coffee, freshly baked pastries, and a cozy
          atmosphere perfect for meetings, studying, or catching up with
          friends.
        </p>
      </div>

      {/* TABLES */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="h-6 w-6 text-[#8B6F47]" aria-hidden />
          <p className="text-[#5D4E37] text-xl font-semibold">Tables</p>
        </div>
        {tablesLoading ? (
          <p className="text-[#7D6E5C] text-sm">Loading tables…</p>
        ) : tablesError ? (
          <p className="text-red-600 text-sm">{tablesError}</p>
        ) : !primaryLocation?.location_id ? (
          <p className="text-[#7D6E5C] text-sm">Pick a location to see tables.</p>
        ) : tables === null ? (
          <p className="text-[#7D6E5C] text-sm">Loading tables…</p>
        ) : tables.length === 0 ? (
          <p className="text-[#7D6E5C] text-sm">No tables listed for this location yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map((table) => (
              <li
                key={table.table_id}
                className="flex flex-col gap-1 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#5D4E37] font-medium">
                    Table {table.table_number}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[#8B6F47]">
                    {table.table_type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#7D6E5C]">
                  <Users className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    {table.min_guests}–{table.max_guests} guests
                  </span>
                </div>
                {table.description ? (
                  <p className="text-xs text-[#7D6E5C] line-clamp-2">{table.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DETAILS */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-4 sm:p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-6">Details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <DetailItem
            icon={<MapPin size={20} />}
            title="Address"
            value={primaryLocation?.address || (locationsLoading ? "Loading..." : "Address not available")}
          />

          <DetailItem
            icon={<Clock size={20} />}
            title="Hours"
            value={primaryLocation?.opening_hours || (locationsLoading ? "Loading..." : "Hours not available")}
          />

          <DetailItem
            icon={<Phone size={20} />}
            title="Phone"
            value="+7 (777) 777-77-77"
          />

          <DetailItem
            icon={<Globe size={20} />}
            title="Website"
            value={locationsError ? "Website unavailable" : "www.cozycornercafe.com"}
          />
        </div>
      </div>

      {/* REVIEWS */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <p className="text-[#5D4E37] text-xl font-semibold">Reviews</p>
            <p className="text-[#7D6E5C] text-sm">
              Share your experience about this cafe.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#5D4E37]">
            <Star size={18} className="text-yellow-500 fill-yellow-500 shrink-0" />
            <span className="font-medium">{restaurant.rating || 0}</span>
            <span className="text-sm text-[#7D6E5C]">({restaurant.total_reviews || 0})</span>
          </div>
        </div>

        <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 gap-4 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[#5D4E37]">Review author</span>
            <p className="text-sm text-[#7D6E5C]">
              {isLoggedIn
                ? `${first_name} ${last_name}`.trim() || "Your account"
                : "Log in to leave a review from your account."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-[#5D4E37]">Rating</span>
              <select
                className="d-select d-select-bordered w-full bg-white"
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
                required
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Terrible</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[#5D4E37]">Review text</span>
            <textarea
              className="d-textarea d-textarea-bordered min-h-28 w-full bg-white"
              name="text"
              value={reviewForm.text}
              onChange={handleReviewChange}
              placeholder="What did you like about this cafe?"
              required
            />
          </label>

          {reviewSubmitError ? (
            <p className="text-sm text-red-600">{reviewSubmitError}</p>
          ) : null}

          <button
            className="d-btn d-btn-primary rounded-xl w-full sm:w-fit"
            type="submit"
            disabled={reviewSubmitting || !isLoggedIn}
          >
            {reviewSubmitting ? "Sending..." : "Submit Review"}
          </button>
        </form>

        {reviewsLoading ? (
          <p className="text-[#7D6E5C] text-sm">Loading reviews...</p>
        ) : reviewsError ? (
          <p className="text-red-600 text-sm">{reviewsError}</p>
        ) : reviews.length === 0 ? (
          <p className="text-[#7D6E5C] text-sm">No reviews yet. Be the first to leave one.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li
                key={review.review_id}
                className="rounded-xl border border-[#E8DFD0] bg-white px-4 py-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#5D4E37]">{review.name}</p>
                    <p className="text-xs text-[#9A8A78]">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-[#5D4E37]">
                    <Star size={16} className="text-yellow-500 fill-yellow-500 shrink-0" />
                    <span>{review.rating}/5</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#7D6E5C] break-words">
                  {review.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon, title, value }) {
  return (
    <div className="flex gap-4 items-start text-start">
      <div className="p-3 bg-[#8B6F47]/10 rounded-xl text-[#8B6F47]">
        {icon}
      </div>
      <div>
        <p className="text-[#5D4E37] font-medium">{title}</p>
        <p className="text-[#7D6E5C] text-sm break-words">{value}</p>
      </div>
    </div>
  );
}
