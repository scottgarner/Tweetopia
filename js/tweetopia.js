"use strict";

var tweetopia = {

	panels: [],
	
	// Main init function

	init: function() {
		tweetopia.setupScene();
		tweetopia.fetchData("%23webvisions");

		window.addEventListener( 'resize', function (event) { wvevents.onWindowResize(event) }, false );
		document.addEventListener( 'mousemove', wvevents.onDocumentMouseMove, false );		

		tweetopia.animate();
	},
	
	// Setup Three.js scene

	setupScene: function () {

		tweetopia.renderWidth = window.innerWidth;
		tweetopia.renderHeight = window.innerHeight;

		tweetopia.camera = new THREE.PerspectiveCamera( 36, tweetopia.renderWidth/ tweetopia.renderHeight, .1, 5000 );
		tweetopia.camera.position.z = 1200		;

		tweetopia.scene = new THREE.Scene();
		tweetopia.scene.add(tweetopia.camera);
		
		tweetopia.renderer = new THREE.WebGLRenderer( { antialias: false });
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );
		tweetopia.renderer.setClearColorHex( 0x333333, 1 );

		$("#render").append( tweetopia.renderer.domElement );
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

				var tweetCanvas = tweetopia.drawCanvas(tweetText);

				// Add panel to scene

				var panelTexture = new THREE.Texture( $(tweetCanvas)[0] );
				panelTexture.needsUpdate = true;
				
				var panelMaterial = new THREE.MeshBasicMaterial( { map: panelTexture, transparent: true} );
				
				var panelMesh = new THREE.Mesh( new THREE.PlaneGeometry( 200, 50, 1, 1 ),  panelMaterial);	
				panelMesh.doubleSided = true;
				panelMesh.position.z = resultIndex * -10;
				panelMesh.rotation.x = Math.PI/2;
				panelMesh.velocity = new THREE.Vector3(Math.random() * 4 - 2, Math.random() * 2 - 1, (data.results.length - resultIndex) /2);

				tweetopia.scene.add(panelMesh);
				tweetopia.panels.push(panelMesh);
			}

		}
	},

	// Create tweet canvas

	drawCanvas: function (tweetText) {

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:800,height:200});
			var tweetContext = $(tweetCanvas)[0].getContext('2d');

			// Draw background

			tweetContext.fillStyle = "rgba(192, 192, 192, 1)";
			tweetContext.fillRect(5, 5, 790, 190);			

			// Manually wrap lines

			var tweetWidth = 760;
			var tweetFontSize = 32;
			var tweetLineHeight = 1.5;
			var tweetX = 20;
			var tweetY = 20 + tweetFontSize;

			tweetContext.fillStyle = "rgba(32, 32, 32, .75)";
			tweetContext.font = tweetFontSize + "px/" + tweetLineHeight + " Georgia";			

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

			return tweetCanvas;
	},

	// Main animation routine

	animate: function() {		

		for (var panelIndex in tweetopia.panels) {
			var curPanel = tweetopia.panels[panelIndex];
			if (Math.abs(curPanel.velocity.x) > .05 || Math.abs(curPanel.velocity.y) > .05) {
				curPanel.position.addSelf(curPanel.velocity);
				curPanel.velocity.multiplyScalar(.995);
			}
		}

		requestAnimationFrame( tweetopia.animate );
		tweetopia.render();
	},

	// Main render routine

	render: function() {
		tweetopia.renderer.render( tweetopia.scene, tweetopia.camera );

	}
}
