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

  const daysToFetch = 2;

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
    //console.log(JSON.stringify(allOrders, null, 2));
  } catch (error) {
    console.error(`Error fetching all orders. Unable to continue. Error details: ${error.message}`);
    return;
  }

  for (const order of allOrders) {
    let existingStylists;
    let existingClients;
    // Get the existing stylists/clients for this customer
    for (const metafield of order.node.customer.metafields.edges) {
      if(metafield.node.key === "stylists") {
        try {
          existingStylists = JSON.parse(metafield.node.value);
        } catch (error) {
          console.error("Failed to parse existing stylists:", error);
          existingStylists = []; // Fallback to an empty array or handle as needed
        }
      }
      if(metafield.node.key === "clients") {
        try {
          existingClients = JSON.parse(metafield.node.value);
        } catch (error) {
          console.error("Failed to parse existing clients:", error);
          existingClients = []; // Fallback to an empty array or handle as needed
        }
      }
    }
    console.log("Existing stylists: " + existingStylists);
    console.log("Existing clients: " + existingClients);

    // Check if existingStylists and existingClients are arrays
    if (Array.isArray(existingStylists)) {
      console.log("Existing stylists is an array.");
    } else {
      console.log("Existing stylists is not an array.");
    }

    if (Array.isArray(existingClients)) {
      console.log("Existing clients is an array.");
    } else {
      console.log("Existing clients is not an array.");
    }

    // Now go over the line items and check whether the stylist/client is already in the list
    for (const lineItem of order.node.lineItems.edges) {
      console.log("Custom attributes:")
      console.log(lineItem.node.customAttributes);
    }

  }
  

}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Run function when the server starts
  main();
});

