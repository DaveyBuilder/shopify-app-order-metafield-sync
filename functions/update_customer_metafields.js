const apiCall = require('./api_call');

async function updateCustomerMetafields(customerID, customerEmail, newStylistsMetafieldValue, stylistsMetafieldNode, newClientsMetafieldValue, clientsMetafieldNode) {
    
    const metafieldsToUpdate = [];
    if (newStylistsMetafieldValue) {
        stylistsMetafieldNode.value = JSON.stringify(newStylistsMetafieldValue);
        metafieldsToUpdate.push(stylistsMetafieldNode);
    }

    if (newClientsMetafieldValue) {
        clientsMetafieldNode.value = JSON.stringify(newClientsMetafieldValue);
        metafieldsToUpdate.push(clientsMetafieldNode);
    }

    if (metafieldsToUpdate.length > 0) {

        // Construct the GraphQL mutation
        const mutation = `
            mutation customerUpdate($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
        `;

        // Prepare the variables
        const variables = {
            input: {
                id: customerID,
                metafields: metafieldsToUpdate.map(metafield => ({
                    id: metafield.id,
                    namespace: metafield.namespace,
                    key: metafield.key,
                    value: metafield.value,
                    type: "json"
                }))
            }
        };

        console.log(`Updating metafields for ${customerEmail}: `);
        console.log(JSON.stringify(variables, null, 2));

        // Prepare the body for apiCall
        const body = {
            query: mutation,
            variables: variables
        };

        const url = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;

        // Make the API call
        try {
            const response = await apiCall(url, "POST", body);
            if (response.data.customerUpdate.userErrors.length > 0) {
                throw new Error(`API response object indicates error when updating customer metafields: ${JSON.stringify(response.data.customerUpdate.userErrors)}`);
            } else {
                console.log(`Successfully updated customer metafields for ${customerEmail}`);
            }
        } catch (error) {
            throw error;
        }

    }

}

module.exports = updateCustomerMetafields;