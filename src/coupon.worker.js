import { decryptData } from "Common/functions";
import { exposeWorker } from 'react-hooks-worker';

const getCouponData = (couponData) => {
    if (couponData == undefined) {
        return { data: [] }
    }
    const coupon_list = couponData.map(x => {
        const id = x['id'];
        // console.log('detail: ', x['coupon_details']);
        const data = JSON.parse(decryptData(x['coupon_details']));
        // console.log("parsed: ", data);
        if (data == null) {
            return null;
        }
        return {
            id: id,
            coupon_details: data
        }
    });
    return { data: coupon_list.filter(x => x != null) };
}
exposeWorker(getCouponData);
