const fetch = require("node-fetch");

async function apiCall(url, method = 'GET', body = null, retries = 3, delay = 5) {
    const delayExecution = (delay) => new Promise(resolve => setTimeout(resolve, delay * 1000));

    try {
        let options = { method: method };
        options.headers = {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        };
        
        // Add body & Content-Type header to the request if method POST/PATCH/PUT & body is not null
        if ((method === 'POST' || method === 'PATCH' || method === 'PUT') && body) {
            options.body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Body: ${errorBody}`);
        }
        //console.log(`API call successful`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch from API: ${error}`);
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)...`);
            if (delay > 0) {
                console.log(`Waiting for ${delay} seconds before retrying...`);
                await delayExecution(delay);
            }
            return apiCall(url, method, body, retries - 1, delay);
        } else {
            console.error(`No more retries left`);
            throw error;
        }
    }
}

module.exports = apiCall;