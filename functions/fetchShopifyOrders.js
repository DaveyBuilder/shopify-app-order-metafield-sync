const axios = require('axios');

async function fetchShopifyOrders(days = 1) {
    const endDate = new Date(new Date().toISOString());
    const startDate = new Date(endDate);

    // Subtract 'days' from today's date, adjusting for UTC
    startDate.setUTCDate(endDate.getUTCDate() - days);

    // Move endDate to the start of the next day in UTC to include all orders of the end date
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    // Format dates to YYYY-MM-DD in UTC
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    console.log(`Fetching orders from ${formattedStartDate} to ${formattedEndDate}...`);

    // metafields(first: 5) {
    //   edges {
    //     node {
    //       namespace
    //       key
    //       value
    //     }
    //   }
    // }

    const graphqlQuery = {
      query: `
        {
          orders(first: 250, query: "created_at:>${formattedStartDate} AND created_at:<${formattedEndDate}") {
            edges {
              node {
                id
                createdAt
                totalPrice
              }
            }
          }
        }
      `
    };

    try {
      const graphqlURL = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;
      const response = await axios.post(graphqlURL, graphqlQuery, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      console.log("Successfully fetched orders within the last " + days + " day(s):");
      return response.data.data.orders.edges;
    } catch (error) {
      console.error('Error fetching orders:', error.response ? error.response.data : error.message);
      return null;
    }
}

module.exports = fetchShopifyOrders;