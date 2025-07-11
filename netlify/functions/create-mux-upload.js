
// netlify/functions/create-mux-upload.js
import Mux from '@mux/mux-node';

export const handler = async (event, context) => {
  const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: baseHeaders,
      body: '',
    };
  }

  const headers = { ...baseHeaders, 'Content-Type': 'application/json' };

  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      const errorMsg = 'Mux API credentials are not configured on the server. The site administrator must set MUX_TOKEN_ID and MUX_TOKEN_SECRET in the Netlify dashboard.';
      console.error(errorMsg);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: errorMsg }),
      };
    }
    
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    });

    // === HANDLE POST REQUEST: Create a new direct upload URL ===
    if (event.httpMethod === 'POST') {
      console.log("Attempting to create Mux Direct Upload URL...");
      const upload = await mux.video.uploads.create({
        cors_origin: '*',
        new_asset_settings: {
          playback_policy: 'public',
          encoding_tier: 'smart',
        },
      });
      
      console.log('Received Mux upload object:', JSON.stringify(upload, null, 2));

      // Defensive Check & Detailed Logging
      if (!upload || typeof upload !== 'object') {
          throw new Error('Mux SDK returned a non-object response for upload creation.');
      }
      if (!upload.url || !upload.asset_id) {
          console.error('Mux response is missing "url" or "asset_id". Full response:', upload);
          throw new Error('Mux API response was successful but incomplete. Check function logs.');
      }

      const responseBody = {
        uploadUrl: upload.url,
        assetId: upload.asset_id,
      };

      console.log('Sending valid response to client:', JSON.stringify(responseBody, null, 2));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseBody),
      };
    }

    // === HANDLE GET REQUEST: Check the status of an asset ===
    if (event.httpMethod === 'GET') {
      const assetId = event.queryStringParameters && event.queryStringParameters.assetId;
      console.log(`Polling status for assetId: ${assetId}`);

      if (!assetId || typeof assetId !== 'string' || !assetId.trim()) {
          const errorBody = { 
              error: 'The assetId query parameter is required and cannot be empty.',
              receivedParams: event.queryStringParameters || 'No query parameters were received.'
          };
          console.error("Responding with 400. Details:", errorBody);
          return { statusCode: 400, headers, body: JSON.stringify(errorBody) };
      }

      const asset = await mux.video.assets.get(assetId);

      const responseBody = {
        status: asset.status,
        playbackId: asset.playback_ids?.[0]?.id || null,
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseBody),
      };
    }
    
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
    };

  } catch (error) {
    console.error('Mux function has crashed. Full error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
          error: 'An internal server error occurred while processing the video request.',
          details: error.message 
      }),
    };
  }
};
