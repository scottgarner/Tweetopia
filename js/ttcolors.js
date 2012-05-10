"use strict";

var ttcolors = {
	lastAmount: 0,
	init: function() {

		ttcolors.night = {};
		ttcolors.night.base = new THREE.Color(0x4b5e6b);
		ttcolors.night.skyTop = new THREE.Color(0x000000);
		ttcolors.night.skyBottom = ttcolors.night.base;
		ttcolors.night.fog = ttcolors.night.base;
		ttcolors.night.groundA = (new THREE.Color( 0xffffff )).lerpSelf(ttcolors.night.base, .05);
		ttcolors.night.groundB = (new THREE.Color( 0xffffff )).lerpSelf(ttcolors.night.base, .40);
		ttcolors.night.groundC = (new THREE.Color( 0xffffff )).lerpSelf(ttcolors.night.base, .75);
		ttcolors.night.textB = ttcolors.night.base;
		ttcolors.night.textA = new THREE.Color( 0x666666 );
		ttcolors.night.textC = ttcolors.night.base;
		ttcolors.night.character = ttcolors.night.base;
	
		ttcolors.day = {};	
		ttcolors.day.base = new THREE.Color(0x55CC88);
		ttcolors.day.skyTop = new THREE.Color(0x3060C0);
		ttcolors.day.skyBottom = new THREE.Color(0x99ddFF);
		ttcolors.day.fog = ttcolors.day.skyBottom;
		ttcolors.day.groundA = new THREE.Color( 0x55FF88 );
		ttcolors.day.groundB = new THREE.Color( 0x55CC88 );
		ttcolors.day.groundC = new THREE.Color( 0x559988 );
		ttcolors.day.textB = ttcolors.day.base;
		ttcolors.day.textA = new THREE.Color( 0x808080 );
		ttcolors.day.textC = ttcolors.day.base;		
		ttcolors.day.character = new THREE.Color(0xFF6699);

		ttcolors.dawn = {};	
		ttcolors.dawn.base = new THREE.Color(0x666699);
		ttcolors.dawn.skyBottom = new THREE.Color(0xFF6699);
		ttcolors.dawn.skyTop = new THREE.Color(0xFF9933);
		ttcolors.dawn.fog = ttcolors.dawn.skyBottom;
		ttcolors.dawn.groundA = (new THREE.Color( 0x000000 )).lerpSelf(ttcolors.dawn.base, 1);
		ttcolors.dawn.groundB = (new THREE.Color( 0x000000 )).lerpSelf(ttcolors.dawn.base, .85);
		ttcolors.dawn.groundC = (new THREE.Color( 0x000000 )).lerpSelf(ttcolors.dawn.base, .75);
		ttcolors.dawn.textB = ttcolors.dawn.base;
		ttcolors.dawn.textA = new THREE.Color( 0x666666 );
		ttcolors.dawn.textC = ttcolors.dawn.base;			
		ttcolors.dawn.character = new THREE.Color(0x33CCFF);		

		ttcolors.dusk = ttcolors.dawn;

		ttcolors.setColorSet(ttcolors.night);		
	},

	setColorSet: function(newColorSet) {

		for (var key in newColorSet ) {
			ttcolors[key] = newColorSet[key];			
		}

	},

	update: function() {		

		if (!ttcolors.autoUpdate) return 0;

		var curTime =  ((tweetopia.clock.getElapsedTime()) % tweetopia.dayLength) / tweetopia.dayLength;
		
		var curColorSet;
		var nextColorSet;
		var amount = 0;

		// Determine colors for time

		if (curTime >= 0 && curTime < .35) {

			curColorSet = ttcolors.night;
			nextColorSet = ttcolors.night;
			amount =  0;
			ttcolors.starOpacity = 1;

		} else if (curTime >= .35 && curTime < .40 ) {

			curColorSet = ttcolors.night;
			nextColorSet = ttcolors.dawn;
			amount =  (curTime - .35) / .05;
			ttcolors.starOpacity = 1 - amount;

		} else if (curTime >= .40 && curTime < .45 ) {

			curColorSet = ttcolors.dawn;
			nextColorSet = ttcolors.dawn;
			amount =  0;
			ttcolors.starOpacity = 0;

		} else if (curTime >= .45 && curTime < .50 ) {

			curColorSet = ttcolors.dawn;
			nextColorSet = ttcolors.day;
			amount =  (curTime - .45) / .05;
			ttcolors.starOpacity = 0;

		} else if (curTime >= .50 && curTime < .85 ) {

			curColorSet = ttcolors.day;
			nextColorSet = ttcolors.day;
			amount =  0;
			ttcolors.starOpacity = 0;

		} else if (curTime >= .85 && curTime < .90 ) {

			curColorSet = ttcolors.day;
			nextColorSet = ttcolors.dusk;
			amount =  (curTime - .85) / .05;
			ttcolors.starOpacity = 0;

		} else if (curTime >= .90 && curTime < .95 ) {

			curColorSet = ttcolors.dusk;
			nextColorSet = ttcolors.dusk;
			amount =  0;
			ttcolors.starOpacity = 0;

		} else if (curTime >= .95 && curTime < 1.00 ) {

			curColorSet = ttcolors.dusk;
			nextColorSet = ttcolors.night;
			amount =  (curTime - .95) / .05;
			ttcolors.starOpacity = amount;

		}

		// Check if an update is needed

		amount = Math.floor(amount * 100) / 100;
		if (amount == ttcolors.lastAmount) return;
		ttcolors.lastAmount = amount;

		// Interpolate colors

		for (var key in curColorSet ) {
			ttcolors[key] = (curColorSet[key].clone()).lerpSelf(nextColorSet[key], amount);			
		}

		// Refresh scene

		ttcolors.refreshScene();
		
	},

	refreshScene: function() {

		// Update colors

		if (tweetopia.renderer) {
			tweetopia.renderer.setClearColor( ttcolors.skyTop, 1);
			tweetopia.scene.fog.color = ttcolors.fog ;
		}

		// Update Sky

		if (ttobjects.skyUniforms) {
			ttobjects.skyUniforms["topColor"].value = new THREE.Vector3( ttcolors.skyTop.r, ttcolors.skyTop.g , ttcolors.skyTop.b);
			ttobjects.skyUniforms["bottomColor"].value =  new THREE.Vector3( ttcolors.skyBottom.r, ttcolors.skyBottom.g , ttcolors.skyBottom.b);
		};

		// Star Opacity

		if (ttobjects.starsUniforms) {
			ttobjects.starsUniforms["opacity"].value = ttcolors.starOpacity;
		}		

		// Update Ground

		if (ttobjects.groundUniforms) {
			ttobjects.groundUniforms["colorA"].value = new THREE.Vector3( ttcolors.groundA.r, ttcolors.groundA.g , ttcolors.groundA.b);
			ttobjects.groundUniforms["colorB"].value =  new THREE.Vector3( ttcolors.groundB.r, ttcolors.groundB.g , ttcolors.groundB.b);
			ttobjects.groundUniforms["colorC"].value =  new THREE.Vector3( ttcolors.groundC.r, ttcolors.groundC.g , ttcolors.groundC.b);
		};

		// Update labels and bubbles

		for (var curPanelIndex in tweetopia.panels) {
			var panelUniforms = tweetopia.panels[curPanelIndex].material.uniforms;
			panelUniforms["colorA"].value = new THREE.Vector3( ttcolors.textA.r, ttcolors.textA.g , ttcolors.textA.b);
			panelUniforms["colorB"].value = new THREE.Vector3( ttcolors.textB.r, ttcolors.textB.g , ttcolors.textB.b);
			panelUniforms["colorC"].value = new THREE.Vector3( ttcolors.textC.r, ttcolors.textC.g , ttcolors.textC.b);

			var labelUniforms = tweetopia.panels[curPanelIndex].characterMesh.labelMesh.material.uniforms;
			labelUniforms["colorA"].value = new THREE.Vector3( ttcolors.textA.r, ttcolors.textA.g , ttcolors.textA.b);
			labelUniforms["colorB"].value = new THREE.Vector3( ttcolors.textB.r, ttcolors.textB.g , ttcolors.textB.b);
			labelUniforms["colorC"].value = new THREE.Vector3( ttcolors.textC.r, ttcolors.textC.g , ttcolors.textC.b);
		}		

		// Update Character

		if (ttobjects.characterUniforms) {
			ttobjects.characterUniforms["colorA"].value = new THREE.Vector3( ttcolors.character.r, ttcolors.character.g , ttcolors.character.b);
			ttobjects.characterUniforms["colorB"].value =  new THREE.Vector3( ttcolors.character.r * .75, ttcolors.character.g  * .75, ttcolors.character.b * .75);
		}
	}

};
