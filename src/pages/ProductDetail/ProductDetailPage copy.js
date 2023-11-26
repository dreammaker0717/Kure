import { Box, Grid, Typography, OutlinedInput, Button, ButtonGroup, Skeleton, Tooltip } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import minusIcon from 'assets/images/icons/icon-minus-light.svg';
import plusIcon from 'assets/images/icons/icon-plus-light.svg';
import Image from 'components/Image/index';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { addRemoveProductFromCart, getValidQuantityOfProduct } from 'services/idb_services/orderManager';
import { convertToNumber } from 'Common/functions';
import { CircularProgress } from '@mui/material';
import { SIG_ALL_PRODUCT_FETCHED, SIG_CHANNEL } from 'Common/signals';
import { customToast } from 'components/CustomToast/CustomToast';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import dateFormater from 'utils/dateFormater';
import { useCartData } from 'services/context_services/cartDataContext';

const db = new KureDatabase();
const ProductDetailPage = () => {
  const { values: cartData } = useCartData();
  // const { profileData } = useContext(UsersProfileContext);
  const location = useLocation();
  const isOnline = navigator.onLine;
  const [quantity, setQuantity] = useState(1);
  const [variation, setVariation] = useState();
  const [formatedDate, setFormatedDate] = useState();
  const [loading, setLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [stock, setStock] = useState(0);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location])

  const fetchData = async () => {
    console.log('fetchData');
    const product_name = location.pathname.substring(1);

    const data = await db.getAllFromIndex('link', product_name, IDB_TABLES.product_data);
    console.log("FFF", data)
    if (data.length == 0) return;
    console.log("NN: ", data[0].variation_id);
    const _stock = await getValidQuantityOfProduct(data[0].variation_id);
    if (data.length) {
      setVariation({ ...data[0] });
      setLoading(false);
    }
    setStock(_stock);
  };

  useEffect(() => {
    db.count(IDB_TABLES.product_data)
      .then((count) => {
        console.log("COUNT: ", count);
        if (count) {
          fetchData().catch(console.error);
        }
      });
  }, [location, cartData]);

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { type } = event.data;
      switch (type) {
        case SIG_ALL_PRODUCT_FETCHED:
          fetchData();
          break;
      }
    });
  }, []);

  useEffect(() => {
    const data = Number(variation?.last_inventory_count_date);
    const transformToDate = new Date(data * 1000);
    setFormatedDate(dateFormater(transformToDate));
  }, [variation]);

  const setPlusMinusQuantity = (c) => {
    let cur_quantity = quantity;
    cur_quantity += c;
    if (cur_quantity < 1 || cur_quantity > stock) {
      if (stock == 0) {
        customToast.warn("This product is currently unavailable.");
      } else if (cur_quantity > stock) {
        customToast.warn("The available quantity for this product is " + stock);
      }
      return;
    }
    setQuantity(cur_quantity)
  }
  const addToCart = () => {
    setIsBusy(true);
    addRemoveProductFromCart(variation, quantity)
      .then((toast_response) => {
        setTimeout(() => {
          setIsBusy(false);
        }, 500);

        const { status, data, message } = toast_response;
        if (status === false) {
          customToast.error(message);
        } else {
          customToast.success(message);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsBusy(false);
      });
  };

  return (
    <Box sx={{ m: '50px 0 100px', p: 0 }}>
      {
        // If offline show "offline" caption.
        !isOnline && (
          <Box
            sx={{
              m: '0 1rem',
              mb: '1rem',
              p: '4px 8px',
              borderRadius: '8px',
              bgcolor: '#57c4c1',
              width: 'fit-content'
            }}
          >
            <Typography children="Offline" sx={{ fontStyle: 'italic', color: '#fff' }} />
          </Box>
        )
      }
      <Grid
        container
        rowSpacing={1}
        sx={{ '&.MuiGrid-container': { m: '0 -16px 0 0', maxWidth: '100vw' } }}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
      >
        <Grid item xs={12} sm={6} sx={{ '&.MuiGrid-item': { p: '0 1rem' } }}>
          <Box width="100%" height="100%">
            {/* {variation?.product_image && !loading && ( */}
            <Image onLoad={() => setLoading(false)} src={variation?.product_image} alt="" sx={{ height: '100%' }} />
            {/* )} */}
            {/* {!variation?.product_image && loading && <Skeleton variant="rectangular" height="100%" width="100%" sx={{ bgcolor: '#fff' }} />} */}
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
            {!loading ? variation?.title : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="80%" />}
          </Typography>

          {variation?.promotional_retail_price ? (
            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
              {variation?.promotional_retail_price === variation?.retail_price ? (
                <Typography component="span" width="20%">
                  {!loading ? `$${variation?.promotional_retail_price}` : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />}
                </Typography>
              ) : (
                <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                  <Typography
                    component="span"
                    sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                  >
                    {!loading ? `$${variation?.retail_price}` : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />}
                  </Typography>
                  <Typography component="span" width="20%">
                    {!loading ? `$${variation?.promotional_retail_price}` : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
              <Typography component="span" width="20%">
                {!loading ? `$${variation?.retail_price}` : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />}
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
              {!loading ? (
                <Typography children={variation?.strain} component="span" sx={{ fontSize: '1rem' }} />
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Product Type"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={variation?.category_name} component="span" sx={{ fontSize: '1rem' }} />
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Quantity on Hand"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={stock} component="span" sx={{ fontSize: '1rem' }} />
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Last Inventory Count Date"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={formatedDate} component="span" sx={{ fontSize: '1rem' }} />
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%" />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Box width="250px">
              <Typography component="p" children="QUANTITY" sx={{ '&.MuiTypography-root': { mb: '4px', fontSize: '10px' } }} />
              <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Box width="40px" height="40px" sx={{ border: '1px solid #fff', cursor: 'pointer' }}
                  onClick={() => setPlusMinusQuantity(-1)}>
                  <Image src={minusIcon} alt="" />
                </Box>
                <OutlinedInput
                  value={quantity}
                  sx={{
                    borderRadius: 0,
                    width: '55px',
                    height: '40px',
                    m: '0 5px',
                    color: '#fff',
                    textAlign: 'center',
                    '&:hover': { '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' } },
                    '& .MuiInputBase-input': {
                      textAlign: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' }
                  }}
                />
                <Box
                  width="40px"
                  height="40px"
                  sx={{ border: '1px solid #fff', cursor: 'pointer' }}
                  onClick={() => setPlusMinusQuantity(1)}
                >
                  <Image src={plusIcon} alt="" />
                </Box>
              </ButtonGroup>
            </Box>
            <Box>
              <Typography component="p" children="SUBTOTAL" sx={{ '&.MuiTypography-root': { mb: '4px', fontSize: '10px' } }} />
              <Typography
                component="p"
                sx={{ fontWeight: 600, fontSize: '22px', pt: '3px' }}
                children={
                  '$' +
                  (
                    convertToNumber(variation?.promotional_retail_price ? variation?.promotional_retail_price : variation?.retail_price) *
                    quantity
                  ).toFixed(2)
                }
              //children={productData?.retail_price}
              />
            </Box>
          </Box>
          <Button
            sx={{
              maxWidth: '350px',
              width: '100%',
              bgcolor: '#32BEB9',
              p: '7px',
              color: '#fff',
              borderRadius: 0,
              opacity: stock === 0 ? 0.5 : 1,
              m: '20px 0',
              '&:hover': { bgcolor: '#32BEB9' }
            }}
            disabled={stock === 0 || isBusy == true}
            onClick={addToCart}
          >
            {isBusy && <CircularProgress sx={{ color: 'white', marginRight: '10px' }} size={'15px'} />} ADD TO CART
          </Button>
          <Typography component="p" sx={{ fontWeight: 'bolder' }} children="NOTE: WE ONLY ACCEPT CASH" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
