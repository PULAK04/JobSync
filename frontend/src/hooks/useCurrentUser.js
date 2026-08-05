import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../utils/api.js";
import { endpoints } from "../utils/endpoints.js";
import { setHydrated, setUser } from "../redux/slices/authSlice.js";

export const useCurrentUser = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        let active = true;

        api.get(`${endpoints.user}/me`)
            .then(({ data }) => {
                if (active) dispatch(setUser(data.user));
            })
            .catch(() => {
                if (active) dispatch(setUser(null));
            })
            .finally(() => {
                if (active) dispatch(setHydrated(true));
            });

        return () => { active = false; };
    }, [dispatch]);
};
