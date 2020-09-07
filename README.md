Tweetopia
=========

#### 3D Twitter Visualization ####

Tweetopia is a 3D Twitter hashtag visualizaiton based on WebGL and built using Three.js

Learn more at the [project page](http://scott.j38.net/interactive/tweetopia/) or see it live at [Tweetopia.net](http://www.tweetopia.net/).

This work is licensed under a [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/).

### Changelog ###

r14

- Moving to Netlify with a serverless function.

r13

-   Cleanup for migration from Heroku to Dokku.

r12

-	Major overhaul to support Twitter API changes.
-	Now uses a web service for search requests.

r11

-	Minor tweaks for initial public release.

r10

-	GA tracking.
-	Initial character faces.
-	Username display.
-	Image contrast.
-	Webfont Support
-	More careful bubble distribution.
-	Better handling of Twitter requests.
-	Day/night color changes

r09

-	Detection of WebGL support.
-	Colored hashtags and usernames.
-	Added simple favicon.
-	Pre-launch splash page.
-	URL hashtag support.
-	Defaults to #WebGL.

r08

-	Splash screen on startup.
-	Custom shaders for star and sky.
-	Refined ground to match style frame.

r07

-	Added SimpleNoise.js for more fluid terrain.
-	New ttcontrol object for scene control fucntions.
-	Restyled panel as speech bubble with pre-build image.
-	More refined text formatting.
-	Placeholder for characters with basic texturing.
-	Showing and hiding of bubbles on visit.
-	Periodically check for new tweets.
-	Initial support for clicking through to twitter.com.

r06

-	Predistrubuted panels.
-	Automatic camera animation between panels.
-	Refined camera animation to look ahead to next panel.
-	Addition of ground plane with generative color and form.
-	Addition of sky cylinder.

r05

-	Added Tween.js for animating properties with easing.
-	Planar distribution of tweet panels.
-	Support for keyboard-controlled camera animation between panels.

r04

-	Added Three.js for 3D environment with functions to setup, animate and render.
- 	New ttevents object for handling event callbacks.
-	Simple panel animation using canvases as textures.

r03

-	No new logic, organization release (wash dishes while you cook).
-	CSS and JS split into files with new tweetopia control object.

r02

-	This release creates canvas elements for the results, with logic to auto wrap and format the text.

r01

-	This initial release polls the Twitter search API and displays the resulting tweets in divs.
