/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on the player and enemy objects (defined in app.js).
 *
 * A game engine works by drawing the entire game screen over and over,
 * presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

let Engine = ( global => {
    /* Predefine the variables that will be used within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    const doc = global.document,
          win = global.window,
          wrapper = doc.getElementById('canvas-wrapper');
          canvas = doc.createElement('canvas'),
          ctx = canvas.getContext('2d');
    let lastTime;

    canvas.width = 505;
    canvas.height = 586;
    wrapper.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get the time delta information which is required if the game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their computer is)
         */
        const now = Date.now(),
              dt = (now - lastTime) / 1000.0;

        /* Call the update/render functions, pass along the time delta to
         * the update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set the lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
            win.requestAnimationFrame(main);

    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (the game loop) and itself calls all
     * of the functions which may need to update entity's data.
     */
    function update(dt) {
        if (player.startGame) {
            updateEntities(dt);
        }
        else {
            updateSelector();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects defined in app.js and calls their update() methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(enemy => enemy.update(dt));
        items.forEach(item => item.update());
        boat.update(dt);
        lives.forEach(heart => heart.update());
        collectedLetters.forEach(letter => letter.update());
        player.update();
    }

    /* This is called by the update function for updating the Selector
     * at the beginning of the game
     */
    function updateSelector() {
        selector.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. This function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */

        const rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 4 of stone
                'images/stone-block.png',   // Row 2 of 4 of stone
                'images/stone-block.png',   // Row 3 of 4 of stone
                'images/stone-block.png',   // Row 4 of 4 of stone
                'images/grass-block.png'    // Bottom row is grass
            ],
            numRows = rowImages.length,
            numCols = 5;
        let row, col;

        allEnemies.forEach(enemy => {
            if (enemy.speedMult > 7 && player.stopGame === false) {
                switch (enemy.y) {
                    case 52:
                        rowImages[1] = 'images/red-stone-block.png';
                        break;
                    case 135:
                        rowImages[2] = 'images/red-stone-block.png'
                        break;
                    case 218:
                        rowImages[3] = 'images/red-stone-block.png'
                        break;
                    case 301:
                        rowImages[4] = 'images/red-stone-block.png'
                        break;
                    default:
                        break;
                }
            }
        });

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns that were defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * The Resources helpers were used to refer to the images
                 * so there are the benefits of caching these images, since
                 * the images are used over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        if (player.startGame) {
            renderEntities();
        } else {
            renderStartScreen();
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions that were defined
     * on the enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function that was defined.
         */
        allEnemies.forEach(enemy => enemy.render());
        boat.render();
        lives.forEach(heart => heart.render());
        collectedLetters.forEach(letter => letter.render());
        player.render();
        items.forEach(item => item.render());
    }

    /* This function is called by the render function and is called on each game
     * tick while the game isn't started.
     */
    function renderStartScreen() {
        selector.render();
        availablePlayers.forEach(player => player.render());
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Load all of the images we know we're going to need to
     * draw the game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/Selector.png',
        'images/Selector-green.png',
        'images/char-cat-girl.png',
        'images/char-cap-boy.png',
        'images/char-princess-girl.png',
        'images/char-pink-girl.png',
        'images/char-horn-boy.png',
        'images/ghost.png',
        'images/stone-block.png',
        'images/red-stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/bugs/brown-enemy-bug.png',
        'images/bugs/blue-enemy-bug.png',
        'images/bugs/green-enemy-bug.png',
        'images/bugs/red-enemy-bug.png',
        'images/bugs/ghost-enemy-bug.png',
        'images/gems/Gem Orange.png',
        'images/gems/Gem Purple.png',
        'images/gems/Gem White.png',
        'images/gems/Small Gem Orange.png',
        'images/gems/Small Gem Purple.png',
        'images/gems/Small Gem White.png',
        'images/gems/letters/Gem U.png',
        'images/gems/letters/Gem D.png',
        'images/gems/letters/Gem A.png',
        'images/gems/letters/Gem C.png',
        'images/gems/letters/Gem I.png',
        'images/gems/letters/Gem T.png',
        'images/gems/letters/Gem Y.png',
        'images/gems/letters/Small Gem U.png',
        'images/gems/letters/Small Gem D.png',
        'images/gems/letters/Small Gem A.png',
        'images/gems/letters/Small Gem C.png',
        'images/gems/letters/Small Gem I.png',
        'images/gems/letters/Small Gem T.png',
        'images/gems/letters/Small Gem Y.png',
        'images/gems/letters/Status-empty.png',
        'images/gems/letters/Status-U.png',
        'images/gems/letters/Status-D.png',
        'images/gems/letters/Status-A.png',
        'images/gems/letters/Status-C.png',
        'images/gems/letters/Status-I.png',
        'images/gems/letters/Status-T.png',
        'images/gems/letters/Status-Y.png',
        'images/Boat.png',
        'images/Heart.png',
        'images/Heart-icon.png',
        'images/Heart-icon-empty.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
