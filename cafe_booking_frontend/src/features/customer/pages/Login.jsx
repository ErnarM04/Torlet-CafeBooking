import React, { useState } from "react";
import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import { Link, Navigate, useNavigate } from "react-router";
import torletLogo from "../../../assets/torlet-logo.png";

function Login(){
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const login = useAuth((state) => state.login);
    const isLoggedIn = useAuth((state) => state.isLoggedIn);

    function validation(e) {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            setError(t("customer.loginErrPhone"));
            return false;
        }

        if (!password) {
            setError(t("customer.loginErrPass"));
            return false;
        }

        setError("");
        return true;
    }

    if (isLoggedIn) return <Navigate to="/customer/" replace />;

    return (
        <div className="flex flex-1 flex-col w-full min-w-0 items-center justify-center gap-8 bg-[#FAF7F2] px-4 py-8">
            <div className="flex flex-col items-center">
                <div className="flex flex-row gap-3 items-center">
                    <img src={torletLogo} alt="Torlet logo" className="h-14 w-14 rounded-xl object-contain"/>
                    <p className="text-[#5D4E37] text-3xl font-bold">{t("customer.loginTitle")}</p>
                </div>
                <p className="text-base text-[#7D6E5C]">{t("customer.loginSubtitle")}</p>
            </div>
            <div className="w-full max-w-md flex flex-col gap-6.75 shadow rounded-2xl p-6 sm:p-8 border border-[#E8DFD0] bg-white">
                <div className="flex flex-col gap-6">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.loginPhoneLegend")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder="+7(777)777-77-77"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.loginPassLegend")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        </fieldset>
                        {error ? (
                        <div role="alert" className="d-alert d-alert-error">
                            <Ban />
                            <span>{error}</span>
                        </div>
                        ) : null}
                    <button 
                    className="rounded-[14px] h-12 text-white bg-[#8B6F47] text-base"
                    onClick={async (e) => {
                        e.preventDefault();
                        if (!validation(e)) return;
                        const result = await login(phoneNumber, password);
                        if (result.success) {
                            navigate("/customer/");
                        } else {
                            setError(result.error || t("customer.loginErrInvalid"));
                        }
                    }}
                    >{t("customer.loginSubmit")}</button>
                </div>
                <Link to="/customer/register" className="text-sm text-[#8B6F47] cursor-pointer">{t("customer.loginRegister")}</Link>
            </div>
        </div>
    );
}

export default Login;