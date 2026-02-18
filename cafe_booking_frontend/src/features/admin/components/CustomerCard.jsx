import React from "react";
import { Mail, Phone, Calendar } from "lucide-react";

function CustomerCard(){
    return (
        <div className="w-98.5 p-6.25 flex flex-col gap-4 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
            <div className="flex justify-between">
                <p className="select-none w-12 h-12 rounded-full bg-[#8B6F47] text-lg font-semibold text-white flex items-center justify-center">SJ</p>
                <div className="text-right">
                    <p className="text-[#7A7269]">Total Bookings</p>
                    <p className="text-[#8B6F47] text-2xl font-semibold">12</p>
                </div>
            </div>
            <p className="text-base text-[#3D3935] font-semibold text-left">Sarah Johnson</p>
            <div className="flex flex-col gap-2 items-start">
                <p className="text-[#7A7269] text-sm flex gap-2 items-center"><Mail size={16} color="#7A7269" strokeWidth={1.33}/>sarah.j@email.com</p>
                <p className="text-[#7A7269] text-sm flex gap-2"><Phone size={16} color="#7A7269" strokeWidth={1.33}/>+1 234-567-8901</p>
                <p className="text-[#7A7269] text-sm flex gap-2"><Calendar size={16} color="#7A7269" strokeWidth={1.33}/>Last visit: 1/12/2024</p>
            </div>
        </div>
    );
}

export default CustomerCard;