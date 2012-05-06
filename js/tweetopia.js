"use strict";

var tweetopia = {

	panels: [],
	curPanelIndex: -1,
	
	// Main init function

	init: function() {

		// Initialize

		tweetopia.setupScene();
		tweetopia.fetchData("%23WVpdx");

		// Setup Events

		window.addEventListener( 'resize', function (event) { ttevents.onWindowResize(event) }, false );
		document.addEventListener( 'mousemove', ttevents.onDocumentMouseMove, false );	
		document.addEventListener( 'keydown', ttevents.onKeyDown, false );
		
		// Start Animation

		tweetopia.animate();
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

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.25 );
		directionalLight.position.set( 0, 1, -1 );
		tweetopia.scene.add( directionalLight );		

		// Add Ground

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
			groundGeometry.vertices[ i ].y = Math.sin( i ) * 20 + Math.cos( i - ( i * 64 ) ) ;
		}

		var groundMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		var groundMesh = new THREE.Mesh( groundGeometry,  groundMaterial);	

		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true,  wireframeLinewidth: 2 } )
		var wireMesh = new THREE.Mesh( groundGeometry,  wireMaterial);
		wireMesh.position.y = 8;

		tweetopia.scene.add(groundMesh);	
		tweetopia.scene.add(wireMesh);	

		// Add Sky

		var skyGeometry = new THREE.CylinderGeometry( 8192, 8192, 2048, 40, 1, true );
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
				panelMesh.rotation.x = Math.PI/2;

				panelMesh.position.x = Math.random() * 4096 - 2048;
				panelMesh.position.y = 128;
				panelMesh.position.z = Math.random() * 4096 - 2048;

				tweetopia.scene.add(panelMesh);
				tweetopia.panels.push(panelMesh);
			}

			tweetopia.nextPanel();

		}
	},

	// Create tweet canvas

	drawCanvas: function (tweetText) {

			var tweetCanvas = $('<canvas/>').addClass('tweetBox').attr({width:800,height:200});
			var tweetContext = $(tweetCanvas)[0].getContext('2d');

			// Draw background

			tweetContext.fillStyle = "rgba(228, 228, 228, 1)";
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

		// for (var panelIndex in tweetopia.panels) {
		// 	var curPanel = tweetopia.panels[panelIndex];
		// 	if (Math.abs(curPanel.velocity.x) > .05 || Math.abs(curPanel.velocity.y) > .05) {
		// 		curPanel.position.addSelf(curPanel.velocity);
		// 		curPanel.velocity.multiplyScalar(.995);
		// 	}
		// }

	    TWEEN.update();

		requestAnimationFrame( tweetopia.animate );
		tweetopia.render();
	},

	// Main render routine

	render: function() {
		tweetopia.camera.lookAt( tweetopia.camera.target );
		tweetopia.renderer.render( tweetopia.scene, tweetopia.camera );
	},

	// Control routines

	nextPanel: function() {
		tweetopia.curPanelIndex++;
        if (tweetopia.curPanelIndex >= tweetopia.panels.length) tweetopia.curPanelIndex = 0;		

		tweetopia.visitPanel(tweetopia.curPanelIndex);
	},

	previousPanel: function() {
		tweetopia.curPanelIndex--;
		if (tweetopia.curPanelIndex < 0) tweetopia.curPanelIndex = tweetopia.panels.length - 1;

		tweetopia.visitPanel(tweetopia.curPanelIndex);

	},

	visitPanel: function (visitPanelIndex) {

		var curPanel = tweetopia.panels[visitPanelIndex];

        new TWEEN.Tween( tweetopia.camera.target )
                .to( { x: curPanel.position.x, y: curPanel.position.y, z: curPanel.position.z }, 2400 )
                .easing( TWEEN.Easing.Quintic.InOut)
                .start();

        var tweenFly = new TWEEN.Tween( tweetopia.camera.position )
                .to( { x: curPanel.position.x - 64, y: curPanel.position.y, z: curPanel.position.z + 256 }, 3200 )
                .easing( TWEEN.Easing.Cubic.In);

        var tweenOrbit = new TWEEN.Tween( tweetopia.camera.position )
        		.to( {x: curPanel.position.x + 64}, 8000)
        		.easing( TWEEN.Easing.Cubic.Out)
        		.onComplete( function () { tweetopia.nextPanel() });
                
        tweenFly.chain(tweenOrbit);
        tweenFly.start();

	}
}
