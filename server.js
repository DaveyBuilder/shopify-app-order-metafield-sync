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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Run functions when the server starts
  fetchShopifyOrders();
  fetchShopifyCustomers();
});