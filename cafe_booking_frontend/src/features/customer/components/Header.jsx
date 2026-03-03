import React from "react";
import {Coffee, User} from "lucide-react";
import { Link } from "react-router";
import useAuth from "../../../hooks/useAuth";

function Header(){

    const isLoggedIn = useAuth((state) => state.isLoggedIn);

    return (
        <div className="bg-white border border-[#E8DFD0] shadow flex flex-row py-4 px-84 justify-between">
            <div className="flex flex-row items-center gap-2">
                <Coffee className="p-2 bg-[#8B6F47] rounded-full" color="white" size={40}/>
                <p className="text-xl font-bold text-[#5D4E37]">Cafe Cozy</p>
            </div>
            <div className="flex flex-row items-center gap-8">
                <Link to="/customer/" className="text-sm text-[#7D6E5C] cursor-pointer">Home</Link>
                <Link to="/customer/cafes" className="text-sm text-[#7D6E5C] cursor-pointer">Book a Table</Link>
                <Link to="/customer/history" className="text-sm text-[#7D6E5C] cursor-pointer">My Bookings</Link>
            </div>
            <Link to={isLoggedIn ? "/customer/profile" : "/customer/login"}><User className="p-2 bg-[#E8DFD0] rounded-full" color="#8B6F47" size={40}/></Link>
        </div>
    );
}

export default Header;