import React from "react";
import { Calendar } from "lucide-react";

function Home(){
    return (
        <div className="min-w-5xl mx-auto px-6 py-12 flex flex-col justify-center gap-12">
            <div className="text-start">
                <p className="text-4xl text-[#5D4E37]">Welcome back, Guest User!</p>
                <p className="text-lg text-[#7D6E5C]">Ready to enjoy a cozy moment at Café Cozy?</p>
            </div>
            <button className="d-btn d-btn-primary text-xl font-normal py-6.25">Book a Table</button>
            <div className="bg-white rounded-2xl py-12 gap-2 border border-[#E8DFD0] shadow flex flex-col items-center">
                <div className="bg-[#FAF7F2] rounded-full p-4 w-fit">
                    <Calendar size={32} color="#8B6F47"/>
                </div>
                <p className="text-xl text-[#5D4E37]">No upcoming bookings</p>
                <p className="text-base text-[#7D6E5C]">Book your table now and enjoy our cozy atmosphere!</p>
                <button className="d-btn d-btn-primary text-base font-normal">Book a Table</button>
            </div>
        </div>
    );
}

export default Home;