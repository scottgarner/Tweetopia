"use strict";

var tweetopia = {

	panels: [],
	curPanelIndex: -1,
	loadCount: 0,
	loadComplete: false,
	
	// Main init function

	init: function() {

		// Initialize

		tweetopia.setupScene();
		tweetopia.setupEnvironment();

		var searchString = "%23WVpdx";
		var searchURL="http://search.twitter.com/search.json";
		var searchQueryString = "?q=" + searchString + "&rpp=20&callback=?"
		tweetopia.fetchData(searchURL + searchQueryString);

		// Preload Images

		tweetopia.bubbleImage = new Image();
		tweetopia.bubbleImage.onload = function () { tweetopia.checkLoad(); };
		tweetopia.bubbleImage.src = "textures/bubble.png";

		tweetopia.dudeRing = new Image();
		tweetopia.dudeRing.onload = function () { tweetopia.checkLoad(); };
		tweetopia.dudeRing.src = "textures/dudeRing.png";		

		// Setup Events

		window.addEventListener( 'resize', function (event) { ttevents.onWindowResize(event) }, false );
		document.addEventListener( 'mousedown', ttevents.onDocumentMouseDown, false );	
		document.addEventListener( 'mousemove', ttevents.onDocumentMouseMove, false );	
		document.addEventListener( 'keydown', ttevents.onKeyDown, false );

		// Start Animation

		tweetopia.animate();
	},
	
	// Check for preload completion

	checkLoad: function () {
		tweetopia.loadCount++;

		if (tweetopia.loadCount >= 3) {
			tweetopia.loadComplete = true;
			tweetopia.parseData(tweetopia.twitterData);
			setInterval("tweetopia.updateData()", 1000 * 300);
			ttcontrol.nextPanel();
		}
	},

	// Setup Three.js scene

	setupScene: function () {

		// Scene, Camera, Renderer

		tweetopia.renderWidth = window.innerWidth;
		tweetopia.renderHeight = window.innerHeight;

		tweetopia.camera = new THREE.PerspectiveCamera( 36, tweetopia.renderWidth/ tweetopia.renderHeight, .1, 16384 );
		tweetopia.camera.position.y = 128;
		tweetopia.camera.position.z = 1200;
		tweetopia.camera.target = new THREE.Vector3( 0, 0, 0 );

		tweetopia.scene = new THREE.Scene();
		tweetopia.scene.add(tweetopia.camera);
		tweetopia.scene.fog = new THREE.Fog( 0x7790a0, 1200, 3200 );
		
		tweetopia.renderer = new THREE.WebGLRenderer( { antialias: true });
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );
		tweetopia.renderer.setClearColorHex( 0x333333, 1 );

		$("#render").append( tweetopia.renderer.domElement );

		// Add Lights

		var ambient = new THREE.AmbientLight( 0x111111 );
		tweetopia.scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
		directionalLight.position.set( 0, 1, 1 );
		tweetopia.scene.add( directionalLight );		

	},

	// Setup Environment

	setupEnvironment: function () {

		// Add Ground

		var simplex = new SimplexNoise();
		var groundGeometry = new THREE.PlaneGeometry( 8192, 8192, 48, 48 );
		THREE.GeometryUtils.triangulateQuads( groundGeometry );

		for ( var i = 0, l = groundGeometry.faces.length; i < l; i ++ ) {
			for ( var j = 0; j < 3; j++) {
				var color = new THREE.Color( 0xffffff );
				var colorFactor = Math.random() + .25;
				color.setRGB( 0.8 * colorFactor, 0.9 * colorFactor, 1 * colorFactor);
				groundGeometry.faces[ i ].vertexColors.push(color);
			}
		}

		for ( var i = 0, l = groundGeometry.vertices.length; i < l; i ++ ) {
			//groundGeometry.vertices[ i ].y = Math.sin( i ) * 20 + Math.cos( i - ( i * 64 ) ) ;
			groundGeometry.vertices[ i ].y  = simplex.noise(groundGeometry.vertices[ i ].x / 1024, groundGeometry.vertices[ i ].z / 1024 ) * 64;
			groundGeometry.vertices[ i ].x +=  Math.random() * 64 - 32;
		}

		var groundMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		var groundMesh = new THREE.Mesh( groundGeometry,  groundMaterial);	

		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true,  wireframeLinewidth: 2 } )
		var wireMesh = new THREE.Mesh( groundGeometry,  wireMaterial);
		wireMesh.position.y = 8;

		tweetopia.scene.add(groundMesh);	
		tweetopia.scene.add(wireMesh);	

		// Add Sky

		var skyGeometry = new THREE.CylinderGeometry( 6000, 6000, 2000, 40, 1, true );
		var faceIndices = [ 'a', 'b', 'c', 'd' ];
		for ( var i = 0, l = skyGeometry.faces.length; i < l; i ++ ) {
			var curFace = skyGeometry.faces[i];
			var vertexCount = ( curFace instanceof THREE.Face3 ) ? 3 : 4;

			for ( var j = 0; j < vertexCount; j++) {

				var vertexIndex = curFace[ faceIndices[ j ] ];
				var vertex = skyGeometry.vertices[ vertexIndex ];

				var color = new THREE.Color( 0xffffff );

				if (vertex.y < 0 )
					color.setRGB(.5,.6,.7);
				else
					color.setRGB(.2,.2,.2);

				skyGeometry.faces[ i ].vertexColors.push(color);
			}
		}
		
		var skyMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, 
			vertexColors: THREE.VertexColors, fog: false } )
		var skyMesh = new THREE.Mesh( skyGeometry,  skyMaterial);
		skyMesh.doubleSided = true;
		skyMesh.position.y = 800;

		tweetopia.scene.add(skyMesh);
	},

	// Fetch Twitter data
	
	fetchData: function (searchURL) {

		$.ajax( {
			url: searchURL,
			dataType: "jsonp",
			timeout : 5000,
			success: function( data ) {
				tweetopia.twitterData = data;

				if (tweetopia.loadComplete)
					tweetopia.parseData(data);
				else
					tweetopia.checkLoad();
			},	
			error: function() {	
			}
		});	
	},

	updateData: function () {

		var searchURL="http://search.twitter.com/search.json";
		var searchQueryString = tweetopia.twitterData.refresh_url + "&rpp=25&callback=?"
		tweetopia.fetchData(searchURL + searchQueryString);

	},
	
	// Parse and store Twitter data
	
	parseData: function(data) {

		if (data.results.length) {
			var panelArray = [];

			for (var resultIndex in data.results) {

				var tweetText = data.results[resultIndex].text;

				if (tweetText.substr(0,1) == "@") continue;
				if (tweetText.substr(0,2) == "RT") continue;

				// Setup canvas and text

				var tweetCanvas = tweetopia.drawCanvas(tweetText);

				// Build Panel

				var panelTexture = new THREE.Texture( $(tweetCanvas)[0] );
				panelTexture.minFilter = panelTexture.magFilter = THREE.LinearFilter;
				panelTexture.needsUpdate = true;
				
				var panelMaterial = new THREE.MeshBasicMaterial( { map: panelTexture, transparent: true} );
				var panelMesh = new THREE.Mesh( new THREE.PlaneGeometry( 240, 80, 1, 1 ),  panelMaterial);	
				
				panelMesh.rotation.x = Math.PI/2;
				panelMesh.position.x = Math.random() * 6000 - 3000;
				panelMesh.position.y = 128;
				panelMesh.position.z = Math.random() * 6000 - 3000;

				panelMesh.visible = false;

				panelMesh.url = "https://twitter.com/#!/" + data.results[resultIndex].from_user + 
								"/status/" + data.results[resultIndex].id_str ;

				tweetopia.scene.add(panelMesh);

				// Add dude

				var dudeGeometry = new THREE.CylinderGeometry( 12, 12, 4, 24, 1);
				var dudeMaterial = new THREE.MeshLambertMaterial({color: 0x667799});
				var dudeMesh = new THREE.Mesh(dudeGeometry, dudeMaterial);

				dudeMesh.scale.x = dudeMesh.scale.y = dudeMesh.scale.z = .1;
				dudeMesh.rotation.x = Math.PI/2;
				dudeMesh.position.x = panelMesh.position.x - 48;
				dudeMesh.position.y = 72;
				dudeMesh.position.z = panelMesh.position.z;

				var dudeRingMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( "textures/dudeRing.png" ), transparent: true});
				var dudeRingMesh = new THREE.Mesh(new THREE.PlaneGeometry( 32, 32, 1, 1), dudeRingMaterial);
				
				dudeRingMesh.doubleSided = true;
				dudeRingMesh.position.y = .1;
				dudeMesh.add(dudeRingMesh);

				panelMesh.dudeMesh = dudeMesh;
				tweetopia.scene.add(dudeMesh);

				new TWEEN.Tween(dudeMesh.scale)
					.to({x:1, y:1, z: 1}, 1000)
					.easing( TWEEN.Easing.Bounce.Out)
					.start();

				// Add elements to scene

				panelArray.push(panelMesh);
			}

			if (panelArray.length) {

				tweetopia.curPanelIndex += panelArray.length;
				tweetopia.panels = panelArray.concat(tweetopia.panels);
			}
			
		}
	},

	// Create tweet canvas

	drawCanvas: function (tweetText) {

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:960,height:320});
			var tweetContext = $(tweetCanvas)[0].getContext('2d');

			// Draw background


    		tweetContext.drawImage(tweetopia.bubbleImage,0,0);	

			// Manually wrap lines

			var tweetWidth = 864;
			var tweetFontSize = 36;
			var tweetLineHeight = 1.5;
			//var tweetX = 48;
			//var tweetY = 48 + tweetFontSize;

			tweetContext.fillStyle = "rgba(32, 32, 32, .75)";
			tweetContext.font = tweetFontSize + "px/" + tweetLineHeight + " Georgia";			

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

			// Draw Text

			var tweetX = 960/2 - maxLineWidth / 2;
			var tweetY = 300/2 - totalHeight/2;

			for ( x = 0; x < tweetLines.length; x++) {
				var curLine = tweetLines[x];

				tweetContext.fillText(curLine, tweetX, tweetY + ( x * lineHeight));

			}

			return tweetCanvas;
	},

	// Main animation routine

	animate: function() {		
	    TWEEN.update();
		tweetopia.render();
		requestAnimationFrame( tweetopia.animate );		
	},

	// Main render routine

	render: function() {
		tweetopia.camera.lookAt( tweetopia.camera.target );
		tweetopia.renderer.render( tweetopia.scene, tweetopia.camera );
	},

	// Control routines


}
