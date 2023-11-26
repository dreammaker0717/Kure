import { useEffect, useState, } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography
} from '@mui/material';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import './../styles.css'
import RoundedBox from "components/Roundedbox/RoundedBox";

const OverviewPage = () => {
    const data = [
        {
            title: 'Software checking',
            Icon: <BookmarkAddedIcon />,
            subtitle: '2,241 assistance',
            price: '$215, 890',
            priceGrowth: ' + 4.45',
            upPrice: '20,00',
            downPrice: '10,00',
        }
    ]
    return (
        <div className='dashboard-content'>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <RoundedBox color={"blueBox"} data={data}></RoundedBox>
                </Grid>
                <Grid item xs={4}>
                    <RoundedBox color={"yellowBox"} data={data}></RoundedBox>
                </Grid>
                <Grid item xs={4}>
                    <RoundedBox color={"blackBox"} data={data}></RoundedBox>
                </Grid>
            </Grid>
           
        </div>
    );
};

export default OverviewPage;