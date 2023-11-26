import { Box, Grid, Typography } from '@mui/material';
import defaultImage from 'assets/images/kure_lm_default_product_image.jpg';
import CartStory from 'components/CartStory';
import { useState } from 'react';

const FarmDetailPage = () => {
    const [farmStoryArray, setfarmStoryArray] = useState([1, 2, 3]);
    return (
        <Box>
            <Box sx={{ background: '#454545', mb: '25px' }}>
                <Grid container sx={{ width: '100%', height: { sm: '520px', xs: 'auto' } }}>
                    <Grid item xs={12} sm={8}>
                        <Box sx={{ m: '10%' }}>
                            <Typography variant="h2" sx={{ fontSize: { xs: '2.4rem', sm: '3.8rem' }, lineHeight: { sm: '5rem', xs: '3.3rem' } }}>From Smuggling to Surviving</Typography>
                            <Typography sx={{ fontSize: '16px' }}>Elk Creek Genetics Brings a Half-Century of Cannabis Experience to Consumers</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ height: '100%', width: '100%', maxWidth: '100%' }}>
                        <img src={defaultImage} alt="" width={'100%'} height={'100%'} />
                    </Grid>
                </Grid>
            </Box>
            <Box>

            </Box>
            <Box sx={{ p: { xs: '30px 10px 30px 10px', md: '48px', background: '#454545' } }}>
                <Box sx={{ textAlign: 'center', mb: '30px' }}>
                    <Typography variant="h2" sx={{ fontSize: '1.75rem' }}>
                        VIEW OTHER STORIES
                    </Typography>
                </Box>
                <Box sx={{ px: { xs: '0px', sm: '70px' } }}>
                    <Grid container columnSpacing={{ xs: 2 }} sx={{ mt: '16px' }}>
                        {farmStoryArray.map((farmstory, index) => {
                            return (
                                <Grid item xs={12} md={4} sm={6} key={index}>
                                    <CartStory />
                                </Grid>
                            )
                        })}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default FarmDetailPage;