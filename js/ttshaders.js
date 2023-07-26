"use strict";

THREE.ShaderUtils.lib["sizedparticles"] = {
	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "common" ]
    ] ),
	vertexShader: [
		"attribute float size; ",

		"void main() {",

		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"	gl_PointSize = size ;",
		"	gl_Position = projectionMatrix * mvPosition;",
		
		"}",
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D map;",
		"uniform float opacity;",
		
		"void main() {",
		
		"	gl_FragColor = texture2D( map, gl_PointCoord ) * opacity;",

		"}",
	].join("\n")
};

THREE.ShaderUtils.lib["fragmentrgbtocolors"] = {
    uniforms: THREE.UniformsUtils.merge( [

        THREE.UniformsLib[ "common" ],
        THREE.UniformsLib[ "fog" ],
        {
        	"colorA" : { type: "v3", value: new THREE.Vector3( 0,0,0 ) },
			"colorB" : { type: "v3", value: new THREE.Vector3( .5,.5,.5) },
			"colorC" : { type: "v3", value: new THREE.Vector3( 1,1,1) }	 
        }

    ] ),	
	vertexShader: [

		"varying vec2 vUv;",	

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		
		"}",
	].join("\n"),

	fragmentShader: [

        "varying vec2 vUv;",
        "uniform sampler2D map;",
		"uniform vec3 colorA;",
		"uniform vec3 colorB;",
		"uniform vec3 colorC;",	        

		THREE.ShaderChunk[ "fog_pars_fragment" ],        
		
		"void main() {",
		"	vec4 textureColor = texture2D( map, vUv );",
		"	if (gl_FrontFacing == false || textureColor.a < 1.0) {",
		"		textureColor = vec4(1,1,1, textureColor.a); ",
		"	}",
		" 	if (textureColor.r == 1.0 && textureColor.g != 1.0) {",
		"		float amount =  textureColor.r - textureColor.g;",
		"		textureColor.rgb = vec3(1.0 - amount,1.0 - amount,1.0 - amount) + colorA * amount;",
		"	}",
		" 	if (textureColor.g == 1.0 && textureColor.b != 1.0) {",
		"		float amount =  textureColor.g - textureColor.b;",
		"		textureColor.rgb = vec3(1.0 - amount,1.0 - amount,1.0 - amount) + colorB * amount;",
		"	}",		
		" 	if (textureColor.b == 1.0 && textureColor.r != 1.0) {",
		"		float amount =  textureColor.b - textureColor.r;",
		"		textureColor.rgb = vec3(1.0 - amount,1.0 - amount,1.0 - amount) + colorC * amount;",
		"	}",			
		"	gl_FragColor = textureColor;",
		
		THREE.ShaderChunk[ "fog_fragment" ],

		"}",
	].join("\n")
};

THREE.ShaderUtils.lib["vertexrgbtocolors"] = {
    uniforms: THREE.UniformsUtils.merge( [

        THREE.UniformsLib[ "common" ],
        THREE.UniformsLib[ "fog" ],
        {
        	"colorA" : { type: "v3", value: new THREE.Vector3( 0,0,0 ) },
			"colorB" : { type: "v3", value: new THREE.Vector3( .5,.5,.5) },
			"colorC" : { type: "v3", value: new THREE.Vector3( 1,1,1) }	 
        }

    ] ),	
	vertexShader: [
		
		"varying vec3 vColor;",	
		"uniform vec3 colorA;",
		"uniform vec3 colorB;",
		"uniform vec3 colorC;",		

		"void main() {",
		"	vColor = colorA;",
		"	if (color.r == 1.) {",
		"		vColor = colorA;",
		"	}",
		"	if (color.g == 1.) { ",
		"		vColor = colorB;",
		"	}",
		"	if (color.b == 1.) { ",
		"		vColor = colorC;",		
		"	}",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		
		"}",
	].join("\n"),

	fragmentShader: [

       	"varying vec3 vColor;",
		THREE.ShaderChunk[ "fog_pars_fragment" ],  

		"void main() {",
		
		"	gl_FragColor = vec4( vColor, 1.0 );",

		THREE.ShaderChunk[ "fog_fragment" ],		

		"}",
	].join("\n")
};	

THREE.ShaderUtils.lib["gradient"] = {
	uniforms: {
	    "map" : { type: "t", value: 0, texture: null },
	    "offsetRepeat" : { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },
	    "topColor" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
	    "bottomColor" : { type: "v3", value: new THREE.Vector3( 0, 0, 0) },
	},
	vertexShader: [

		"varying vec3 vColor;",
		"varying vec2 vUv;",
		"uniform vec4 offsetRepeat;",	
		"uniform vec3 topColor;",
		"uniform vec3 bottomColor;",	

		"void main() {",

		"	if (position.y > 0.0) {",
		"		vColor = topColor;",
		"	} else { ",
		"		vColor = bottomColor;",
		"	}",
		"	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		
		"}",
	].join("\n"),

	fragmentShader: [

        "varying vec2 vUv;",
        "uniform sampler2D map;",
       	"varying vec3 vColor;",
		
		"void main() {",
		
		"	gl_FragColor = vec4( vColor, 1.0 );",
		"	gl_FragColor = gl_FragColor + texture2D( map, vUv ) * .025;",

		"}",
	].join("\n")
};

THREE.ShaderUtils.lib["uv"] = {
	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),
	fragmentShader: [
		"varying vec2 vUv;",
		"void main() {",
			"gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);",
		"}"
	].join("\n")
};