import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, OutlinedInput, Button, ButtonGroup, Skeleton, Tooltip } from '@mui/material';
import { getValidQuantityOfProduct } from 'services/idb_services/orderManager';
import Image from 'components/Image/index';
const ReconProductDetailWidget = (props) => {
    const { variationDetails } = props;
    const [stock, setStock] = useState(0);

    const fetchData = async () => {
        const _stock = await getValidQuantityOfProduct(variationDetails?.variation_id);
        setStock(_stock);
    };
    useEffect(() => {
        if (variationDetails == undefined) return;
        fetchData();
    }, [variationDetails])

    if (!variationDetails) return <></>
    return (
        <Box>
            <Grid
                container
                rowSpacing={1}
                sx={{ '&.MuiGrid-container': { m: '0 -16px 0 0', maxWidth: '100vw' } }}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            >
                <Grid item xs={12} sm={6} sx={{ '&.MuiGrid-item': { p: '0 1rem' } }}>
                    <Box width="100%" height="100%">
                        {variationDetails?.product_image && (
                            <Image src={variationDetails?.product_image} alt="" sx={{ height: '100%' }} />
                        )}
                        {!variationDetails?.product_image && <Skeleton variant="rectangular" height="100%" width="100%" sx={{ bgcolor: '#fff' }} />}
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ '&.MuiGrid-item': { p: '0 1rem' } }}>
                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: "18px", md: '36px' },
                            fontWeight: 600,
                            '&.MuiTypography-root': { mb: '20px', mt: { xs: '20px', sm: '0' } }
                        }}
                    >
                    </Typography>

                    {variationDetails?.promotional_retail_price ? (
                        <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                            {variationDetails?.promotional_retail_price === variationDetails?.retail_price ? (
                                <Typography component="span" width="20%">
                                    {`$${variationDetails?.promotional_retail_price}`}
                                </Typography>
                            ) : (
                                <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                                    <Typography
                                        component="span"
                                        sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                                    >
                                        {`$${variationDetails?.retail_price}`}
                                    </Typography>
                                    <Typography component="span" width="20%">
                                        {`$${variationDetails?.promotional_retail_price}`}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                            <Typography component="span" width="20%">
                                {`$${variationDetails?.retail_price}`}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ mt: { xs: "10px", md: "40px" }, mb: { xs: "10px", md: "75px" } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                                children="Product Strain"
                                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                component="span"
                            />

                            <Typography children={variationDetails?.strain} component="span" sx={{ fontSize: '1rem' }} />

                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                                children="Product Type"
                                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                component="span"
                            />

                            <Typography children={variationDetails?.category_name} component="span" sx={{ fontSize: '1rem' }} />

                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
                            <Typography
                                children="Quantity on Hand"
                                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                                component="span"
                            />
                            <Typography children={stock} component="span" sx={{ fontSize: '1rem' }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReconProductDetailWidget;