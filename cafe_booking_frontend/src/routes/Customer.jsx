import React from "react";
import Header from "../features/customer/components/Header";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "../features/customer/pages/Home";
import Booking from "../features/customer/pages/Booking";
import BookingsHistory from "../features/customer/pages/BookingsHistory";
import Profile from "../features/customer/pages/Profile";
import Settings from "../features/customer/pages/Settings";
import Login from "../features/customer/pages/Login";
import Signup from "../features/customer/pages/Signup";
import CafeList from "../features/customer/pages/CafeList";
import CafeDetails from "../features/customer/pages/CafeDetails";

export default function Customer(){
    return (
        <div className="flex flex-col min-h-screen">
            <Header></Header>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="booking" element={<Booking/>}/>
                <Route path="history" element={<BookingsHistory/>}/>
                <Route path="profile" element={<Profile/>}/>
                <Route path="profile/settings" element={<Settings/>}/>
                <Route path="cafes" element={<CafeList/>}/>
                <Route path="cafes/:id" element={<CafeDetails/>}/>
                <Route path="cafes/:id/booking" element={<Booking/>}/>
                <Route path="login" element={<Login/>}/>
                <Route path="register" element={<Signup/>}/>
            </Routes>
        </div>
    );
}