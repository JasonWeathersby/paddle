(function() {

    this.gameSound = function() {
        var context;
        var bufferLoader;
        var bList;
        var steerPlaying = false;
        var paddlePlaying = false;
        var hitPlaying = false;
        var sunkPlaying = false;

        this.loadSounds = function() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();

            bufferLoader = new BufferLoader(
                context, [
                    'sounds/riverbg.ogg',
                    'sounds/paddle.ogg',
                    'sounds/steer.ogg',
                    'sounds/hit.ogg',
                    'sounds/sunk.ogg',

                ],
                startBackground
            );

            bufferLoader.load();
        }

        var startBackground = function startBackground(bufferList) {
            bList = bufferList
            var river = context.createBufferSource();
            river.buffer = bList[0];
			river.loop = true;		
			var gainNode = context.createGain();
			river.connect(gainNode);
			gainNode.gain.value = 0.5;
			gainNode.connect(context.destination);			
            //river.connect(context.destination);
            river.start(0);
        }
        this.paddleTimeout = function() {
            paddlePlaying = false;
        }
        this.playPaddle = function() {
            if (!paddlePlaying) {
                var paddle = context.createBufferSource();
                paddle.buffer = bList[1];
                paddlePlaying = true;
                paddle.connect(context.destination);
                paddle.start(0);
                var timer = setTimeout(this.paddleTimeout, paddle.buffer.duration * 1000);
            }

        }
        this.steerTimeout = function() {
            steerPlaying = false;
        }

        this.playSteer = function() {
            if (!steerPlaying) {
                var steer = context.createBufferSource();
                steer.buffer = bList[2];
                steerPlaying = true;
                steer.connect(context.destination);
                steer.start(0);
                var timer = setTimeout(this.steerTimeout, steer.buffer.duration * 1000);

            }
        }
        this.hitTimeout = function() {
            hitPlaying = false;
        }
        this.playHit = function() {
            if (!hitPlaying) {
                var hit = context.createBufferSource();
                hit.buffer = bList[3];
                hitPlaying = true;
                hit.connect(context.destination);
                hit.start(0);

                var timer = setTimeout(this.hitTimeout, hit.buffer.duration * 1000);
            }
        }
        this.sunkTimeout = function() {
            sunkPlaying = false;
        }

        this.playSunk = function() {
            if (!sunkPlaying) {
                var sunk = context.createBufferSource();
                sunk.buffer = bList[4];
                sunkPlaying = true;
                sunk.connect(context.destination);
                sunk.start(0);

                var timer = setTimeout(this.sunkTimeout, sunk.buffer.duration * 1000);

            }
        }



    }
})();