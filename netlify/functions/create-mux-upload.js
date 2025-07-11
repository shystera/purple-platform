
// netlify/functions/create-mux-upload.js

// This SDK is installed via the updated package.json
const Mux = require('@mux/mux-node');

// Authenticate using environment variables set in the Netlify UI.
// Your MUX_TOKEN_ID and MUX_TOKEN_SECRET are required here.
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

exports.handler = async (event, context) => {
  // Set CORS headers to allow requests from your site.
  // For production, replace '*' with your specific domain e.g., 'https://my-kohza-app.netlify.app'
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight CORS requests from the browser.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    // === HANDLE POST REQUEST: Create a new direct upload URL ===
    if (event.httpMethod === 'POST') {
      const upload = await Video.Uploads.create({
        cors_origin: '*', // Or your specific domain
        new_asset_settings: {
          playback_policy: 'public',
          encoding_tier: 'smart',
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          uploadUrl: upload.url,
          assetId: upload.asset_id,
        }),
      };
    }

    // === HANDLE GET REQUEST: Check the status of an asset ===
    if (event.httpMethod === 'GET') {
      // Add detailed logging to see what the server is receiving.
      console.log("Received GET request for asset status. Query params:", event.queryStringParameters);

      const assetId = event.queryStringParameters && event.queryStringParameters.assetId;

      if (!assetId || typeof assetId !== 'string' || !assetId.trim()) {
          const errorBody = { 
              error: 'The assetId query parameter is required and cannot be empty.',
              receivedParams: event.queryStringParameters || 'No query parameters were received.'
          };
          console.error("Responding with 400. Details:", errorBody);
          return { statusCode: 400, headers, body: JSON.stringify(errorBody) };
      }

      const asset = await Video.Assets.get(assetId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: asset.status,
          playbackId: asset.playback_ids?.[0]?.id || null,
        }),
      };
    }
    
    // Handle other HTTP methods
    return {
        statusCode: 405,
        headers,
        body: 'Method Not Allowed'
    };

  } catch (error) {
    console.error('Mux function error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An internal server error occurred while processing the video.' }),
    };
  }
};
