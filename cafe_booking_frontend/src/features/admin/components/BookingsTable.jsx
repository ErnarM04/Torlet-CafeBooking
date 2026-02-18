import React from "react";
import { Eye, Check, X } from "lucide-react";

function BookingsTable(){
    return (
        <div>
            <table className="d-table d-table-untitled">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Date & Time</th>
                        <th>Table</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>BK001</td>
                        <td><p>Sarah Johnson</p><p className="addition">+1 234-567-8901</p></td>
                        <td><p>1/12/2024</p><p className="addition">12:00</p></td>
                        <td>Table 5</td>
                        <td>4 guests</td>
                        <td><span className="d-badge d-badge-success">Confirmed</span></td>
                        <td className="flex flex-row gap-2"><Eye/><Check color="green"/><X color="red"/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default BookingsTable;