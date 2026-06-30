import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Users, Check } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import useRestaurants from "../../../hooks/useRestaurants";
import useBookings from "../../../hooks/useBookings";
import useAuth from "../../../hooks/useAuth";
import TableMap from "../../../components/konva/TableMap";

function Booking() {
  const { t } = useTranslation();
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchRestaurants, getRestaurantById, fetchLocations, getLocations } =
    useRestaurants();
  const {
    allTables,
    availableTables,
    availableTableIds,
    tablesLoading,
    tablesError,
    fetchAvailableTables,
    selectedTableId,
    selectTable,
    createBooking,
    resetBookingDraft,
  } = useBookings();

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null;
    return allTables.find((t) => t.table_id === selectedTableId) || null;
  }, [allTables, selectedTableId]);

  const availableSet = useMemo(() => new Set(availableTableIds || []), [availableTableIds]);

  const selectedTableStatusKey = useMemo(() => {
    if (!selectedTable) return null;
    if (selectedTable.is_active === false || selectedTable.is_available === false) return "inactive";
    return availableSet.has(selectedTable.table_id) ? "available" : "booked";
  }, [selectedTable, availableSet]);

  const restaurant = id ? getRestaurantById(id) : null;
  const locations = id ? getLocations(id) : [];
  const primaryLocation = locations[0];
  const quickTimes = useMemo(
    () => ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    [],
  );

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    if (id) fetchLocations(id);
  }, [id, fetchLocations]);

  useEffect(() => {
    if (!primaryLocation?.location_id || !date || !time || guests < 1) return;
    fetchAvailableTables(primaryLocation.location_id, date, time, guests);
  }, [primaryLocation?.location_id, date, time, guests, fetchAvailableTables]);

  useEffect(() => {
    return () => {
      resetBookingDraft();
    };
  }, [resetBookingDraft]);

  async function handleConfirmBooking() {
    if (!restaurant?.restaurant_id || !primaryLocation?.location_id) {
      setSubmitError(t("customer.bookingErrLocation"));
      return;
    }
    if (!date || !time) {
      setSubmitError(t("customer.bookingErrDateTime"));
      return;
    }
    if (!selectedTableId) {
      setSubmitError(t("customer.bookingErrTable"));
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await createBooking({
        restaurantId: restaurant.restaurant_id,
        locationId: primaryLocation.location_id,
        tableId: selectedTableId,
        bookingDate: date,
        bookingTime: time,
        numberOfGuests: guests,
      });
      navigate("/customer/history");
    } catch (error) {
      if (error.response?.status === 409) {
        setSubmitError(
          error.response?.data?.detail ||
            "This table was just booked by someone else. Please choose another table or time.",
        );
        if (primaryLocation?.location_id && date && time) {
          fetchAvailableTables(primaryLocation.location_id, date, time, guests);
        }
      } else {
        setSubmitError(
          error.response?.data?.detail || t("customer.bookingErrCreate"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoggedIn) return <Navigate to="/customer/login" replace />;
  if (!id) return <Navigate to="/customer/cafes" replace />;

  return (
    <div className="w-full flex flex-1 justify-center bg-[#FAF7F2] min-w-0">
      <div className="max-w-5xl w-full flex flex-col py-8 sm:py-12 px-4 md:px-6 gap-6 sm:gap-8 min-w-0">
        <p className="text-[#5D4E37] text-2xl sm:text-3xl text-start">
          {t("customer.bookingTitle")}
        </p>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
              <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row">
                <Calendar color="#8B6F47" />
                {t("customer.bookingDate")}
              </p>
              <input
                className="d-input bg-[#FAF7F2] border border-[#E8DFD0] rounded-[14px]"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
              <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row">
                <Clock color="#8B6F47" />
                {t("customer.bookingTime")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-between">
                {quickTimes.map((slot) => (
                  <button
                    key={slot}
                    className={
                      time === slot
                        ? "d-btn d-btn-primary h-9 px-3 py-2 text-sm font-normal rounded-[10px]"
                        : "d-btn bg-[#FAF7F2] text-sm text-[#5D4E37] h-9 px-3 py-2 font-normal rounded-[10px]"
                    }
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className=" flex flex-col shadow p-6.25 gap-3 w-full bg-white rounded-2xl border border-[#E8DFD0]">
              <p className="text-start text-base text-[#5D4E37] gap-2 flex flex-row">
                <Users color="#8B6F47" />
                {t("customer.bookingGuests")}
              </p>
              <div className="flex flex-row gap-4">
                <button
                  className="w-10 h-10 bg-[#FAF7F2] rounded-[10px] text-[#5D4E37] text-base d-btn"
                  onClick={() => (guests > 1 ? setGuests(guests - 1) : {})}
                >
                  -
                </button>
                <p className="text-[#5D4E37] text-2xl">{guests}</p>
                <button
                  className="w-10 h-10 bg-[#FAF7F2] rounded-[10px] text-[#5D4E37] text-base d-btn"
                  onClick={() => setGuests(guests + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className=" flex flex-col shadow p-6.25 gap-4 w-full bg-white rounded-2xl border border-[#E8DFD0]">
            <p className="text-start text-xl text-[#5D4E37] gap-2 flex flex-row">
              {t("customer.bookingTablesTitle")}
            </p>
            {restaurant ? (
              <p className="text-start text-sm text-[#7D6E5C]">
                {restaurant.name}
              </p>
            ) : null}
            {tablesLoading ? (
              <span className="d-loading d-loading-dots self-start"></span>
            ) : null}
            {tablesError ? (
              <p className="text-red-600 text-start">{tablesError}</p>
            ) : null}
            {!tablesLoading && !tablesError && (!date || !time) ? (
              <p className="text-sm text-[#7D6E5C] text-start">
                {t("customer.bookingPickHint")}
              </p>
            ) : null}
            {!tablesLoading &&
            !tablesError &&
            date &&
            time &&
            availableTables.length === 0 ? (
              <p className="text-sm text-[#7D6E5C] text-start">
                {t("customer.bookingNoneHint")}
              </p>
            ) : null}

            {!tablesLoading && !tablesError && allTables.length ? (
              <div className="mt-2">
                <TableMap
                  tables={allTables}
                  enabledTableIds={availableTableIds}
                  selectedId={selectedTableId}
                  onSelect={(id) => selectTable(id)}
                  aspectRatio={2}
                  minHeight={280}
                  maxHeight={460}
                  floatingHint={Boolean(selectedTable)}
                  floatingHintTitle={
                    selectedTable
                      ? t("customer.bookingTableNum", { num: selectedTable.table_number })
                      : ""
                  }
                  floatingHintLines={
                    selectedTable
                      ? [
                          selectedTableStatusKey
                            ? t(`customer.tableStatus.${selectedTableStatusKey}`)
                            : "",
                          t("customer.bookingSeatsMeta", {
                            type: t(`common.tableTypes.${selectedTable.table_type}`, {
                              defaultValue: selectedTable.table_type || "table",
                            }),
                            min: selectedTable.min_guests ?? 1,
                            max: selectedTable.max_guests ?? selectedTable.min_guests ?? 1,
                          }),
                          `${t("customer.bookingDescLabel")} ${
                            selectedTable.description?.trim()
                              ? selectedTable.description.trim()
                              : t("customer.bookingDescEmpty")
                          }`,
                        ].filter(Boolean)
                      : []
                  }
                />
              </div>
            ) : null}
          </div>
          {submitError ? (
            <p className="text-red-600 text-start">{submitError}</p>
          ) : null}
          <button
            className="d-btn d-btn-primary h-14 w-full rounded-[14px] font-normal"
            onClick={handleConfirmBooking}
            disabled={submitting}
          >
            {submitting
              ? t("customer.bookingConfirming")
              : t("customer.bookingConfirm")}
          </button>
          </div>
      </div>
    </div>
  );
}

export default Booking;
