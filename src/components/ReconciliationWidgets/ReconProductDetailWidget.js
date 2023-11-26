import { Box, } from "@mui/material";
import React, { useState } from "react";

import TitleIcon from '@mui/icons-material/Title';
import StoreIcon from '@mui/icons-material/Store';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';


const ReconProductDetailWidget = (props) => {
    const { productDetails } = props;

    if(!productDetails){
        return <></>
    }
    return (
        <Box sx={{ display: 'flex', mb: '15px', flexDirection: 'column' }}>
            <List>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                            <TitleIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={productDetails.title} />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#024151', color: '#ffffff' }}>
                            <StoreIcon sx={{ backgroundColor: '#024151', color: '#ffffff' }} />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`Store: ${productDetails.store_name}`} />
                </ListItem>
            </List>
        </Box>
    );
};

export default ReconProductDetailWidget;