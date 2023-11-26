export const DrawerWidth = 260;

export const DEVICE_SIZE = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
}
export const PRODUCT_SIZE = {
  11: { "short": "S", "full": "Small" },
  12: { "short": "M", "full": "Medium" },
  13: { "short": "L", "full": "Large" },
  16: { "short": "XL", "full": "Extra Large" },
}
export const PRODUCT_COLOR = {
  8: { "letter": "Black", "color": "#000000" },
  9: { "letter": "Red", "color": "#FF0000" },
  10: { "letter": "White", "color": "#FFFFFF" },
  11: { "letter": "Blue", "color": "#0000FF" },
  12: { "letter": "Green", "color": "#00FF00" },
  13: { "letter": "Yellow", "color": "#FFFF00" },
  14: { "letter": "Multi", "color": "gray" },
  15: { "letter": "Dark", "color": "#1e1e1e" },
}
export const TEMP_CART_STATUS = {
  CHECKING: "CHECKING",
  SENDING: 'SENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}
export const FCM_TYPE = {
  CLEAR_ALL: 1,
  ACCOUNT_CHANGE: 2,
}
export const ADJUSTMENT_TYPE = {
  TAX: "tax",
  PROMOTION: "promotion",
  SHIPPING: 'shipping',
  COUPON: "coupon"
}
export const ADJUST_VALUE_TYPE = {
  PERCENT: "percent",
  FLAT: "flat",
}
export const CHECKOUT_METHOD = {
  DELIVERY_18: 1,
  DELIVERY_NO_FEE: 2,
  PICK_UP: 3,
  DELIVERY_SONOMA: 4,
}

export const CART_STATUS = {
  DRAFT: "draft",
  PARKED: "parked",
  NEEDS_PROCESSING: "needs_processing",
  COMPLETED: "completed",
  VOIDED: "voided"
  // FREEZE: "freeze",
}
/**
 * Exactly as they are labeled in Drupal.
 *
 * @type {{PICK_UP: string, DELIVERY: string}}
 */
export const CHECKOUT_TYPE = {
  DELIVERY: 'delivery',
  PICK_UP: 'pick_up',
}
export const ADJUSTMENT_TYPES = [
  {
    type: 'tax',
    percentage: null,
    amount: {
      number: 0.00,
      currencyCode: ''
    }
  },
  {
    type: 'promotion',
    percentage: null,
    amount: {
      number: 0.00,
      currencyCode: ''
    }
  },
]
export const ADJUST_TYPE = [
  {
    name: "order_fixed_amount_off",
    title: "order_fixed_amount_off",
    value_type: ADJUST_VALUE_TYPE.FLAT,
    value_field: "amount_off",
    is_discount: true,
    affect_item: false,
  },
  {
    name: "order_percentage_off",
    title: "order_percentage_off",
    value_type: ADJUST_VALUE_TYPE.PERCENT,
    value_field: "percentage_off",
    is_discount: true,
    affect_item: false,
  },
  {
    name: "order_item_percentage_off",
    title: "order_item_percentage_off",
    value_type: ADJUST_VALUE_TYPE.PERCENT,
    value_field: "percentage_off",
    is_discount: true,
    affect_item: true,
  },
  {
    name: "ji_order_item_fixed_amount",
    title: "ji_order_item_fixed_amount",
    value_type: ADJUST_VALUE_TYPE.FLAT,
    value_field: "amount_off",
    is_discount: true,
    affect_item: true,
  },
  {
    name: "order_tax",
    title: "Tax",
    value_type: ADJUST_VALUE_TYPE.PERCENT,
    value_field: "value",
    is_discount: false,
    affect_item: false,
  },
  // {
  //   name: "order_newyear_discount",
  //   title: "New year discount",
  //   value_type: ADJUST_VALUE_TYPE.PERCENT,
  //   value_field: "value",
  //   is_discount: true,
  //   affect_item: false,
  // },
  // {
  //   name: "order_product_day_discount",
  //   title: "Product of the day",
  //   value_type: ADJUST_VALUE_TYPE.FLAT,
  //   value_field: "value",
  //   is_discount: true,
  //   affect_item: false,
  // },
]
export const USER_TYPE = {
  ADMIN: 'administrator',
  KURE_EMPLOYEE: 'kure_employee',
  CUSTOMER: 'authenticated',
  ANONYMOUS: 'anonymous'
}
export const PhoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)$/;
export const EmptyProductCard = {
  description: false,
  product_image: '',
  product_type: '',
  retail_price: '',
  strain: '',
  title: ''
};
export const AuthPageType = {
  Login: "Login",
  Register: "Register",
  Reset: "Reset"
}
export const OrderProductType = {
  default: "default",
  return: "return"
}
export const ButtonCategories = [
  {
    label: 'All',
    value: '',
    isSelected: false,
    isHidden: true
  },
  {
    label: 'Promotions',
    value: 'promotions',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Accessories',
    value: 'accessories',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Apparel',
    value: 'apparel',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Cartridge',
    value: 'cartridge',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Concentrate',
    value: 'concentrate',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Edibles',
    value: 'edibles',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Flower',
    value: 'flower',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Glass',
    value: 'glass',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Hemp',
    value: 'hemp',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Preroll',
    value: 'preroll',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Seeds',
    value: 'seeds',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Tincture',
    value: 'tincture',
    isSelected: false,
    isHidden: false
  },
  {
    label: 'Topicals',
    value: 'topicals',
    isSelected: false,
    isHidden: false
  }
];

export const DELIVERY_STATUS = {
  SelectAddress: {
    value: 10,
    title: 'Where should I deliver your order?',
    sub_title: 'I will deliver your order to the address you select.',
    next_button: 'Deliver To This Address',
    skip_button: null
  },
  EditAddress: {
    value: 20,
    title: 'Change this address carefully.',
    sub_title: 'For our delivery driver, please ensure the details provided here are up to date.',
    next_button: 'Save',
    skip_button: null
  },
  AddAddress: {
    value: 25,
    title: 'Add a new address.',
    sub_title: 'For our delivery driver, please ensure the details provided here are up to date.',
    next_button: 'Save',
    skip_button: null
  },
  AddInstruction: {
    value: 30,
    title: 'Order instructions? Add them here',
    sub_title: 'Your instruction is used for develivery guy. So please write important message you want to add.',
    next_button: 'Add',
    skip_button: 'No, thank you'
  },
  AddCoupon: {
    value: 40,
    title: 'Do you have a coupon?',
    sub_title: "Use a discount coupon or skip if you don't have one.",
    next_button: 'Add coupon',
    skip_button: 'I don’t have a coupon'
  },
  Checkout: {
    value: 50,
    title: 'Great! Almost finished.',
    sub_title: "Your pick up order is almost done. Add amount, please.",
    next_button: 'Add Payment ',
    skip_button: null
  },
  Complete: {
    value: 60,
    title: 'Almost finished!',
    sub_title: 'Your delivery order is almost done. Once you submit the order, we’ll process your order.',
    next_button: 'SUBMIT ORDER NOW',
    skip_button: null
  }
};

export const PICKUP_STATUS = {
  SelectStore: {
    value: 10,
    title: 'Please pick up your product(s) from',
    sub_title: 'During business hours, you’re welcome to stop in after a few minutes.',
    next_button: 'I will use this store',
    skip_button: null
  },
  AddCoupon: {
    value: 40,
    title: 'Do you have a coupon?',
    sub_title: "Use a discount coupon or skip if you don't have one.",
    next_button: 'Add coupon',
    skip_button: 'I don’t have a coupon'
  },
  Checkout: {
    value: 50,
    title: 'Great! Almost finished.',
    sub_title: 'Add amount, please.',
    next_button: 'Add Payment ',
    skip_button: null
  },
  Complete: {
    value: 60,
    title: 'Almost finished!',
    sub_title: 'Your pick up order is almost done. Once you submit the order, we’ll process your order.',
    next_button: 'SUBMIT ORDER NOW',
    skip_button: null
  }
};

export const DRAWER_CHECKOUT_STAGE = {
  Deliver: {
    value: 10,
    text: 'DELIVER MY ORDER',
    sub_stages: DELIVERY_STATUS
  },
  Pickup: {
    value: 100,
    text: 'I WANT TO PICK UP',
    sub_stages: PICKUP_STATUS
  }
};
