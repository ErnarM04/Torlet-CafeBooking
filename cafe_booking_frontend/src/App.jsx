import React from "react";
import './App.css'
import Modal from "./components/Modal";
import TestComponents from "./TestComponents";
import Header from "./features/admin/components/Header";
import NavMenu from "./features/admin/components/NavMenu";
import PKICard from "./features/admin/components/PKICard";
import RecentBookings from "./features/admin/components/RecentBookings";
import OrdersTable from "./features/admin/components/OrdersTable";
import BookingsTable from "./features/admin/components/BookingsTable";
import CustomerCard from "./features/admin/components/CustomerCard";
import SummaryCard from "./features/admin/components/SummaryCard";


function App() {
  return (
    <div className="bg-[#faf8f5]"> 
      <TestComponents></TestComponents>
    </div>
  );
}

export default App
