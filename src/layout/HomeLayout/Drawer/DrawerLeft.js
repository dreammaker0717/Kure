import { Box, Grid, List, Stack, Typography, ListItem, Link, Drawer } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Link as Route } from 'react-router-dom';
import { ROUTE } from 'routes/CONSTANTS';


function DrawerLeft({ setShowDrawerLeft, showDrawerLeft, dataTitle }) {
    const cssDrawerRight = {
        '& 	.MuiDrawer-paper': {
            height: '100vh',
            width: '98vw',
            maxWidth: '440px',
            minWidth: '250px',
            padding: '10px',
            overflow: 'hidden',
            transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
        },
        '& .MuiGrid-root': {
            height: '100vh'
        },
        '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
        }
    };
    const cssHeader = {
        p: '20px 24px',
        mb: '53px'
    };
    const cssLink = {
        ml: 0,
        padding: '20px'
    };
    const cssRouter = {
        display: 'block',
        fontSize: '23px',
        fontWeight: 'bold',
        color: '#000',
        textDecoration: 'none',
        '&:hover':{
            textDecoration: 'underline'
        }
    }

    return (
        <Drawer anchor={'left'} open={showDrawerLeft} onClose={() => setShowDrawerLeft(false)} sx={cssDrawerRight}>
            <Grid>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={cssHeader}>
                    <Typography variant={'h2'}>Products</Typography>
                    <HighlightOffIcon
                        sx={{ width: '50px', minHeight: '50px', cursor: 'pointer' }}
                        onClick={() => setShowDrawerLeft(false)}
                    ></HighlightOffIcon>
                </Stack>
                <List sx={{ mt: '45px', overflow: 'scroll', height: '82%' }}>
                    {dataTitle.map((button, index) => {
                        return (
                            <ListItem sx={cssLink} key={index}>
                                <Route to={`${ROUTE.CATEGORY}/${button.label}`} style={{textDecoration: 'none'}}>
                                    <Typography sx={cssRouter}>{button.label}</Typography>
                                </Route>
                            </ListItem>
                        );
                    })}
                </List>
            </Grid>
        </Drawer>
    );
}

export default DrawerLeft;
