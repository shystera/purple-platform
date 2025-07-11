const Mux = require('@mux/mux-node');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { Video } = new Mux(
      process.env.MUX_TOKEN_ID,
      process.env.MUX_TOKEN_SECRET
    );

    const upload = await Video.Uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic'
      },
      cors_origin: '*'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadUrl: upload.url,
        uploadId: upload.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
