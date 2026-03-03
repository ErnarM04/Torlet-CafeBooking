import { Clock, Globe, MapPin, Phone, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useRestaurants from "../../../hooks/useRestaurants";

export default function CafeDetails() {

    const { restaurants, loading, error, getRestaurantById, fetchLocations, getLocations } = useRestaurants();
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;
    const restaurant = getRestaurantById(id);
    const locations = getLocations(id);

    useEffect(() => {
        if (id) fetchLocations(id);
        }, [id, fetchLocations]);
    
    if(!restaurant) return <div className="p-6">Loading restaurant...</div>;

  return (
    <div className="flex flex-col gap-6 flex-1 bg-[#FAF7F2] py-6 px-90">

      {/* HERO */}
    <div
        className="relative rounded-2xl shadow overflow-hidden h-64 bg-black/40 bg-cover bg-center bg-blend-overlay"
        style={{
        backgroundImage:"url('https://fruitbasket.limepack.com/blog/wp-content/uploads/2024/03/modern-cafe-house.jpg')",}}>
        <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex items-end p-6 text-white">
                <div className="flex w-full justify-between items-end flex-col md:flex-row gap-4">
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-start">
                        {restaurant.name}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                            <Star size={18} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{restaurant.rating}</span>
                            <span className="text-sm text-white/80">({restaurant.total_reviews} reviews) • {restaurant.cuisine_type}</span>
                        </div>
                    </div>
                    <button className="d-btn d-btn-primary text-base font-normal rounded-xl"
                    onClick={() => {navigate("booking")}}>
                        Book a Table
                    </button>
                </div>
            </div>
        </div>
 

      {/* ABOUT */}
      <div className="rounded-2xl text-start bg-white border border-[#E8DFD0] shadow p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-3">About</p>
        <p className="text-[#7D6E5C] text-base leading-relaxed">
          A warm and inviting café nestled in the heart of downtown. We
          specialize in artisan coffee, freshly baked pastries, and a cozy
          atmosphere perfect for meetings, studying, or catching up with
          friends.
        </p>
      </div>

      {/* DETAILS */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-6">Details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <DetailItem
            icon={<MapPin size={20} />}
            title="Address"
            value={locations[0].address}
          />

          <DetailItem
            icon={<Clock size={20} />}
            title="Hours"
            value={locations[0].opening_hours}
          />

          <DetailItem
            icon={<Phone size={20} />}
            title="Phone"
            value="+7 (777) 777-77-77"
          />

          <DetailItem
            icon={<Globe size={20} />}
            title="Website"
            value="www.cozycornercafe.com"
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, title, value }) {
  return (
    <div className="flex gap-4 items-start text-start">
      <div className="p-3 bg-[#8B6F47]/10 rounded-xl text-[#8B6F47]">
        {icon}
      </div>
      <div>
        <p className="text-[#5D4E37] font-medium">{title}</p>
        <p className="text-[#7D6E5C] text-sm">{value}</p>
      </div>
    </div>
  );
}