import { Clock, Users, MapPin } from "lucide-react";
import React from "react";

function BookingCard({ booking, onCancel }) {
    const statusClassMap = {
        confirmed: "d-badge-success",
        pending: "d-badge-pending",
        cancelled: "d-badge-declined",
        completed: "d-badge-success",
    };

    const dateText = booking?.booking_date
        ? new Date(booking.booking_date).toLocaleDateString()
        : "Unknown date";

    const statusClass = statusClassMap[booking?.status] || "d-badge-pending";

    return (
        <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6.25 flex flex-col gap-4">
            <div className="flex flex-row flex-wrap justify-between items-center gap-2">
                <p className="text-[18px] text-[#5D4E37] min-w-0 break-words">{dateText}</p>
                <span className={`d-badge shrink-0 ${statusClass}`}>{booking?.status || "pending"}</span>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                    <Clock className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Time</p>
                        <p className="text-[#5D4E37] text-sm">{booking?.booking_time || "N/A"}</p>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <Users className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Guests</p>
                        <p className="text-[#5D4E37] text-sm">{booking?.number_of_guests || 0} people</p>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <MapPin className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Table</p>
                        <p className="text-[#5D4E37] text-sm">{booking?.table ? `Table #${booking.table}` : "Auto-assign"}</p>
                    </div>
                </div>
            </div>
            {booking?.status !== "cancelled" && booking?.status !== "completed" ? (
                <button
                    className="d-btn rounded-[10px] bg-[#FAF7F2] text-[#5D4E37] font-normal"
                    onClick={() => onCancel?.(booking.booking_id)}
                >
                    Cancel booking
                </button>
            ) : null}
        </div>
    );
}

export default BookingCard;