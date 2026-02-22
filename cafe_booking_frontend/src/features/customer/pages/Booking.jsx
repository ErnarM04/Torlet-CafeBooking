import React, { useState } from "react";
import { Calendar, Clock, Users, Check } from "lucide-react";

function Booking(){

    const [guests, setGuests] = useState(0);

    return (
        <div className="w-full flex justify-center bg-[#FAF7F2]">
            <div className="max-w-5xl w-full flex flex-col py-12 px-4 md:px-6 gap-8">
            <p className="text-[#5D4E37] text-3xl text-start">Book a Table</p>
            <div className="flex flex-row justify-between gap-8">
                <div className="flex flex-col gap-6 items-center w-full">
                <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
                    <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row"><Calendar color="#8B6F47"/>Select date</p>
                    <input className="d-input bg-[#FAF7F2] border border-[#E8DFD0] rounded-[14px]" type="date"/>
                </div>
                <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
                    <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row"><Clock color="#8B6F47"/>Select time</p>
                    <div className="grid grid-cols-3 gap-2 justify-between">
                        <button className="d-btn d-btn-primary h-9 px-3 py-2 text-sm font-normal rounded-[10px]">09:00 AM</button>
                        <button className="d-btn bg-[#FAF7F2] text-sm text-[#5D4E37] h-9 px-3 py-2 font-normal rounded-[10px]">09:00 AM</button>
                        <button className="d-btn bg-[#FAF7F2] text-sm text-[#5D4E37] h-9 px-3 py-2 font-normal rounded-[10px]">09:00 AM</button>
                    </div>
                </div>
                <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
                    <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row"><Users color="#8B6F47"/>Number of Guests</p>
                    <div className="flex flex-row gap-4">
                        <button className="w-10 h-10 bg-[#FAF7F2] rounded-[10px] text-[#5D4E37] text-base d-btn"
                        onClick={() => guests > 0 ? setGuests(guests - 1):{}}>-</button>
                        <p className="text-[#5D4E37] text-2xl">{guests}</p>
                        <button className="w-10 h-10 bg-[#FAF7F2] rounded-[10px] text-[#5D4E37] text-base d-btn"
                        onClick={() => setGuests(guests + 1)}>+</button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
                <div className=" flex flex-col shadow p-6.25 gap-4 w-full bg-white rounded-2xl border border-[#E8DFD0]">
                    <p className="text-start text-xl text-[#5D4E37] gap-2 flex flex-row">Available Tables</p>
                    <ul className="d-list flex flex-col gap-3">
                        <li className="d-list-row flex flex-col border-2 text-start border-[#E8DFD0] rounded-[14px]">
                            <div className="flex flex-col text-start">
                                <p className="text-base text-[#5D4E37]">Table #1</p>
                                <p className="text-sm text-[#7D6E5C]">Corner ● Seats 2</p>
                            </div>
                        </li>
                        <li className="d-list-row flex flex-row justify-between items-center border-2 bg-[#FAF7F2] border-[#8B6F47] rounded-[14px]">
                            <div className="flex flex-col text-start">
                                <p className="text-base text-[#5D4E37]">Table #1</p>
                                <p className="text-sm text-[#7D6E5C]">Corner ● Seats 2</p>
                            </div>
                            <Check className="rounded-full bg-[#8B6F47] p-1" size={24} color="white"/>
                        </li>
                    </ul>
                </div>
                <button className="d-btn d-btn-primary h-14 w-full rounded-[14px] font-normal">Confirm Booking</button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Booking;