const axios = require('axios');

async function fetchShopifyOrders() {
    const graphqlURL = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;
    const graphqlQuery = {
      query: `
        {
          orders(first: 10) {
            edges {
              node {
                id
                totalPrice
              }
            }
          }
        }
      `
    };
  
    try {
      const response = await axios.post(graphqlURL, graphqlQuery, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      console.log("Orders")
      console.log(response.data.data.orders.edges);
    } catch (error) {
      console.error('Error fetching orders:', error.response ? error.response.data : error.message);
    }
}

module.exports = fetchShopifyOrders;