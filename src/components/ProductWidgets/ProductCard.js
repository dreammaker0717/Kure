import { Box, Link, Card, CardActions, CardContent, Button, Skeleton, Typography } from '@mui/material';
import { Link as Route } from 'react-router-dom';
import Image from 'components/Image/index';
import { useContext, useState } from 'react';
import { addRemoveProductFromCart } from 'services/idb_services/orderManager';
import { customToast } from 'components/CustomToast/CustomToast';
import { CircularProgress } from '@mui/material';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';

function ProductCard({ variation, index }) {
  const { profileData } = useContext(UsersProfileContext);
  const [isBusy, setIsBusy] = useState(false);

  const addToCart = (variation) => {
    setIsBusy(true);
    addRemoveProductFromCart(variation)
      .then((toast_response) => {
        setTimeout(() => {
          // I set timeout because to show loading effect.
          setIsBusy(false);
        }, 500);
        const { status, data, message } = toast_response;
        if (status === false) {
          customToast.error(message);
        } else {
          customToast.success('Successfully added to cart');
        }
      })
      .catch((err) => {
        console.log(err);
        setIsBusy(false);
      });
  };

  return (
    <Card>
      <Box sx={{ height: { xs: '150px', sm: '184px', md: '184px', lg: '159px', xl: '200px' }, lineHeight: 0 }}>
        <Route to={`/${variation.link}`}>
          <Image index={index} alt="" sx={{ height: '100%' }} src={variation.product_image} />
        </Route>
      </Box>
      <CardContent sx={{
        p: '10px', height: {
          md: '96px',
          xs: "80px"
        }
      }}>
        <Typography variant="body2" color="text.secondary">
          <Link
            component={Route}
            to={`/${variation.link}`}
            sx={{
              fontSize: '1rem',
              lineHeight: { xs: 1.1, md: 1.5 },
              textDecoration: 'none',
              color: '#000',
              fontWeight: 700,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              '&:hover': { '&.MuiTypography-inherit': { color: '#32BEB9' } }
            }}
          >
            {variation.title ? variation.title : <Skeleton width="60%" />}
          </Link>
        </Typography>
        <Box
          sx={{
            p: '5px 0',
            color: '#000',
            fontSize: '0.875rem',
            '& .MuiTypography-root': { fontWeight: 700 }
          }}
        >
          {!variation?.promotional_retail_price && !variation.retail_price ? <Skeleton width="20%" /> : null}
          {variation?.promotional_retail_price ? (
            <Box sx={{ '& span': { fontSize: '15px', lineHeight: '30px', fontWeight: 'bold' }, display: 'flex' }}>
              {variation?.promotional_retail_price === variation?.retail_price ? (
                <Typography component="span" width="20%">
                  {`$${variation?.promotional_retail_price}`}
                </Typography>
              ) : (
                <Box sx={{ '& span': { fontSize: '15px', lineHeight: '30px', fontWeight: 'bold' }, display: 'flex' }}>
                  <Typography
                    component="span"
                    sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '10px', fontWeight: 400 } }}
                  >
                    {`$${variation?.retail_price}`}
                  </Typography>
                  <Typography component="span" width="20%">
                    {`$${variation?.promotional_retail_price}`}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ '& span': { fontSize: '15px', lineHeight: '30px', fontWeight: 'bold' }, display: 'flex' }}>
              <Typography component="span" width="20%">
                {`$${variation?.retail_price}`}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: '10px', pt: 0 }}>
        {variation.promotional_retail_price || variation.retail_price ? (
          <Button
            sx={{
              width: '100%',
              color: '#fff',
              textTransform: 'uppercase',
              backgroundColor: '#32BEB9',
              border: '1px solid #32BEB9',
              height: '38px',
              textAlign: 'center',
              '&:hover': { backgroundColor: '#32BEB9' }
            }}
            disabled={isBusy}
            onClick={() => addToCart(variation)}
            data-pid={variation.variation_id}
            data-price={variation.promotional_retail_price && variation.retail_price}
            data-title={variation.title}
          >
            {isBusy && <CircularProgress sx={{ color: 'white', marginRight: '10px' }} size={'15px'} />}ADD TO CART
          </Button>
        ) : (
          <Skeleton width="100%" sx={{ height: '38px' }} />
        )}
      </CardActions>
    </Card>
  );
}

export default ProductCard;
