const apiCall = require('./api_call');

async function updateCustomerMetafields(customerID, newStylistsMetafieldValue, stylistsMetafieldNode, newClientsMetafieldValue, clientsMetafieldNode) {
    
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

        console.log("Updating metafields for customer", customerID, ":", metafieldsToUpdate);

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
                    type: "json_string"
                }))
            }
        };

        // Prepare the body for apiCall
        const body = {
            query: mutation,
            variables: variables
        };

        const url = `${process.env.STORE_URL}/admin/api/2024-01/graphql.json`;

        // Make the API call
        try {
            //const response = await apiCall(url, body);
            console.log("Update response:", response);
        } catch (error) {
            console.error("Error updating customer metafields:", error);
        }

    }

}

module.exports = updateCustomerMetafields;