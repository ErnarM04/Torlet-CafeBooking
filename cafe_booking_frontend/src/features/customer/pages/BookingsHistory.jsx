import React, { useEffect } from "react";
import { Navigate } from "react-router";
import BookingCard from "../components/BookingCard";
import useBookings from "../../../hooks/useBookings";
import useAuth from "../../../hooks/useAuth";

function BookingsHistory(){
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const { bookings, loading, error, fetchBookings, cancelBooking } = useBookings();

    useEffect(() => {
        if (isLoggedIn) {
            fetchBookings();
        }
    }, [isLoggedIn, fetchBookings]);

    if (!isLoggedIn) return <Navigate to="/customer/login" replace />;

    return (
        <div className="w-full flex flex-1 justify-center bg-[#FAF7F2] min-w-0">
            <div className="max-w-5xl w-full flex flex-col py-8 sm:py-12 px-4 md:px-6 gap-6 sm:gap-8 min-w-0">
                <p className="text-[#5D4E37] text-2xl sm:text-3xl text-start">My Bookings</p>
                {loading ? <span className="d-loading d-loading-dots"></span> : null}
                {error ? <p className="text-red-600 text-start">{error}</p> : null}
                {!loading && bookings.length === 0 ? (
                    <p className="text-[#7D6E5C] text-start">No bookings yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.booking_id}
                                booking={booking}
                                onCancel={cancelBooking}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingsHistory;