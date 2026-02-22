import React from "react";
import BookingCard from "../components/BookingCard";

function BookingsHistory(){
    return (
        <div className="w-full flex justify-center bg-[#FAF7F2]">
            <div className="max-w-5xl w-full flex flex-col py-12 px-4 md:px-6 gap-8">
                <p className="text-[#5D4E37] text-3xl text-start">Book a Table</p>
                <div className="grid grid-cols-2 gap-8">
                    <BookingCard></BookingCard>
                    <BookingCard></BookingCard>
                </div>
            </div>
        </div>
    );
}

export default BookingsHistory;