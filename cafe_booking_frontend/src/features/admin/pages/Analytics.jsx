import React from "react";
import PKICard from "../components/PKICard";
import SummaryCard from "../components/SummaryCard";

export default function Analytics(){
    return (
        <div className="flex flex-col gap-8 p-8 bg-[#FAF8F5] w-full">
            <div className="flex flex-row gap-6">
                <PKICard></PKICard>
                <PKICard></PKICard>
                <PKICard></PKICard>
                <PKICard></PKICard>
            </div>
            <div className="flex flex-row w-full justify-between gap-6">
                <div className="flex flex-col gap-4 p-6.25 w-full bg-white rounded-2xl border border-[#8B6F47]/15 shadow">
                    <p className="text-[#3D3935] text-base font-semibold text-start">Peak Booking Hours</p>
                    <span className="h-75">Place for Graph</span>
                </div>
                <div className="flex flex-col gap-4 p-6.25 w-full bg-white rounded-2xl border border-[#8B6F47]/15 shadow">
                    <p className="text-[#3D3935] text-base font-semibold text-start">Weekly Booking Trend</p>
                    <span className="h-75">Place for Graph</span>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6.25 w-full bg-white rounded-2xl border border-[#8B6F47]/15 shadow">
                <p className="text-[#3D3935] text-base font-semibold text-start">Table Utilization by Zone</p>
                <span className="h-75">Place for Graph</span>
            </div>
            <div className="flex flex-row gap-6">
                <SummaryCard/>
                <SummaryCard/>
                <SummaryCard/>
            </div>
        </div>
    );
}