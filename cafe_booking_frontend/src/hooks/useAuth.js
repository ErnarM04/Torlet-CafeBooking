import { create } from "zustand";
import axios from "axios";

const URL = "http://127.0.0.1:8000/api/auth"

const useAuth = create((set) => ({
    access: "",
    refresh: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    isLoggedIn: false,
    setAccess: (newAccess) => set({access: newAccess}),
    setToken: (newAccess, newRefresh) => set({access: newAccess, refresh: newRefresh}),
    setUser: (first_name, last_name, email, phone_number) => set({first_name: first_name, last_name: last_name, email: email, phone_number: phone_number}),
    refresh: (refresh) => {
        axios.post(URL+"/refresh/", {
            refresh: refresh
        })
        .then(function (response) {
            console.log(response);
            const {access} = response.data;
            useAuth.getState().setAccess(access);
        })
        .catch(function (error) {
            console.log(error);
        })
    },
    login: async (phone_number, password) => {
        try {
            const response = await axios.post(URL + "/login/", {
                phone_number,
                password,
            });

            const { access, refresh, user } = response.data;
            const { first_name, last_name, email, phone_number: phone } = user;

            set({
                access,
                refresh,
                first_name,
                last_name,
                email,
                phone_number: phone,
                isLoggedIn: true,
            });

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    register: async (first_name, last_name, email, phone_number, password) => {
        axios.post(URL+"/register/", {
            phone_number: phone_number,
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password,

        })
        .then(function (response) {
            console.log(response);
            return login(phone_number, password);
        })
        .catch(function (error) {
            console.log(error);
        })
    },
}));

export default useAuth;