import DrawerProductAddWidget from "layout/HomeLayout/Drawer/DrawerCheckoutWidgets/DrawerProductAddWidget";
import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import CameraEnhanceIcon from "@mui/icons-material/CameraEnhance";
import ProductQRCaptureModal from "components/ProductQRCaptureModal/ProductQRCaptureModal";

import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";

const cssCamera = {
    display: 'flex',
    cursor: 'pointer',
    color: '#32BEB9',
    ':hover': {
        color: '#44ffbb'
    },
    width: '40px',
    height: '40px',
};

const db = new KureDatabase();
const ReconProductSelectWidget = (props) => {
    const { setProductData } = props;
    const [openQRPane, setOpenQRPane] = useState(false);


    const onClickOpenQR = (is_delete) => {
        setIsDeletion(is_delete);
        setOpenQRPane(true);
    };

    const onClickProduct = (variation) => {
        setProductData(variation);
    };

    const onQrScan = async (package_uid_with_count) => {
        // package_uid_with_count will contain a dash and a number at the end of the string, i.e. 1A406030004086D000034503-1
        // We need to remove the dash and the number from the string to get the package_uid.
        const package_uid = package_uid_with_count.split('-')[0];
        const result = await db.getAllFromIndexList({ package_uid: package_uid }, IDB_TABLES.product_data);
        console.log(result[0]);
        setProductData(result[0]);
    };

    return (
        <div>
            {openQRPane &&
                <ProductQRCaptureModal
                    open={openQRPane}
                    isDeletion={false}
                    onClose={() => {
                        setOpenQRPane(false)
                    }}
                    onQrScan={onQrScan}
                />
            }
            <Typography sx={{ fontSize: 14, mb: '.5em!important' }} color="text.secondary" gutterBottom>
                Find a product via a manual search or scan a QR code to begin.
            </Typography>
            <Box sx={{ display: 'flex', mb: '15px', gap: '1em' }}>
                <DrawerProductAddWidget onClickProduct={onClickProduct} />
                <CameraEnhanceIcon
                    sx={cssCamera}
                    onClick={() => onClickOpenQR(false)}
                />
            </Box>
        </div>
    );
};

export default ReconProductSelectWidget;