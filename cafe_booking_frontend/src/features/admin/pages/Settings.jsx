import React from "react";
import { Building2, Clock, Bell, Bot, Shield, Plus, Save } from "lucide-react";

export default function Settings(){
    return (
        <div className="grid gap-8 p-8 w-3xl">
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                <div className="flex flex-row items-center gap-3">
                    <Building2 className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                    <p className="text-xl text-[#3D3935] font-semibold">Café Information</p>
                </div>
                <div className="flex flex-col gap-4">
                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Cafe Name</legend>
                        <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="The Cozy Cafe"/>
                    </fieldset>
                    <div className="flex flex-row gap-4">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Email</legend>
                            <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="admin@cafe.com"/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Phone</legend>
                            <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="+1 234-567-8900"/>
                        </fieldset>
                    </div>
                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Address</legend>
                        <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="123 Main Street, City, State 12345"/>
                    </fieldset>
                </div>
            </div>
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                <div className="flex flex-row items-center gap-3">
                    <Clock className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                    <p className="text-xl text-[#3D3935] font-semibold">Working Hours</p>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Monday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Tuesday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Wednesday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Thursday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Friday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Saturday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-row gap-4 items-center justify-start">
                        <p className="min-w-32 text-start text-base text-[#3D3935] font-medium">Sunday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                <div className="flex fle-row justify-between">
                    <div className="flex flex-row items-center gap-3">
                        <Building2 className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Branches</p>
                    </div>
                    <button className="d-btn d-btn-primary rounded-xl "><Plus/>Add Branch</button>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Main Branch</p>
                            <p className="text-sm text-[#7A7269]">123 Main Street, City</p>
                        </div>
                        <span className="d-badge d-badge-success">Active</span>
                    </div>
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Main Branch</p>
                            <p className="text-sm text-[#7A7269]">123 Main Street, City</p>
                        </div>
                        <span className="d-badge d-badge-success">Active</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                    <div className="flex flex-row items-center gap-3">
                        <Bell className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Notifications</p>
                    </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">New Booking Alerts</p>
                            <p className="text-sm text-[#7A7269]">Get notified when new bookings are made</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Booking Confirmations</p>
                            <p className="text-sm text-[#7A7269]">Notify when bookings are confirmed</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Daily Summary</p>
                            <p className="text-sm text-[#7A7269]">Receive daily booking summary emails</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                    <div className="flex flex-row items-center gap-3">
                        <Bot className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">AI Assistant Configuration</p>
                    </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Enable AI Assistant</p>
                            <p className="text-sm text-[#7A7269]">Allow AI to help with booking insights</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Auto-suggestions</p>
                            <p className="text-sm text-[#7A7269]">Get AI-powered recommendations</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col p-6.25 gap-6 bg-white border border-[#8B6F47]/15 rounded-2xl shadow">
                    <div className="flex flex-row items-center gap-3">
                        <Shield className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Security</p>
                    </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Change Password</p>
                            <p className="text-sm text-[#7A7269]">Update your account password</p>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between items-center p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-[#7A7269]">Add an extra layer of security</p>
                        </div>
                    </div>
                </div>
            </div>
            <button className="d-btn d-btn-primary text-base font-normal justify-self-end w-fit rounded-xl"><Save size={20}/>Save changes</button>
        </div>
    );
}