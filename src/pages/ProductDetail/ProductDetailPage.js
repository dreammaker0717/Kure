import { Box, Grid, Typography, OutlinedInput, Button, ButtonGroup, Skeleton, Tooltip } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
// import minusIcon from 'assets/images/icons/icon-minus-light.svg';
// import plusIcon from 'assets/images/icons/icon-plus-light.svg';
import Image from 'components/Image/index';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import {
  addRemoveProductFromCart,
  getValidQuantityOfProduct,
  getStockProduct
} from 'services/idb_services/orderManager';
import {
  convertToNumber, filterAndSortProducts,
  getColorOfVariation,
  getSizeOfVariation,
  getUniqueArray,
  monetizeToLocal
} from 'Common/functions';
import { CircularProgress } from '@mui/material';
import { SIG_PRODUCT_STOCK_CHANGED, SIG_CHANNEL } from 'Common/signals';
import { customToast } from 'components/CustomToast/CustomToast';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import dateFormater from 'utils/dateFormater';
import { useCartData } from 'services/context_services/cartDataContext';
import { fetchProductDataByProductId } from 'services/idb_services/productManager';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PRODUCT_COLOR, PRODUCT_SIZE } from 'Common/constants';
import { useParams } from 'react-router';
import './ProductDetailPage.css'
import { useNavigate } from 'react-router';

const db = new KureDatabase();
const ProductDetailPage = () => {
  const { drupal_variation_link, drupal_variation_id } = useParams();
  const navigate = useNavigate();
  // console.log(drupal_variation_link, drupal_variation_id);
  const { values: cartData } = useCartData();
  // const { profileData } = useContext(UsersProfileContext);
  const location = useLocation();
  const isOnline = navigator.onLine;
  const [quantity, setQuantity] = useState(1);
  const [variation, setVariation] = useState(null);
  const [variationList, setVariationList] = useState([]);

  const [attList, setAttList] = useState();

  const [formattedDate, setFormattedDate] = useState();
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location])

  useEffect(() => {
    if (!variation) return;
    if (!variation.attributes) return;
    if (drupal_variation_link == variation.link && drupal_variation_id == variation.variation_id) return;
    navigate({
      pathname: `/${variation.link}/${variation.variation_id}`
    })
  }, [variation])

  useEffect(() => {
    // read variation list at first page loading.

    if (!drupal_variation_link) return;
    // if (isOnline) setLoading(true);

    db.getAllFromIndex('link', drupal_variation_link, IDB_TABLES.product_data).then((data) => {
      if (data.length == 0) return;

      data = filterAndSortProducts(data);
      setVariationList(data);
      setCurrentVariation(data);
      // const product_id = data[0].product_id;
      // we should try to fetch data from drupal, too.
      // fetchProductDataByProductId(product_id).then((res) => {
      //   // console.log("DURPAL PRODUCT INFO: ", res);
      //   setLoading(false);
      //   if (!res && res != undefined) {
      //     setCurrentVariation(res);
      //     setVariationList(res);
      //   }
      // })
    });
  }, [drupal_variation_link]);

  const setCurrentVariation = (variationList) => {
    // console.log("VVV: ", variationList)
    // console.log('variationlist changed', variationList);
    // if variation list is fetched, we need to set current variation.
    if (!variationList) return;
    if (variationList.length == 0) return;

    let _attr = {};
    let is_set = false;
    for (let i = 0; i < variationList.length; i++) {
      const v = variationList[i];
      if (!v.attributes || !v.attributes.color || !v.attributes.size) continue;
      const _color = Object.entries(v.attributes.color)[0];
      const _size = Object.entries(v.attributes.size)[0];
      if (!_attr[_color[0]]) {
        _attr[_color[0]] = {
          name: _color[1],
          sizes: []
        };
      }
      _attr[_color[0]]['sizes'].push({
        size: _size[0],
        name: _size[1],
        vid: v.variation_id
      })
      is_set = true;
    }
    if (is_set) {
      setAttList(_attr);
    }
    // console.log("__ATR: ", _attr);
    // const _color_list = getUniqueArray(variationList.filter(x => x.attributes != null).map(x => x.attributes.color).map(x => (Object.keys(x))[0]))
    // const _size_list = getUniqueArray(variationList.filter(x => x.attributes != null).map(x => x.attributes.size).map(x => (Object.keys(x))[0]))
    // setSizeList(_size_list)
    // setColorList(_color_list)


    // @TODO: This condition is in the wrong place. Or better, it should utilize a query to the IDB store to get the
    //        variation. We can't rely on the variationList because it most likely has been filtered out by the parent
    //        caller.
    if (drupal_variation_id) {
      setVariation(variationList.find(x => x.variation_id == drupal_variation_id))
      setStock(variationList.find(x => x.variation_id == drupal_variation_id)?.stock);
    } else {
      if (variation) return;
      const variation_id_list = variationList.map(x => x.variation_id);
      let tmp_variation_id = null;
      if (cartData.cart) {
        const existing_variations = cartData.cart.order_items.filter(x => variation_id_list.includes(x.purchased_entity.variation_id)).map(x => x.purchased_entity.variation_id);
        if (existing_variations.length > 0) {
          tmp_variation_id = existing_variations[0];
        }
      }
      // console.log("tmp_variation_id: ", tmp_variation_id, variationList);
      if (tmp_variation_id != null) {
        setVariation(variationList.find(x => x.variation_id == tmp_variation_id))
        setStock(variationList.find(x => x.variation_id == tmp_variation_id)?.stock);
      } else {
        setVariation(variationList[0]);
        setStock(variationList[0]?.stock);
      }
    }

    // console.log("CART DATA: ", cartData);
  }
  // console.log("VARIATION", variation);

  useEffect(() => {
    if (!variation) return;
    // getValidQuantityOfProduct(variation.variation_id).then((_stock) => {
    //   console.log("STOCK 2: ", _stock)
    //   console.log("variation 2: ", variation)
    //   console.log("variation_id 2: ", variation.variation_id)
    //   setStock(_stock);
    // })
    // }, [variation, cartData]);
  }, [variation]);

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { type, data } = event.data;
      const _data = data;
      console.log(type);
      switch (type) {
        /**
         * @TODO: We need to add a new signal for when a push notification is processed for a variation.
         */
        case SIG_PRODUCT_STOCK_CHANGED:
          console.log("variation === ", drupal_variation_id);
          if (!drupal_variation_id) return;
          getStockProduct(drupal_variation_id).then((_stock) => {
            setStock(_stock);
          })
          break;
      }
    });
  }, []);

  useEffect(() => {
    const data = Number(variation?.last_inventory_count_date);
    const transformToDate = new Date(data * 1000);
    setFormattedDate(dateFormater(transformToDate));
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

  const sel_color = getColorOfVariation(variation)
  const sel_size = getSizeOfVariation(variation)
  // console.log("ATTR List: ", attList)

  const onChangeColor = (new_color) => {
    if (!variationList) return;
    if (!variation) return;
    const v_color = getColorOfVariation(variation);
    // console.log("COLOR: ", new_color, v_color)
    if (v_color == new_color) return;
    // const _sizes
    const color_info_list = attList[new_color];
    // console.log("color_info_list: ", attList, color_info_list);
    if (color_info_list.length == 0) return;
    const tmp_variation_id = color_info_list.sizes[0].vid;
    const tmp_variation = variationList.find(x => x.variation_id == tmp_variation_id);
    setVariation(tmp_variation);
  }

  const onChangeSize = (new_size) => {
    // console.log("new_size: ", new_size)
    if (!variationList) return;
    if (!variation) return;
    const v_color = getColorOfVariation(variation);
    const v_size = getSizeOfVariation(variation);

    if (new_size == v_size) return;
    const _att = attList[v_color]['sizes'].find(x => x.size == new_size);
    if (!_att) return;

    const tmp_variation_id = _att['vid'];
    const tmp_variation = variationList.find(x => x.variation_id == tmp_variation_id);
    setVariation(tmp_variation);
  }
  // console.log("sel ", sel_color, sel_size, variation)
  // console.log("attrList: ", attList);
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
            <Typography children="Offline" sx={{ fontStyle: 'italic', color: '#fff' }}/>
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
            <Image src={variation?.product_image_large} alt="" sx={{ height: '100%' }}/>
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
            {!loading ? variation?.title : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="80%"/>}
          </Typography>

          {variation?.promotional_retail_price ? (
            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
              {variation?.promotional_retail_price === variation?.retail_price ? (
                <Typography component="span" width="20%">
                  {!loading ? `$${variation?.promotional_retail_price}` :
                    <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>}
                </Typography>
              ) : (
                <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
                  {!loading ?
                    <Typography
                      component="span"
                      sx={{ '&.MuiTypography-root': { textDecoration: 'line-through', mr: '30px', fontWeight: 400 } }}
                    >
                      {variation?.retail_price}
                    </Typography>
                    :
                    <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>
                  }
                  {!loading ?
                    <Typography component="span" width="20%">
                      {variation?.promotional_retail_price}
                    </Typography>
                    :
                    <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>

                  }

                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ '& span': { fontSize: { xs: "16px", md: '22px' }, fontWeight: 'bold' }, display: 'flex' }}>
              <Typography component="span" width="20%">
                {!loading ? `$${variation?.retail_price}` : <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: { xs: "10px", md: "40px" }, mb: { xs: "10px", md: "20px" } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Product Strain"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={variation?.strain} component="span" sx={{ fontSize: '1rem' }}/>
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Product Type"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={variation?.category_name} component="span" sx={{ fontSize: '1rem' }}/>
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Quantity on Hand"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={stock} component="span" sx={{ fontSize: '1rem' }}/>
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: { xs: '20px', sm: '4px' } }}>
              <Typography
                children="Last Inventory Count Date"
                sx={{ width: '250px', display: 'inline-block', fontSize: '1rem', fontWeight: 600 }}
                component="span"
              />
              {!loading ? (
                <Typography children={formattedDate} component="span" sx={{ fontSize: '1rem' }}/>
              ) : (
                <Skeleton sx={{ bgcolor: '#f7f7f7' }} width="20%"/>
              )}
            </Box>
          </Box>

          {/* Color List */}
          {attList && <Grid container spacing={1}>
            <Grid item style={{ width: "50px" }}>
              Color:
            </Grid>
            <Grid item>
              <select
                className='variation-attr-selector'
                onChange={(e) => onChangeColor(e.target.value)}
                defaultValue={sel_color}
              >
                {(Object.keys(attList).map(x => {
                  return (<option key={`color-${x}`} value={x}>
                    {attList[x]['name']}
                  </option>)

                }))}
              </select>
            </Grid>

          </Grid>
          }

          {/* Size List */}
          {(attList && attList[sel_color]) && <Grid container spacing={1} sx={{ mt: "10px" }}>
            <Grid item style={{ width: "50px" }}>
              Size:
            </Grid>
            <Grid item>
              <select
                className='variation-attr-selector'
                onChange={e => onChangeSize(e.target.value)}
                defaultValue={sel_size}
              >
                {attList[sel_color]['sizes'].map(x => {
                  return <option key={`size-${x.size}`} value={x.size}>
                    {x.name}
                  </option>
                })}
              </select>
            </Grid>

          </Grid>}

          <Box sx={{ display: 'flex', mt: "10px" }}>
            <Box width="250px">
              <Typography component="p" children="QUANTITY"
                          sx={{ '&.MuiTypography-root': { mb: '4px', fontSize: '10px' } }}/>
              <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Box width="40px" height="40px" sx={{ border: '1px solid #fff', cursor: 'pointer', p: "7px" }}
                     onClick={() => setPlusMinusQuantity(-1)}>
                  <RemoveIcon/>
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
                  sx={{ border: '1px solid #fff', cursor: 'pointer', p: "7px" }}
                  onClick={() => setPlusMinusQuantity(1)}
                >
                  <AddIcon/>
                </Box>
              </ButtonGroup>
            </Box>
            <Box>
              <Typography component="p" children="SUBTOTAL"
                          sx={{ '&.MuiTypography-root': { mb: '4px', fontSize: '10px' } }}/>
              <Typography
                component="p"
                sx={{ fontWeight: 600, fontSize: '22px', pt: '3px' }}
                children={

                  monetizeToLocal
                  (
                    convertToNumber(variation?.promotional_retail_price ? variation?.promotional_retail_price : variation?.retail_price) *
                    quantity
                  )
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
            {isBusy && <CircularProgress sx={{ color: 'white', marginRight: '10px' }} size={'15px'}/>} ADD TO CART
          </Button>
          <Typography component="p" sx={{ fontWeight: 'bolder' }} children="NOTE: WE ONLY ACCEPT CASH"/>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
