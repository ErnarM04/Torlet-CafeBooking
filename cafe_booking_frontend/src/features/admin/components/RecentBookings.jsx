import React from "react";

function RecentBookings(){
    return (
        <div className="bg-white p-6.25 flex flex-col gap-4">
            <p className="text-base text-[#3D3935] font-semibold text-start">Recent Bookings</p>
            <table className="d-table">
                <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Date & Time</th>
                    <th>Table</th>
                    <th>Guests</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody className="text-sm text-[#3D3935] font-medium">
                <tr>
                    <th>BK001</th>
                    <td>Sarah Johnson</td>
                    <td>1/12/2024 12:00</td>
                    <td>Table 5</td>
                    <td>4</td>
                    <td><span className="d-badge d-badge-pending">Confirmed</span></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default RecentBookings;