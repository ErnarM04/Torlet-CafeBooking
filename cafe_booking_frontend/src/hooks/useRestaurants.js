import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_URL = `${API_BASE_URL}/cafes`;

const useRestaurants = create((set, get) => ({
  restaurants: [],
  loading: false,
  error: "",
  locationsByRestaurant: {},
  locationsLoading: false,
  locationsError: "",
  tablesByLocation: {},
  tablesLoading: false,
  tablesError: "",

  fetchRestaurants: async () => {
    const { restaurants } = get();

    if (restaurants.length > 0) return;

    set({ loading: true, error: "" });

    try {
      const response = await axios.get(API_URL+"/restaurants");
      set({ restaurants: response.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch restaurants",
        loading: false,
      });
    }
  },

  setRestaurants: (restaurantList) => set({ restaurants: restaurantList }),

  addRestaurant: (restaurant) =>
    set({ restaurants: [...get().restaurants, restaurant] }),

  updateRestaurant: (restaurant_id, updatedData) =>
    set({
      restaurants: get().restaurants.map((r) =>
        r.restaurant_id === restaurant_id ? { ...r, ...updatedData } : r
      ),
    }),

  removeRestaurant: (restaurant_id) =>
    set({
      restaurants: get().restaurants.filter((r) => r.restaurant_id !== restaurant_id),
    }),

  getRestaurantById: (restaurant_id) =>
    get().restaurants.find((r) => r.restaurant_id === restaurant_id),
  fetchLocations: async (restaurant_id) => {
    const { locationsByRestaurant } = get();

    if (locationsByRestaurant[restaurant_id]) return;

    set({ locationsLoading: true, locationsError: "" });

    try {
      const response = await axios.get(
        `${API_URL}/locations/?restaurant=${restaurant_id}`
      );

      set({
        locationsByRestaurant: {
          ...locationsByRestaurant,
          [restaurant_id]: response.data,
        },
        locationsLoading: false,
      });
    } catch (err) {
      set({
        locationsError: err.response?.data?.message || err.message,
        locationsLoading: false,
      });
    }
  },
  getLocations: (restaurant_id) =>
    get().locationsByRestaurant[restaurant_id] || [],

  fetchTablesForLocation: async (location_id, { force = false } = {}) => {
    if (!location_id) return;
    if (!force && get().tablesByLocation[location_id] !== undefined) {
      return;
    }

    set({ tablesLoading: true, tablesError: "" });
    try {
      const response = await axios.get(
        `${API_URL}/tables/?location=${location_id}`
      );
      set({
        tablesByLocation: {
          ...get().tablesByLocation,
          [location_id]: response.data || [],
        },
        tablesLoading: false,
      });
    } catch (err) {
      set({
        tablesError:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load tables",
        tablesLoading: false,
      });
    }
  },

  getTablesForLocation: (location_id) =>
    get().tablesByLocation[location_id] || null,
}));

export default useRestaurants;