import { ButtonCategories } from 'Common/constants';
import { createContext, useContext, useEffect, useRef, useState, } from 'react';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
const db = new KureDatabase();
export const CommonDataIndex = {
    OPEN_NOTIFICATION_DRAWER: "open_notification_drawer",
    OPEN_ACCOUNT_DRAWER: 'open_account_drawer',
    OPEN_CART_DRAWER: 'open_cart_drawer',
    OPEN_SEARCH_PRODUCT_DRAWER: "open_search_product_drawer",
    IS_LOGGED_IN: 'is_logged_in',
    STORES: 'stores',
    SEL_STORE: 'sel_store',
    VALID_CATEGORIES: 'valid_categories',
    WIDTH:"width",
    HEIGHT:"height",
    IS_SCROLLED:"is_scrolled"
}
export const CommonDataContext = createContext({
    values: {},
    commonData: {},
    setValue: () => { },
    setValueObjects: () => { },
});

const init_data = {
    [CommonDataIndex.OPEN_NOTIFICATION_DRAWER]: false,
    [CommonDataIndex.IS_LOGGED_IN]: false,
    [CommonDataIndex.STORES]: [],
    [CommonDataIndex.SEL_STORE]: parseInt(localStorage.getItem('store_id') || 2),
    [CommonDataIndex.VALID_CATEGORIES]:  [...ButtonCategories],
    [CommonDataIndex.OPEN_ACCOUNT_DRAWER]: false,
    [CommonDataIndex.OPEN_CART_DRAWER]: false,
    [CommonDataIndex.OPEN_SEARCH_PRODUCT_DRAWER]: false,
    [CommonDataIndex.WIDTH]: 400,
    [CommonDataIndex.HEIGHT]: 768,
    [CommonDataIndex.IS_SCROLLED]: true,
}
export const CommonDataProvider = ({ children }) => {
    const [values, setValues] = useState({ ...init_data });
    const valueRef = useRef({ ...init_data });

    useEffect(() => {

    }, [])
    const setValue = (key, value) => {
        valueRef.current[key] = value;
        apply();
    }

    const setValueObjects = (object) => {
        const keys = Object.keys(object);
        for(let i = 0; i < keys.length; i++){
            valueRef.current[keys[i]] = object[keys[i]];
        }
        apply();
    }
    // console.log("Cai:CommonDataProvider", { values });

    const apply = () => {
        setValues({ ...valueRef.current });
    };

    return (
        <CommonDataContext.Provider
            value={{
                values,
                commonData: values,
                setValue,
                setValueObjects,
            }}
        >
            {children}
        </CommonDataContext.Provider>
    );
}
export const useCommonData = () => {
    const context = useContext(CommonDataContext);
    if (context === undefined) {
        throw new Error("useCommonData must be used within a CommonDataProvider");
    }
    return context;
};