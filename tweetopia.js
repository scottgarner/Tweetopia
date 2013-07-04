var port = process.env.PORT;

var express = require("express");
var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/public'));


// Twitter

var Twitter = require('mtwitter');
var twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	application_only: true
});


//

app.get('/ws', function(request, response) {

	var options = JSON.parse(JSON.stringify(request.query));

	if (options.q == null) {
		options.q = '%23WebGL';
	}

	options.callback = null;

	twitter.get(
		'search/tweets',
		options, 
		function(err, item) {
			console.log("ERROR: " + err)
			console.log("ITEM: " + item);

			if (item != null) {
				console.log("cool");

				 var json = JSON.stringify(item);
				// response.writeHead(200, {'content-type':'application/json'}); 
				response.jsonp(item);	
			}
		}
	);

});


app.listen(port, function() {
	console.log("Listening on " + port);
});
