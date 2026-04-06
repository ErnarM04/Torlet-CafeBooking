import { Clock, Globe, LayoutGrid, MapPin, Phone, Star, Users } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useRestaurants from "../../../hooks/useRestaurants";

export default function CafeDetails() {

    const {
      loading,
      error,
      fetchRestaurants,
      getRestaurantById,
      fetchLocations,
      getLocations,
      locationsLoading,
      locationsError,
      fetchTablesForLocation,
      getTablesForLocation,
      tablesLoading,
      tablesError,
    } = useRestaurants();
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;
    const restaurant = getRestaurantById(id);
    const locations = getLocations(id);
    const primaryLocation = locations[0];
    const tables = primaryLocation?.location_id
      ? getTablesForLocation(primaryLocation.location_id)
      : null;

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    useEffect(() => {
      if (id) fetchLocations(id);
    }, [id, fetchLocations]);

    useEffect(() => {
      if (primaryLocation?.location_id) {
        fetchTablesForLocation(primaryLocation.location_id);
      }
    }, [primaryLocation?.location_id, fetchTablesForLocation]);
    
    if (loading || !id) {
      return <div className="p-6">Loading restaurant...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-600">Failed to load restaurant: {error}</div>;
    }

    if (!restaurant) {
      return <div className="p-6">Restaurant not found.</div>;
    }

  return (
    <div className="flex flex-col gap-6 flex-1 bg-[#FAF7F2] py-4 sm:py-6 px-4 sm:px-8 md:px-12 max-w-5xl w-full mx-auto min-w-0">

      {/* HERO */}
    <div
        className="relative rounded-2xl shadow overflow-hidden h-48 sm:h-64 bg-black/40 bg-cover bg-center bg-blend-overlay"
        style={{
        backgroundImage:"url('https://fruitbasket.limepack.com/blog/wp-content/uploads/2024/03/modern-cafe-house.jpg')",}}>
        <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex items-end p-6 text-white">
                <div className="flex w-full justify-between items-end flex-col md:flex-row gap-4">
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-start">
                        {restaurant.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                            <Star size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
                            <span className="font-medium">{restaurant.rating}</span>
                            <span className="text-sm text-white/80">({restaurant.total_reviews} reviews) • {restaurant.cuisine_type}</span>
                        </div>
                    </div>
                    <button className="d-btn d-btn-primary text-base font-normal rounded-xl w-full sm:w-auto shrink-0"
                    onClick={() => {navigate("booking")}}>
                        Book a Table
                    </button>
                </div>
            </div>
        </div>
 

      {/* ABOUT */}
      <div className="rounded-2xl text-start bg-white border border-[#E8DFD0] shadow p-4 sm:p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-3">About</p>
        <p className="text-[#7D6E5C] text-base leading-relaxed">
          A warm and inviting café nestled in the heart of downtown. We
          specialize in artisan coffee, freshly baked pastries, and a cozy
          atmosphere perfect for meetings, studying, or catching up with
          friends.
        </p>
      </div>

      {/* TABLES */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="h-6 w-6 text-[#8B6F47]" aria-hidden />
          <p className="text-[#5D4E37] text-xl font-semibold">Tables</p>
        </div>
        {tablesLoading ? (
          <p className="text-[#7D6E5C] text-sm">Loading tables…</p>
        ) : tablesError ? (
          <p className="text-red-600 text-sm">{tablesError}</p>
        ) : !primaryLocation?.location_id ? (
          <p className="text-[#7D6E5C] text-sm">Pick a location to see tables.</p>
        ) : tables === null ? (
          <p className="text-[#7D6E5C] text-sm">Loading tables…</p>
        ) : tables.length === 0 ? (
          <p className="text-[#7D6E5C] text-sm">No tables listed for this location yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map((table) => (
              <li
                key={table.table_id}
                className="flex flex-col gap-1 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#5D4E37] font-medium">
                    Table {table.table_number}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[#8B6F47]">
                    {table.table_type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#7D6E5C]">
                  <Users className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    {table.min_guests}–{table.max_guests} guests
                  </span>
                </div>
                {table.description ? (
                  <p className="text-xs text-[#7D6E5C] line-clamp-2">{table.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DETAILS */}
      <div className="rounded-2xl bg-white text-start border border-[#E8DFD0] shadow p-4 sm:p-6">
        <p className="text-[#5D4E37] text-xl font-semibold mb-6">Details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <DetailItem
            icon={<MapPin size={20} />}
            title="Address"
            value={primaryLocation?.address || (locationsLoading ? "Loading..." : "Address not available")}
          />

          <DetailItem
            icon={<Clock size={20} />}
            title="Hours"
            value={primaryLocation?.opening_hours || (locationsLoading ? "Loading..." : "Hours not available")}
          />

          <DetailItem
            icon={<Phone size={20} />}
            title="Phone"
            value="+7 (777) 777-77-77"
          />

          <DetailItem
            icon={<Globe size={20} />}
            title="Website"
            value={locationsError ? "Website unavailable" : "www.cozycornercafe.com"}
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
        <p className="text-[#7D6E5C] text-sm break-words">{value}</p>
      </div>
    </div>
  );
}