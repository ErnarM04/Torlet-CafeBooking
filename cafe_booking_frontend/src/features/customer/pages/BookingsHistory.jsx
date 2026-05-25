import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { Bell } from "lucide-react";
import BookingCard from "../components/BookingCard";
import useBookings from "../../../hooks/useBookings";
import useAuth from "../../../hooks/useAuth";

function BookingsHistory(){
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const {
        bookings,
        loading,
        error,
        fetchBookings,
        cancelBooking,
        notifications,
        notificationsLoading,
        notificationsError,
        fetchNotifications,
        markNotificationRead,
    } = useBookings();

    useEffect(() => {
        if (isLoggedIn) {
            fetchBookings();
            fetchNotifications();
        }
    }, [isLoggedIn, fetchBookings, fetchNotifications]);

    if (!isLoggedIn) return <Navigate to="/customer/login" replace />;

    return (
        <div className="w-full flex flex-1 justify-center bg-[#FAF7F2] min-w-0">
            <div className="max-w-5xl w-full flex flex-col py-8 sm:py-12 px-4 md:px-6 gap-6 sm:gap-8 min-w-0">
                <p className="text-[#5D4E37] text-2xl sm:text-3xl text-start">My Bookings</p>
                <section className="rounded-2xl border border-[#E8DFD0] bg-white p-4 sm:p-6 text-start">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-[#8B6F47]" aria-hidden />
                            <p className="text-[#5D4E37] text-xl font-semibold">Notifications</p>
                        </div>
                        <span className="text-sm text-[#7D6E5C]">
                            {notifications.filter((item) => !item.is_read).length} unread
                        </span>
                    </div>
                    {notificationsLoading ? (
                        <span className="d-loading d-loading-dots"></span>
                    ) : notificationsError ? (
                        <p className="text-sm text-red-600">{notificationsError}</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-sm text-[#7D6E5C]">No notifications yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.notification_id}
                                    className={`rounded-xl border px-4 py-3 ${
                                        notification.is_read
                                            ? "border-[#E8DFD0] bg-white"
                                            : "border-[#D4B896] bg-[#FAF7F2]"
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="font-medium text-[#5D4E37]">{notification.title}</p>
                                            <p className="mt-1 text-sm text-[#7D6E5C] break-words">{notification.message}</p>
                                            <p className="mt-2 text-xs text-[#9A8A78]">
                                                {notification.booking_number} · {notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}
                                            </p>
                                        </div>
                                        {!notification.is_read ? (
                                            <button
                                                className="d-btn d-btn-sm rounded-lg bg-white text-[#5D4E37]"
                                                type="button"
                                                onClick={() => markNotificationRead(notification.notification_id)}
                                            >
                                                Mark read
                                            </button>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
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
