import React from "react";
import { Eye } from "lucide-react";

function OrdersTable(){
    return (
        <div>
            <table className="d-table d-table-untitled">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Booking ID</th>
                        <th>Date & Time</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ORD001</td>
                        <td>Sarah Johnson</td>
                        <td>BK001</td>
                        <td><p>1/12/2024</p><p className="addition">12:15</p></td>
                        <td>$40.00</td>
                        <td><span className="d-badge d-badge-preparing">Preparing</span></td>
                        <td><Eye /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default OrdersTable;