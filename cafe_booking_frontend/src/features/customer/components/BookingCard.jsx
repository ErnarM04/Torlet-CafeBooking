import { Clock, Users, MapPin } from "lucide-react";
import React from "react";

function BookingCard(){
    return (
        <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6.25 flex flex-col gap-4">
            <div className="flex flex-row justify-between">
                <p className="text-[18px] text-[#5D4E37]">Wed, Dec 2, 2026</p>
                <span className="d-badge d-badge-success">Confirmed</span>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                    <Clock className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Time</p>
                        <p className="text-[#5D4E37] text-sm">09:00 AM</p>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <Users className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Guests</p>
                        <p className="text-[#5D4E37] text-sm">2 people</p>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <MapPin className="bg-[#FAF7F2] rounded-[10px] p-2.5" size={36} color="#8B6F47"/>
                    <div className="text-start">
                        <p className="text-[#7D6E5C] text-xs">Table</p>
                        <p className="text-[#5D4E37] text-sm">Table #2</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingCard;