"use strict";

var tweetopia = {

	dayLength: 240,			// Length of day in seconds 
	panelDistance: 300,		// Camera distance from panel
	maxTweets: 80,			// Maximum number of tweets

	searchUrl: "/.netlify/functions/tweetopia",
	
	// Main init function

	init: function() {

		$('#main').css('cursor', 'none');

		// Check QueryString

		var match = RegExp('[?&]dayLength=([^&/]*)').exec(window.location.search);
		if (match != null) tweetopia.dayLength = match[1];	

		// Functional Globals

		tweetopia.panels = [];
		tweetopia.curPanelIndex=  -1;
		tweetopia.loadCount = 0;
		tweetopia.loadComplete = false;
		tweetopia.clock = new THREE.Clock();		

		// Initialize

		ttcolors.init();
		ttcolors.autoUpdate = true;

		ttobjects.init();

		tweetopia.setupScene();

		// Fetch Twitter Data

		var searchString;

		if (location.hash) 
			searchString = location.hash.substr(1);
		else
			location.hash = searchString = "WebGL";

		var searchCount = tweetopia.maxTweets;
		var searchQueryString = "?q=%23" + searchString + "&count=" + searchCount + "&include_entities=1";
		tweetopia.fetchData(tweetopia.searchUrl + searchQueryString);

		// Preload Images

		tweetopia.logoImage = new Image();
		tweetopia.logoImage.onload = function () { tweetopia.checkLoad("Logo Texture"); };
		tweetopia.logoImage.src = "textures/logo.png";

		tweetopia.bubbleImage = new Image();
		tweetopia.bubbleImage.onload = function () { tweetopia.checkLoad("Bubble Texture"); };
		tweetopia.bubbleImage.src = "textures/bubble.png";

		tweetopia.labelImage = new Image();
		tweetopia.labelImage.onload = function () { tweetopia.checkLoad("Label texture"); };
		tweetopia.labelImage.src = "textures/label.png";		

		tweetopia.characterRing = new Image();
		tweetopia.characterRing.onload = function () { tweetopia.checkLoad("Ring Texture"); };
		tweetopia.characterRing.src = "textures/characterRing.png";		

		tweetopia.characterFace= new Image();
		tweetopia.characterFace.onload = function () { tweetopia.checkLoad("Face Texture"); };
		tweetopia.characterFace.src = "textures/characterFace.png";			

		// Setup Events

		window.addEventListener( 'resize', function (event) { ttevents.onWindowResize(event) }, false );
		window.addEventListener('hashchange', function (event) { ttevents.onWindowHashChange(event) }, false);
		document.addEventListener( 'mousedown', ttevents.onDocumentMouseDown, false );	
		document.addEventListener( 'mousemove', ttevents.onDocumentMouseMove, false );	
		document.addEventListener( 'keydown', ttevents.onKeyDown, false );

		// Start Animation

		tweetopia.animate();
	},
	
	// Check for preload completion

	checkLoad: function (assetName) {
		tweetopia.loadCount++;

		console.log("Asset Loaded: " + assetName);

		if (tweetopia.loadCount >= 7) {
			tweetopia.loadComplete = true;
			tweetopia.buildPanels(tweetopia.twitterData);

			new TWEEN.Tween(tweetopia.logoMaterial)
				.to ({ opacity : 1 }, 500)
				.start();

			setInterval("tweetopia.updateData()", 1000 * 60);
			setTimeout("tweetopia.startAnimation()", 1000 * 3);
		}
	},

	startAnimation: function () {
		ttcontrol.nextPanel();

		new TWEEN.Tween(tweetopia.logoMaterial)
			.to ({ opacity : 0 }, 1000)
			.onComplete (function () { tweetopia.logoMaterial.visible = false })
			.start();

	},

	// Fetch Twitter data

	fetchData: function (searchUrl) {

		console.log(searchUrl);

		$.ajax( {
			url: searchUrl,
			dataType: "json",
			timeout : 5000,
		})
		.done(function( data ) {
				tweetopia.twitterData = data;
				if (tweetopia.loadComplete)
					tweetopia.buildPanels(data);
				else
					tweetopia.checkLoad("Twitter Data");
		})
		.fail (function( jqXHR, textStatus) {
				console.log("Error fetching tweets.");	
				console.log(textStatus);
		});

	},

	updateData: function () {
		$('#render').css('cursor', 'none');	

		var searchCount = tweetopia.maxTweets - tweetopia.panels.length;
		if (searchCount <= 0) return;

		var searchQueryString = tweetopia.twitterData.search_metadata.refresh_url + "&count=" + searchCount;
		tweetopia.fetchData(tweetopia.searchUrl + searchQueryString);
	},

	// Setup Three.js scene

	setupScene: function () {

		// Scene, Camera, Renderer

		tweetopia.renderWidth = window.innerWidth;
		tweetopia.renderHeight = window.innerHeight;

		tweetopia.projector = new THREE.Projector();

		tweetopia.camera = new THREE.PerspectiveCamera( 35, tweetopia.renderWidth/ tweetopia.renderHeight, .1, 12400 );
		tweetopia.camera.position.y = 256;
		tweetopia.camera.position.z = 1600;
		tweetopia.camera.target = new THREE.Vector3( 0, 256, 0 );

		tweetopia.scene = new THREE.Scene();
		tweetopia.scene.add(tweetopia.camera);
		tweetopia.scene.fog = new THREE.Fog( ttcolors.fog.getHex(), 600, 3200 );
		
		tweetopia.renderer = new THREE.WebGLRenderer( { antialias: true, clearColor: ttcolors.skyTop.getHex(), clearAlpha: 1 });
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );

		$("#render").append( tweetopia.renderer.domElement );

		// UV Pass

		var uvShader = THREE.ShaderUtils.lib["uv"]; 
		
		tweetopia.uvMaterial = new THREE.ShaderMaterial( { 
			vertexShader: uvShader.vertexShader, 
			fragmentShader: uvShader.fragmentShader 
		}); 

		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		tweetopia.uvRenderTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters  );				

		// Add Objects

		tweetopia.scene.add(ttobjects.createSky());
		tweetopia.scene.add(ttobjects.createStars());
		tweetopia.scene.add(ttobjects.createGround());			
		tweetopia.scene.add(ttobjects.createLogo());	

	},
	
	// Build panels and dudes
	
	buildPanels: function(data) {
		if (data.statuses.length) {
			var panelArray = [];

			for (var statusIndex in data.statuses) {

				//if (data.results[resultIndex].text.substr(0,1) == "@") continue;
				if (data.statuses[statusIndex].text.substr(0,2) == "RT") continue;

				// Build bubble

				var safePosition = tweetopia.getSafePosition(panelArray);

				var characterMesh = ttobjects.createCharacter(data.statuses[statusIndex], safePosition);
				tweetopia.scene.add(characterMesh);

				var bubbleMesh = ttobjects.createBubble(data.statuses[statusIndex], safePosition);
				tweetopia.scene.add(bubbleMesh);				

				bubbleMesh.characterMesh = characterMesh;

				new TWEEN.Tween(characterMesh.scale)
					.to({x:1, y:1, z: 1}, 1000)
					.easing( TWEEN.Easing.Bounce.Out)
					.start();

				// Add elements to scene

				panelArray.push(bubbleMesh);
			}

			if (panelArray.length) {
				
				tweetopia.curPanelIndex += panelArray.length;
				tweetopia.panels = panelArray.concat(tweetopia.panels);

				console.log("Added " + panelArray.length + " new tweets (" + tweetopia.panels.length + " total).");
			}
			
		}
	},

	getSafePosition: function(panelArray) {

		var safePosition = new THREE.Vector3();
		var minDistance;

		do {

			minDistance = 480;
			safePosition.x = Math.random() * 5600 - 2800;
			safePosition.y = 132;
			safePosition.z = Math.random() * 5600 - 2800;

			var panelArray = panelArray.concat(tweetopia.panels);

			for (var curPanelIndex in panelArray) {
				var curPanel = panelArray[curPanelIndex];
				var distance = safePosition.distanceTo(curPanel.position);
				
				if (distance < minDistance) {
					minDistance = distance
					break;
				};
			}

		} while (minDistance < 480);

		return safePosition;
	},

	// Main animation routine

	animate: function() {	
	    TWEEN.update();
	    if (tweetopia.dayLength > 0) ttcolors.update();
		tweetopia.render();
		requestAnimationFrame( tweetopia.animate );		
	},

	// Main render routine

	render: function() {
		tweetopia.camera.lookAt( tweetopia.camera.target );
		tweetopia.renderer.render( tweetopia.scene, tweetopia.camera );

	},

}
