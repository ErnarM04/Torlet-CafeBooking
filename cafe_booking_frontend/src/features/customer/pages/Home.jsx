import React from "react";
import { Calendar, Clock } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";

function Home(){

    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const firstName = useAuth((state) => state.first_name);
    const navigate = useNavigate();

    return (
        <div className="min-w-5xl mx-auto px-6 py-12 flex flex-col justify-center gap-12">
            <div className="text-start">
                {isLoggedIn ? 
                <p className="text-4xl text-[#5D4E37]">Welcome back, {firstName}!</p> :
                <p className="text-4xl text-[#5D4E37]">Welcome to Cafe Cozy!</p>
                }
                <p className="text-lg text-[#7D6E5C]">Ready to enjoy a cozy moment at Café Cozy?</p>
            </div>
            <button onClick={() => navigate("cafes")} className="d-btn d-btn-primary text-xl font-normal py-6.25">Book a Table</button>
            {isLoggedIn ?
            <div className="bg-white rounded-2xl py-12 gap-2 border border-[#E8DFD0] shadow flex flex-col items-center">
                <div className="bg-[#FAF7F2] rounded-full p-4 w-fit">
                    <Calendar size={32} color="#8B6F47"/>
                </div>
                <p className="text-xl text-[#5D4E37]">No upcoming bookings</p>
                <p className="text-base text-[#7D6E5C]">Book your table now and enjoy our cozy atmosphere!</p>
                <button className="d-btn d-btn-primary text-base font-normal">Book a Table</button>
            </div> :
            <div className="bg-white rounded-2xl px-10 py-12 gap-6 border border-[#E8DFD0] shadow flex flex-col">
                <p className="text-[#5D4E37] text-[28px] font-bold text-start">Why Choose Cafe Cozy?</p>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col gap-3 items-center">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">Easy Booking</p>
                        <p className="text-[#7D6E5C] text-base">Reserve your table in just a few clicks</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">Easy Booking</p>
                        <p className="text-[#7D6E5C] text-base">Reserve your table in just a few clicks</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">Easy Booking</p>
                        <p className="text-[#7D6E5C] text-base">Reserve your table in just a few clicks</p>
                    </div>
                </div>
            </div>}
            <div>
                
            </div>
        </div>
    );
}

export default Home;