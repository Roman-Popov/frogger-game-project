
// >>>>>> Class declaration section >>>>>>

class Enemy {
    constructor(crazySpeed) {
        this.availableY = [52, 135, 218, 301];
        this.x = -(Math.round(Math.random() * 200) + 25 * speed + 100);
        this.y = this.availableY[Math.round(Math.random() * 3)];
        this.speedMult = crazySpeed || Math.round(Math.random() * 3) + 3;
        this.reserve = 0;
        this.collision = false;
        this.sprite = 'images/bugs/blue-enemy-bug.png';
        this.dead = false;
    }


    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        this.x += speed * this.speedMult * dt * 10;

        // If the bug has run a distance up to the end
        if (this.x > 550) {
            this.speedMult = Math.ceil(Math.random() * 10);     // from 1 to 10

            // Adding some more time for prepare arriving fast enemies
            this.reserve = this.speedMult > 7 ? (this.speedMult - 7) * 50 : 0;

            // Updating initial enemy position
            this.x = -(Math.round(Math.random() * 200) + 25 * speed + 100 + this.reserve);
            this.y = this.availableY[Math.round(Math.random() * 4)]

            if (!this.dead) {
                this.sprite = (this.speedMult < 3) ? 'images/bugs/brown-enemy-bug.png' :
                              (this.speedMult < 6) ? 'images/bugs/blue-enemy-bug.png' :
                              (this.speedMult < 8) ? 'images/bugs/green-enemy-bug.png' :
                                                     'images/bugs/red-enemy-bug.png';
            } else {
                this.sprite = 'images/bugs/ghost-enemy-bug.png';
            }
        }

        // If player is alive && in the same row and column as an enemy
        if ((player.lives != 0 && this.x > player.x - 70 && this.x < player.x + 60) && this.y === player.y) {
            player.collision = true;
        }
    }


    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



class Player {
    constructor(character = 3) {
        this.availableX = [0, 101, 202, 303, 404];
        this.availableGear = [1, 2, 3, 3, 4, 4, 5];
        this.x = character * 101;
        this.y = 384;
        this.lives = 3;
        this.score = 0;
        this.collision = false;
        this.allowAboard = false;
        this.aboard = false;
        this.movable = true;
        this.stopGame = false;
        this.startGame = false;
        switch (character) {
            case 0:
                this.sprite = 'images/char-cat-girl.png';
                break;
            case 1:
                this.sprite = 'images/char-cap-boy.png';
                break;
            case 2:
                this.sprite = 'images/char-princess-girl.png';
                break;
            case 3:
                this.sprite = 'images/char-pink-girl.png';
                break;
            case 4:
                this.sprite = 'images/char-horn-boy.png';
                break;
            default:
                console.log('Something wrong with character choice. You will use default character');
                this.sprite = 'images/char-princess-girl.png';
                break;
        }
    }


    goAshore() {
        if (this.x > 450) return;  // Too late to go ashore
        this.y = 52;
        this.x = this.availableX[Math.round(this.x / 505 * 5)];
    }


    handleInput(key) {
        if (this.movable) {
            switch (key) {
                case 'up':
                    if (this.y > 52 || this.allowAboard) this.y -= 83;
                    break;
                case 'down':
                    if (this.y != 384) {
                        if (this.aboard) {
                            this.goAshore();
                        } else {
                            this.y += 83;
                        }
                    }
                    break;
                case 'left':
                    if (this.x != 0 && !this.aboard) this.x -= 101;
                    break;
                case 'right':
                    if (this.x != 404 && !this.aboard) this.x += 101;
                    break;
                default:
                    console.log('Wrong key! To move your character use arrow keys.')
                    break;
            }
        }
    }


    updateSpeed() {
        speed = this.availableGear[letter.counter] * initialSpeed;
    }


    gameOver() {
        this.movable = false;
        this.stopGame = true;
        speed = 3;

        // Enemy invasion :D
        for (let i = 0; i < 30; i++) {
            allEnemies.push(new Enemy(Math.ceil(Math.random() * 10)));
            allEnemies[allEnemies.length - 1].x = 540;
        }
    }


    update() {
        // if player collected all the letters
        if (letter.counter === letter.availableSprites.length && !this.stopGame) {
            console.log('You have won!');
            allEnemies.forEach(enemy => enemy.speedMult = 10);  // All alive enemies are quickly escaping from the screen
            this.gameOver();
            allEnemies.forEach(enemy => enemy.dead = true)  // All enemies become ghosts
            return;
        } else if (this.stopGame) {
            return;     // Stop player updating if the game has been over
        }

        // If the player is in the boat
        if (this.aboard) {
            this.x = boat.x;

            // If the player swam away
            if (this.x > 540) {
                if (letter.taken) {
                    this.updateSpeed();
                    collectedLetters[letter.counter].available = true;
                    letter.counter += 1;
                }
                this.score += (50 + jewel.taken * jewel.value) * speed + letter.taken * letter.value;

                // Adding new enemy if the letter was collected
                if (letter.taken) {
                    letter.taken = false;
                    allEnemies.push(new Enemy());
                }

                jewel.taken = false;
                this.x = 404;
                this.y = 384;
                this.aboard = false;
                console.log(`Your score: ${this.score}`);
            }
        }

        // If player has collided with the enemy
        if (this.collision) {
            jewel.taken = false;
            letter.taken = false;
            this.collision = false;
            lives[this.lives - 1].available = false;
            this.lives -= 1;

            if (this.lives === 0) {
                console.log('Game over')
                this.sprite = 'images/ghost.png';   // Player become a ghost
                this.gameOver();
                this.stopGame = true;
            } else {
                this.x = 202;
                this.y = 384;
            }
        }
    }


    // Draw the player on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



class Boat {
    constructor(x) {
        this.x = x || -150;
        this.y = -31;
        this.multAboard = 1;
        this.sprite = 'images/Boat.png';
    }


    update(dt) {
        // Stop boat updating if it sailed away and game was finished
        if (player.stopGame && this.x === -150) {
            return;
        }

        this.x += speed * dt * 20 * this.multAboard + speed * player.stopGame;

        if (player.x > this.x - 65 && player.x < this.x + 100) {
            player.allowAboard = true;
            if (player.y === this.y) {
                player.aboard = true;
                player.allowAboard = false;
            } else {
                player.aboard = false;
            }
        } else {
            player.allowAboard = false;
        }

        if (player.aboard) {
            player.x = this.x;
            this.multAboard = 3;
        } else {
            this.multAboard = 1;
        }

        // Return the boat to the beginning if it sailed away
        if (this.x > 550) this.x = -150;
    }


    // Draw the boat on the screen, required method for game
    render() {
        if (this.x != -150 || player.stopGame) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }
}



class Item {
    constructor(options = {}) {
        this.presence = false;
        this.availableX = [0, 101, 202, 303, 404];
        this.availableY = [52, 135, 218, 301];
        this.availableSprites = ['images/gems/Gem Orange.png', 'images/gems/Gem Purple.png', 'images/gems/Gem White.png'];
        this.availableValue = [50, 100, 150];
        this.value = 0;
        this.chance = options.chance || 0.01;
        this.showTimeDelay = options.showTimeDelay || 5000;
        this.multDelay = options.multDelay || 1;
        this.taken = false;
        this.x;
        this.y;
        this.sprite;
        this.lastTime = Date.now();
        this.now;
    }


    // Choosing a random item from available ones
    chooseItem() {
        let itemType = Math.floor(Math.random() * this.availableSprites.length);
        this.sprite = this.availableSprites[itemType];
        this.value = this.availableValue[itemType];
    }


    isTakenItem() {
        if (this.x === player.x && this.y === player.y && !this.taken) {
            this.taken = true;
            // Player takes the item, item becomes small
            this.sprite = this.sprite.replace('Gem ', 'Small Gem ');
        } else if (this.sprite && !this.taken) {
            // If item exists but player lost it. Item become normal-sized
            this.sprite = this.sprite.replace('Small ', '');
        }
    }


    // Pin the item to the player
    moveTakenItem() {
            this.x = player.x;
            this.y = player.y;
            this.lastTime = this.now;
    }


    hideItem() {
        this.x = -5000;
        this.y = -5000;
        this.presence = false;
        this.lastTime = this.now;
    }


    update() {
        if (player.stopGame) return; // Stop item updating if the game has been over
        this.now = Date.now();
        let deltaT = (this.now - this.lastTime);
        // Set the min delay for deleting the item; If it's too small - set to 1.5s
        let deleteTimeDelay = deltaT > 1500 ? (1.5 - 0.2 * speed) * this.showTimeDelay * this.multDelay : 1500;
        // Trying to show the item
        if (!this.presence && Math.random() < this.chance) {
            // If enough time has passed after the previous action with the item
            if (deltaT > this.showTimeDelay) {
                this.chooseItem();
                // Random position of item
                this.x = this.availableX[Math.floor(Math.random() * this.availableX.length)];
                this.y = this.availableY[Math.floor(Math.random() * this.availableY.length)];
                this.presence = true;
                this.lastTime = this.now;
            }
        // Deletting item from the screen if there has passed enough time, item exists and it's not taken
        } else if (deltaT > deleteTimeDelay && this.presence && !this.taken) {
            this.hideItem();
        }

        // If the item is taken - it becomes small, else - item has normal size
        this.isTakenItem();

        if (this.taken) {
            this.moveTakenItem();
        }
    }


    // Draw the item on the screen, required method for game
    render() {
        if (this.presence && !player.stopGame) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }
}



class Letter extends Item {
    constructor(options = {}) {
        super();
        this.availableSprites = ['images/gems/letters/Gem U.png', 'images/gems/letters/Gem D.png',
            'images/gems/letters/Gem A.png', 'images/gems/letters/Gem C.png',
            'images/gems/letters/Gem I.png', 'images/gems/letters/Gem T.png',
            'images/gems/letters/Gem Y.png'];
        this.availableValue = [250, 500, 750, 1000, 1500, 2000, 3000];
        this.chance = options.chance || 0.0025;
        this.showTimeDelay = options.showTimeDelay || 15000;
        this.multDelay = options.multDelay || 0.5;
        this.counter = 0;
    }


    chooseItem() {
        this.sprite = this.availableSprites[this.counter];
        this.value = this.availableValue[this.counter];
    }
}



class Heart extends Item {
    constructor(options = {}) {
        super();
        this.availableSprites = ['images/Heart.png'];
        this.availableValue = [0];
        this.chance = options.chance || 0.005;
        this.showTimeDelay = options.showTimeDelay || 20000;
        this.multDelay = options.multDelay || 0.2;
    }


    isTakenItem() {
        if (this.x === player.x && this.y === player.y) {
            this.hideItem();
            // In case if player has not enough lives - add one more
            if (player.lives < 5) {
                lives[player.lives].available = true;
                player.lives += 1;
            // Else - add score points
            } else {
                player.score += 250 * speed;
                console.log('score = ', player.score);
            }
        }
    }
}



// Status-bar icons
class Icon {
    constructor(available) {
        this.x = false;
        this.y = 415;
        this.sprite;
        this.available = available;
    }


    setX() {
        this.x = 0;
    }


    chooseSprite() {
        return;
    }


    update() {
        if (!this.x) this.setX();
        this.sprite = this.chooseSprite();
    }

    // Draw the status-bar icon on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



class HeartIcon extends Icon {
    constructor(available) {
        super(available)
    }

    // Choosing icon position according to the index number of this live in lives massive
    setX() {
        this.x = lives.indexOf(this) * 40;
    }

    // To synchronize player's number of lives with the status-bar
    // Available lives are solid, unavailable are blank
    chooseSprite() {
        return this.available ? 'images/Heart-icon.png' : 'images/Heart-icon-empty.png';
    }
}



class LetterIcon extends Icon {
    constructor(available) {
        super(available);
        this.availableSprites = ['images/gems/letters/Status-U.png', 'images/gems/letters/Status-D.png',
            'images/gems/letters/Status-A.png', 'images/gems/letters/Status-C.png',
            'images/gems/letters/Status-I.png', 'images/gems/letters/Status-T.png',
            'images/gems/letters/Status-Y.png'];
    }

    // Choosing icon position according to the index number
    // of this letter in collectedLetters massive
    setX() {
        this.x = collectedLetters.indexOf(this) * 35 + 240;
    }

    // To synchronize player's collected letters with the status-bar
    // Collected letters are solid, other are blank
    chooseSprite() {
        return this.available ? this.availableSprites[collectedLetters.indexOf(this)]
            : 'images/gems/letters/Status-empty.png';
    }
}



class Selector {
    constructor() {
        this.x = 202;
        this.y = 375;
        this.sprite = 'images/Selector.png';
        this.chosen = false;
        this.bgOpacity = 0.5;
    }


    letsBegin() {
        items.forEach(item => item.lastTime = Date.now());
        this.chosen = true;
        this.sprite = 'images/Selector-green.png';
        const clearBg = setInterval(() => {
            this.bgOpacity -= 0.05;
            if (this.bgOpacity < 0.05) {clearInterval(clearBg); console.log('clear')}
        }, 50)
        setTimeout(() => {
            player.startGame = true;
            this.bgOpacity = 0.5;
        }, 500);
    }


    handleInput(key) {
        switch (key) {
            case 'left':
                if (this.x != 0 && !this.chosen) this.x -= 101;
                break;
            case 'right':
                if (this.x != 404 && !this.chosen) this.x += 101;
                break;
            case 'spacebar':
                this.letsBegin();
                break;
            default:
                console.log('Wrong key! To move a selector use left and right arrow keys' +
                            'or use spacebar / long-touch to select the character');
                break;
        }
    }


    update() {
        player.sprite = availablePlayers[Math.round(this.x / 101)].sprite;
        player.x = availablePlayers[Math.round(this.x / 101)].x;
    }


    // Draw the selector on the screen, required method for game
    render() {
        ctx.fillStyle = `rgba(0, 0, 0, ${this.bgOpacity})`;
        ctx.fillRect(0, 50, canvas.width, canvas.height);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// <<<<<< End of class declaration section <<<<<<



// >>>>>> Main section >>>>>>

let initialSpeed = 1;
let speed = initialSpeed;

const selector = new Selector();
const availablePlayers = [];
for (let i = 0; i < 5; i++) {
    availablePlayers.push(new Player(i));
}

const jewel = new Item();
const letter = new Letter();
const heart = new Heart();

const items = [jewel, letter, heart];
const allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy()];
const boat = new Boat();
const player = new Player();

// In the beginning tha player has 3 lives and the status-bar displays it ("true" HeartIcons)
const lives = [new HeartIcon(true), new HeartIcon(true), new HeartIcon(true),
               new HeartIcon(), new HeartIcon()];

const collectedLetters = [];
// Make as many letter icons as required to finish the game
letter.availableSprites.forEach(() => collectedLetters.push(new LetterIcon()))


// This listens for key presses and sends the keys to Player.handleInput() method
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'spacebar',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (!e.repeat) {
        if (!player.startGame) {
            selector.handleInput(allowedKeys[e.keyCode]);
        } else {
            player.handleInput(allowedKeys[e.keyCode]);
        }
    }
});



// For using touchscreen
const gameField = document.getElementById('canvas-wrapper');
let touchstartX;
let touchstartY;
let touchstartTime;
let selectTimer;

gameField.addEventListener('touchstart', function (e) {
    e.preventDefault();
    touchstartX = e.touches[0].pageX;
    touchstartY = e.touches[0].pageY;
    touchstartTime = e.timeStamp;

    // In case of long touch
    if (!player.startGame) {
        selectTimer = setTimeout(() => {
                selector.handleInput('spacebar');
        }, 600);
    }
});

gameField.addEventListener('touchend', function (e) {

    clearTimeout(selectTimer);

    let moveX = touchstartX - e.changedTouches[0].pageX;
    let moveY = touchstartY - e.changedTouches[0].pageY;
    let result;

    if (Math.abs(moveX) > Math.abs(moveY) &&
       (Math.abs(moveX) > 10 || Math.abs(moveY) > 10)) {
        result = moveX > 0 ? 'left' : 'right';
    } else {
        result = moveY > 0 ? 'up' : 'down';
    }

    if (!player.startGame) {
        selector.handleInput(result);
    } else {
        player.handleInput(result);
    }
});

// <<<<<< End of main section <<<<<<
