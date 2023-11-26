import { Box, Grid, Typography } from '@mui/material';
import CartStory from 'components/CartStory';
import { useState } from 'react';
const FarmStoriesPage = () => {
    const [text, settext] = useState('Five years ago, Rayna Grace Matthews and her wife, Kara Crockett, moved to Potter Valley to take over the cannabis farm and property purchased by Rayna’s parents in 2005.');
    const [farmStoryArray, setfarmStoryArray] = useState([1, 2, 3, 4, 5, 6]);
    const cssSwitchPages = {
        color: '#57c4c1',
        p: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    };
    return (
        <Box sx={{ px: '15px' }}>
            <Typography sx={{ fontSize: '3.8rem', lineHeight: '5rem', }}>Farm Stories</Typography>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 2 }} sx={{ mt: '16px' }}>
                {farmStoryArray.map((farmstory, index) => {
                    return (
                        <Grid item xs={12} md={3} sm={4} key={index}>
                            <CartStory />
                        </Grid>
                    )
                })}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
                {/* <KeyboardDoubleArrowLeftIcon /> */}
                {/* <Typography sx={cssSwitchPages}>&lsaquo;&lsaquo;</Typography> */}
                <Typography sx={{ p: '8px', fontSize: '16px' }}>Page 1</Typography>
                <Typography sx={cssSwitchPages}>&rsaquo;&rsaquo;</Typography>
                {/* <KeyboardDoubleArrowRightIcon /> */}
            </Box>
        </Box>
    );
};

export default FarmStoriesPage;