"use strict";

var tweetopia = {

	// Main init function
	
	init: function() {
		tweetopia.fetchData("%23webvisions");
	},
	
	// Fetch Twitter data
	
	fetchData: function (searchString) {
		var searchURL="http://search.twitter.com/search.json";
		var searchQueryString = "?q=" + searchString + "&callback=?&rpp=25"

		$.ajax( {
			url: searchURL + searchQueryString,
			dataType: "jsonp",
			timeout : 5000,
			success: function( data ) {
				tweetopia.parseData(data);
			},	
			error: function() {	
			}
		});	
	},
	
	// Parse and store Twitter data
	
	parseData: function(data) {

		if (data.results.length) {
			for (var resultIndex in data.results) {

				var tweetText = data.results[resultIndex].text;

				if (tweetText.substr(0,1) == "@") continue;
				if (tweetText.substr(0,2) == "RT") continue;

				// Setup canvas and text

				var tweetWidth = 380;
				var tweetFontSize = 16;
				var tweetLineHeight = 1.5;
				var tweetX = 10;
				var tweetY = 10 + tweetFontSize;

				var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:400,height:100});
				var tweetContext = $(tweetCanvas)[0].getContext('2d');
				tweetContext.font = tweetFontSize + "px/" + tweetLineHeight + " Georgia";

				$('body').append(tweetCanvas);

				// Manually wrap lines

				var tweetWords = tweetText.split(" ");
				var tweetLine = "";

				for (var x = 0; x < tweetWords.length; x++) {
					var curLine = tweetLine + tweetWords[x] + " ";
					var curMetrics = tweetContext.measureText(curLine);
					var curWidth = curMetrics.width;
					if (curWidth > tweetWidth) {
						tweetContext.fillText(tweetLine, tweetX, tweetY);
						tweetLine = tweetWords[x] + " ";
						tweetY += tweetFontSize * tweetLineHeight;
					}
					else {
						tweetLine = curLine;
					}
				}
				tweetContext.fillText(tweetLine, tweetX, tweetY);
			}
		}
	}
}
