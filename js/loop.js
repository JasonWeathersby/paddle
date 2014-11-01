 //Main file for game logic
 //window.onload = init;
 //Global Game Object
 //Need to cleanup variable name spaces
'use strict';


/*jslint vars: true plusplus: true*/
/*global document: false */
/*global Image: false */
/*global window: false */
var paddleGame = null;

var RADS = Math.PI / 180;

//Utility function to cancel animation
var cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
}());

//Utility function for request animation
var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
}());


 //Draw a rotated image from center at x, and y of passed in coords
function drawRotatedImage(context, image, x, y, angle) {
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
     //context.arc(-(image.width/2), -(image.height/2), 10, 0, 2 * Math.PI, false);
     //context.fillStyle = 'blue';
     //context.fill();
     //context.closePath();       
    context.restore();
}

 //Setups the offscreen canvas for height of both background and background width
function setupWaterCanvas(height, width) {
    if (paddleGame.gameAssets.loadedImage) {
        paddleGame.paddleBackground.ypos = paddleGame.gameAssets.kayak1.height / 2;
        paddleGame.waterCanvas = document.createElement('canvas');
        paddleGame.waterCanvas.width = width;
        paddleGame.waterCanvas.height = height;
        var m_context = paddleGame.waterCanvas.getContext('2d');
        m_context.drawImage(paddleGame.gameAssets.background1, 0, 0, width, paddleGame.gameAssets.backgroundheight);
        m_context.drawImage(paddleGame.gameAssets.background2, 0, paddleGame.gameAssets.backgroundheight, width, paddleGame.gameAssets.backgroundheight);
    }
}


 //This function checks to see if there is a collision between a line and square
 // The line is represented by the axis of the kayaks.  The rocks are the squares
 //frontx and y - coords of the angle corrected boat
 //backx and y - coords of the angle corrected boat
 //All rocks are 50by50 pixels so we can check collisions with the rock x and y +50
 //http://stackoverflow.com/questions/1585525/how-to-find-the-intersection-point-between-a-line-and-a-rectangle
function checkCollision(frontx, fronty, backx, backy, rockx, rocky, rockx50, rocky50) {

    if ((frontx <= rockx && backx <= rockx) || (fronty <= rocky && backy <= rocky) || (frontx >= rockx50 && backx >= rockx50) || (fronty >= rocky50 && backy >= rocky50)) {
        return false;
    }
    var slope = (backy - fronty) / (backx - frontx);

    var y = slope * (rockx - frontx) + fronty;
    if (y > rocky && y < rocky50) {
        return true;
    }

    y = slope * (rockx50 - frontx) + fronty;
    if (y > rocky && y < rocky50) {
        return true;
    }
    var x = (rocky - fronty) / slope + frontx;
    if (x > rockx && x < rockx50) {
        return true;
    }
    x = (rocky50 - fronty) / slope + frontx;
    if (x > rockx && x < rockx50) {
        return true;
    }
    return false;
}

 //Draw Rock at x, y location
function drawRock(image, x, y) {
    var mContext = paddleGame.waterCanvas.getContext('2d');
    mContext.drawImage(image, x, y);
}


function PaddleBackground() {
    this.BASESPEED = 0;
    this.speed = this.BASESPEED;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.context = null;
    this.rockdrawn = false;
    this.padhandle = null;
    this.paddir = null;
    this.paddling = false;
    this.paddleangle = 0;
    this.ypos = 0;
    this.posx = paddleGame.bgCanvas.width / 2;
    this.stopped = false;
    this.alpha = 0;
    this.alphaw = 1;
    this.sunkCounter = 0;
    this.rocks = [];
    this.x = 0;
    this.y = 0;
    this.splashcnt = 0;
    this.init = function (x1, y1) {
        this.x = x1;
        this.y = y1;
    };
    this.draw = function () {
        var vert;
        var hor;
        if (!this.stopped) {
            // Pan background
            this.y += this.speed + this.BASESPEED;
            this.splashcnt += 3;
            if (this.splashcnt > 100) {
                this.splashcnt = 0;
            }
            if (!paddleGame.waterCanvas) {
                setupWaterCanvas(paddleGame.gameAssets.backgroundheight * 2, this.canvasWidth);
            } else {
                if (!this.rockdrawn) {
                    var ra = {
                        'rock1': paddleGame.gameAssets.rock1,
                        'rock2': paddleGame.gameAssets.rock2,
                        'rock3': paddleGame.gameAssets.rock3,
                        'rock4': paddleGame.gameAssets.rock4,
                        'rock5': paddleGame.gameAssets.rock5,
                        'rock6': paddleGame.gameAssets.rock6
                    };


                    var rc = 1, rock, rockX, rockY;

                     //Randomize Rock locations
                    var horTop = parseInt(this.canvasWidth / 100, 10);
                    for (vert = 3; vert < 22; vert++) {
                        for (hor = 0; hor <= horTop; hor++) {
                            if (Math.random() < 0.4) {
                                rock = 'rock' + rc;
                                rc++;
                                rockX = hor * 100 + (Math.random() * 100);
                                rockY = vert * 100 + (Math.random() * 100);
                                this.rocks.push({
                                    xposition: rockX,
                                    yposition: rockY
                                });
                                drawRock(ra[rock], rockX, rockY);
                                if (rc > 6) {
                                    rc = 1;
                                }
                            }
                        }
                    }

                    //ypos of rock on screen will be ypos - y coord to back of kayak
                    this.rockdrawn = true;
                }
                if (this.ypos < paddleGame.gameAssets.kayak1.height / 2) {
                    this.ypos = paddleGame.gameAssets.kayak1.height / 2;
                }
                if (this.ypos > this.canvasHeight * 0.8) {
                    this.ypos = this.canvasHeight * 0.8;
                }

                if (this.paddling) {
                    this.speed = 1 + this.BASESPEED;
                    this.ypos += 0.1;
                } else {
                    this.speed = 1.2 + this.BASESPEED;
                    this.ypos -= 0.25;
                }

                this.context.translate(0, -this.y);
                this.context.drawImage(paddleGame.waterCanvas, 0, 0);
                this.context.drawImage(paddleGame.waterCanvas, 0, paddleGame.gameAssets.backgroundheight * 2);

                this.context.translate(0, this.y);


                if (this.splashcnt >= 0 && this.splashcnt < 20) {
                    drawRotatedImage(this.context, paddleGame.gameAssets.kayak1, this.posx, this.ypos, this.paddleangle * -1);
                }
                if (this.splashcnt >= 20 && this.splashcnt < 40) {
                    drawRotatedImage(this.context, paddleGame.gameAssets.kayak2, this.posx, this.ypos, this.paddleangle * -1);
                }
                if (this.splashcnt >= 40 && this.splashcnt < 60) {
                    drawRotatedImage(this.context, paddleGame.gameAssets.kayak3, this.posx, this.ypos, this.paddleangle * -1);
                }
                if (this.splashcnt >= 60 && this.splashcnt < 80) {
                    drawRotatedImage(this.context, paddleGame.gameAssets.kayak4, this.posx, this.ypos, this.paddleangle * -1);
                }
                if (this.splashcnt >= 80 && this.splashcnt <= 100) {
                    drawRotatedImage(this.context, paddleGame.gameAssets.kayak5, this.posx, this.ypos, this.paddleangle * -1);
                }

                if (this.paddling) {
                    if (this.paddir === 1 || this.paddir === 4) {
                        this.context.drawImage(paddleGame.gameAssets.paddleright, this.canvasWidth / 2 - 50, this.canvasHeight * 0.5);
                    } else {
                        this.context.drawImage(paddleGame.gameAssets.paddleleft, this.canvasWidth / 2 - 50, this.canvasHeight * 0.5);
                    }

                }

                var mSin = Math.sin(this.paddleangle * RADS);
                var mCos = Math.cos(this.paddleangle * RADS);
                var mSinLen = paddleGame.gameAssets.kayak1.height / 2 * mSin;
                var mCosLen = paddleGame.gameAssets.kayak1.height / 2 * mCos;

                var blnx = 0;
                var blny = 0;
                var flnx = 0;
                var flny = 0;

                flnx = this.posx + mSinLen;
                blnx = this.posx - mSinLen;
                flny = this.ypos + mCosLen;
                blny = this.ypos - mCosLen;

                 //For trailing wave effecct
                this.alpha += 0.02;
                this.alphaw -= 0.01;
                if (this.alphaw < 0) {
                    this.alphaw = 2;
                }
                if (this.alpha > 5) {
                    this.alpha = 0;
                }
                // save the current co-ordinate system 
                this.context.save();
                this.context.translate(blnx, blny);
                this.context.rotate(-this.paddleangle / 2 * RADS);
                this.context.drawImage(paddleGame.gameAssets.wake1, -paddleGame.gameAssets.wake1.width / 2, -paddleGame.gameAssets.wake1.height / 2 - 10 - this.alpha, paddleGame.gameAssets.wake1.width, paddleGame.gameAssets.wake1.height);
                this.context.drawImage(paddleGame.gameAssets.wake1, -paddleGame.gameAssets.wake1.width / 2, -paddleGame.gameAssets.wake1.height / 2 - 5, paddleGame.gameAssets.wake1.width, paddleGame.gameAssets.wake1.height * Math.random());
                this.context.drawImage(paddleGame.gameAssets.wake1, -paddleGame.gameAssets.wake1.width / 2, -(paddleGame.gameAssets.wake1.height / 2) * (1 + this.alphaw) - 5, paddleGame.gameAssets.wake1.width, paddleGame.gameAssets.wake1.height * this.alphaw);
                this.context.restore();


                 //2200
                var topBound = paddleGame.gameAssets.backgroundheight * 2 - this.canvasHeight;

                var j, testy;
                for (j = 0; j < this.rocks.length; j++) {
                    //in the overlap
                    if (this.y > topBound) {
                        if ((this.rocks[j].yposition > topBound)) { //|| (rocks[j].yposition < (backgroundheight*2-this.y)+this.canvasHeight)){
                            testy = this.rocks[j].yposition - this.y;
                            if (checkCollision(flnx, flny, blnx, blny, this.rocks[j].xposition, testy, this.rocks[j].xposition + 50, testy + 50)) {
                                //hitSound.play();
                                paddleGame.gamesound.playHit();
                                this.stopped = true;
                            }
                        } else if (this.rocks[j].yposition < (this.canvasHeight - (paddleGame.gameAssets.backgroundheight * 2 - this.y))) {
                            testy = this.rocks[j].yposition + (paddleGame.gameAssets.backgroundheight * 2 - this.y);
                            if (checkCollision(flnx, flny, blnx, blny, this.rocks[j].xposition, testy, this.rocks[j].xposition + 50, testy + 50)) {
                                paddleGame.gamesound.playHit();
                                this.stopped = true;
                            }
                        }

                    } else {
                        if (this.rocks[j].yposition > (this.y - 50) && this.rocks[j].yposition < this.y + this.canvasHeight) {
                            testy = this.rocks[j].yposition - this.y;
                            if (checkCollision(flnx, flny, blnx, blny, this.rocks[j].xposition, testy, this.rocks[j].xposition + 50, testy + 50)) {
                                paddleGame.gamesound.playHit();
                                this.stopped = true;
                            }

                        }
                    }
                }


                this.context.mozImageSmoothingEnabled = false;
                this.context.font = '12pt Calibri';
                this.context.fillStyle = 'white';
                var msg = 'xpos: ' + this.posx.toFixed(0) + ' ypos: ' + this.ypos.toFixed(0) + ' y: ' + this.y.toFixed(0) + ' an:' + this.paddleangle.toFixed(0);
                this.context.fillText(msg, this.canvasWidth * 0.075, this.canvasHeight * 0.98);
                 // If the image scrolled off the screen, reset
                if (this.y >= paddleGame.gameAssets.backgroundheight * 2) {
                    this.y = 0;
                    this.BASESPEED += 0.5;
                    if (this.BASESPEED > 10) {
                        this.BASESPEED = 10;
                    }
                }
                 //Sunk
            }
        } else {
             //Do the animation and sound effects when kayak hits a rock
            this.sunkCounter++;
            var tAlpha = 0;
            if (this.sunkCounter <= 500) {
                tAlpha = 1 - this.sunkCounter * 0.002;
            }
            this.context.translate(0, -this.y);
            this.context.drawImage(paddleGame.waterCanvas, 0, 0);
            this.context.drawImage(paddleGame.waterCanvas, 0, paddleGame.gameAssets.backgroundheight * 2);
            this.context.translate(0, this.y);
            if (this.sunkCounter < 25) {
                this.context.drawImage(paddleGame.gameAssets.drops, 0, 0, this.canvasWidth, this.canvasHeight);
                //sunkSound.play();
                paddleGame.gamesound.playSunk();
                drawRotatedImage(this.context, paddleGame.gameAssets.flip, this.posx, this.ypos, this.paddleangle * -1);
            } else {
                if (this.sunkCounter < this.canvasHeight * 4) {
                    this.context.save();
                    this.context.globalAlpha = tAlpha;
                    this.context.drawImage(paddleGame.gameAssets.drops2, 0, this.sunkCounter / 4, this.canvasWidth, this.canvasHeight);
                    //this.context.drawImage(paddleGame.gameAssets.drops, 0, 0, this.canvasWidth, this.canvasHeight);            
                    this.context.restore();
                }
                drawRotatedImage(this.context, paddleGame.gameAssets.over, this.posx, this.ypos, this.paddleangle * -1);

            }
        }
    };
}



function stoppaddle() {
    cancelAnimationFrame(paddleGame.paddleAnim);
    paddleGame.paddleBackground.paddling = false;
}

function paddlecont() {

    paddleGame.paddleAnim = requestAnimFrame(paddlecont);
    if (paddleGame.paddleBackground.paddir === 0) {
        paddleGame.paddleBackground.posx -= 1.2;
        paddleGame.paddleBackground.paddleangle -= 0.5;
        paddleGame.gamesound.playPaddle();
    } else if (paddleGame.paddleBackground.paddir === 1) {
        paddleGame.paddleBackground.posx += 1.2;
        paddleGame.paddleBackground.paddleangle += 0.5;
         //paddleSound.play();
        paddleGame.gamesound.playPaddle();
    } else if (paddleGame.paddleBackground.paddir === 3) {
         //posx+=1.2;
        paddleGame.paddleBackground.ypos -= 0.05;
        paddleGame.paddleBackground.paddleangle -= 0.8;
         //steerSound.play();
        paddleGame.gamesound.playSteer();
    } else if (paddleGame.paddleBackground.paddir === 4) {
         //posx+=1.2;
        paddleGame.paddleBackground.ypos -= 0.05;
        paddleGame.paddleBackground.paddleangle += 0.8;
         //steerSound.play();
        paddleGame.gamesound.playSteer();
    }
    if (paddleGame.paddleBackground.posx <= -37) {
        paddleGame.paddleBackground.posx = -37;
        stoppaddle();
    }
    if (paddleGame.paddleBackground.posx >= (paddleGame.bgCanvas.width + 20)) {
        paddleGame.paddleBackground.posx = paddleGame.bgCanvas.width + 20;
        stoppaddle();
    }
    if (paddleGame.paddleBackground.paddleangle >= 80) {
        paddleGame.paddleBackground.paddleangle = 80;
    }
    if (paddleGame.paddleBackground.paddleangle <= -80) {
        paddleGame.paddleBackground.paddleangle = -80;
    }

}

function paddle(evt) {
    if (!paddleGame.paddleBackground.stopped) {
        paddleGame.paddleBackground.paddling = true;
        var x;
        var y;
        if (evt.targetTouches) {
            x = evt.targetTouches[0].clientX;
            y = evt.targetTouches[0].clientY;
        } else {
            x = evt.clientX;
            y = evt.clientY;
        }
        if (paddleGame.bgCanvas.width === 600) {
            x = x - (window.innerWidth - 600) / 2;
        }
        if (x <= paddleGame.bgCanvas.width / 2 && y >= paddleGame.bgCanvas.height / 2) {
            paddleGame.paddleBackground.paddir = 0;
        } else if (x > paddleGame.bgCanvas.width / 2 && y >= paddleGame.bgCanvas.height / 2) {
            paddleGame.paddleBackground.paddir = 1;

        } else if (x < paddleGame.bgCanvas.width / 2 && y < paddleGame.bgCanvas.height / 2) {
            paddleGame.paddleBackground.paddir = 3;
        } else if (x >= paddleGame.bgCanvas.width / 2 && y < paddleGame.bgCanvas.height / 2) {
            paddleGame.paddleBackground.paddir = 4;
        }
        paddlecont(x, paddleGame.bgCanvas.width / 2);
    } else {
        if (paddleGame.paddleBackground.sunkCounter > 100) {
            paddleGame.setupVars();
            paddleGame.paddleBackground.stopped = false;
        }

    }
}


 /**
  * Define object to hold images
  */
function AssetRepository() {
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
        paddleGame.gameAssets.assetCounter += 1;
        if (paddleGame.gameAssets.assetCounter >= paddleGame.gameAssets.assetCount) {
            paddleGame.gameAssets.backgroundheight = paddleGame.gameAssets.background2.height;
            paddleGame.gameAssets.loadedImage = true;
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


function PaddleGame() {

    this.gamesound = null;
    this.paddleBackground = null;
    this.gameAssets = null;
    this.waterCanvas = null;
    this.bgCanvas = document.getElementById('myCanvas');
    this.mainAnim = null;
    this.paddleAnim = null;

    this.init = function () {
        this.gamesound = null;
        this.y = 0;
        this.speed = 1; // + this.paddleBackground.BASESPEED;

        this.gamesound = new gameSound();
        this.gamesound.loadSounds();
        this.gameAssets = new AssetRepository();

        this.bgCanvas.height = window.innerHeight;
        if (window.innerWidth < 600) {
            this.bgCanvas.width = window.innerWidth;
        } else {
            var cen = (window.innerWidth - 600) / 2;
            this.bgCanvas.width = 600;
            this.bgCanvas.style.left = cen + "px";
        }

        //this no longer works
        var supportsTouch = ('ontouchstart' in window);
        //window.DocumentTouch &&
        //    document instanceof DocumentTouch;
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
            this.paddleBackground = new PaddleBackground(); //Object.create(PaddleBackground);
            this.paddleBackground.context = this.bgContext;
            this.paddleBackground.canvasWidth = this.bgCanvas.width;
            this.paddleBackground.canvasHeight = this.bgCanvas.height;
            this.paddleBackground.init(this.bgCanvas.width / 3, 0); // Set draw point to 0,0

            return true;
        }
        return false;
    };

    // Start the animation loop
    this.animate = function () {
        paddleGame.mainAnim = requestAnimFrame(paddleGame.animate);
        paddleGame.paddleBackground.draw();
        //render();
    };
    this.start = function () {
        this.animate();
    };
    this.setupVars = function () {
        this.paddleBackground.BASESPEED = 0;
        if (this.paddleBackground) {
            this.paddleBackground.sunkCounter = 0;
            this.paddleBackground.paddleangle = 0;
            this.paddleBackground.y = 0;
            this.paddleBackground.speed = 1 + this.paddleBackground.BASESPEED;
            this.paddleBackground.posx = this.bgCanvas.width / 2;
        }
    };
    return this;
}


function initGame() {
    paddleGame = new PaddleGame(); //Object.create(PaddleGame);
    if (paddleGame.init()) {
        paddleGame.setupVars();
        paddleGame.start();
    }
}
//Uncomment if running stand alone
//window.onload = initGame;
