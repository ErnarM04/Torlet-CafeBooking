import React from "react";
import './App.css'
import Admin from "./routes/Admin";
import { BrowserRouter, Routes, Route } from "react-router";
import Customer from "./routes/Customer";
import Landing from "./pages/Landing";


function App() {

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/*" element={<Admin/>}/>
          <Route path="/customer/*" element={<Customer/>}/>
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App
