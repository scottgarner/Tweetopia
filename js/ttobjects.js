"use strict";

var ttobjects = {

	// Shared Geometery

	bubbleGeometry: new THREE.PlaneGeometry( 256, 128, 1, 1 ),
	characterGeometry: new THREE.CylinderGeometry( 12,12, 4, 32, 1, false),
	characterPlaneGeometry: new THREE.PlaneGeometry( 32, 32, 1, 1),
	labelGeometry: new THREE.PlaneGeometry( 128, 16, 1, 1),	

	// Shared Materials

	characterRingMaterial: new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( "textures/characterRing.png" ), transparent:true, fog: true}),
	characterFaceMaterial: new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( "textures/characterFace.png" ), transparent:true, fog: true}),

	// Init

	init: function() {

		ttobjects.characterUniforms = THREE.UniformsUtils.clone( THREE.ShaderUtils.lib["vertexrgbtocolors"].uniforms );

		for ( var i = 0, l = ttobjects.characterGeometry.faces.length; i < l; i ++ ) {
			if (ttobjects.characterGeometry.faces[ i ].centroid.y == 0)
				ttobjects.characterGeometry.faces[ i ].color = new THREE.Color(0x00ff00);
			else
				ttobjects.characterGeometry.faces[ i ].color = new THREE.Color(0xff0000);
		}

	},

	// Logo

	createLogo: function() {

		var logoTexture = THREE.ImageUtils.loadTexture( "textures/logo.png" );

		var logoGeometry = new THREE.PlaneGeometry( 1024, 256, 1, 1 );

		tweetopia.logoMaterial = new THREE.MeshBasicMaterial( {map: logoTexture, transparent: true, depthTest: false});
		tweetopia.logoMaterial.opacity = 0;

		var logoMesh = new THREE.Mesh(logoGeometry, tweetopia.logoMaterial );
		logoMesh.rotation.x = Math.PI/2;
		logoMesh.position.y = 320;

		return(logoMesh);
	},

	// Sky

	createSky: function () {

		var skyGeometry = new THREE.CylinderGeometry( 6000, 6000 , 4000, 40, 1, true );

		var skyShader = THREE.ShaderUtils.lib["gradient"];
		ttobjects.skyUniforms = THREE.UniformsUtils.clone( skyShader.uniforms );

		var skyTexture = THREE.ImageUtils.loadTexture( "textures/stripes.png" );
		skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;	

		ttobjects.skyUniforms["map"].texture = skyTexture;
		ttobjects.skyUniforms["topColor"].value = new THREE.Vector3( ttcolors.skyTop.r, ttcolors.skyTop.g , ttcolors.skyTop.b);
		ttobjects.skyUniforms["bottomColor"].value =  new THREE.Vector3( ttcolors.skyBottom.r, ttcolors.skyBottom.g , ttcolors.skyBottom.b);
		ttobjects.skyUniforms["offsetRepeat"].value = new THREE.Vector4( 0, 0, 36, 3);

		var skyMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.skyUniforms,
			vertexShader: skyShader.vertexShader,
			fragmentShader: skyShader.fragmentShader,
		});

		var skyMesh = new THREE.Mesh( skyGeometry,  skyMaterial);
		skyMesh.flipSided = true;
		skyMesh.position.y = 1800;

		return skyMesh;

	},

	// Stars

	createStars: function() {

		var starsShader = THREE.ShaderUtils.lib["sizedparticles"];
		ttobjects.starsUniforms = THREE.UniformsUtils.clone( starsShader.uniforms );
		ttobjects.starsUniforms["map"].texture = THREE.ImageUtils.loadTexture( "textures/star.png" );
	
        var starsAttributes = {
                size: { type: 'f', value: [] },
        };	

		var starsGeometry = new THREE.Geometry();

		for ( var i = 0; i < 192; i ++ ) {

			var angle = Math.random() * Math.PI*2;
			var radius = 5800 - Math.random() * 1200;

			var vertex = new THREE.Vector3();
			vertex.x = radius * Math.cos(angle);
			vertex.y = Math.random() * 3200 ;
			vertex.z = radius * Math.sin(angle);

			starsGeometry.vertices.push( vertex );

			starsAttributes.size.value[i] = 4.0 + Math.random() * 6.0;
		}		

		var starsMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.starsUniforms,
			attributes: starsAttributes,
			vertexShader: starsShader.vertexShader,
			fragmentShader: starsShader.fragmentShader,
			transparent:true,
			blending: THREE.CustomBlending,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.OneMinusSrcColorFactor
		});

		var starsParticles = new THREE.ParticleSystem( starsGeometry, starsMaterial );

		return(starsParticles);
	},

	// Create Ground

	createGround: function() {

		var simplex = new SimplexNoise();
		var groundGeometry = new THREE.PlaneGeometry( 8200, 8200, 48, 48 );

		THREE.GeometryUtils.triangulateQuads( groundGeometry );

		for ( var i = 0, l = groundGeometry.faces.length; i < l; i ++ ) {
			for ( var j = 0; j < 3; j++) {
				var color;

				switch (j) {
					case 0:
						color = new THREE.Color(0xFF0000);
						break;
					case 1:
						color = new THREE.Color(0x00FF00);
						break;
					case 2:
						color = new THREE.Color(0x0000FF);
						break;
				}
				
				groundGeometry.faces[ i ].vertexColors.push(color);
			}
		}

		for ( var i = 0, l = groundGeometry.vertices.length; i < l; i ++ ) {
			groundGeometry.vertices[ i ].y  = simplex.noise(groundGeometry.vertices[ i ].x / 1024, 
				groundGeometry.vertices[ i ].z / 1024 ) * 64;
			groundGeometry.vertices[ i ].x +=  Math.random() * 128 - 64;
			groundGeometry.vertices[ i ].z +=  Math.random() * 128 - 64;
		}

		var groundShader = THREE.ShaderUtils.lib["vertexrgbtocolors"];
		ttobjects.groundUniforms = THREE.UniformsUtils.clone( groundShader.uniforms );

		ttobjects.groundUniforms["colorA"].value = new THREE.Vector3( ttcolors.groundA.r, ttcolors.groundA.g , ttcolors.groundA.b);
		ttobjects.groundUniforms["colorB"].value =  new THREE.Vector3( ttcolors.groundB.r, ttcolors.groundB.g , ttcolors.groundB.b);
		ttobjects.groundUniforms["colorC"].value =  new THREE.Vector3( ttcolors.groundC.r, ttcolors.groundC.g , ttcolors.groundC.b);

		var groundMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.groundUniforms,
			vertexShader: groundShader.vertexShader,
			fragmentShader: groundShader.fragmentShader,
			vertexColors: THREE.VertexColors,
			fog: true
		});

		var groundMesh = new THREE.Mesh( groundGeometry,  groundMaterial);	

		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true,  wireframeLinewidth: 2 } )
		var wireMesh = new THREE.Mesh( groundGeometry,  wireMaterial);
		wireMesh.position.y = 8;

		groundMesh.add(wireMesh);	

		return(groundMesh);
	},

	// Bubble

	createBubble: function(tweetData,tweetPosition) {

		var tweetCanvas = ttcanvas.drawBubble(tweetData.text,
			tweetData.from_user_name,
			tweetData.entities);

		var bubbleTexture = new THREE.Texture( $(tweetCanvas)[0] );
		bubbleTexture.needsUpdate = true;

		var bubbleShader = THREE.ShaderUtils.lib["fragmentrgbtocolors"];
		ttobjects.bubbleUniforms = THREE.UniformsUtils.clone( bubbleShader.uniforms );

		ttobjects.bubbleUniforms["map"].texture = bubbleTexture;
		ttobjects.bubbleUniforms["colorA"].value = new THREE.Vector3( ttcolors.textA.r, ttcolors.textA.g , ttcolors.textA.b);
		ttobjects.bubbleUniforms["colorB"].value =  new THREE.Vector3( ttcolors.textB.r, ttcolors.textB.g , ttcolors.textB.b);
		ttobjects.bubbleUniforms["colorC"].value =  new THREE.Vector3( ttcolors.textC.r, ttcolors.textC.g , ttcolors.textC.b);

		var bubbleMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.bubbleUniforms,
			vertexShader: bubbleShader.vertexShader,
			fragmentShader: bubbleShader.fragmentShader,
			transparent: true
		});

		var bubbleMesh = new THREE.Mesh( ttobjects.bubbleGeometry,  bubbleMaterial);					
		bubbleMesh.rotation.x = Math.PI/2;				
		bubbleMesh.position = tweetPosition;				
		bubbleMesh.visible = false;
		bubbleMesh.url = "https://twitter.com/#!/" + tweetData.from_user + "/status/" + tweetData.id_str ;
		bubbleMesh.boundingBoxes = tweetCanvas.boundingBoxes;

		return(bubbleMesh);
	},

	// Create Character

	createCharacter: function(tweetData,tweetPosition) {

		// Character body mesh

		var characterShader = THREE.ShaderUtils.lib["vertexrgbtocolors"];

		ttobjects.characterUniforms["colorA"].value = new THREE.Vector3( ttcolors.character.r, ttcolors.character.g , ttcolors.character.b);
		ttobjects.characterUniforms["colorB"].value =  new THREE.Vector3( ttcolors.character.r * .75, ttcolors.character.g  * .75, ttcolors.character.b * .75);

		var characterMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.characterUniforms,
			vertexShader: characterShader.vertexShader,
			fragmentShader: characterShader.fragmentShader,
			vertexColors: THREE.FaceColors,
			fog: true
		});

		var characterMesh = new THREE.Mesh(ttobjects.characterGeometry, characterMaterial);
		characterMesh.scale.x = characterMesh.scale.y = characterMesh.scale.z = .1;
		characterMesh.rotation.x = Math.PI/2;
		characterMesh.position.x = tweetPosition.x - 48;
		characterMesh.position.y = 72;
		characterMesh.position.z = tweetPosition.z + .25;

		// Add character ring

		var characterRingMesh = new THREE.Mesh(ttobjects.characterPlaneGeometry, ttobjects.characterRingMaterial);
		characterRingMesh.doubleSided = true;
		characterRingMesh.position.y = .25;

		characterMesh.add(characterRingMesh);

		// Add character face

		var characterFaceMesh = new THREE.Mesh(ttobjects.characterPlaneGeometry, ttobjects.characterFaceMaterial);
		characterFaceMesh.position.y = 3;

		characterMesh.add(characterFaceMesh);		

		// Add label

		var labelMesh = ttobjects.createLabel(tweetData);
		labelMesh.position.y = -.25;

		characterMesh.add(labelMesh);
		characterMesh.labelMesh = labelMesh;		

		return characterMesh;
	},

	createLabel: function(tweetData) {
		// Add character label

		var labelCanvas = ttcanvas.drawLabel(tweetData.from_user_name);
		var labelTexture = new THREE.Texture( $(labelCanvas)[0] );
		labelTexture.needsUpdate = true;

		var labelShader = THREE.ShaderUtils.lib["fragmentrgbtocolors"];
		ttobjects.labelUniforms = THREE.UniformsUtils.clone( labelShader.uniforms );

		ttobjects.labelUniforms["map"].texture = labelTexture;
		ttobjects.labelUniforms["colorA"].value = new THREE.Vector3( ttcolors.textA.r, ttcolors.textA.g , ttcolors.textA.b);
		ttobjects.labelUniforms["colorB"].value =  new THREE.Vector3( ttcolors.textB.r, ttcolors.textB.g , ttcolors.textB.b);
		ttobjects.labelUniforms["colorC"].value =  new THREE.Vector3( ttcolors.textC.r, ttcolors.textC.g , ttcolors.textC.b);		

		var labelMaterial = new THREE.ShaderMaterial( {
			uniforms: ttobjects.labelUniforms,
			vertexShader: labelShader.vertexShader,
			fragmentShader: labelShader.fragmentShader,
			transparent: true, fog: true
		});				

		var labelMesh = new THREE.Mesh(ttobjects.labelGeometry, labelMaterial);
		labelMesh.position.z = -28;
		labelMesh.doubleSided = true;

		return(labelMesh);

	}	
}