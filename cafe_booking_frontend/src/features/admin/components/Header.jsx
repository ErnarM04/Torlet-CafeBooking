import React from "react";
import "../../../App.css";
import { Bot, Bell, User } from "lucide-react";

function Header({title}){
    return (
        <div className="min-w-full flex justify-between bg-white border border-[#8B6F47]/15 p-8 pt-4 pb-4 items-center">
            <p className="text-[#3D3935] text-3xl font-semibold select-none">{title}</p>
            <div className="flex items-center gap-4">
                <button className="d-btn d-btn-primary rounded-xl flex flex-row p-4 gap-2">
                    <Bot/>
                    <p className="text-base">AI Assistant</p>
                </button>
                <button className="d-btn d-btn-ghost w-10 h-10 p-2">
                    <Bell/>
                </button>
                <div className="flex flex-row items-center cursor-pointer gap-3 p-2">
                    <div>
                        <p className="text-[#3D3935] text-sm font-semibold">Admin User</p>
                        <p className="text-[#7A7269] text-xs">admin@cafe.com</p>
                    </div>
                    <User className="bg-[#8B6F47] rounded-full w-9 h-9 p-2" color="white" size={36}/>
                </div>
            </div>
        </div>
    );
}

export default Header;