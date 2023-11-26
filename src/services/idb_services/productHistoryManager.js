import { getUUID } from "Common/functions";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { Resource } from "services/api_services/Resource";

const db = new KureDatabase();
let resource = new Resource();

export const getProductHistoryList = async () => {
    const data = await db.getAll(IDB_TABLES.product_history);
}

export const addProductToHistory = async (package_uid, label) => {
    label = label.trim();
    // console.log(package_uid, label)
    let sel_product = await db.getAllFromIndexList({ "package_uid": package_uid }, IDB_TABLES.product_data);
    if (!sel_product) return [];
    sel_product = sel_product[0]
    // console.log('sel_product', sel_product)
    const existings = await getProductHistory(package_uid);
    // console.log('existings', existings)
    if (existings.find(x => x.label == label) == undefined) {
        await db.put([{
            id: getUUID(),
            ...sel_product,
            label: label,
            created: new Date().getTime()
        }],
            IDB_TABLES.product_history
        );
        // console.log("addProductToHistory>>", "created")
        return await getProductHistory(package_uid);
    }
    else {
        // console.log("addProductToHistory>>", "existing")
        return existings;
    }
}
export const getProductHistory = async (package_uid) => {
    const history_list = await db.getAllFromIndexList({ "package_uid": package_uid }, IDB_TABLES.product_history);
    if (!history_list || history_list == undefined) {
        return [];
    }
    return history_list;
}