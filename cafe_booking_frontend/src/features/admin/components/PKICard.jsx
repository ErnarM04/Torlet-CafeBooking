import React from "react";
import {Calendar} from "lucide-react";

function PKICard(){
    return (
        <div className="flex flex-row p-6.25 w-fit border border-[#8B6F47]/15 bg-white rounded-2xl">
            <div className="flex flex-col items-start h-22 w-47">
                <p className="text-sm text-[#7A7269]">Today's Bookings</p>
                <p className="text-3xl text-[#3D3935] font-semibold">0</p>
                <p className="text-sm text-[#00A63E]">↑ 12% from yesterday</p>
            </div>
            <Calendar className="w-12 h-12 bg-[#8B6F47]/10 rounded-xl p-3" color="#8B6F47" />
        </div>
    );
}

export default PKICard;