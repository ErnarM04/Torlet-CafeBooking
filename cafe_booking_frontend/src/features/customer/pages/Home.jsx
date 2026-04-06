import React, { useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";
import useBookings from "../../../hooks/useBookings";

function Home(){
    const { t } = useTranslation();
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const firstName = useAuth((state) => state.first_name);
    const fetchProfile = useAuth((state) => state.fetchProfile);
    const { bookings, fetchBookings } = useBookings();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            fetchProfile();
            fetchBookings();
        }
    }, [isLoggedIn, fetchProfile, fetchBookings]);

    const upcomingBooking = bookings.find((booking) => booking.status === "pending" || booking.status === "confirmed");

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-8 px-4 py-8 sm:gap-12 sm:px-6 sm:py-12">
            <div className="text-start">
                {isLoggedIn ? 
                <p className="text-3xl sm:text-4xl text-[#5D4E37] break-words">{t("customer.homeWelcomeBack", { name: firstName })}</p> :
                <p className="text-3xl sm:text-4xl text-[#5D4E37]">{t("customer.homeWelcome")}</p>
                }
                <p className="text-base sm:text-lg text-[#7D6E5C]">{t("customer.homeSubtitle")}</p>
            </div>
            <button onClick={() => navigate("cafes")} className="d-btn d-btn-primary text-lg sm:text-xl font-normal py-5 sm:py-6.25 w-full sm:w-auto">{t("customer.homeBookCta")}</button>
            {isLoggedIn ?
            <div className="bg-white rounded-2xl py-10 sm:py-12 px-4 gap-2 border border-[#E8DFD0] shadow flex flex-col items-center">
                <div className="bg-[#FAF7F2] rounded-full p-4 w-fit">
                    <Calendar size={32} color="#8B6F47"/>
                </div>
                {upcomingBooking ? (
                    <>
                        <p className="text-xl text-[#5D4E37]">{t("customer.homeNextUp")}</p>
                        <p className="text-base text-[#7D6E5C]">{upcomingBooking.booking_date} at {upcomingBooking.booking_time}</p>
                        <button className="d-btn d-btn-primary text-base font-normal" onClick={() => navigate("/customer/history")}>{t("customer.homeViewBookings")}</button>
                    </>
                ) : (
                    <>
                        <p className="text-xl text-[#5D4E37]">{t("customer.homeNoUpcoming")}</p>
                        <p className="text-base text-[#7D6E5C]">{t("customer.homeNoUpcomingHint")}</p>
                        <button className="d-btn d-btn-primary text-base font-normal" onClick={() => navigate("/customer/cafes")}>{t("customer.homeBookCta")}</button>
                    </>
                )}
            </div> :
            <div className="bg-white rounded-2xl px-4 py-8 sm:px-10 sm:py-12 gap-6 border border-[#E8DFD0] shadow flex flex-col">
                <p className="text-[#5D4E37] text-2xl sm:text-[28px] font-bold text-start">{t("customer.homeWhyTitle")}</p>
                <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-6">
                    <div className="flex flex-col gap-3 items-center text-center md:flex-1">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">{t("customer.homeEasyTitle")}</p>
                        <p className="text-[#7D6E5C] text-base max-w-sm">{t("customer.homeEasyText")}</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center text-center md:flex-1">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">{t("customer.homeEasyTitle")}</p>
                        <p className="text-[#7D6E5C] text-base max-w-sm">{t("customer.homeEasyText")}</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center text-center md:flex-1">
                        <Clock className="w-14 h-14 p-3.5 bg-[#FAF7F2] rounded-full" size={28} color="#8B6F47"/>
                        <p className="text-[#5D4E37] text-xl font-bold">{t("customer.homeEasyTitle")}</p>
                        <p className="text-[#7D6E5C] text-base max-w-sm">{t("customer.homeEasyText")}</p>
                    </div>
                </div>
            </div>}
            <div>
                
            </div>
        </div>
    );
}

export default Home;