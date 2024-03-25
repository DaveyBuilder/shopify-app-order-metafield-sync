// FILE NOT BEING USED - USED GRAPHQL API INSTEAD

const apiCall = require('./api_call');

async function getAllOrdersREST(days = 1) {
    const endDate = new Date();
    const startDate = new Date();
    console.log("Start Date 1: ", startDate);
    console.log("End Date 1: ", endDate);
    // Subtract 'days' from today's date, adjusting for UTC
    startDate.setUTCDate(endDate.getUTCDate() - days);
    console.log("Start Date 2: ", startDate);

    // Move endDate to the start of the next day in UTC to include all orders of the end date
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    console.log("End Date 2: ", endDate);

    // Format dates to ISO 8601 in UTC
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    console.log("Start Date 3: ", formattedStartDate);
    console.log("End Date 3: ", formattedEndDate);
    

    console.log(`Fetching orders from ${formattedStartDate} to ${formattedEndDate}...`);

    try {
        const queryURL = `${process.env.STORE_URL}/admin/api/2024-01/orders.json?created_at_min=${formattedStartDate}&created_at_max=${formattedEndDate}&status=any&limit=250`;
        const response = await apiCall(queryURL, 'GET');
        return response.orders;
    } catch (error) {
        throw error;
    }
}

module.exports = getAllOrdersREST;