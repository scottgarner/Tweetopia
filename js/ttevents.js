"use strict";

var ttevents = {
	onWindowResize: function ( event ) {
	
		tweetopia.renderWidth  = window.innerWidth;
		tweetopia.renderHeight= window.innerHeight;
	
		tweetopia.camera.aspect = tweetopia.renderWidth / tweetopia.renderHeight;
		tweetopia.camera.updateProjectionMatrix();
	
		tweetopia.renderer.setSize( tweetopia.renderWidth, tweetopia.renderHeight );

		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		tweetopia.uvRenderTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters  );			
	},
	
	onWindowHashChange: function (event) {
		if (event.oldURL.indexOf("#") >= 0) {
			window.location.reload(true);
		}
	},

	onDocumentMouseDown: function (event) {

		var curPanel = tweetopia.panels[tweetopia.curPanelIndex];

		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		tweetopia.projector.unprojectVector( vector, tweetopia.camera );
	
		var ray = new THREE.Ray( tweetopia.camera.position, vector.subSelf( tweetopia.camera.position ).normalize() );
	
		// Check for character or label click

		var characterIntersects = ray.intersectObjects( [curPanel.characterMesh, curPanel.characterMesh.labelMesh] );

		if ( characterIntersects.length > 0 ) {
			window.open(curPanel.url);
		}

		// Check for bubble click

		var bubbleIntersects = ray.intersectObjects( [curPanel] );

		if ( bubbleIntersects.length > 0 ) {

			var holdMaterial = curPanel.material;
			curPanel.material = tweetopia.uvMaterial;
			tweetopia.renderer.render( tweetopia.scene, tweetopia.camera, tweetopia.uvRenderTexture , true );
			curPanel.material = holdMaterial;

			var glContext = tweetopia.renderer.getContext();

			try {	
				var buffer = glContext.readPixels(event.clientX, window.innerHeight - event.clientY, 1, 1, glContext.RGBA, glContext.UNSIGNED_BYTE);
			} catch (err) {
			}
			if(!buffer){
				buffer = new Uint8Array(1 * 1 * 4);
				glContext.readPixels(event.clientX, window.innerHeight -  event.clientY, 1, 1, glContext.RGBA, glContext.UNSIGNED_BYTE, buffer);
			}

			var clickX = buffer[0] / 255 * 1024;
			var clickY = buffer[1] / 255 * 512;

			for (var curBoundingBoxIndex in curPanel.boundingBoxes) {
				var curBoundingBox = curPanel.boundingBoxes[curBoundingBoxIndex];

				if (clickX > curBoundingBox.start.x && 
					clickX < curBoundingBox.end.x &&
					clickY > curBoundingBox.end.y &&
					clickY < curBoundingBox.start.y) {

					window.open(curBoundingBox.url);
				}

			}

		}

	},

	onDocumentMouseMove: function (event) {
	
		$('#render').css('cursor', 'default');
		
	},
	onKeyDown: function ( event ) {
		//console.log(event.keyCode);
		// switch( event.keyCode ) {
		// 	case 78: /*N*/	
		// 		tweetopia.nextPanel();
		// 		break;
		// 	case 80: /*P*/
		// 		tweetopia.previousPanel(); 
		// 		break;
		// }

	}
}