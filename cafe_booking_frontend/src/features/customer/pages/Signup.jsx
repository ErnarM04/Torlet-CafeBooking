import React, { useState } from "react";
import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import { Link, Navigate, useNavigate } from "react-router";
import torletLogo from "../../../assets/torlet-logo.png";

function Signup(){
    const { t } = useTranslation();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [smsCode, setSmsCode] = useState("");
    const [smsSent, setSmsSent] = useState(false);
    const [smsVerified, setSmsVerified] = useState(false);
    const [smsHint, setSmsHint] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const register = useAuth((state) => state.register);
    const requestSmsCode = useAuth((state) => state.requestSmsCode);
    const verifySmsCode = useAuth((state) => state.verifySmsCode);
    const isLoggedIn = useAuth((state) => state.isLoggedIn);

    function validation(e) {
        e.preventDefault();

        if (!firstName) {
            setError(t("customer.signupErrFirst"));
            return false
        }

        if (!phoneNumber) {
            setError(t("customer.signupErrPhone"))
            return false;
        }

        if (!email) {
            setError(t("customer.signupErrEmail"))
            return false;
        }

        if (password.length < 8) {
            setError(t("customer.signupErrPassLen"));
            return false;
        }

        if (password !== confirmPassword) {
            setError(t("customer.signupErrPassMatch"));
            return false;
        }

        if (!smsVerified) {
            setError(t("customer.signupErrVerifyPhone"));
            return false;
        }

        setError("");
        return true;
    };

    if (isLoggedIn) return <Navigate to="/customer/" replace/>;

    return (
        <div className="flex flex-1 flex-col w-full min-w-0 py-8 sm:py-10 items-center justify-center gap-8 bg-[#FAF7F2] px-4">
            <div className="flex flex-col items-center">
                <div className="flex flex-row gap-3 items-center">
                    <img src={torletLogo} alt="Torlet logo" className="h-14 w-14 rounded-xl object-contain"/>
                    <p className="text-[#5D4E37] text-3xl font-bold">{t("landing.brand")}</p>
                </div>
                <p className="text-base text-[#7D6E5C]">{t("customer.signupLead")}</p>
            </div>
            <div className="w-full max-w-lg flex flex-col gap-6.75 shadow rounded-2xl p-6 sm:p-8 border border-[#E8DFD0] bg-white">
                <div className="flex flex-col gap-3">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupFirstName")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder={t("customer.signupFirstName")}
                            onChange={(e) => setFirstName(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupLastName")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder={t("customer.signupLastName")}
                            onChange={(e) => setLastName(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupPhone")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="text" placeholder="+7(777)777-77-77 "
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setSmsSent(false);
                                setSmsVerified(false);
                                setSmsHint("");
                            }}/>
                        </fieldset>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    className="d-btn d-btn-outline rounded-[14px] h-12"
                                    onClick={async () => {
                                        if (!phoneNumber.trim()) {
                                            setError(t("customer.signupErrPhone"));
                                            return;
                                        }
                                        setError("");
                                        const res = await requestSmsCode(phoneNumber.trim());
                                        if (!res.success) {
                                            setError(res.error || t("customer.signupInvalidCode"));
                                            return;
                                        }
                                        setSmsSent(true);
                                        if (res.dev_code) {
                                            setSmsHint(t("customer.signupDevCode", { code: res.dev_code }));
                                        }
                                    }}
                                >
                                    {t("customer.signupSendCode")}
                                </button>
                                <input
                                    className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]"
                                    type="text"
                                    placeholder={t("customer.signupCodePlaceholder")}
                                    value={smsCode}
                                    onChange={(e) => setSmsCode(e.target.value)}
                                    disabled={!smsSent}
                                />
                                <button
                                    type="button"
                                    className="d-btn d-btn-primary rounded-[14px] h-12 border-0"
                                    onClick={async () => {
                                        if (!phoneNumber.trim() || !smsCode.trim()) {
                                            setError(t("customer.signupNeedPhoneAndCode"));
                                            return;
                                        }
                                        setError("");
                                        const res = await verifySmsCode(phoneNumber.trim(), smsCode.trim());
                                        if (!res.success) {
                                            setError(res.error || t("customer.signupInvalidCode"));
                                            setSmsVerified(false);
                                            return;
                                        }
                                        setSmsVerified(true);
                                    }}
                                    disabled={!smsSent}
                                >
                                    {t("customer.signupVerify")}
                                </button>
                            </div>
                            {smsHint ? <p className="text-xs text-[#7D6E5C]">{smsHint}</p> : null}
                            {smsVerified ? <p className="text-xs text-green-700">{t("customer.signupPhoneVerified")}</p> : null}
                        </div>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupEmail")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="email" placeholder={t("customer.signupEmail")}
                            onChange={(e) => setEmail(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupPassword")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder={t("customer.signupPassword")} value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-medium">{t("customer.signupConfirm")}</legend>
                            <input 
                            className="d-input w-full px-4 py-2.5 bg-white rounded-[14px] border-[#E8DFD0] text-base text-[#3D3935] outline-[#E8DFD0]" 
                            type="password" placeholder={t("customer.signupConfirm")} value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}/>
                        </fieldset>
                        {error ? 
                        <div role="alert" className="d-alert d-alert-error">
                            <Ban />
                            <span>{error}</span>
                        </div> : ""
                        }
                    <button 
                    className="rounded-[14px] h-12 mt-3 text-white bg-[#8B6F47] text-base"
                    onClick={async (e) => {
                        e.preventDefault();
                        const isValid = validation(e);
                        if (!isValid) return;
                        const success = await register(firstName, lastName, email, phoneNumber, password);
                        if (success){
                            navigate("/customer/");
                        }
                    }}
                    >{t("customer.signupSubmit")}</button>
                </div>
                <Link to="/customer/login" className="text-sm text-[#8B6F47] cursor-pointer">{t("customer.signupLoginLink")}</Link>
            </div>
        </div>
    );
}

export default Signup;