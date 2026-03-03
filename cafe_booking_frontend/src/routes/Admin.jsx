import React, { useState } from "react";
import Dashboard from "../features/admin/pages/Dashboard";
import NavMenu from "../features/admin/components/NavMenu";
import Header from "../features/admin/components/Header";
import { Route, Routes } from "react-router";
import Bookings from "../features/admin/pages/BookingsManagement";
import Orders from "../features/admin/pages/OrdersManagement";
import Customers from "../features/admin/pages/Customers";
import Settings from "../features/admin/pages/Settings";
import Analytics from "../features/admin/pages/Analytics";

function Admin(){
    const [title, setTitle] = useState("Not found")

    return (
            <div className="flex flex-row min-h-screen">
                <NavMenu className="sticky" setTitle={setTitle}></NavMenu>
                <div className="flex flex-col w-full">
                    <Header title={title}></Header>
                    <Routes>
                        <Route path="/" element={<Dashboard/>}/>
                        <Route path="dashboard" element={<Dashboard/>}/>
                        <Route path="bookings" element={<Bookings/>}/>
                        <Route path="orders" element={<Orders/>}/>
                        <Route path="customers" element={<Customers/>}/>
                        <Route path="analytics" element={<Analytics/>}/>
                        <Route path="settings" element={<Settings/>}/>
                    </Routes>
                </div>
            </div>
    );
}

export default Admin;