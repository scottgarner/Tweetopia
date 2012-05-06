var ttcanvas = {

	// Create tweet canvas

	drawBubble: function (tweetText, tweetEntities) {

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:1024,height:512});
			var tweetContext = $(tweetCanvas)[0].getContext('2d');

			// Draw background

    		tweetContext.drawImage(tweetopia.bubbleImage,0,0);	

			// Manually wrap lines

			var tweetWidth = 864;
			var tweetFontSize = 36;
			var tweetLineHeight = 1.5;

			tweetContext.fillStyle = "rgba(32, 32, 32, .75)";
			tweetContext.font = tweetFontSize + "px/" + tweetLineHeight + " Georgia";	
			tweetContext.textBaseline = "bottom";		

			var tweetWords = tweetText.split(" ");
			var tweetLines = [""];
			var tweetLineIndex = 0;

			var maxLineWidth = 0;

			for (var x = 0; x < tweetWords.length; x++) {
				var curLine = tweetLines[tweetLineIndex] + tweetWords[x] + " ";
				var testMetrics = tweetContext.measureText(curLine);

				if (testMetrics.width > tweetWidth) {
					tweetLineIndex++;
					tweetLines[tweetLineIndex] = tweetWords[x] + " ";
				}
				else {
					tweetLines[tweetLineIndex] = curLine;
				}

				var curMetrics = tweetContext.measureText(tweetLines[tweetLineIndex]);
				if (curMetrics.width > maxLineWidth) maxLineWidth = curMetrics.width;
			}

			var lineHeight = tweetFontSize * tweetLineHeight;
			var totalHeight = lineHeight * (tweetLines.length - 1)   ;

			// Format Text

			var letterIndex = 0;
			var tweetY = 512/2 - totalHeight/2;

			var boundingBox;
			var boundingBoxes = [];

			for (var tweetLineIndex in tweetLines) {
				var curLine = tweetLines[tweetLineIndex];
				var tweetX = 1024/2 - maxLineWidth / 2;

				for (var lineLetterIndex  = 0; lineLetterIndex < curLine.length; lineLetterIndex++) {

					var curLetter;

					// Stupid HTML entities

					if (tweetText.substr(letterIndex,5) == "&amp;") {
						curLetter  = "&";
						letterIndex += 4;
						lineLetterIndex += 4;
					} else if (tweetText.substr(letterIndex,4) == "&lt;") {
						curLetter  = "<";
						letterIndex += 3;
						lineLetterIndex += 3;
					} else if (tweetText.substr(letterIndex,4) == "&gt;") {
						curLetter  = ">";
						letterIndex += 3;
						lineLetterIndex += 3;						
					} else {
						curLetter = curLine[lineLetterIndex];
					}				

					// Layout text and look for Twitter entities

					var curLetterMetrics = tweetContext.measureText(curLetter);

					var tweetEntityTypes = [tweetEntities.media, tweetEntities.urls,
						tweetEntities.user_mentions, tweetEntities.hashtags];

					for (var curEntityTypeIndex in tweetEntityTypes) {

						var curEntityType = tweetEntityTypes[curEntityTypeIndex];

						if (curEntityType) {
							for (var curEntityIndex in curEntityType) {
								var curEntity = curEntityType[curEntityIndex];
								if (letterIndex == curEntity.indices[0]) {
									boundingBox = {};
									boundingBox.start = { x:tweetX, y:tweetY };

									if ( curEntity.url )
										boundingBox.url = curEntity.url;
									else if ( curEntity.screen_name)
										boundingBox.url = "http://twitter.com/#!/" + curEntity.screen_name;
									else if ( curEntity.text)
										boundingBox.url = "https://twitter.com/#!/search/%23" + curEntity.text;
									else
										boundingBox.url = curPanel.url;

									tweetContext.fillStyle = tweetopia.colors[1].getContextStyle();
									break;
								}
								if (letterIndex == curEntity.indices[1]) {
									boundingBox.end = {x: tweetX, y: tweetY - tweetFontSize};
									boundingBoxes.push(boundingBox);
									tweetContext.fillStyle = "rgba(32, 32, 32, .75)";
									break;
								}
							}
						}

					}
					
					// Write Text

					tweetContext.fillText(curLetter, tweetX, tweetY);
					tweetX += curLetterMetrics.width;
					letterIndex++;
				}
				
				tweetY += lineHeight;

			}

			// for ( var curBoundingBoxIndex in boundingBoxes) {
			// 	var curBoundingBox = boundingBoxes[curBoundingBoxIndex];
			
			// 	tweetContext.fillRect(curBoundingBox.start.x, curBoundingBox.start.y, 
			// 		curBoundingBox.end.x - curBoundingBox.start.x, 
			// 		curBoundingBox.end.y - curBoundingBox.start.y);
			// }

			tweetCanvas.boundingBoxes = boundingBoxes;

			return tweetCanvas;
	},



};