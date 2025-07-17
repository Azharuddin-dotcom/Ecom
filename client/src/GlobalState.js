import { createContext, useEffect, useState } from "react";
import ProductAPI from "./api/ProductAPI";
import UserAPI from "./api/UserAPI";
import CategoriesAPI from "./api/CategoriesAPI";
import axios from "./components/mainpages/utils/axios.js";

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {

    const [token, setToken] = useState(false);

    const refreshToken = async () => {
        try {
            const res = await axios.get(`/user/refresh_token`);
            console.log(res);
            const accessToken = res.data.accesstoken;
            setToken(accessToken);
            localStorage.setItem('token', accessToken);
        } catch (err) {
            alert(err.response.data.msg);
            localStorage.removeItem('firstLogin');
        }
    }

    useEffect(() => {
        const firstLogin = localStorage.getItem('firstLogin');
        if(firstLogin) {
            refreshToken();
        }    
    },[]);

    const state = {
        token: [token, setToken],
        productsAPI: ProductAPI(),
        userAPI: UserAPI(token),
        categoriesAPI: CategoriesAPI()
    }
 
    return(
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    )
}