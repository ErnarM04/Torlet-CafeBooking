import React from "react";
import CustomerCard from "../components/CustomerCard";
import { Search } from "lucide-react";

export default function Customers(){
    return (
        <div className="p-8 flex flex-col gap-6">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
                <label className="d-input w-full bg-white outline-none rounded-xl border border-[#8B6F47]/15 p-2.5 text-base text-[#3D3935]">
                    <Search size={20} color="#7A7269"/>
                    <input type="text" placeholder="Search Customers..."/>
                </label>
                <input type="datetime-local" className="d-input outline-none bg-white rounded-xl border border-[#8B6F47]/15 p-2.5 text-base text-[#3D3935]"/>
                <select defaultValue="Status" className="d-select d-select-primary">
                    <option>All</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Declined</option>
                </select>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <CustomerCard/>
                <CustomerCard/>
                <CustomerCard/>
                <CustomerCard/>
                <CustomerCard/>
                <CustomerCard/>
            </div>
        </div>
    );
}