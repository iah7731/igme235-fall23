class Piece {
    constructor(firstblock, secondblock) {
        this.firstblock = firstblock;
        this.secondblock = secondblock;
        this.matrix =
            [
                [0, this.firstblock, 0],
                [0, this.secondblock, 0],
                [0, 0, 0]
            ]
        this.firstblockcolor = assignColor(this.firstblock);
        this.secondblockcolor = assignColor(this.secondblock);

        this.placed = false;
        this.row = 0;
        this.col = 2;

        this.rotation = 0;
    }

    gravitatePiece() {
        let tempRow = this.row;

        // Move the piece down one row if possible
        if (this.row < playfield.length - 1) {
            // Store the current row values
            let tempFirstBlock = playfield[this.row][this.col];

            let tempSecondBlock;

            tempSecondBlock = playfield[this.row + 1][this.col];

            // Move the piece down one row
            if (this.row < 13) {

                if (playfield[this.row + 2][this.col] !== 0) {
                    this.placed = true;
                }
                else {
                    this.row++;

                    // Update the playfield
                    playfield[tempRow][this.col] = 0;
                    playfield[this.row][this.col] = tempFirstBlock;
                }

                playfield[this.row + 1][this.col] = tempSecondBlock;
            }
            else {
                this.placed = true;
            }

        }
    }

    movePieceLeft() {
        let tempCol = this.col;

        // Move the piece left if possible
        if (this.col > 0) {
            // Store the current column values
            let tempFirstBlock = playfield[this.row][this.col];
            let tempSecondBlock = playfield[this.row + 1][this.col];

            // Move the piece left
            if (this.col > 1 && playfield[this.row][this.col - 2] !== 0) {
                return;
            }
            else {
                this.col--;

                // Update the playfield
                playfield[this.row][tempCol] = 0;
                playfield[this.row][this.col] = tempFirstBlock;
                playfield[this.row + 1][tempCol] = 0;
                playfield[this.row + 1][this.col] = tempSecondBlock;
            }
        }
        else {
            this.placed = true;
        }
    }

    movePieceRight() {
        let tempCol = this.col;

        // Move the piece right if possible
        if (this.col < playfield[0].length - 1) {
            // Store the current column values
            let tempFirstBlock = playfield[this.row][this.col];
            let tempSecondBlock = playfield[this.row + 1][this.col];

            // Move the piece right
            if (this.col < playfield[0].length - 2 && playfield[this.row][this.col + 2] !== 0) {
                return;
            } else {
                this.col++;

                // Update the playfield
                playfield[this.row][tempCol] = 0;
                playfield[this.row][this.col] = tempFirstBlock;
                playfield[this.row + 1][tempCol] = 0;
                playfield[this.row + 1][this.col] = tempSecondBlock;
            }
        } else {
            this.placed = true;
        }
    }

}

const canvas = document.querySelector('#game');
const gameOverText = document.querySelector('#gameOver');
const scoretext = document.querySelector("#score");
const topscoretext = document.querySelector("#topscore");
const context = canvas.getContext('2d');
const grid = 48;
const thirdColumn = 2;
let gameOver;
let pieceSequence = [];
let playfield = [];
let pieceList = [];
let spawnDiamond = false;
let score = 0;
let row = 0;
let col = 0;
let counter = 0;
let currentPiece = null;
let initialized = false;
let sequenceCounter = 0;
let potentialCol = 0;
let potentialRow = 0;
let row1del;
let col1del;
let row2del;
let col2del;

function startGame() {
    // populate the empty state
    for (let row = 0; row < 15; row++) {
        playfield[row] = [];

        for (let col = 0; col < 6; col++) {
            playfield[row][col] = 0;
        }
    }

    // set gameplay variables before starting the loop

    gameOver = false;
    initialized = false;
    score = 0;
    topscoretext.innerHTML = "Top Score - " + localStorage.getItem("iah7731-pustrive-score");
    gameLoop(); // start the loop
}

function gameLoop() {

    // draw current board
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();

    if (!initialized) {
        currentPiece = getNextPiece();
        initialized = true;
        playfield[currentPiece.row][currentPiece.col] = currentPiece.firstblock;
        playfield[currentPiece.row + 1][currentPiece.col] = currentPiece.secondblock;
    }

    if (currentPiece.placed == true) {
        // check for activations
        if
            (
            areColorsTouching(1, 2) ||
            areColorsTouching(3, 4) ||
            areColorsTouching(5, 6) ||
            areColorsTouching(7, 8) ||
            areColorsTouching(9, 1) ||
            areColorsTouching(9, 2) ||
            areColorsTouching(9, 3) ||
            areColorsTouching(9, 4) ||
            areColorsTouching(9, 5) ||
            areColorsTouching(9, 6) ||
            areColorsTouching(9, 7) ||
            areColorsTouching(9, 8)
        ) {
            // add score
            score += 500;
            moveBoardDown();
        }
        currentPiece = getNextPiece();
        playfield[currentPiece.row][currentPiece.col] = currentPiece.firstblock;
        playfield[currentPiece.row + 1][currentPiece.col] = currentPiece.secondblock;
    }

    // check if the piece is placed

    if (++counter > 35) {
        currentPiece.gravitatePiece();
        counter = 0;
    }

    // update score
    scoretext.innerHTML = "Score - " + score;

    // check for game over
    gameOver = isGameOver();


    if (!gameOver) {
        requestAnimationFrame(gameLoop); // restart the loop
    }
    else {
        showGameOver(); // reset the game
    }

}


function getNextPiece() {
    // Check if we need a new sequence
    if (pieceSequence.length == 0) {
        // Go make a new sequence
        generateSequence();
    }

    // Pop the last piece from the sequence and assign it to currentPiece
    currentPiece = pieceSequence.pop();

    // Add the new current piece to the list of pieces played
    pieceList.push(currentPiece);

    // Return the new current piece
    return currentPiece;
}


function generateSequence() {
    // Check if we should spawn a diamond (have enough sequences passed)
    if (sequenceCounter == 25) {
        // Enable the spawnDiamond flag and reset the sequence counter
        spawnDiamond = true;
        sequenceCounter = 0;
    }

    // Loop to generate 6 pieces in the sequence
    for (let i = 0; i < 6; i++) {
        let pieceForSequence;

        // Check to spawn a diamond
        if (i == 4 && spawnDiamond == true) {
            // Create a new Piece with a diamond and a random second block color
            pieceForSequence = new Piece(getRandInt(1, 8), 9);
        }
        else {
            // Create a new Piece with random first and second block colors
            pieceForSequence = new Piece(getRandInt(1, 8), getRandInt(1, 8));
        }

        // Assign the generated piece to the sequence array
        pieceSequence[i] = pieceForSequence;
    }

    // Increment the sequence counter for the next iteration
    sequenceCounter += 1;
}


function showGameOver() {
    if(score > localStorage.getItem("iah7731-pustrive-score"))
    {
        localStorage.setItem("iah7731-pustrive-score", score);
    }
    
    score = 0;
    
    context.fillStyle = "gray";

    for (let row = 0; row < playfield.length; row++) {
        // Loop through each column in the current row
        for (let col = 0; col < playfield[row].length; col++) {
            // Draw a filled rectangle for the current cell with a grid - 1 pixel spacing
            context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
        }
    }

    gameOverText.innerHTML = "<h1>GAME OVER!</h1> <br> <h2>Refresh the page to try again.</h2>";
}

function areColorsTouching(color1, color2) {
    // Loop through each row in the playfield, excluding the last row
    for (let row = 0; row < playfield.length - 1; row++) {
        // Loop through each column in the current row
        for (let col = 0; col < playfield[row].length; col++) {
            // Get the color of the current cell and the color of the cell in the next row
            const currentColor = playfield[row][col];
            const nextRowColor = playfield[row + 1][col];

            // Check if the current cell and the one below have the specified colors
            if ((currentColor === color1 && nextRowColor === color2) ||
                (currentColor === color2 && nextRowColor === color1)) {
                // Check if this pair is not the same as the last one deleted
                if (row !== row1del || col !== col1del) {
                    // Store the coordinates of the cells to be deleted
                    row1del = row;
                    col1del = col;
                    row2del = row - 1;
                    col2del = col;

                    if(row1del <= -1 || col1del <= -1 || row2del <= -1 || col2del <= -1)
                    {
                        return false;
                    }

                    // Set the values in the playfield to 0 to delete them
                    playfield[row1del][col1del] = 0;
                    playfield[row2del][col2del] = 0;

                    // Return true to indicate that colors are touching and cells are deleted
                    return true;
                }
            }
        }
    }

    // Return false if no touching colors are found
    return false;
}


function drawBoard() {
    // Loop through each row in the playfield
    for (let row = 0; row < playfield.length; row++) {
        // Loop through each column in the current row
        for (let col = 0; col < playfield[row].length; col++) {
            // Determine the color to fill based on the value in the playfield
            switch (playfield[row][col]) {
                case 0:
                    context.fillStyle = "black";
                    break;
                case 1:
                    context.fillStyle = "red";
                    break;
                case 2:
                    context.fillStyle = "darkred";
                    break;
                case 3:
                    context.fillStyle = "yellow";
                    break;
                case 4:
                    context.fillStyle = "goldenrod";
                    break;
                case 5:
                    context.fillStyle = "limegreen";
                    break;
                case 6:
                    context.fillStyle = "green";
                    break;
                case 7:
                    context.fillStyle = "aqua";
                    break;
                case 8:
                    context.fillStyle = "blue";
                    break;
                case 9:
                    context.fillStyle = "white";
                    break;
            }

            // Draw a filled rectangle for the current cell with a grid - 1 pixel spacing
            context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
        }
    }
}


function assignColor(num) { // assigns a color to each value (1-9)
    switch (num) {
        case 1:
            return "red";
        case 2:
            return "darkred";
        case 3:
            return "yellow";
        case 4:
            return "goldenrod";
        case 5:
            return "limegreen";
        case 6:
            return "green";
        case 7:
            return "aqua";
        case 8:
            return "blue";
        case 9:
            return "white";
    }
}

document.addEventListener('keydown', function (e) { // event listener to add logic for moving the active piece
    switch (e.key) {
        case "ArrowLeft":
            currentPiece.movePieceLeft();
            break;
        case "ArrowRight":
            currentPiece.movePieceRight();
            break;
        case "ArrowDown":
            currentPiece.gravitatePiece();
            break;
    }
});

function isGameOver() {
    if (playfield.length > 0) {
        for (let row = 0; row < playfield.length; row++) {
            if (playfield[row][thirdColumn] === 0) {
                // If any cell in the column is empty, return false
                return false;
            }
        }

        // If all cells in the column are filled, return true
        return true;
    }


    return false;
}

function moveBoardDown() {
    // Move each piece down one row if applicable
    for (let i = 0; i < pieceList.length; i++) {
        if (pieceList[i].secondblock === 0) {
            playfield[pieceList[i].row][pieceList[i].col] = pieceList[i].firstblock;
            playfield[pieceList[i].row - 2][pieceList[i].col] = 0;
            playfield[pieceList[i].row - 1][pieceList[i].col] = 0;
        }
    }
}

function getRandInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

startGame();