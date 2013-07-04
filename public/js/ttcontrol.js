"use strict";

var ttcontrol = {

	autoUpdate: false,

	// Revisit logo

	showLogo: function () {

		tweetopia.logoMaterial.visible = true;

		new TWEEN.Tween(tweetopia.logoMaterial)
			.to ({ opacity : 1 }, 500)
			.start();

		new TWEEN.Tween(tweetopia.camera.target)
			.to({x: 0, y: 256, z: 0}, 3000)
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing( TWEEN.Easing.Quintic.InOut)
			.start();

		new TWEEN.Tween(tweetopia.camera.position)
			.to({x: 0, y: 256, z: 1200}, 6000)
            .interpolation(TWEEN.Interpolation.CatmullRom)
            .easing( TWEEN.Easing.Quintic.InOut)
            .onComplete( function() {
            	tweetopia.curPanel = -1;
            	setTimeout("tweetopia.startAnimation()", 1000 * 3);
            })
            .start();

	},	

	// Visit the next panel

	nextPanel: function() {
		if (tweetopia.panels.length == 0) return;

		tweetopia.curPanelIndex++;
        if (tweetopia.curPanelIndex >= tweetopia.panels.length) tweetopia.curPanelIndex = 0;		

		ttcontrol.visitPanel(tweetopia.curPanelIndex);
	},

	// Visit the previous panel

	previousPanel: function() {
		if (tweetopia.panels.length == 0) return;

		tweetopia.curPanelIndex--;
		if (tweetopia.curPanelIndex < 0) tweetopia.curPanelIndex = tweetopia.panels.length - 1;

		ttcontrol.visitPanel(tweetopia.curPanelIndex);

	},

	// Visit specified panel

	visitPanel: function (visitPanelIndex) {

		var curPanel = tweetopia.panels[visitPanelIndex];

		var flightHeight = (tweetopia.camera.position.distanceTo(curPanel.position) / 5600) * 96;

        new TWEEN.Tween( tweetopia.camera.target )
                .to( { x: curPanel.position.x, y: [96,112], z: curPanel.position.z }, 3000 )
                .interpolation(TWEEN.Interpolation.CatmullRom)
                .easing( TWEEN.Easing.Quintic.InOut)
                .start();

        var tweenFly = new TWEEN.Tween( tweetopia.camera.position )
                .to( { x: curPanel.position.x - 64, y: [96 + flightHeight,96], z: curPanel.position.z + tweetopia.panelDistance }, 4000 )
                .interpolation(TWEEN.Interpolation.CatmullRom)
                .easing( TWEEN.Easing.Cubic.In)
                .onComplete( function() { 
                	//ttcontrol.showPanel() 
                	setTimeout("ttcontrol.showPanel()", 800);
                });

        var tweenOrbit = new TWEEN.Tween( tweetopia.camera.position )
        		.to( {x: curPanel.position.x + 64}, 8000)
        		.easing( TWEEN.Easing.Cubic.Out)
        		.onComplete( function () { 
        			ttcontrol.hidePanel(); 

        			if (tweetopia.curPanelIndex == tweetopia.panels.length -1)
        				setTimeout("ttcontrol.showLogo()", 800);          				
        			else 
        				setTimeout("ttcontrol.nextPanel()", 800);

        		});
                
        tweenFly.chain(tweenOrbit);
        tweenFly.start();
	},

	// Animate panel in

	showPanel: function () {
		var curPanel = tweetopia.panels[tweetopia.curPanelIndex];
		curPanel.scale.x = .25;
		curPanel.scale.z = .2;
		curPanel.position.x -= 48;
		curPanel.position.y = 100;

		new TWEEN.Tween(curPanel.characterMesh.labelMesh.scale)
			.to ({x: .9, z: .9 }, 180)
			.onComplete(function() {

				new TWEEN.Tween( curPanel.scale) 
					.to ({x : 1, z: 1}, 400)
					.easing( TWEEN.Easing.Back.Out)
					.start();

				new TWEEN.Tween(curPanel.position)
					.to ( {x: curPanel.position.x + 48, y: 132}, 400)
					.easing( TWEEN.Easing.Back.Out)			
					.start();

				curPanel.characterMesh.labelMesh.visible = false;
				curPanel.visible = true;
			})		
			.start();		
					
	},

	// Animate panel out and cleanup

	hidePanel: function () {
		var curPanelIndex = tweetopia.curPanelIndex;
		var curPanel = tweetopia.panels[tweetopia.curPanelIndex];

		new TWEEN.Tween( curPanel.scale) 
			.to ({x : 0.25, z: 0.2}, 200)
			.start();

		new TWEEN.Tween(curPanel.position)
			.to ( {y: 100, x: curPanel.position.x - 48}, 200)
			.onComplete( function () { 
				curPanel.visible = false;
				curPanel.position.x += 48;

				curPanel.characterMesh.labelMesh.visible = true;
				curPanel.characterMesh.labelMesh.scale.x = curPanel.characterMesh.labelMesh.scale.z =  .8;

				new TWEEN.Tween(curPanel.characterMesh.labelMesh.scale)
					.to ({x: 1.0, z: 1.0 }, 320)
					.easing( TWEEN.Easing.Back.Out)			
					.start();					

				// Cleanup old panels

				if (curPanelIndex >= 40) {
					new TWEEN.Tween(curPanel.characterMesh.scale)
						.delay(1000)
						.to({ x: .1, y: .1, z: .1}, 200)
						.onComplete( function(){ 
							tweetopia.scene.remove(curPanel);
							tweetopia.scene.remove(curPanel.characterMesh)
							tweetopia.panels.splice(curPanelIndex, 1);

							tweetopia.curPanelIndex--;
							if (tweetopia.curPanelIndex < 0) tweetopia.curPanelIndex = 0;
						})
						.start();
				}
			})
			.start();
	}
}