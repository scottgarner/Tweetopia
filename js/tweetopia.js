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

		// Fetch Twitter Data

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

	// Setup Three.js scene

	setupScene: function () {

		// Scene, Camera, Renderer

		tweetopia.renderWidth = window.innerWidth;
		tweetopia.renderHeight = window.innerHeight;

		tweetopia.camera = new THREE.PerspectiveCamera( 36, tweetopia.renderWidth/ tweetopia.renderHeight, .1, 16384 );
		tweetopia.camera.position.y = 256;
		tweetopia.camera.position.z = 1200;
		tweetopia.camera.target = new THREE.Vector3( 0, 256, 0 );

		tweetopia.scene = new THREE.Scene();
		tweetopia.scene.add(tweetopia.camera);
		tweetopia.scene.fog = new THREE.Fog( 0x5e6f7a, 1200, 3200 );
		
		tweetopia.renderer = new THREE.WebGLRenderer( { antialias: true });
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );
		tweetopia.renderer.setClearColorHex( 0x000000, 1 );

		$("#render").append( tweetopia.renderer.domElement );

		// Add Lights

		var ambient = new THREE.AmbientLight( 0x111111 );
		tweetopia.scene.add( ambient );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
		directionalLight.position.set( 0, 1, 1 );
		tweetopia.scene.add( directionalLight );		

		// Add Logo

		var logoGeometry = new THREE.PlaneGeometry( 1024, 256, 1, 1 );
		tweetopia.logoMaterial = new THREE.MeshBasicMaterial( {map: THREE.ImageUtils.loadTexture( "textures/logo.png" ), transparent: true});
		tweetopia.logoMaterial.doubleSided = true;

		var logoMesh = new THREE.Mesh(logoGeometry, tweetopia.logoMaterial );
		logoMesh.rotation.x = Math.PI/2;
		logoMesh.position.y = 320;

		tweetopia.scene.add(logoMesh);

	},

	// Setup Environment

	setupEnvironment: function () {

		// Add Ground

		var simplex = new SimplexNoise();
		var groundGeometry = new THREE.PlaneGeometry( 8192, 8192, 48, 56 );
		THREE.GeometryUtils.triangulateQuads( groundGeometry );

		for ( var i = 0, l = groundGeometry.faces.length; i < l; i ++ ) {
			for ( var j = 0; j < 3; j++) {
				var color;

				switch (j) {
					case 0:
						color = new THREE.Color( 0xe6e8ea );
						break;
					case 1:
						color = new THREE.Color( 0xabb3b9 );
						break;
					case 2:
						color = new THREE.Color( 0x5e6f7a );
						break;
				}
				
				groundGeometry.faces[ i ].vertexColors.push(color);
			}
		}

		for ( var i = 0, l = groundGeometry.vertices.length; i < l; i ++ ) {
			//groundGeometry.vertices[ i ].y = Math.sin( i ) * 20 + Math.cos( i - ( i * 64 ) ) ;
			groundGeometry.vertices[ i ].y  = simplex.noise(groundGeometry.vertices[ i ].x / 1024, groundGeometry.vertices[ i ].z / 1024 ) * 64;
			groundGeometry.vertices[ i ].x +=  Math.random() * 128 - 64;
		}

		var groundMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		var groundMesh = new THREE.Mesh( groundGeometry,  groundMaterial);	

		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading,
			wireframe: true,  wireframeLinewidth: 2 } )
		var wireMesh = new THREE.Mesh( groundGeometry,  wireMaterial);
		wireMesh.position.y = 8;

		tweetopia.scene.add(groundMesh);	
		tweetopia.scene.add(wireMesh);	

		// Add Sky

		var skyGeometry = new THREE.CylinderGeometry( 6200, 6200, 4200, 40, 1, true );

		var skyShader = THREE.ShaderUtils.lib["sky"];
		var skyUniforms = THREE.UniformsUtils.clone( skyShader.uniforms );

		var skyTexture = THREE.ImageUtils.loadTexture( "textures/stripes.png" );
		skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;	

		skyUniforms["map"].texture = skyTexture;
		skyUniforms["topColor"].value = new THREE.Vector3( 0, 0, 0);
		skyUniforms["bottomColor"].value = new THREE.Vector3( 95.0 / 256.0, 115.0 / 256.0 , 128.0 / 256.0);
		skyUniforms["offsetRepeat"].value = new THREE.Vector4( 0, 0, 36, 3);

		var skyMaterial = new THREE.ShaderMaterial( {
			uniforms: skyUniforms,
			vertexShader: skyShader.vertexShader,
			fragmentShader: skyShader.fragmentShader,
		});

		var skyMesh = new THREE.Mesh( skyGeometry,  skyMaterial);
		skyMesh.flipSided = true;
		skyMesh.position.y = 1800;

		tweetopia.scene.add(skyMesh);

		// Add stars

		var starsShader = THREE.ShaderUtils.lib["stars"];
		var starsUniforms = THREE.UniformsUtils.clone( starsShader.uniforms );

		starsUniforms["map"].texture = THREE.ImageUtils.loadTexture( "textures/star.png" );
	
        var starsAttributes = {
                size: { type: 'f', value: [] },
        };	

		var starsGeometry = new THREE.Geometry();

		for ( var i = 0; i < 128; i ++ ) {

			var angle = Math.random() * Math.PI*2;
			var radius = 6000 - Math.random() * 400;

			var vertex = new THREE.Vector3();
			vertex.x = radius * Math.cos(angle);
			vertex.y = Math.random() * 3200 ;
			vertex.z = radius * Math.sin(angle);

			starsGeometry.vertices.push( vertex );

			starsAttributes.size.value[i] = 4.0 + Math.random() * 6.0;
		}		

		var starsMaterial = new THREE.ShaderMaterial( {
			uniforms: starsUniforms,
			attributes: starsAttributes,
			vertexShader: starsShader.vertexShader,
			fragmentShader: starsShader.fragmentShader,
			transparent:true
		});

		var starsParticles = new THREE.ParticleSystem( starsGeometry, starsMaterial );

		tweetopia.scene.add(starsParticles);

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
				console.log("Error fetching tweets.")	
			}
		});	
	},

	updateData: function () {

		if (tweetopia.panels.length > 80) return;

		var searchURL="http://search.twitter.com/search.json";
		var searchQueryString = tweetopia.twitterData.refresh_url + "&rpp=20&callback=?"
		tweetopia.fetchData(searchURL + searchQueryString);

	},
	
	// Parse and store Twitter data
	
	parseData: function(data) {

		if (data.results.length) {
			var panelArray = [];

			var panelGeometry = new THREE.PlaneGeometry( 256, 128, 1, 1 );

			for (var resultIndex in data.results) {

				var tweetText = data.results[resultIndex].text;

				if (tweetText.substr(0,1) == "@") continue;
				if (tweetText.substr(0,2) == "RT") continue;

				// Setup canvas and text

				var tweetCanvas = tweetopia.drawCanvas(tweetText);

				// Build Panel

				var panelTexture = new THREE.Texture( $(tweetCanvas)[0] );
				panelTexture.needsUpdate = true;
				
				var panelMaterial = new THREE.MeshBasicMaterial( { map: panelTexture, transparent: true} );
				panelMaterial.doubleSided = true;
				var panelMesh = new THREE.Mesh( panelGeometry,  panelMaterial);	
				
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
				var dudeMaterial = new THREE.MeshLambertMaterial({color: 0x5e6f7a});
				var dudeMesh = new THREE.Mesh(dudeGeometry, dudeMaterial);

				dudeMesh.scale.x = dudeMesh.scale.y = dudeMesh.scale.z = .1;
				dudeMesh.rotation.x = Math.PI/2;
				dudeMesh.position.x = panelMesh.position.x - 48;
				dudeMesh.position.y = 72;
				dudeMesh.position.z = panelMesh.position.z + .1;

				var dudeRingMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( "textures/dudeRing.png" ), transparent:true});
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

				console.log("Added " + panelArray.length + " new tweets (" + tweetopia.panels.length + " total).");
			}
			
		}
	},

	// Create tweet canvas

	drawCanvas: function (tweetText) {

			tweetText = tweetText.replace( /\&amp;/g, '&' );
			tweetText = tweetText.replace( /\&lt;/g, '<' );
			tweetText = tweetText.replace( /\&gt;/g, '>' );

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:1024,height:512});
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

			var tweetX = 1024/2 - maxLineWidth / 2;
			var tweetY = 512/2 - totalHeight/2 - 8;

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
