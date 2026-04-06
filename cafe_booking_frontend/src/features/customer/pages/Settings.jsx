import { LogOut, User, Bell, X, Check } from "lucide-react";
import React from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";

function Settings(){
    const logout = useAuth((state) => state.logout);
    const navigate = useNavigate();

    return (
        <div className="w-full flex justify-center bg-[#FAF7F2] min-w-0">
            <div className="max-w-5xl w-full flex flex-col py-8 sm:py-12 px-4 md:px-6 gap-6 sm:gap-8 min-w-0">
                <p className="text-[#5D4E37] text-2xl sm:text-3xl text-start">Settings</p>
                <div className="bg-white flex flex-col justify-start gap-6 p-6.25 rounded-2xl border border-[#E8DFD0] shadow">
                    <div className="flex flex-row gap-3 items-center">
                        <User className="w-10 h-10 p-2.5 rounded-[10px] bg-[#FAF7F2]" color="#8B6F47" size={20}/>
                        <p className="text-xl text-[#5D4E37] text-start">Personal Information</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-normal">Full Name</legend>
                            <input className="d-input w-full px-4 py-3 bg-[#FAF7F2] rounded-[14px] border-[#E8DFD0] text-base text-[#0A0A0A] outline-none" type="text" placeholder="Full Name"/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-normal">Email</legend>
                            <input className="d-input w-full px-4 py-3 bg-[#FAF7F2] rounded-[14px] border-[#E8DFD0] text-base text-[#0A0A0A] outline-none" type="email" placeholder="Email"/>
                        </fieldset>
                        <button className="d-btn d-btn-primary rounded-[10px] font-normal">Save Changes</button>
                    </div>
                </div>
                <div className="bg-white flex flex-col gap-6 p-6.25 rounded-2xl border border-[#E8DFD0] shadow">
                    <div className="flex flex-row gap-3 items-center">
                        <Bell className="w-10 h-10 p-2.5 rounded-[10px] bg-[#FAF7F2]" color="#8B6F47" size={20}/>
                        <p className="text-xl text-[#5D4E37] text-start">Notifications</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-between items-center">
                            <p className="text-base text-[#5D4E37]">Email Reminders</p>
                            <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                            <p className="text-base text-[#5D4E37]">SMS Reminders</p>
                            <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                            <p className="text-base text-[#5D4E37]">Promotions & Updates</p>
                            <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                        </div>
                    </div>
                </div>
                <button
                    className="flex flex-row gap-3 h-15 bg-white border border-[#E8DFD0] rounded-[14px] text-base text-[#5D4E37] items-center justify-center"
                    onClick={() => {
                        logout();
                        navigate("/customer/login");
                    }}
                >
                    <LogOut color="#5D4E37" size={18}/>Log Out
                </button>
            </div>
        </div>
    );
}

export default Settings;