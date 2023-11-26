import React from 'react';
import { Box, Grid, Typography, OutlinedInput, Button, ButtonGroup, Skeleton, Divider } from '@mui/material';

const OneProductInfoWidget = (props) => {
    const { loading, title, value, sx, component } = props;
    return (
        <Box sx={sx ? sx : { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
            <Typography
                children={title}
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component={component ? component : "span"}
            />
            {!loading ? (
                <Typography children={value} component="span" sx={{ fontSize: '1rem' }} />
            ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />
            )}
        </Box>
    );
};

export default OneProductInfoWidget;