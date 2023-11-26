// import * as React from "react";

// const order_data = {
//   orders: [
//     {
//       order_id: 1,
//       uid: 1057,
//       cashier_id: 1057,
//       state: 'draft',
//       store_id: 2,
//       created: Date.now(),
//     }
//   ],
//   order_items: [],
// };

// export function resourceOrder(config = {}) {

//   async function createNewOrder() {
//     const order = {
//       order_id: 2,
//       uid: 1057,
//       cashier_id: 1057,
//       state: 'draft',
//       store_id: 2,
//       created: Date.now(),
//     };
//     return writeData('order', 'id', 'readwrite', order)
//   }

//   async function getDraftOrder() {
//     return new Promise(function (resolve) {
//       getCurrentOrder().then(function (result) {
//         resolve(result);
//       }).catch((message) => {
//         console.log(message);
//         resolve(createNewOrder());
//       });
//     });
//   }

//   async function addOrderItem(purchased_entity, quantity, retail_price, title) {
//     return new Promise(function (resolve) {
//       let order_id;
//       getDraftOrder().then((result) => {
//         getCurrentOrderItems().then((items) => {
//           let item = items.find(order_item => order_item.purchased_entity === purchased_entity);
//           if (item !== undefined) {
//             item.quantity = item.quantity + quantity;
//           } else {
//             item = {
//               order_item_id: 1,
//               order_id: result.order_id,
//               purchased_entity: purchased_entity,
//               quantity: quantity,
//               retail_price: retail_price,
//               title: title,
//               created: Date.now(),
//             };
//             order_id = writeData('order_item', 'id', 'readwrite', item);
//           }
//         }).catch((message) => {
//           console.log(message)
//         })
//         resolve(order_id);
//       })
//     });
//   }

//   function writeData(table_name, keyPath, mode, data) {
//     let object = (table_name === 'orders') ? order_data.orders : order_data.order_items;
//     object.push(data);
//     return data.order_id;
//   }

//   async function getCurrentOrder() {
//     return new Promise(function (resolve, reject) {
//       let result = order_data.orders.find(item => item.state === 'draft');
//       if (result) {
//         resolve(result);
//       } else {
//         // console.log('not found');
//         reject('not found');
//       }
//     });
//   }

//   async function getCurrentOrderItems() {
//     return new Promise(function (resolve, reject) {
//       getCurrentOrder().then((result) => {
//         // let items = order_data.order_items.find(item => item.order_id === result.order_id);
//         let items = order_data.order_items.filter((obj) => {
//           return obj.order_id === result.order_id;
//         });
//         resolve(items);
//       })
//     });
//   }


//   return {
//     addOrderItem,
//     getCurrentOrderItems,
//   };
// }