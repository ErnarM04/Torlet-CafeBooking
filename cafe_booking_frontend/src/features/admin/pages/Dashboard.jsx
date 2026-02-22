import React from "react";
import PKICard from "../components/PKICard";
import RecentBookings from "../components/RecentBookings";

function Dashboard(){
    return (
        <div className="bg-[#FAF8F5] flex flex-col gap-8 p-8 w-full">
            <div className="grid grid-cols-4 gap-6">
                <PKICard></PKICard>
                <PKICard></PKICard>
                <PKICard></PKICard>
                <PKICard></PKICard>
            </div>
            <div className="bg-white flex flex-col gap-4 p-6.25 border border-[#8B6F47]/15 rounded-2xl shadow">
                <p className="text-start text-[#3D3935] text-base font-semibold">Weekly Booking Trend</p>
                <div className="h-75">
                    Place for Graph. Coming Soon...
                </div>
            </div>
            <RecentBookings></RecentBookings>
        </div>
    );
}

export default Dashboard;