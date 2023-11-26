import { Box, Grid, Typography, Card, CardActionArea, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import defaultImage from 'assets/images/kure_lm_default_product_image.jpg';
import iconRead from 'assets/images/icons/icons8-right-24.png';

const CartStory = () => {
    const cssCard = {
        background: '#6e6e6e',
        border: '1px solid #7a7a7a',
        height: '100%',
        '&:hover': {
            border: 'solid 1px #57c4c1'
        }
    };
    const cssRead = {
        display: 'flex',
        color: '#57c4c1',
        '&:hover': {
            textDecoration: 'underline'
        }
    }
    return (
        <Card sx={cssCard}>
            <CardActionArea sx={{ height: '100%' }}>
                <CardMedia
                    component="img"
                    height="300"
                    image={defaultImage}
                    alt="green iguana"
                />
                <CardContent sx={{ color: '#FFF', height: 'calc( 100% - 340px )', px: '15px' }}>
                    <Typography variant="h2" sx={{ fontWeight: '400', mb: '8px !important' }}>
                        {text}Women Farmers Bring Spirit and Ethics to the Garden
                    </Typography>
                    <Typography sx={{ fontSize: '1.1em', mb: '8px !important' }}>
                        Five years ago, Rayna Grace Matthews and her wife, Kara Crockett, moved to Potter Valley to take over
                        the cannabis farm and property purchased by Rayna’s parents in 2005.
                    </Typography>
                    <Typography sx={{ fontSize: '1.1em', mb: '8px !important' }}>
                        Walking through their compact and blessedly flat garden east of Potter Valley,
                        it is easy to see why Rayna’s family was attracted to this location.
                    </Typography>
                </CardContent>
                <CardActions sx={{ px: '15px' }}>
                    <Typography sx={cssRead}>Read More <img src={iconRead} alt="ProductImage" /></Typography>
                </CardActions>
            </CardActionArea>
        </Card>
    );
};

export default CartStory;