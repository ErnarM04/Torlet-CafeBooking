import React from "react";
import { Coffee } from "lucide-react";

function Login(){
    return (
        <div className="flex flex-col w-full h-screen items-center justify-center gap-8 bg-[#FAF7F2]">
            <div className="flex flex-col items-center">
                <div className="flex flex-row gap-3 items-center">
                    <Coffee className="p-3 bg-[#8B6F47] rounded-full" size={56} color="white"/>
                    <p className="text-[#5D4E37] text-3xl font-bold">Cafe Cozy</p>
                </div>
                <p className="text-base text-[#7D6E5C]">Welcome back!</p>
            </div>
            <div className="w-84 flex flex-col gap-6.75 shadow rounded-2xl p-8 border border-[#E8DFD0] bg-white">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-[#5D4E37] text-sm text-start">Email Address</p>
                        <input className="d-input w-full rounded-[14px] px-4 py-3 text-base border border-[#E8DFD0]" type="email" placeholder="abc123@gmail.com"/>
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <p className="text-[#5D4E37] text-sm text-start">Password</p>
                        <input className="d-input w-full rounded-[14px] px-4 py-3 text-base border border-[#E8DFD0]" type="password" placeholder="Password"/>
                    </div>
                    <button className="rounded-[14px] h-12 text-white bg-[#8B6F47] text-base">Sign In</button>
                </div>
                <p className="text-sm text-[#8B6F47] cursor-pointer">Don't have an account? Sign Up</p>
            </div>
        </div>
    );
}

export default Login;