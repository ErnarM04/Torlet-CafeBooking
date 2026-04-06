import React, { useState } from "react";
import { Ban, Coffee } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { Link, Navigate, useNavigate } from "react-router";

function Signup(){

    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const register = useAuth((state) => state.register);
    const isLoggedIn = useAuth((state) => state.isLoggedIn);

    function validation(e) {
        e.preventDefault();

        if (!firstName) {
            setError("First Name field can not be empty.");
            return false
        }

        if (!phoneNumber) {
            setError("Phone Number field can not be empty.")
            return false;
        }

        if (!email) {
            setError("Email field can not be empty.")
            return false;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        setError("");
        return true;
    };

    if (isLoggedIn) return <Navigate to="/customer/" replace/>;

    return (
        <div className="flex flex-1 flex-col w-full min-w-0 py-8 sm:py-10 items-center justify-center gap-8 bg-[#FAF7F2] px-4">
            <div className="flex flex-col items-center">
                <div className="flex flex-row gap-3 items-center">
                    <Coffee className="p-3 bg-[#8B6F47] rounded-full" size={56} color="white"/>
                    <p className="text-[#5D4E37] text-3xl font-bold">Cafe Cozy</p>
                </div>
                <p className="text-base text-[#7D6E5C]">Wanna join?</p>
            </div>
            <div className="w-full max-w-lg flex flex-col gap-6.75 shadow rounded-2xl p-6 sm:p-8 border border-[#E8DFD0] bg-white">
                <div className="flex flex-col gap-3">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">First Name *</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder="First Name"
                            onChange={(e) => setFirstName(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Last Name</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder="Last Name"
                            onChange={(e) => setLastName(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Phone Number *</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder="+7(777)777-77-77 "
                            onChange={(e) => setPhoneNumber(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Email Address *</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="email" placeholder="Email Address"
                            onChange={(e) => setEmail(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Password *</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder="Password" value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">Confirm Password *</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder="Confirm Password" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}/>
                        </fieldset>
                        {error ? 
                        <div role="alert" className="d-alert d-alert-error">
                            <Ban />
                            <span>{error}</span>
                        </div> : ""
                        }
                    <button 
                    className="rounded-[14px] h-12 mt-3 text-white bg-[#8B6F47] text-base"
                    onClick={async (e) => {
                        e.preventDefault();
                        const isValid = validation(e);
                        if (!isValid) return;
                        const success = await register(firstName, lastName, email, phoneNumber, password);
                        if (success){
                            navigate("/customer/");
                        }
                    }}
                    >Sign Up</button>
                </div>
                <Link to="/customer/login" className="text-sm text-[#8B6F47] cursor-pointer">Already have an account? Log In</Link>
            </div>
        </div>
    );
}

export default Signup;