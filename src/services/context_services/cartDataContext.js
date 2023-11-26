import { createContext, useContext, useEffect, useRef, useState, } from 'react';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
const db = new KureDatabase();
export const CartDataIndex = {
    CART: 'cart',
    FORCE_ORDER_ID: "force_order_id",
    CUSTOMER_KEYWORD: "customer_keyword"
}
export const CartDataContext = createContext({
    values: {},
    commonData: {},
    setValue: () => { },
    setValueObjects: () => { },
});
const init_data = {
    [CartDataIndex.CART]: null,
    [CartDataIndex.FORCE_ORDER_ID]: "",
    [CartDataIndex.CUSTOMER_KEYWORD]: "",
}
export const CartDataProvider = ({ children }) => {
    const [values, setValues] = useState({ ...init_data });
    const valueRef = useRef({ ...init_data });

    const setValue = (key, value) => {
        valueRef.current[key] = value;
        apply();
    }

    const setValueObjects = (object) => {
        const keys = Object.keys(object);
        for (let i = 0; i < keys.length; i++) {
            valueRef.current[keys[i]] = object[keys[i]];
        }
        apply();
    }
    // console.log("Cai:CartDataProvider", { values });
    const apply = () => {
        setValues({ ...valueRef.current });
    };

    return (
        <CartDataContext.Provider
            value={{
                values,
                commonData: values,
                setValue,
                setValueObjects,
            }}
        >
            {children}
        </CartDataContext.Provider>
    );
}
export const useCartData = () => {
    const context = useContext(CartDataContext);
    if (context === undefined) {
        throw new Error("useCartData must be used within a CartDataProvider");
    }
    return context;
};