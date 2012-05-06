"use strict";

var wvevents = {
	onWindowResize: function ( event ) {
	
		tweetopia.renderWidth  = window.innerWidth;
		tweetopia.renderHeight= window.innerHeight;
	
		tweetopia.camera.aspect = tweetopia.renderWidth / tweetopia.renderHeight;
		tweetopia.camera.updateProjectionMatrix();
	
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );
	},
	
	onDocumentMouseMove: function (event) {
	
		var mouseX = ( event.clientX - (tweetopia.renderWidth / 2) );
		var mouseY = ( event.clientY - (tweetopia.renderHeight / 2) );
		
		tweetopia.camera.rotation.x = (mouseY / (tweetopia.renderHeight /2 )) * -10 * (Math.PI /180);	
		tweetopia.camera.rotation.y = (mouseX / (tweetopia.renderWidth /2 )) * -10 * (Math.PI /180);	
		
	},	
}