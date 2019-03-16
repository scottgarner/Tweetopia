require('dotenv').config();

var port = process.env.PORT || 3000;

var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));


// Twitter

var Twitter = require('mtwitter');
var twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	application_only: true
});


//

app.get('/ws', function (request, response) {

	var options = JSON.parse(JSON.stringify(request.query));

	if (options.q == null) {
		options.q = '%23WebGL';
	}

	options.callback = null;

	twitter.get(
		'search/tweets',
		options,
		function (err, item) {

			if (item != null) {

				var json = JSON.stringify(item);
				response.jsonp(item);
			}
		}
	);

});


app.listen(port, function () {
	console.log("Listening on " + port);
});
