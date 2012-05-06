THREE.ShaderUtils.lib["stars"] = {
	uniforms: {
		map : { type: "t", value: 0, texture: null },		
	},
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
		
		"void main() {",
		
		"	gl_FragColor = texture2D( map, gl_PointCoord );",

		"}",
	].join("\n")
};

THREE.ShaderUtils.lib["sky"] = {
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