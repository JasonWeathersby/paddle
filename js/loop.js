 //Main file for game logic
 //window.onload = init;
 //Global Game Object
 //Need to cleanup variable name spaces
 var game = new Game();

 var mainAnim = null;
 var BASESPEED = 0;


 function setupVars() {
         BASESPEED = 0;
         if (game.background) {
             game.background.sunkCounter = 0;
             game.background.paddleangle = 0;
             game.background.y = 0;
             game.background.speed = 1 + BASESPEED;
             game.background.posx = game.bgCanvas.width / 2;
         }

     }


 var RADS = Math.PI / 180;

 //Draw a rotated image from center at x, and y of passed in coords
 function drawRotatedImage(context, image, x, y, angle) {
     var canvas = document.getElementById('myCanvas');
     // save the current co-ordinate system 
     // before we screw with it
     context.save();

     // move to the middle of where we want to draw our image
     context.translate(x, y);

     // rotate around that point, converting our 
     // angle from degrees to radians 
     context.rotate(angle * RADS);
     context.drawImage(image, -(image.width / 2), -(image.height / 2), image.width, image.height);
     //Put a blue dot on the center of the image for testing
     //this.context.arc(-(image.width/2), -(image.height/2), 10, 0, 2 * Math.PI, false);
     //this.context.fillStyle = 'blue';
     //this.context.fill();
     //this.context.closePath();	   
     context.restore();
 }




 /**
  * Define object to hold images and sounds
  */
 var aRepository = new function() {
     // Define images
     this.assetCount = 22;
     this.assetCounter = 1;
     this.startScreen = new Image();
     this.rock1 = new Image();
     this.rock2 = new Image();
     this.rock3 = new Image();
     this.rock4 = new Image();
     this.rock5 = new Image();
     this.rock6 = new Image();

     this.background1 = new Image();
     this.background2 = new Image();

     this.kayak1 = new Image();
     this.kayak2 = new Image();
     this.kayak3 = new Image();
     this.kayak4 = new Image();
     this.kayak5 = new Image();

     this.wake1 = new Image();
     this.paddleleft = new Image();
     this.paddleright = new Image();
     this.splash = new Image();
     this.flip = new Image();
     this.over = new Image();
     this.drops = new Image();
     this.drops2 = new Image();
     this.loadedImage = false;
     this.backgroundheight = null;

     function checkLoaded() {
             aRepository.assetCounter++;
             if (aRepository.assetCounter >= aRepository.assetCount) {
                 aRepository.backgroundheight = aRepository.background2.height;
                 aRepository.loadedImage = true;
             }
         }
         // Set images src
     this.rock1.src = "images/assets/rock1.png";
     this.rock1.onload = checkLoaded;
     this.rock2.src = "images/assets/rock2.png";
     this.rock2.onload = checkLoaded;
     this.rock3.src = "images/assets/rock3.png";
     this.rock3.onload = checkLoaded;
     this.rock4.src = "images/assets/rock4.png";
     this.rock4.onload = checkLoaded;
     this.rock5.src = "images/assets/rock5.png";
     this.rock5.onload = checkLoaded;
     this.rock6.src = "images/assets/rock6.png";
     this.rock6.onload = checkLoaded;
     this.background1.src = "images/assets/waterloop1.png";
     this.background1.onload = checkLoaded;
     this.background2.src = "images/assets/waterloop2.png";
     this.background2.onload = checkLoaded;

     this.kayak1.src = "images/assets/Kayak1.png";
     this.kayak1.onload = checkLoaded;
     this.kayak2.src = "images/assets/Kayak2.png";
     this.kayak2.onload = checkLoaded;
     this.kayak3.src = "images/assets/Kayak3.png";
     this.kayak3.onload = checkLoaded;
     this.kayak4.src = "images/assets/Kayak4.png";
     this.kayak4.onload = checkLoaded;
     this.kayak5.src = "images/assets/Kayak5.png";
     this.kayak5.onload = checkLoaded;
     this.paddleleft.src = "images/assets/paddleright.png";
     this.paddleleft.onload = checkLoaded;
     this.paddleright.src = "images/assets/paddleleft.png";
     this.paddleright.onload = checkLoaded;
     this.splash.src = "images/assets/splash.png";
     this.splash.onload = checkLoaded;
     this.wake1.src = "images/assets/wake1.png";
     this.wake1.onload = checkLoaded;
     this.flip.src = "images/assets/kayakflip.png";
     this.flip.onload = checkLoaded;
     this.over.src = "images/assets/kayakover.png";
     this.over.onload = checkLoaded;
     this.startScreen.src = "images/assets/startscreen.png";
     this.startScreen.onload = checkLoaded;
     this.drops.src = "images/assets/drops2.png";
     this.drops.onload = checkLoaded;
     this.drops2.src = "images/assets/drops1.png";
     this.drops2.onload = checkLoaded;

 }


 //Setups the offscreen canvas for height of both background and background width
 function setupWaterCanvas(height, width) {
     if (aRepository.loadedImage) {
         game.background.ypos = aRepository.kayak1.height / 2;
         game.waterCanvas = document.createElement('canvas');
         game.waterCanvas.width = width;
         game.waterCanvas.height = height;
         var m_context = game.waterCanvas.getContext('2d');
         m_context.drawImage(aRepository.background1, 0, 0, width, aRepository.backgroundheight);
         m_context.drawImage(aRepository.background2, 0, aRepository.backgroundheight, width, aRepository.backgroundheight);
     }
 }


 //This function checks to see if there is a collision between a line and square
 // The line is represented by the axis of the kayaks.  The rocks are the squares
 //frontx and y - coords of the angle corrected boat
 //backx and y - coords of the angle corrected boat
 //All rocks are 50by50 pixels so we can check collisions with the rock x and y +50
 //http://stackoverflow.com/questions/1585525/how-to-find-the-intersection-point-between-a-line-and-a-rectangle
 function checkCollision(frontx, fronty, backx, backy, rockx, rocky, rockx50, rocky50) {

     if ((frontx <= rockx && backx <= rockx) || (fronty <= rocky && backy <= rocky) || (frontx >= rockx50 && backx >= rockx50) || (fronty >= rocky50 && backy >= rocky50))
         return false;

     var slope = (backy - fronty) / (backx - frontx);

     var y = slope * (rockx - frontx) + fronty;
     if (y > rocky && y < rocky50) return true;

     y = slope * (rockx50 - frontx) + fronty;
     if (y > rocky && y < rocky50) return true;

     var x = (rocky - fronty) / slope + frontx;
     if (x > rockx && x < rockx50) return true;

     x = (rocky50 - fronty) / slope + frontx;
     if (x > rockx && x < rockx50) return true;

     return false;
 }

 //Draw Rock at x, y location
 function drawRock(image, x, y) {
     var mContext = game.waterCanvas.getContext('2d');
     mContext.drawImage(image, x, y);
 }


 function Background() {
     this.speed = BASESPEED;
     this.canvasWidth = 0;
     this.canvasHeight = 0;
     this.rockdrawn = false;
     this.padhandle = null;
     this.paddir = null;
     this.paddling = false;
     this.paddleangle = 0;
     this.ypos = 0;
     this.posx = game.bgCanvas.width / 2;
     this.stopped = false;
     this.alpha = 0;
     this.alphaw = 1;
     this.sunkCounter = 0;
     //This var is used to show the splashing effect around the kayak
     this.splashcnt = 0;
     //Currently hard coded rock locations
     //ypos must be in order 
     var rocks = [];

     this.init = function(x1, y1) {
         this.x = x1;
         this.y = y1;
     };
     // Implement abstract function
     this.draw = function() {
         if (!this.stopped) {
             // Pan background
             this.y += this.speed + BASESPEED;
             this.splashcnt += 3;
             if (this.splashcnt > 100) this.splashcnt = 0;

             if (!game.waterCanvas) {
                 setupWaterCanvas(aRepository.backgroundheight * 2, this.canvasWidth /* *.7*/ );
             } else {

                 if (!this.rockdrawn) {
                     var ra = {
                         'rock1': aRepository.rock1,
                         'rock2': aRepository.rock2,
                         'rock3': aRepository.rock3,
                         'rock4': aRepository.rock4,
                         'rock5': aRepository.rock5,
                         'rock6': aRepository.rock6
                     };


                     var rc = 1;

                     //Randomize Rock locations
                     var horTop = parseInt(this.canvasWidth / 100);
                     for (var vert = 3; vert < 22; vert++) {
                         for (var hor = 0; hor <= horTop; hor++) {
                             if (Math.random() < 0.4) {
                                 var rock = 'rock' + rc;
                                 rc++
                                 var rockX = hor * 100 + (Math.random() * 100);
                                 var rockY = vert * 100 + (Math.random() * 100);
                                 rocks.push({
                                     xposition: rockX,
                                     yposition: rockY
                                 });
                                 drawRock(ra[rock], rockX, rockY);
                                 if (rc > 6) rc = 1;
                             }
                         }
                     }

                     //ypos of rock on screen will be ypos - y coord to back of kayak
                     this.rockdrawn = true;
                 }
                 if (this.ypos < aRepository.kayak1.height / 2) {
                     this.ypos = aRepository.kayak1.height / 2;
                 }
                 if (this.ypos > this.canvasHeight * .8) {
                     this.ypos = this.canvasHeight * .8;
                 }

                 if (this.paddling) {
                     this.speed = 1 + BASESPEED;
                     this.ypos += 0.1;
                 } else {
                     this.speed = 1.2 + BASESPEED;
                     this.ypos -= 0.25;
                 }

                 this.context.translate(0, -this.y);
                 this.context.drawImage(game.waterCanvas, 0 /*this.canvasWidth*.15*/ , 0);
                 this.context.drawImage(game.waterCanvas, 0 /*this.canvasWidth*.15*/ , aRepository.backgroundheight * 2);

                 this.context.translate(0, this.y);


                 if (this.splashcnt >= 0 && this.splashcnt < 20) {
                     drawRotatedImage(this.context, aRepository.kayak1, this.posx, this.ypos, this.paddleangle * -1);
                 }
                 if (this.splashcnt >= 20 && this.splashcnt < 40) {
                     drawRotatedImage(this.context, aRepository.kayak2, this.posx, this.ypos, this.paddleangle * -1);
                 }
                 if (this.splashcnt >= 40 && this.splashcnt < 60) {
                     drawRotatedImage(this.context, aRepository.kayak3, this.posx, this.ypos, this.paddleangle * -1);
                 }
                 if (this.splashcnt >= 60 && this.splashcnt < 80) {
                     drawRotatedImage(this.context, aRepository.kayak4, this.posx, this.ypos, this.paddleangle * -1);
                 }
                 if (this.splashcnt >= 80 && this.splashcnt <= 100) {
                     drawRotatedImage(this.context, aRepository.kayak5, this.posx, this.ypos, this.paddleangle * -1);
                 }

                 if (this.paddling) {
                     if (this.paddir === 1 || this.paddir === 4) {
                         this.context.drawImage(aRepository.paddleright, this.canvasWidth / 2 - 50, this.canvasHeight * .5);
                     } else {
                         this.context.drawImage(aRepository.paddleleft, this.canvasWidth / 2 - 50, this.canvasHeight * .5);
                     }

                 }

                 var mSin = Math.sin(this.paddleangle * RADS);
                 var mCos = Math.cos(this.paddleangle * RADS);
                 var mSinLen = aRepository.kayak1.height / 2 * mSin;
                 var mCosLen = aRepository.kayak1.height / 2 * mCos;

                 var blnx = 0;
                 var blny = 0;
                 var flnx = 0;
                 var flny = 0;

                 flnx = this.posx + mSinLen;
                 blnx = this.posx - mSinLen;
                 flny = this.ypos + mCosLen;
                 blny = this.ypos - mCosLen;

                 //For trailing wave effecct
                 this.alpha += .02;
                 this.alphaw -= .01;
                 if (this.alphaw < 0) this.alphaw = 2;
                 if (this.alpha > 5) this.alpha = 0;

                 // save the current co-ordinate system 
                 this.context.save();
                 this.context.translate(blnx, blny);
                 this.context.rotate(-this.paddleangle / 2 * RADS);
                 this.context.drawImage(aRepository.wake1, -aRepository.wake1.width / 2, -aRepository.wake1.height / 2 - 10 - this.alpha, aRepository.wake1.width, aRepository.wake1.height);
                 this.context.drawImage(aRepository.wake1, -aRepository.wake1.width / 2, -aRepository.wake1.height / 2 - 5, aRepository.wake1.width, aRepository.wake1.height * Math.random());
                 this.context.drawImage(aRepository.wake1, -aRepository.wake1.width / 2, -(aRepository.wake1.height / 2) * (1 + this.alphaw) - 5, aRepository.wake1.width, aRepository.wake1.height * this.alphaw);
                 this.context.restore();


                 //2200
                 var topBound = aRepository.backgroundheight * 2 - this.canvasHeight;

                 //this.y - this.canvasHeight-aRepository.rock.height;

                 for (j = 0; j < rocks.length; j++) {

                     //in the overlap
                     if (this.y > topBound) {
                         if ((rocks[j].yposition > topBound)) { //|| (rocks[j].yposition < (backgroundheight*2-this.y)+this.canvasHeight)){
                             var testy = rocks[j].yposition - this.y;
                             if (checkCollision(flnx, flny, blnx, blny, rocks[j].xposition, testy, rocks[j].xposition + 50, testy + 50)) {
                                 //hitSound.play();
                                 game.gamesound.playHit();
                                 this.stopped = true;
                             }
                         } else if (rocks[j].yposition < (this.canvasHeight - (aRepository.backgroundheight * 2 - this.y))) {
                             var testy = rocks[j].yposition + (aRepository.backgroundheight * 2 - this.y);
                             if (checkCollision(flnx, flny, blnx, blny, rocks[j].xposition, testy, rocks[j].xposition + 50, testy + 50)) {
                                 game.gamesound.playHit();
                                 this.stopped = true;
                             }
                         }

                     } else {
                         if (rocks[j].yposition > (this.y - 50) && rocks[j].yposition < this.y + this.canvasHeight) {
                             var testy = rocks[j].yposition - this.y;
                             if (checkCollision(flnx, flny, blnx, blny, rocks[j].xposition, testy, rocks[j].xposition + 50, testy + 50)) {
                                 game.gamesound.playHit();
                                 this.stopped = true;
                             }

                         }
                     }
                 }


                 this.context.mozImageSmoothingEnabled = false;
                 this.context.font = '12pt Calibri';
                 this.context.fillStyle = 'white';
                 var msg = 'xpos: ' + this.posx.toFixed(0) + ' ypos: ' + this.ypos.toFixed(0) + ' y: ' + this.y.toFixed(0) + ' an:' + this.paddleangle.toFixed(0);
                 this.context.fillText(msg, this.canvasWidth * .075, this.canvasHeight * .98);
                 // If the image scrolled off the screen, reset
                 if (this.y >= aRepository.backgroundheight * 2) {
                     this.y = 0;
                     BASESPEED += 0.5;
                     if (BASESPEED > 10) {
                         BASESPEED = 10;
                     }
                 }
                 //Sunk
             }
         } else {
             //Do the animation and sound effects when kayak hits a rock
             this.sunkCounter++;
             var tAlpha = 0;
             if (this.sunkCounter <= 500) {
                 tAlpha = 1 - this.sunkCounter * .002;
             }
             this.context.translate(0, -this.y);
             this.context.drawImage(game.waterCanvas, 0 /*this.canvasWidth*.15*/ , 0);
             this.context.drawImage(game.waterCanvas, 0 /*this.canvasWidth*.15*/ , aRepository.backgroundheight * 2);
             this.context.translate(0, this.y);
             if (this.sunkCounter < 25) {
                 this.context.drawImage(aRepository.drops, 0, 0, this.canvasWidth, this.canvasHeight);
                 //sunkSound.play();
                 game.gamesound.playSunk();
                 drawRotatedImage(this.context, aRepository.flip, this.posx, this.ypos, this.paddleangle * -1);
             } else {
                 if (this.sunkCounter < this.canvasHeight * 4) {
                     this.context.save();
                     this.context.globalAlpha = tAlpha;
                     this.context.drawImage(aRepository.drops2, 0, this.sunkCounter / 4, this.canvasWidth, this.canvasHeight);
                     //this.context.drawImage(aRepository.drops, 0, 0, this.canvasWidth, this.canvasHeight);			
                     this.context.restore();
                 }
                 drawRotatedImage(this.context, aRepository.over, this.posx, this.ypos, this.paddleangle * -1);

             }
         }
     };
 }



 function stoppaddle() {
     cancelAnimationFrame(game.background.padhandle);
     game.background.paddling = false;
 }

 function paddlecont() {

     game.background.padhandle = requestAnimFrame(paddlecont);
     if (game.background.paddir === 0) {
         game.background.posx -= 1.2;
         game.background.paddleangle -= .5;
         //paddleSound.play();
         game.gamesound.playPaddle();
     } else if (game.background.paddir === 1) {
         game.background.posx += 1.2;
         game.background.paddleangle += 0.5;
         //paddleSound.play();
         game.gamesound.playPaddle();
     } else if (game.background.paddir === 3) {
         //posx+=1.2;
         this.ypos -= 0.05;
         game.background.paddleangle -= 0.8;
         //steerSound.play();
         game.gamesound.playSteer();
     } else if (game.background.paddir === 4) {
         //posx+=1.2;
         this.ypos -= 0.05;
         game.background.paddleangle += 0.8;
         //steerSound.play();
         game.gamesound.playSteer();
     }
     var mCanvas = document.getElementById('myCanvas');
     if (game.background.posx <= -37) {
         game.background.posx = -37;
         stoppaddle();
     }
     if (game.background.posx >= (mCanvas.width + 20)) {
         game.background.posx = mCanvas.width + 20;
         stoppaddle();
     }
     if (game.background.paddleangle >= 80) {
         game.background.paddleangle = 80;
     }
     if (game.background.paddleangle <= -80) {
         game.background.paddleangle = -80;
     }

 }

 function paddle(evt) {
     if (!game.background.stopped) {
         game.background.paddling = true;
         var x;
         var y;
         var mCanvas = document.getElementById('myCanvas');
         if (evt.targetTouches) {
             x = evt.targetTouches[0].clientX;
             y = evt.targetTouches[0].clientY;
         } else {
             x = evt.clientX;
             y = evt.clientY;
         }
         if (mCanvas.width === 600) {
             x = x - (window.innerWidth - 600) / 2
         }
         if (x <= mCanvas.width / 2 && y >= mCanvas.height / 2) {
             game.background.paddir = 0;
         } else if (x > mCanvas.width / 2 && y >= mCanvas.height / 2) {
             game.background.paddir = 1;

         } else if (x < mCanvas.width / 2 && y < mCanvas.height / 2) {
             game.background.paddir = 3;
         } else if (x >= mCanvas.width / 2 && y < mCanvas.height / 2) {
             game.background.paddir = 4;
         }
         paddlecont(x, mCanvas.width / 2);
     } else {
     	if( game.background.sunkCounter > 100 ){
         setupVars();
         game.background.stopped = false;
    	}

     }
 }

 function checkStart(evt) {
     var mCanvas = document.getElementById('myCanvas');
     if (evt) {
         var x = evt.targetTouches[0].clientX;
         var y = evt.targetTouches[0].clientY;
     }
     setupVars();
     if (game.init())
         game.start();
 }

 function startScreen() {
     var canvas = document.getElementById('myCanvas');
     canvas.height = window.innerHeight;
     canvas.width = window.innerWidth;
     context = canvas.getContext('2d');
     context.drawImage(aRepository.startScreen, 0, 0, aRepository.startScreen.width * canvas.width / aRepository.startScreen.width, aRepository.startScreen.height * canvas.height / aRepository.startScreen.height);
     var supportsTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
     if (supportsTouch) {
         document.ontouchstart = checkStart;
     }


 }

 function Game() {

     var gamesound;

     this.init = function() {
         this.gamesound = null;
         this.y = 0;
         this.speed = 1 + BASESPEED;
         this.waterCanvas = null;

         this.gamesound = new gameSound();
         this.gamesound.loadSounds();


         // Get the canvas element
         this.bgCanvas = document.getElementById('myCanvas');


         this.bgCanvas.height = window.innerHeight;
         if (window.innerWidth < 600) {
             this.bgCanvas.width = window.innerWidth;
         } else {
             var cen = (window.innerWidth - 600) / 2
             this.bgCanvas.width = 600;

             this.bgCanvas.style.left = cen + "px";
         }

         //this no longer works
         var supportsTouch = ('ontouchstart' in window); // ||
         window.DocumentTouch &&
             document instanceof DocumentTouch;
         if (supportsTouch) {
             document.ontouchstart = paddle;
             document.ontouchend = stoppaddle;
             //} else {
             document.onmousedown = paddle;
             document.onmouseup = stoppaddle;
         }
         // Test to see if canvas is supported
         if (this.bgCanvas.getContext) {
             this.bgContext = this.bgCanvas.getContext('2d');

             // Initialize the background object
             this.background = new Background();
             this.background.init(this.bgCanvas.width / 3, 0); // Set draw point to 0,0

             // information
             this.background.context = this.bgContext;
             this.background.canvasWidth = this.bgCanvas.width;
             this.background.canvasHeight = this.bgCanvas.height;

             return true;
         } else {
             return false;
         }
     };

     // Start the animation loop
     this.start = function() {
         animate();
     };
 }


 function animate() {
         var mainAnim = requestAnimFrame(animate);
         game.background.draw();
         //render();
     }
     //Utility function to cancel animation
 cancelAnimationFrame = (function() {
     return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
 })();

 //Utility function for request animation
 requestAnimFrame = (function() {
     return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame;
 })();