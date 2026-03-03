import React, { useEffect, useState } from "react";
import { Coffee } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { Link, useNavigate } from "react-router";

function Login(){

    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const login = useAuth((state) => state.login);
    const isLoggedIn = useAuth((state) => state.isLoggedIn);


    return (
        <div className="flex flex-1 flex-col w-full items-center justify-center gap-8 bg-[#FAF7F2]">
            <div className="flex flex-col items-center">
                <div className="flex flex-row gap-3 items-center">
                    <Coffee className="p-3 bg-[#8B6F47] rounded-full" size={56} color="white"/>
                    <p className="text-[#5D4E37] text-3xl font-bold">Cafe Cozy</p>
                </div>
                <p className="text-base text-[#7D6E5C]">Welcome back!</p>
            </div>
            <div className="w-84 flex flex-col gap-6.75 shadow rounded-2xl p-8 border border-[#E8DFD0] bg-white">
                <div className="flex flex-col gap-6">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Email Address or Phone Number</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="email" placeholder="abc123@gmail.com"
                            onChange={(e) => setPhoneNumber(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Password</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}/>
                        </fieldset>
                    <button 
                    className="rounded-[14px] h-12 text-white bg-[#8B6F47] text-base"
                    onClick={(e) => {
                        e.preventDefault();
                        if (login(phoneNumber, password)){
                            navigate("/customer/");
                        }
                    }}
                    >Sign In</button>
                </div>
                <Link to="/customer/register" className="text-sm text-[#8B6F47] cursor-pointer">Don't have an account? Sign Up</Link>
            </div>
        </div>
    );
}

export default Login;