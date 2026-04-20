import { Clock, MapPin, Star } from "lucide-react";
import React, { useEffect } from "react";
import useRestaurants from "../../../hooks/useRestaurants";
import { useNavigate } from "react-router";

export default function CafeList() {
  const { restaurants, loading, fetchRestaurants } = useRestaurants();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <div className="bg-[#FAF7F2] flex-1 flex flex-col gap-8 sm:gap-12 p-4 sm:p-8 md:p-10 items-stretch sm:items-center w-full min-w-0">
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-3 sm:gap-4 text-start">
        <p className="text-[#5D4E37] text-3xl sm:text-4xl font-bold">Book a Table</p>
        <p className="text-[#7D6E5C] text-lg sm:text-xl">
          Discover and reserve your table at the best restaurants near you
        </p>
      </div>
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 sm:gap-8 min-w-0">
        <div className="flex flex-row flex-wrap justify-between items-center gap-3">
          <p className="text-[#5D4E37] text-2xl sm:text-3xl font-bold">
            Recommended for You
          </p>
          <p className="text-[#8B6F47] text-base shrink-0">View All</p>
        </div>
        <div className="flex flex-col gap-6">
          {loading ? (
            <span className="d-loading d-loading-dots"></span>
          ) : (
            restaurants.map((restaurant) => (
              <div
                key={restaurant.restaurant_id}
                onClick={() => {
                  navigate(restaurant.restaurant_id);
                }}
                className="bg-white z-1 cursor-pointer flex flex-col sm:flex-row border border-[#E8DFD0] shadow rounded-2xl overflow-hidden min-w-0"
              >
                <img
                  className="w-full sm:w-64 h-48 sm:h-auto shrink-0 object-cover sm:rounded-l-2xl sm:rounded-r-none rounded-t-2xl sm:rounded-t-none"
                  alt=""
                  src="https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/64EF898D-2EDD-4B47-A456-E6A7D137AC91/Derivates/00f76cac-64f6-4573-be4f-e604a7d99143.jpg"
                />
                <div className="flex flex-col p-4 sm:p-6 gap-2 min-w-0 flex-1">
                  <div className="flex flex-row justify-between gap-3 items-start">
                    <div className="flex flex-col gap-1 text-start min-w-0">
                      <p className="text-[#5D4E37] text-xl sm:text-2xl font-bold break-words">
                        {restaurant.name}
                      </p>
                      <p className="text-[#8B6F47] text-sm">
                        {restaurant.cuisine_type}
                      </p>
                    </div>
                    <p className="flex gap-1 items-center rounded-[20px] w-fit h-fit bg-[#FAF7F2] px-3 py-1.5 text-[#5D4E37] text-base font-bold shrink-0">
                      <Star fill="#5D4E37" color="#5D4E37" size={16} />{" "}
                      {restaurant.rating}
                    </p>
                  </div>
                  <p className="text-[#7D6E5C] text-sm sm:text-base text-start">
                    Experience authentic Japanese cuisine with fresh sashimi and
                    expertly crafted rolls. Our chefs bring traditional
                    techniques to create an unforgettable dining experience.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
                    <p className="flex items-center gap-1.5 text-[#7D6E5C] text-sm min-w-0">
                      <MapPin className="shrink-0" color="#7D6E5C" size={16} /> <span>0.8 miles away</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#7D6E5C] text-sm min-w-0">
                      <Clock className="shrink-0" color="#7D6E5C" size={16} /> <span className="whitespace-normal">11:30 AM - 10:00 PM</span>
                    </p>
                  </div>
                  <button
                    className="d-btn d-btn-primary z-10 self-stretch sm:self-end rounded-[10px] font-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(restaurant.restaurant_id + "/booking");
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
