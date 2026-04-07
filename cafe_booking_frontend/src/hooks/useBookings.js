import { create } from "zustand";
import axios from "axios";
import useAuth from "./useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const BOOKINGS_URL = `${API_BASE_URL}/bookings`;
const CAFES_URL = `${API_BASE_URL}/cafes`;

async function authorizedRequest(config) {
  const auth = useAuth.getState();
  let access = auth.access;

  if (!access && auth.refreshToken) {
    const refreshed = await auth.refreshAccessToken(auth.refreshToken);
    if (refreshed) access = useAuth.getState().access;
  }

  if (!access) {
    throw new Error("Authentication required");
  }

  try {
    return await axios({
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: `Bearer ${access}`,
      },
    });
  } catch (error) {
    if (error?.response?.status !== 401 || !useAuth.getState().refreshToken) {
      throw error;
    }

    const refreshed = await useAuth
      .getState()
      .refreshAccessToken(useAuth.getState().refreshToken);
    if (!refreshed) throw error;

    const newAccess = useAuth.getState().access;
    return await axios({
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: `Bearer ${newAccess}`,
      },
    });
  }
}

const useBookings = create((set, get) => ({
  bookings: [],
  loading: false,
  error: "",
  allTables: [],
  availableTables: [],
  availableTableIds: [],
  tablesLoading: false,
  tablesError: "",
  selectedTableId: "",

  fetchBookings: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await authorizedRequest({
        method: "get",
        url: `${BOOKINGS_URL}/`,
      });
      set({ bookings: response.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.detail || err.message || "Failed to load bookings",
        loading: false,
      });
    }
  },

  fetchAvailableTables: async (locationId, bookingDate, bookingTime, numberOfGuests) => {
    if (!locationId || !bookingDate || !bookingTime) {
      set({ allTables: [], availableTables: [], availableTableIds: [] });
      return;
    }

    set({ tablesLoading: true, tablesError: "" });
    try {
      const [allTablesRes, availabilityRes] = await Promise.all([
        axios.get(`${CAFES_URL}/tables/?location=${locationId}`),
        authorizedRequest({
          method: "get",
          url: `${BOOKINGS_URL}/availability/`,
          params: {
            location: locationId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            number_of_guests: numberOfGuests,
            duration_minutes: 120,
          },
        }),
      ]);

      const allTables = allTablesRes.data || [];
      const availableIdsArr = availabilityRes.data.available_table_ids || [];
      const availableIds = new Set(availableIdsArr);
      const availableTables = allTables.filter((table) => availableIds.has(table.table_id));

      set({ allTables, availableTables, availableTableIds: availableIdsArr, tablesLoading: false });
    } catch (err) {
      set({
        tablesError:
          err.response?.data?.detail || err.message || "Failed to check table availability",
        tablesLoading: false,
      });
    }
  },

  selectTable: (tableId) => set({ selectedTableId: tableId }),

  createBooking: async ({
    restaurantId,
    locationId,
    tableId,
    bookingDate,
    bookingTime,
    numberOfGuests,
    specialRequest = "",
  }) => {
    const payload = {
      restaurant: restaurantId,
      location: locationId,
      table: tableId || null,
      booking_date: bookingDate,
      booking_time: bookingTime,
      number_of_guests: numberOfGuests,
      duration_minutes: 120,
      special_request: specialRequest,
    };

    const response = await authorizedRequest({
      method: "post",
      url: `${BOOKINGS_URL}/`,
      data: payload,
    });

    set({ bookings: [response.data, ...get().bookings] });
    return response.data;
  },

  cancelBooking: async (bookingId, cancellationReason = "") => {
    const response = await authorizedRequest({
      method: "post",
      url: `${BOOKINGS_URL}/${bookingId}/cancel/`,
      data: { cancellation_reason: cancellationReason },
    });

    set({
      bookings: get().bookings.map((booking) =>
        booking.booking_id === bookingId ? response.data : booking,
      ),
    });
    return response.data;
  },
}));

export default useBookings;
