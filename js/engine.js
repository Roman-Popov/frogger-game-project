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
          canvas = doc.createElement('canvas'),
          ctx = canvas.getContext('2d');
    let lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

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
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects defined in app.js and calls their update() methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(enemy => enemy.update(dt));
        items.forEach(item => item.update());
        boat.update(dt);
        player.update();
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

        renderEntities();
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
        player.render();
        items.forEach(item => item.render());
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
        'images/char-boy.png',
        'images/ghost.png',
        'images/stone-block.png',
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
        'images/Boat.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
