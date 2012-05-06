var ttcontrol = {

	// Visit the next panel

	nextPanel: function() {
		tweetopia.curPanelIndex++;
        if (tweetopia.curPanelIndex >= tweetopia.panels.length) tweetopia.curPanelIndex = 0;		

		ttcontrol.visitPanel(tweetopia.curPanelIndex);
	},

	// Visit the previous panel

	previousPanel: function() {
		tweetopia.curPanelIndex--;
		if (tweetopia.curPanelIndex < 0) tweetopia.curPanelIndex = tweetopia.panels.length - 1;

		ttcontrol.visitPanel(tweetopia.curPanelIndex);

	},

	// Visit specified panel

	visitPanel: function (visitPanelIndex) {

		var curPanel = tweetopia.panels[visitPanelIndex];
		var targetTime = 2400;

		//console.log(tweetopia.camera.position.z + " " + curPanel.position.z);
		if (tweetopia.camera.position.z < curPanel.position.z){
			targetTime = 3600;
			//console.log("flip");
		} 

        new TWEEN.Tween( tweetopia.camera.target )
                .to( { x: curPanel.position.x, y: [80,112], z: curPanel.position.z }, targetTime )
                .interpolation(TWEEN.Interpolation.CatmullRom)
                .easing( TWEEN.Easing.Quintic.InOut)
                .start();

        var tweenFly = new TWEEN.Tween( tweetopia.camera.position )
                .to( { x: curPanel.position.x - 64, y: [128,96], z: curPanel.position.z + 320 }, 3600 )
                .interpolation(TWEEN.Interpolation.CatmullRom)
                .easing( TWEEN.Easing.Cubic.In)
                .onComplete( function() { ttcontrol.showPanel() });

        var tweenOrbit = new TWEEN.Tween( tweetopia.camera.position )
        		.to( {x: curPanel.position.x + 64}, 8000)
        		.easing( TWEEN.Easing.Cubic.Out)
        		.onComplete( function () { ttcontrol.hidePanel(); ttcontrol.nextPanel() });
                
        tweenFly.chain(tweenOrbit);
        tweenFly.start();
	},

	// Animate panel in

	showPanel: function () {
		var curPanel = tweetopia.panels[tweetopia.curPanelIndex];

		curPanel.scale.x = curPanel.scale.z = .1;
		curPanel.position.y = 128;
		curPanel.visible = true;

		new TWEEN.Tween( curPanel.scale) 
			.to ({x : 1, z: 1}, 360)
			.easing( TWEEN.Easing.Back.Out)
			.start();

	},

	// Animate panel out and cleanup

	hidePanel: function () {
		var curPanelIndex = tweetopia.curPanelIndex;
		var curPanel = tweetopia.panels[tweetopia.curPanelIndex];

		new TWEEN.Tween( curPanel.scale) 
			.to ({x : 0.1, z: 0.1}, 200)
			.start();

		new TWEEN.Tween(curPanel.position)
			.to ( {y: 96}, 200)
			.onComplete( function () { 
				curPanel.visible = false 

				// Cleanup old panels

				if (curPanelIndex >= 20) {
					new TWEEN.Tween(curPanel.dudeMesh.scale)
						.to({ x: .1, y: .1, z: .1}, 200)
						.onComplete( function(){ 
							tweetopia.scene.remove(curPanel);
							tweetopia.scene.remove(curPanel.dudeMesh)
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