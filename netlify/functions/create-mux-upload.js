
// netlify/functions/create-mux-upload.js
import Mux from '@mux/mux-node';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    // CRITICAL: Check for environment variables inside the handler.
    // This prevents the function from crashing on load if keys are missing.
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      console.error('Mux environment variables not set.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Mux API credentials are not configured on the server. The site administrator must set MUX_TOKEN_ID and MUX_TOKEN_SECRET in the Netlify dashboard.' }),
      };
    }
    
    // Initialize Mux client safely inside the handler.
    const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

    // === HANDLE POST REQUEST: Create a new direct upload URL ===
    if (event.httpMethod === 'POST') {
      const upload = await Video.Uploads.create({
        cors_origin: '*', // For production, lock this to your site's domain
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
      body: JSON.stringify({ error: 'An internal server error occurred while processing the video request.' }),
    };
  }
};
