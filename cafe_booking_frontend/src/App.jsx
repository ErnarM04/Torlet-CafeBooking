import React from "react";
import './App.css'
import Admin from "./Admin";
import { BrowserRouter, Routes, Route } from "react-router";
import Customer from "./Customer";


function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/admin/*" element={<Admin/>}/>
          <Route path="/customer/*" element={<Customer/>}/>
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App
