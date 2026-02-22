import React from "react";
import { Search, Plus } from "lucide-react";
import OrdersTable from "../components/OrdersTable";

function Orders(){
    return (
        <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-row justify-between">
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
                    <label className="d-input w-full bg-white outline-none rounded-xl border border-[#8B6F47]/15 p-2.5 text-base text-[#3D3935]">
                        <Search size={20} color="#7A7269"/>
                        <input type="text" placeholder="Search Bookings..."/>
                    </label>
                    <input type="datetime-local" className="d-input outline-none bg-white rounded-xl border border-[#8B6F47]/15 p-2.5 text-base text-[#3D3935]"/>
                    <select defaultValue="Status" className="d-select d-select-primary">
                        <option>All</option>
                        <option>Confirmed</option>
                        <option>Pending</option>
                        <option>Declined</option>
                    </select>
                </div>
                
                <button className="d-btn d-btn-primary rounded-xl text-base font-normal"><Plus size={20}/>New Booking</button>
            </div>
            <OrdersTable className="border border-[#8B6F47]/15"></OrdersTable>
        </div>
    );
}

export default Orders;