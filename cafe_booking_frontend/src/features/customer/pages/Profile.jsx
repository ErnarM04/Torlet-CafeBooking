import React from "react";
import { User, Mail, Calendar, Clock, Settings } from "lucide-react";
import { Link } from "react-router";

function Profile(){
    return (
        <div className="w-full flex justify-center bg-[#FAF7F2]">
            <div className="max-w-5xl w-full bg-white flex flex-col py-12 px-4 md:px-6 gap-8">
                <p className="text-[#5D4E37] text-3xl text-start">Profile</p>
                <div className="bg-white flex flex-col gap-6 p-8 rounded-2xl shadow">
                    <div className="flex flex-row gap-6 items-center">
                        <User className="bg-[#8B6F47] p-5 rounded-full w-20 h-20" size={40} color="white"/>
                        <div className="text-start">
                            <p className="text-[#5D4E37] text-2xl">Guest User</p>
                            <p className="text-[#7D6E5C] text-base">Cafe Cozy Member</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-row gap-3 items-center">
                            <Mail className="size-12 bg-[#FAF7F2] p-3.5 rounded-[10px]" color="#8B6F47" size={20}/>
                            <div className="text-start">
                                <p className="text-xs text-[#7D6E5C]">Email</p>
                                <p className="text-sm text-[#5D4E37]">nurgalyev.dias@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 items-center">
                            <Calendar className="size-12 bg-[#FAF7F2] p-3.5 rounded-[10px]" color="#8B6F47" size={20}/>
                            <div className="text-start">
                                <p className="text-xs text-[#7D6E5C]">Member Since</p>
                                <p className="text-sm text-[#5D4E37]">January 2026</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 items-center">
                            <Clock className="size-12 bg-[#FAF7F2] p-3.5 rounded-[10px]" color="#8B6F47" size={20}/>
                            <div className="text-start">
                                <p className="text-xs text-[#7D6E5C]">Last Visit</p>
                                <p className="text-sm text-[#5D4E37]">No visits yet</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white flex flex-col gap-6 p-8 rounded-2xl shadow">
                    <p className="text-[20px] text-[#5D4E37] text-start">Recent Booking History</p>
                    <div>
                        <p className="text-base text-[#7D6E5C]">No booking history yet</p>
                    </div>
                </div>
                <Link 
                className="text-base text-[#8B6F47] cursor-pointer flex flex-row items-center justify-center gap-2"
                to="/customer/profile/settings"
                >Go to Settings <Settings color="#8B6F47"/></Link>
            </div>
        </div>
    );
}

export default Profile;