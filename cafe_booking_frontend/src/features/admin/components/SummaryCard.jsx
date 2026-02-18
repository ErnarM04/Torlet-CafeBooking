import React from "react";
import { TrendingUp, Clock, Users } from "lucide-react";

function SummaryCard(){
    return (
        <div className="flex flex-col items-start border border-[#8B6F47]/15 bg-white rounded-2xl shadow p-6.25">
            <TrendingUp className="w-10 h-10 p-2 bg-[#DCFCE7] rounded-xl" color="#00A63E"/>
            <p className="text-[#3D3935] text-base font-semibold">Weekend Bookings Up</p>
            <p className="text-[#7A7269] text-sm text-left">Weekend bookings increased by 23% this month. Consider extending operating hours.</p>
        </div>
    );
}

export default SummaryCard;