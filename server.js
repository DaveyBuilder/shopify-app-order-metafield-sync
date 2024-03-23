const express = require('express');
const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log('Running in:', process.env.NODE_ENV || 'no environment specified');

const PORT = process.env.PORT;
app.use(express.json());

const getAllOrdersGRAPHQL = require('./functions/get_all_orders_GRAPHQL');
//const getAllOrdersREST = require('./functions/get_all_orders_REST');
const fetchShopifyCustomers = require('./functions/fetchShopifyCustomers');

async function main() {

  const daysToFetch = 0;

  let allOrders;

  // Fetch all orders using REST API
  // try {
  //   allOrders = await getAllOrdersREST(daysToFetch);
  //   console.log("Successfully fetched orders within the last " + daysToFetch + " day(s):");
  // } catch (error) {
  //   console.error(`Error fetching all orders. Unable to continue. Error details: ${error.message}`);
  //   return;
  // }
  //console.log(JSON.stringify(allOrders, null, 2));
  // for (const order of allOrders) {
  //   console.log("Order ID: " + order.id);
  //   console.log("Customer: " + order.customer);
  //   console.log("Line items: " + order.line_items);
  // }

  // Fetch all orders using GraphQL API
  try {
    allOrders = await getAllOrdersGRAPHQL(daysToFetch);
    console.log("Successfully fetched orders within the last " + daysToFetch + " day(s):");
    console.log(JSON.stringify(allOrders, null, 2));
  } catch (error) {
    console.error(`Error fetching all orders. Unable to continue. Error details: ${error.message}`);
    return;
  }

  

}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Run function when the server starts
  main();
});

