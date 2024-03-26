const express = require('express');
const app = express();
const cron = require('node-cron');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log('Running in:', process.env.NODE_ENV || 'no environment specified');

const PORT = process.env.PORT;
app.use(express.json());

const getAllOrdersGRAPHQL = require('./functions/get_all_orders_GRAPHQL');
const updateCustomerMetafields = require('./functions/update_customer_metafields');
//const getAllOrdersREST = require('./functions/get_all_orders_REST');
//const testOrders = require('./functions/test_order_data');

async function main() {

  const daysToFetch = 100;

  let allOrders;

  // Fetch all orders using GraphQL API
  try {
    allOrders = await getAllOrdersGRAPHQL(daysToFetch);
    console.log("Successfully fetched orders within the last " + daysToFetch + " day(s):");
    // console.log(JSON.stringify(allOrders, null, 2));
    // return;
  } catch (error) {
    console.error(`Error fetching all orders. Unable to continue. Error details: ${error.message}`);
    return;
  }

  //allOrders = testOrders;

  if (allOrders.length === 0) {
    console.log("No orders to process. Exiting.");
    return;
  }

  for (const order of allOrders) {
    console.log("NEXT ORDER");
    //console.log(JSON.stringify(order, null, 2));
    let existingStylists;
    let existingClients;
    let stylistsMetafieldNode;
    let clientsMetafieldNode;
    // Get the existing stylists/clients for this customer
    for (const metafield of order.node.customer.metafields.edges) {
      
      if(metafield.node.key === "stylists") {
        console.log(metafield.node)
        stylistsMetafieldNode = metafield.node
        try {
          existingStylists = JSON.parse(metafield.node.value);
        } catch (error) {
          console.error("Failed to parse existing stylists:", error);
          existingStylists = []; // Fallback to an empty array (could be a new customer)
        }
      }
      if(metafield.node.key === "clients") {
        console.log(metafield.node)
        clientsMetafieldNode = metafield.node
        try {
          existingClients = JSON.parse(metafield.node.value);
        } catch (error) {
          console.error("Failed to parse existing clients:", error);
          existingClients = []; // Fallback to an empty array (could be a new customer)
        }
      }
    }

    // Check if existingStylists and existingClients are arrays
    if (!Array.isArray(existingStylists)) {
      console.error("Existing stylists is not an array. Skipping order.");
      continue; // Skip to the next order
    }
    if (!Array.isArray(existingClients)) {
      console.error("Existing clients is not an array. Skipping order.");
      continue; // Skip to the next order
    }

    // Now go over the line items and check whether the stylist/client is already in the list
    let stylistsToAdd = [];
    let clientsToAdd = [];
    for (const lineItem of order.node.lineItems.edges) {
      console.log("Custom attributes:");
      console.log(lineItem.node.customAttributes);
    
      // Iterate through each custom attribute to find 'Hair Stylist Name' and 'Client Name'
      for (const attribute of lineItem.node.customAttributes) {
        if (attribute.key === 'Hair Stylist Name') {
          // Check if the stylist's name exists in the existingStylists array
          if (existingStylists.includes(attribute.value)) {
            //console.log(`Stylist ${attribute.value} exists in the existing stylists.`);
          } else {
            stylistsToAdd.push(attribute.value);
          }
        } else if (attribute.key === 'Client Name') {
          // Check if the client name exists in the existingClients array
          if (existingClients.includes(attribute.value)) {
            //console.log(`Client name ${attribute.value} exists in the existing clients.`);
          } else {
            clientsToAdd.push(attribute.value);
          }
        }
      }
    }

    if (stylistsToAdd.length === 0 && clientsToAdd.length === 0) {
      console.log(`No stylists or clients to add for customer ${order.node.customer.email}. Skipping order.`);
      continue; // Skip to the next order
    }

    console.log(order.node.customer.email + " Stylists to add: " + stylistsToAdd);
    console.log(order.node.customer.email + " Clients to add: " + clientsToAdd);

    // So we have existingStylists and existingClients
    // We also have stylistsToAdd and clientsToAdd
    // Also stylistsMetafieldNode and clientsMetafieldNode
    const customerID = order.node.customer.id;
    const customerEmail = order.node.customer.email;
    //console.log("Customer ID: " + customerID);

    let newStylistsMetafieldValue;
    if (stylistsToAdd.length > 0) {
      newStylistsMetafieldValue = existingStylists.concat(stylistsToAdd);
    }

    let newClientsMetafieldValue;
    if (clientsToAdd.length > 0) {
      newClientsMetafieldValue = existingClients.concat(clientsToAdd);
    }

    // console.log("New stylists metafield value: " + newStylistsMetafieldValue);
    // console.log("New clients metafield value: " + newClientsMetafieldValue);
    // console.log("Stylists metafield node: " + stylistsMetafieldNode);
    // console.log("Clients metafield node: " + clientsMetafieldNode);

    // Now if there are stylists or clients to add, then update the customer metafield/s
    if (newStylistsMetafieldValue || newClientsMetafieldValue) {
      console.log(`Updating customer metafields for customer ${customerID}, ${customerEmail}...`);
      try {
        await updateCustomerMetafields(customerID, customerEmail, newStylistsMetafieldValue, stylistsMetafieldNode, newClientsMetafieldValue, clientsMetafieldNode);
      } catch (error) {
        console.error(`Failed to update customer metafields for: ${error}`);
      }
    }

  }

}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Schedule main() to run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Running main() function...');
    main();
  });
});

