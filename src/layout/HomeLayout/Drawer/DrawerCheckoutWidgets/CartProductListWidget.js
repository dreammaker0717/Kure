import iconTrash from 'assets/images/icons/icon-trash.svg';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
  Box,
  Grid,
  Stack,
  Typography,
  OutlinedInput,
  Button,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useEffect, useState } from 'react';
import { broadcastMessage, convertToNumber, monetizeToLocal } from 'Common/functions';
import {
  addRemoveProductFromCart,
  createCart,
  deleteVariationFromCart,
  getCart,
  postOrderMessage,
  resetOrder,
  setOrderProductAsReturn,
} from 'services/idb_services/orderManager';
import Image from 'components/Image/index';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { customToast } from 'components/CustomToast/CustomToast';

import NoLuggageIcon from '@mui/icons-material/NoLuggage';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import CommonConfirmModal from 'components/CommonConfirmModal/CommonConfirmModal';
import { SIG_CUSTOMER_REMOVED } from 'Common/signals';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Resource } from "services/api_services/Resource";
import { OrderProductType, USER_TYPE } from "Common/constants";
import { useNavigate } from "react-router-dom";

function CartProductListWidget(props) {
  const { cart, setCart, is_disabled } = props;
  const navigate = useNavigate();
  const [onOpenConfirm, setOnOpenConfirm] = useState(false);
  const [onOpenCreateConfirm, setOnOpenCreateConfirm] = useState(false);
  const resource = new Resource();

  const cssImgProduct = {
    borderRadius: '50%',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: '#f7f7f7',
    border: '1px solid',
    boxSizing: 'border-box'
  };

  const cssBorder = {
    height: '30px',
    border: '1px solid #fff',
    cursor: 'pointer'
  };

  const boxBorderDisabled = {
    height: '30px',
    border: '1px solid #8f8b8b3d',
    cursor: 'initial',
    color: '#8f8b8b3d',
  };

  const callAddCart = async (purchased_entity, direction) => {
    const toast_response = await addRemoveProductFromCart(purchased_entity, direction);
    const { status, data, message } = toast_response;
    if (status === false) {
      customToast.error(message);
    }
    return status;
  };

  const incrementDecrement = (order_item, direction) => {
    // const stock = parseInt( product.ProductInfo.stock);
    callAddCart(order_item.purchased_entity, direction);
  };

  const onClickDeleteProduct = (order_item) => {
    deleteVariationFromCart(order_item.purchased_entity);
  };

  if (cart == null) {
    return <Stack sx={{ textAlign: 'center', pt: "20px", pb: "30px" }} direction="row"
      alignItems={'center'} justifyContent={"center"} spacing={1}>
      <NoLuggageIcon sx={{ color: "var(--error)" }} />Your cart is empty.
    </Stack>
  }
  // console.log("CartProductListWidget: >>> ", cart);

  const onClickResetProducts = () => {
    setOnOpenConfirm(true);
  }

  const onConfirmReset = async () => {
    await resetOrder(cart);
    broadcastMessage(SIG_CUSTOMER_REMOVED);
    setOnOpenConfirm(false);
  }

  const onClickCreateNewOrder = () => {
    setOnOpenCreateConfirm(true);
  }

  /**
   * To create a new order from a button, we simply create a new cart and post a message to the client.
   *
   * @returns {Promise<void>}
   */
  const onConfirmEraseOrder = async () => {
    const new_cart = await createCart();
    postOrderMessage(new_cart.data);
    setOnOpenCreateConfirm(false);
  }
  const is_employee = resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE;
  const onSetOrderReturn = (order_item, e) => {
    // console.log('return: ', order_item, e.target.checked);
    setOrderProductAsReturn(order_item.purchased_entity, e.target.checked);
    // setChecked(e.target.checked);
  }

  const onClickProduct = (order_item) => {
    navigate(`/${order_item.purchased_entity.link}/${order_item.purchased_entity?.variation_id}`)
  }

  return (
    <Box >
      {onOpenConfirm && <CommonConfirmModal
        open={onOpenConfirm}
        onOk={onConfirmReset}
        onCancel={() => {
          setOnOpenConfirm(false)
        }}
        title={"This order will be erased"}
        description={"Are you sure you want to clear this cart?"}
      />}
      {onOpenCreateConfirm && <CommonConfirmModal
        open={onOpenCreateConfirm}
        onOk={onConfirmEraseOrder}
        onCancel={() => {
          setOnOpenCreateConfirm(false)
        }}
        title={"The current order will be stored in notification tab."}
        description={"Are you sure you want to create a new order?"}
      />}
      {(cart.order_items && cart.order_items.length > 0)
        ? <Box>
          {cart.order_items.map((order_item, index) => {
            // console.log("CCC: ", order_item)
            const can_add_count = parseInt(order_item.purchased_entity?.stock) - parseInt(order_item.quantity);

            const uiDelete = (<DeleteOutlineIcon
              sx={{
                width: { xs: '20px', sm: "25px" },
                height: { xs: '20px', sm: "25px" },
                cursor: 'pointer',
                color: '#FF4D4F',
              }}

              onClick={() => onClickDeleteProduct(order_item)}
            />);
            const uiImage = (<Image
              src={order_item.purchased_entity?.product_image_thumbnail} alt="ProductImage"
              style={cssImgProduct}
              sx={{
                width: {
                  xs: "50px",
                  sm: "65px"
                },
                height: {
                  xs: "50px",
                  sm: "65px"
                }
              }}
            />);
            const uiTitle = (<Box sx={{
              height: "34px",
              overflow: "hidden",
            }}>
              <Typography sx={{ lineHeight: 1.2 }}
                onClick={() => {
                  onClickProduct(order_item)
                }}
              >
                <span style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxHeight: "34px",
                }}
                  className='custom-button custom-button-underline'
                >
                  {order_item.purchased_entity?.title}
                </span>
              </Typography>
            </Box>);

            const uiAddRemove = (<Box sx={{ display: 'flex', float: 'right', textAlign: 'right', gap: '8px', alignItems: 'center' }}>
              {/* If a package was scanned, do not allow them to continue manually change the quantity. */}
              {(order_item.package_uids && order_item.package_uids.length == 0) && (
                <>
                  {can_add_count >= 0 &&
                    <RemoveOutlinedIcon sx={cssBorder} onClick={(e) => {
                      if (order_item.quantity == 1) {
                        return;
                      }
                      incrementDecrement(order_item, -1);
                    }}
                    />
                  }
                  <OutlinedInput
                    value={order_item.quantity}
                    sx={{
                      width: '40px',
                      height: '30px',
                      fontSize: '16px',
                      border: '1px solid',
                      borderRadius: '0px',
                      color: 'white',
                      p: 0,
                      '& .MuiOutlinedInput-input': { p: '0', textAlign: 'center' }
                    }}
                  />
                  {can_add_count >= 0 &&
                    <AddOutlinedIcon sx={cssBorder} onClick={(e) => {
                      incrementDecrement(order_item, 1)
                    }} />
                  }
                  {
                    can_add_count < 0 && <Button
                      onClick={() => {
                        console.log("canadd: ", can_add_count, "quantity: ", order_item.quantity, "stock: ", order_item.purchased_entity?.stock)
                        incrementDecrement(order_item, can_add_count)
                      }}
                      variant="outlined"
                      color="success"
                      sx={{
                        float: "right",
                        color: 'white',
                        border: '1px solid',
                      }}
                    >
                      Set to {parseInt(order_item.purchased_entity?.stock)}
                    </Button>
                  }
                </>
              )}
              {/* We have at least one package scanned, allow them to scan to return items to stock. */}
              {(order_item.package_uids && order_item.package_uids.length > 0) && (
                <>
                  <RemoveOutlinedIcon sx={boxBorderDisabled} />
                  <OutlinedInput
                    value={order_item.quantity}
                    sx={{
                      width: '40px',
                      height: '30px',
                      fontSize: '16px',
                      border: '1px solid',
                      borderRadius: '0px',
                      color: 'white',
                      p: 0,
                      '& .MuiOutlinedInput-input': { p: '0', textAlign: 'center' }
                    }}
                  ></OutlinedInput>
                  <AddOutlinedIcon sx={boxBorderDisabled} />
                </>
              )}
            </Box>);
            const uiTotalPrice = (<Typography>
              {monetizeToLocal((order_item.type == OrderProductType.return ? -1 : 1) * convertToNumber(order_item.retail_price) * order_item.quantity)}
            </Typography>);
            const uiProductReturn = (<Box sx={{ textAlign: { xs: 'left', md: "left" } }}>
              {(is_employee && !is_disabled) ? <FormControlLabel
                sx={{ mr: 0 }}
                control={<Checkbox
                  checked={order_item.type == OrderProductType.return}
                  onChange={(e) => { onSetOrderReturn(order_item, e) }}
                  size="small"
                  sx={{
                    p: "5px",
                    color: '#DF4D4F',
                    '&.Mui-checked': {
                      color: '#FF4D4F'
                    },
                  }}
                />}

                label={<span style={{ color: '#FF4D4F', fontSize: "12px" }}>Set as return item</span>}>
              </FormControlLabel>
                : <></>}
            </Box>);
            return (
              <Box key={`order-item-${order_item.purchased_entity?.variation_id}`}
                sx={{
                  p: "5px", paddingBottom: { xs: '15px', sm: '5px' },
                  border: (can_add_count < 0) ? "1px solid #E6854A" : null
                }}>
                <Box display={{ xs: 'none', sm: 'block' }}>
                  <Grid container alignItems={"center"} spacing={1}>
                    {!is_disabled &&
                      <Grid item sm={0.5} style={{ paddingLeft: "0px" }} >
                        {uiDelete}
                      </Grid>
                    }
                    <Grid item sm={2} >
                      {uiImage}
                    </Grid>
                    <Grid item sm={9}>
                      <Grid container spacing={1} alignItems={'center'} justifyContent={"space-between"}>
                        <Grid item sm={6}>
                          {uiTitle}
                        </Grid>
                        {!is_disabled &&
                          <Grid item
                            sm={can_add_count >= 0 ? 4 : 6}
                          // sx={{ display: 'flex', justifyContent: 'end' }}
                          >
                            {uiAddRemove}
                          </Grid>
                        }
                        {can_add_count >= 0 &&
                          <Grid item sm={2} sx={{ textAlign: 'right' }}>
                            {uiTotalPrice}
                          </Grid>
                        }
                      </Grid>
                      {uiProductReturn}
                    </Grid>

                  </Grid>
                </Box>
                <Box display={{ xs: 'block', sm: 'none' }}>
                  <Grid container direction="row" wrap="nowrap" alignItems={"center"} spacing={1}>

                    {!is_disabled &&
                      <Grid item style={{ paddingLeft: "0px" }} >
                        {uiDelete}
                      </Grid>
                    }
                    <Grid item >
                      {uiImage}
                    </Grid>

                    <Grid item zeroMinWidth>
                      {uiTitle}
                    </Grid>

                  </Grid>

                  <Grid container spacing={1} alignItems={'center'} justifyContent={"space-between"}>
                    <Grid item xs={5} style={{ paddingLeft: "6px" }} >
                      {uiProductReturn}
                    </Grid>
                    <Grid item xs={7}  >
                      <Grid container direction="row" spacing={2} alignItems={'center'} justifyContent={"flex-end"}>
                        {!is_disabled &&
                          <Grid item
                            xs={7}
                          // sx={{ display: 'flex', justifyContent: 'end' }}
                          >
                            {uiAddRemove}
                          </Grid>
                        }
                        {can_add_count >= 0 &&
                          <Grid item
                            xs={5}
                            style={{ textAlign: 'right' }}
                          >
                            {uiTotalPrice}
                          </Grid>
                        }
                      </Grid>
                    </Grid>

                  </Grid>

                </Box>

              </Box>
            );
          })}

          {/*Only allow a Kure employee to see the two buttons below.*/}
          {resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && !is_disabled && (
            <Grid container justifyContent={'flex-end'} spacing={1}>
              <Grid item>
                <Button
                  onClick={onClickResetProducts}
                  variant="outlined"
                  color="error"
                  sx={{
                    color: 'white',
                    border: '1px solid',
                    pr: { xs: "5px", md: "15px" },
                    pl: { xs: "5px", md: "15px" },
                  }}
                >
                  Reset this order
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={onClickCreateNewOrder}
                  variant="outlined"
                  color="warning"
                  sx={{
                    color: 'white',
                    border: '1px solid',
                    pr: { xs: "5px", md: "15px" },
                    pl: { xs: "5px", md: "15px" },
                  }}
                >
                  Create new order
                </Button>
              </Grid>


            </Grid>
          )}
        </Box>
        : <Box sx={{ ml: "10px", mb: "40px", textAlign: "center" }}>
          {/* <Typography variant="h5">
            <ReportProblemIcon sx={{ color: "#E67D04", mr: "10px" }} fontSize={'small'} />
            It seems there's no product in your cart for this store.
            <br />
            Please add products to your cart.
          </Typography> */}
        </Box>
      }

    </Box >
  );
}

export default CartProductListWidget;
