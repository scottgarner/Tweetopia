"use strict";

var ttcanvas = {

	// Create username label

	drawLabel: function(username) {

		username = username.toUpperCase();	

		var labelCanvas = $('<canvas/>').attr({width:512,height:64});
		var labelContext = $(labelCanvas)[0].getContext('2d');
		labelContext.font = "300 " + 24 + "px/" + 1.5 + " Nunito";	
		labelContext.textBaseline = "baseline";
		labelContext.lineWidth = "8";		
		
		var labelMetrics = labelContext.measureText(username);			

		// Draw Bubble

			//Center

 		labelContext.drawImage(tweetopia.labelImage, 24, 0, 
 			tweetopia.labelImage.width - 24 * 2, tweetopia.labelImage.height, 
 			512/2 - labelMetrics.width /2, 0, 
 			labelMetrics.width, tweetopia.labelImage.height);	

 			// Left

 		labelContext.drawImage(tweetopia.labelImage, 0, 0, 
 			26, tweetopia.labelImage.height, 
 			512/2 - labelMetrics.width /2 - 24, 0,
 			26, tweetopia.labelImage.height); 

 			// Right

 		labelContext.drawImage(tweetopia.labelImage, tweetopia.labelImage.width - 26, 0,
 			26, tweetopia.labelImage.height, 
 			512/2 + labelMetrics.width /2 - 2, 0,
 			26, tweetopia.labelImage.height); 


		// Draw text

		labelContext.fillStyle = "rgb(0,0,255)";
		labelContext.fillText(username, 512/2 - labelMetrics.width /2, 64 /2 + 10);

		return labelCanvas;
	},

	// Create tweet canvas

	drawBubble: function (tweetText, tweetUser, tweetEntities) {

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:1024,height:512});
			var tweetContext = $(tweetCanvas)[0].getContext('2d');

			// Draw Bubble

     		tweetContext.drawImage(tweetopia.bubbleImage,0,0);	

			// Manually wrap lines

			var tweetWidth = 864;
			var tweetFontSize = 36;
			var tweetFontSizeSmall = 22;
			var tweetLineHeight = 1.5;	

			tweetContext.fillStyle = "rgb(255,0,0)";
			tweetContext.font = "300 " + tweetFontSize + "px/" + tweetLineHeight + " Nunito";	
			tweetContext.textBaseline = "baseline";				

			var tweetWords = tweetText.split(" ");
			var tweetLines = [""];
			var tweetLineIndex = 0;

			var maxLineWidth = 0;

			for (var x = 0; x < tweetWords.length; x++) {
				var curLine = tweetLines[tweetLineIndex] + tweetWords[x];

				var curLineClean = curLine;
				curLineClean = curLineClean.replace(/\&amp;/g,'&');
				curLineClean = curLineClean.replace(/\&lt;/g,'<');
				curLineClean = curLineClean.replace(/\&gt;/g,'>');

				var testMetrics = tweetContext.measureText(curLineClean);

				if (testMetrics.width > tweetWidth) {
					tweetLineIndex++;
					tweetLines[tweetLineIndex] = tweetWords[x] + " ";
				}
				else {
					tweetLines[tweetLineIndex] = curLine  + " ";
					if (testMetrics.width > maxLineWidth) maxLineWidth = testMetrics.width;
				}

			}

			var lineHeight = tweetFontSize * tweetLineHeight;
			var totalHeight = lineHeight * (tweetLines.length);

			// Format Text

			var letterIndex = 0;
			var tweetY = 512/2 - totalHeight/2 + tweetFontSize;

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

					if (tweetEntities) {

						var tweetEntityTypes = [];

						if (tweetEntities.hasOwnProperty('media')) tweetEntityTypes.push(tweetEntities.media);
						if (tweetEntities.hasOwnProperty('urls')) tweetEntityTypes.push(tweetEntities.urls);
						if (tweetEntities.hasOwnProperty('user_mentions')) tweetEntityTypes.push(tweetEntities.user_mentions);
						if (tweetEntities.hasOwnProperty('hashtags')) tweetEntityTypes.push(tweetEntities.hashtags);

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

										tweetContext.fillStyle = "rgb(0,255,0)";
										break;
									}
									if (letterIndex == curEntity.indices[1]) {
										boundingBox.end = {x: tweetX, y: tweetY - tweetFontSize};
										boundingBoxes.push(boundingBox);
										tweetContext.fillStyle = "rgb(255,0,0)";
										break;
									}
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

			tweetCanvas.boundingBoxes = boundingBoxes;


			// Add username

			/*
			var lastLineMetrics = tweetContext.measureText(tweetLines[tweetLines.length - 1]);

			if (tweetLines.length == 4)
				tweetY -= lineHeight;
			// else if (lastLineMetrics.width < maxLineWidth /1.5 )
			// 	tweetY -= lineHeight;
			else 
				tweetY -= tweetFontSizeSmall /2;

			var userMetrics;	

			tweetUser = "—" + tweetUser.toUpperCase();
			tweetContext.fillStyle = "rgb(196,196,196)";
			tweetContext.font = "300 " + tweetFontSizeSmall + "px/" + tweetLineHeight + " Nunito";
			userMetrics = tweetContext.measureText(tweetUser);
			tweetContext.fillText(tweetUser, (1024/2 + maxLineWidth /2) -  userMetrics.width, tweetY );
			*/

			// Debug bounding boxes

			// for ( var curBoundingBoxIndex in boundingBoxes) {
			// 	var curBoundingBox = boundingBoxes[curBoundingBoxIndex];
			
			// 	tweetContext.fillRect(curBoundingBox.start.x, curBoundingBox.start.y, 
			// 		curBoundingBox.end.x - curBoundingBox.start.x, 
			// 		curBoundingBox.end.y - curBoundingBox.start.y);
			// }


			// Debug display canvas	

    		//$("#main").prepend(tweetCanvas);		


			// Return Object			

			return tweetCanvas;
	},



};