import React, { useEffect, useState } from "react";
import { Coffee, LayoutDashboard, Calendar, ShoppingBag, Users, ChartColumn, Settings } from "lucide-react";

function NavMenu(){

    const [selected, setSelected] = useState("Dashboard");

    const pages = new Map([
        ["Dashboard", LayoutDashboard],
        ["Bookings", Calendar],
        ["Orders", ShoppingBag],
        ["Customers", Users],
        ["Analytics", ChartColumn],
        ["Settings", Settings]
    ])

    function selectedItem(name, Icon){
        return (
            <div className="flex bg-[#8B6F47] rounded-xl items-start gap-3 p-3 cursor-pointer">
                <Icon className="w-5 h-5" color="white" />
                <p className="text-base text-white">{name}</p>
            </div>
        );
    }

    return (
        <div className="w-fit bg-white">
            <div className="flex border border-[#8B6F47] gap-2 p-6">
                <Coffee className="bg-[#8B6F47] w-10 h-10 rounded-xl p-2" color="white"/>
                <div className="flex flex-col items-start">
                    <p className="text-base text-[#3D3935] font-semibold">CafeAdmin</p>
                    <p className="text-xs text-[#7A7269]">Booking Management</p>
                </div>
            </div>
            <div className="flex flex-col h-max gap-1 p-4 border border-[#8B6F47]">
                {[...pages].map(([name, Icon]) => (
                    name != selected ?
                    <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => setSelected(name)}>
                        <Icon className="w-5 h-5" />
                        <p className="text-base ">{name}</p>
                    </div> :
                    <div className="flex bg-[#8B6F47] rounded-xl items-start gap-3 p-3 cursor-pointer">
                        <Icon className="w-5 h-5" color="white" />
                        <p className="text-base text-white">{name}</p>
                    </div>
                ))}
            </div>
            
        </div>
    );
}

export default NavMenu;