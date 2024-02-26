const axios = require('axios');

async function fetchShopifyCustomers() {
    const graphqlURL = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;
    const graphqlQuery = {
      query: `
        {
          customers(first: 10) {
            edges {
              node {
                id
                email
                firstName
                lastName
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
      console.log("Customers")
      console.log(response.data.data.customers.edges);
    } catch (error) {
      console.error('Error fetching customers:', error.response ? error.response.data : error.message);
    }
}

module.exports = fetchShopifyCustomers;

