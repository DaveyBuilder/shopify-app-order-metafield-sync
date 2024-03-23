const apiCall = require('./api_call');

async function getAllOrdersGRAPHQL(days = 1) {
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

    const graphqlQuery = {
      query: `
        {
          orders(first: 10, query: "created_at:>${formattedStartDate} AND created_at:<${formattedEndDate}") {
            edges {
              node {
                id
                createdAt
                totalPrice
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      customAttributes {
                        key
                        value
                      }
                    }
                  }
                }
                customer {
                  id
                  email
                }
              }
            }
          }
        }
      `
    };

    try {
      const queryURL = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;
      const response = await apiCall(queryURL, 'POST', graphqlQuery);
      return response.data.orders.edges;
  } catch (error) {
      throw error;
  }

}

module.exports = getAllOrdersGRAPHQL;