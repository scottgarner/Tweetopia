exports.handler = async (event, context) => {
  
  const Twitter = require('twitter-lite');

  try {

    const user = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    });
     
    const response = await user.getBearerToken();
    const app = new Twitter({
      bearer_token: response.access_token
    });

    const query =  event.queryStringParameters;

    if (query.q == null) {
      query.q = '%23WebGL';
    }

    const results = await app.get("search/tweets", query);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },      
      body: JSON.stringify(results),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) }
  }
}
