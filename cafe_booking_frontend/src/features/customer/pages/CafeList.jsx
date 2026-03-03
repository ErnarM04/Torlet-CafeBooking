import { Clock, MapPin, Star } from "lucide-react";
import React, { useEffect } from "react";
import useRestaurants from "../../../hooks/useRestaurants";
import { Link, useNavigate, useParams } from "react-router";

export default function CafeList() {

    const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants])

    return (
        <div className="bg-[#FAF7F2] flex-1 flex flex-col gap-12 p-10 items-center">
            <div className="flex flex-col w-245 gap-4 text-start">
                <p className="text-[#5D4E37] text-4xl font-bold">Book a Table</p>
                <p className="text-[#7D6E5C] text-xl">Discover and reserve your table at the best restaurants near you</p>
            </div>
            <div className="flex flex-col max-w-245 gap-8">
                <div className="flex flex-row justify-between items-center">
                    <p className="text-[#5D4E37] text-3xl font-bold">Recommended for You</p>
                    <p className="text-[#8B6F47] text-base">View All</p>
                </div>
                <div>
                    {loading ? 
                    <span className="d-loading d-loading-dots"></span>:
                    restaurants.map((restaurant) => (
                        <div key={restaurant.restaurant_id} 
                        onClick={() => {navigate(restaurant.restaurant_id)}}
                        className="bg-white z-1 cursor-pointer flex flex-row border border-[#E8DFD0] shadow rounded-2xl">
                        <img className="w-64 h-auto object-fill rounded-l-2xl " src="https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/64EF898D-2EDD-4B47-A456-E6A7D137AC91/Derivates/00f76cac-64f6-4573-be4f-e604a7d99143.jpg"/>
                        <div className="flex flex-col p-6 gap-2">
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col gap-1 text-start">
                                    <p className="text-[#5D4E37] text-2xl font-bold overflow-hidden">{restaurant.name}</p>
                                    <p className="text-[#8B6F47] text-sm">{restaurant.cuisine_type}</p>
                                </div>
                                <p className="flex gap-1 items-center rounded-[20px] w-fit h-fit bg-[#FAF7F2] px-3 py-1.5 text-[#5D4E37] text-base font-bold"><Star fill="#5D4E37" color="#5D4E37" size={16}/> {restaurant.rating}</p>
                            </div>
                            <p className="text-[#7D6E5C] text-base text-start overflow-clip">Experience authentic Japanese cuisine with fresh sashimi and expertly crafted rolls. Our chefs bring traditional techniques to create an unforgettable dining experience.</p>
                            <div className="flex flex-row gap-6">
                                <p className="flex items-center gap-1.5 text-[#7D6E5C] text-sm"><MapPin color="#7D6E5C" size={16}/> 0.8 miles away</p>
                                <p className="flex items-center gap-1.5 text-[#7D6E5C] text-sm"><Clock color="#7D6E5C" size={16}/> 11:30 AM - 10:00 PM</p>
                            </div>
                            <button className="d-btn d-btn-primary z-10 self-end rounded-[10px] font-normal"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(restaurant.restaurant_id+"/booking");
                                }}>Book Now</button>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
}