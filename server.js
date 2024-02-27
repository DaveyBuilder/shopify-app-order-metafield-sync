const express = require('express');
const axios = require('axios');
const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log('Running in:', process.env.NODE_ENV || 'no environment specified');

const PORT = process.env.PORT;
app.use(express.json());

const fetchShopifyOrders = require('./functions/fetchShopifyOrders');
const fetchShopifyCustomers = require('./functions/fetchShopifyCustomers');

// Define a new function to initialize Shopify data
async function executeTask() {
  try {
    const orders = await fetchShopifyOrders(1);
    console.log(orders);
    //const customers = await fetchShopifyCustomers();
  } catch (error) {
    console.error('Error fetching Shopify data:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Run function when the server starts
  executeTask();
});