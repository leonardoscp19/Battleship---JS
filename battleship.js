/**
 * The Battleship game class.
 */
class Battleship {
	// Game constants
	static MAX_ROWS = 10;
	static MAX_COLS = 10;

	// Shot status
	static SHOT_MISS = 1
	static SHOT_HIT = 2

	#hitCount = 0;
	#shotCount = 0;
	#winCount = 0
	#shipLengths = [5, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
	#ships = [];
	#board;

	constructor(start_game = true) {
		if (start_game) {
			this.#board = new Board(Battleship.MAX_ROWS, Battleship.MAX_COLS);
			//this.#board.clear();
			this.#board.draw();

			// Initialize the game.
			this.#winCount = this.initGame();

			// Define an event listener to handle shots on the game board cells.
			var thisObject = this; // "this" will not be available when fire is called, so keep it's value.
			document.getElementById("gameboard").addEventListener("click", function (e) {thisObject.fire(e)}, false);
		}
	}


	/**
	 * Place all the ships on the gaming board.
	 *
	 * @return Number of cells occupied by all ships.
	 */
	initGame() {
		let s, i;

		for (i = 0;  i < this.#shipLengths.length; i++) {
			if (this.#shipLengths[i] == 5) {
				s = this.createCarrier();
			}
			else {
				s = this.createLinearShip(this.#shipLengths[i]);
			}
			this.addShipToGame(s);
		}

		// Return number of hits to win (number of cells containing ships)
		return this.#ships.reduce((currentCount, ship) => currentCount + ship.size, 0);
	}

	/**
	 * Add a ship to the game board.
	 * @param ship - The ship to add.
	 */
	addShipToGame(ship) {
		if (ship.size < 1 || ship.size > 5 || ship.location.length != ship.size) throw Error("Invalid ship size");
		this.#ships.push(ship);
	}

	/**
	 * Randomly places an aircraft carrier in the game board.
	 * This a T-shaped ship, occupying 5 cells.
	 *
	 * @param must_fit - If the ship should fit in the game board.
	 * @return {Ship} - The created ship.
	 */
	createCarrier(must_fit = true) {
        var fits = true;
		var carrier = new Ship(5);
		var location = [];
		var non_overlapping_area = [];
        var i;
		var firstRow, firstCol;

		do {
			location = [];
			non_overlapping_area = [];
			fits = true;
			switch (this.getRandomInt(0, 4)) { // "orientation"
				case 0: 	// T
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS-2);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS-2);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push(firstRow.toString() + (firstCol+1).toString());
					location.push(firstRow.toString() + (firstCol+2).toString());
					location.push((firstRow+1).toString() + (firstCol+1).toString());
					location.push((firstRow+2).toString() + (firstCol+1).toString());

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;

				case 1:		// ┤
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS-2);
					firstCol = this.getRandomInt(2, Battleship.MAX_COLS);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push((firstRow+1).toString() + firstCol.toString());
					location.push((firstRow+2).toString() + firstCol.toString());
					location.push((firstRow+1).toString() + (firstCol-1).toString());
					location.push((firstRow+1).toString() + (firstCol-2).toString());

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;

				case 2:		// ⟂
					firstRow = this.getRandomInt(2, Battleship.MAX_ROWS);
					firstCol = this.getRandomInt(2, Battleship.MAX_COLS);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push(firstRow.toString() + (firstCol-1).toString());
					location.push(firstRow.toString() + (firstCol-2).toString());
					location.push((firstRow-1).toString() + (firstCol-1).toString());
					location.push((firstRow-2).toString() + (firstCol-1).toString());

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;

				case 3:		// ├
					firstRow = this.getRandomInt(2, Battleship.MAX_ROWS);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS-2);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push((firstRow-1).toString() + firstCol.toString());
					location.push((firstRow-2).toString() + firstCol.toString());
					location.push((firstRow-1).toString() + (firstCol+1).toString());
					location.push((firstRow-1).toString() + (firstCol+2).toString());

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;
			}
			for (i = 0;  i < this.#ships.length; i++) {
				if (this.#ships[i].is_overlapped(non_overlapping_area)) {
					fits = false;
					break;
				}
			}

		} while (!fits);
		carrier.location = location;
		return carrier;
	}

	/**
	 * Randomly places a "linear" ship in the game board.
	 *
	 * @param size - Number of cells of the ship.
	 * @param must_fit - If the ship should fit in the game board.
	 * @return {Ship} - The created ship.
	 */
	createLinearShip(size, must_fit = true) {
		var fits = true;
		var firstRow, firstCol;
		var i;
		var location = [];
		var non_overlapping_area = [];
		var ship = new Ship(size);

		do {
			location = [];
			non_overlapping_area = [];
			fits = true;
			switch (this.getRandomInt(0, 2)) { // "orientation"
				case 0: 	// W-E
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS - size + 1);

					// Define ship locations
					for (i = 0; i < size; i++) {
						location.push(firstRow.toString() + (firstCol + i).toString());
					}

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;

				case 1:		// N-S
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS - size + 1);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS);

					// Define ship locations
					for (i = 0; i < size; i++) {
						location.push((firstRow + i).toString() + firstCol.toString());
					}

					if (must_fit) {
						non_overlapping_area = this.getShipNonOverlappingLocations(location);
					}

					break;
			}
			for (i = 0;  i < this.#ships.length; i++) {
				if (this.#ships[i].is_overlapped(non_overlapping_area)) {
					fits = false;
					break;
				}
			}
		} while (!fits);
		ship.location = location;
		return ship;
	}

	/**
	 * Returns the ship locations, including non-overlapping locations around the ship.
	 * This is used to avoid ships in adjacent cells.
	 *
	 * @param shipLocations - Locations array with strings of row/col coordinates. Ex.: "75" for row 7, col 5.
	 * @return {string[]} - The ship locations, including non-overlapping cells.
	 */
	getShipNonOverlappingLocations(shipLocations) {
		let non_overlapping_area = new Set();
		let i, j, l, row, col;

		for (l = 0; l < shipLocations.length; l++) {
			row = parseInt(shipLocations[l].substring(0, 1));
			col = parseInt(shipLocations[l].substring(1, 2));
			for (i = row-1; i <= row+1; i++) {
				for (j = col-1; j <= col+1; j++) {
					if (i >= 0 && i < Battleship.MAX_ROWS && j >= 0 && j < Battleship.MAX_COLS) {
						non_overlapping_area.add(i.toString() + j.toString());
					}
				}
			}
		}

		return Array.from(non_overlapping_area);
	}

	/**
	 * Handles a shot in the cell with coordinates (row,col).
	 *
	 * @param row - Cell row where the shot was made.
	 * @param col - Cell col where the shot was made.
	 */
	handleShot(row, col) {
		if (this.#hitCount == this.#winCount) return;

		this.#shotCount++;

		var shot_location = [row.toString() + col.toString()];
		var shot_status = Battleship.SHOT_MISS;
		var i;
		var first_hit;

		for (i = 0; i < this.#ships.length; i++) {
			if (this.#ships[i].is_overlapped(shot_location)) {
				// Hit!
				shot_status = (this.#ships[i].size << 4) | Battleship.SHOT_HIT;
				this.#hitCount++;
				break;
			}
		}

		first_hit = this.#board.update(row, col, (shot_status & 0x0F) == Battleship.SHOT_MISS ? false : true, shot_status >> 4);
		if (first_hit) {
			if (this.#hitCount == this.#winCount) {
				var shotCount = this.#shotCount;
				setTimeout(function() { alert("Todos os navios foram afundados! Parabéns, ganhaste!\n\nPrecisaste de " + shotCount + " torpedos."); }, 100);
			}
		}
	}

	/**
	 * Handle clicks on the game board.
	 *
	 * @param e Event.
	 * @returns Nothing.
	 */
	fire(e) {
		// if item clicked (e.target) is not the parent element on which the event listener was set (e.currentTarget).
		if (e.target !== e.currentTarget) {
			// Get row and column indexes from the id of the HTML element.
			var row = e.target.id.substring(1, 2);
			var col = e.target.id.substring(2, 3);
			//alert("Click on row " + row + ", col " + col);

			if (row && col) {
				this.handleShot(row, col);
			}
		}
		e.stopPropagation();
	}

	/**
	 * Get a random int in the interval [min, max[
	 *
	 * @param min The minimum value (inclusive)
	 * @param max The maximum value (exclusive)
	 * @returns {number} A random integer value in the specified interval.
	 */
	getRandomInt(min, max) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
	}
}


/**
 * The ship class.
 */
class Ship {
	#size				// Size of the ship.
	#location = [];		// @type {string[]} - Location of the ship. Stored as an array of strings with "xy" coordinates.

	/**
	 * Create a new ship with the specified size.
	 * @param {number} size - The size of the ship.
	 */
	constructor(size) {
		this.#size = size;
	}

	/**
	 * Get the ship size.
	 * @readonly
	 * @return {number} The ship size.
	 * @function
	 */
	get size() {
		return this.#size;
	}

	/**
	 * Set the ship locations.
	 * @param {String[]} - The ship locations as an array of "xy" coordinates.
	 * @function
	 * @memberof Ship
	 */
	set location(locArray) {
		this.#location = locArray;
	}

	/**
	 * Get the ship locations.
	 * @readonly
	 * @return {String[]} The ship locations as an array of "xy" coordinates.
	 * @function
	 * @memberof Ship
	 */
	get location() {
		return this.#location;
	}

	/**
	 * Returns if the specified locations overlap the ship locations.
	 * @param {String[]} some_location - The location to check.
	 * @returns {boolean}  true if overlaps; false otherwise.
	 */
	is_overlapped(some_location) {
		return this.#location.filter(value => some_location.includes(value)).length != 0;
	}

}

/**
 * The Board class.
 */
class Board {
	// Cell colors
	static MISS_COLOR = '#bbb';
	static HIT_COLOR = 'red';
	static COORD_COLOR = 'black';

	// Cell size
	static CELL_SIZE_PX = 50

	// Cell possible states
	static CELL_EMPTY = 0
	static CELL_SHIP_PART_FLOAT = 1
	static CELL_SHIP_PART_HIT = 3
	static CELL_MISSED_SHOT = 5

	#gameBoard;
	#numRows;
	#numCols;

	constructor(numRows, numCols) {
		this.#numRows = numRows;
		this.#numCols = numCols;
		this.#gameBoard = Array(numRows).fill().map(() => Array(numCols).fill(Board.CELL_EMPTY));
	}

	/**
	 * Clear board of all existing ships.
	 */
	clear() {
		var i, j;
		for (i = 0; i < this.#numRows; i++) {
			for (j = 0; j < this.#numCols; j++) {
				this.#gameBoard[i][j] = Board.CELL_EMPTY;
			}
		}
	}

	/**
	 * Draw the initial, empty, board.
	 */
	draw() {
		var row, col;

		for (row = 0; row <= this.#numRows; row++) {
			for (col = 0; col <= this.#numCols; col++) {

				// create a div HTML element for each grid cell.
				var cell = document.createElement("div");
				document.getElementById("gameboard").appendChild(cell);

				if (row != 0 && col != 0) {
					// Each cell is a div element with an ID with format: "c<row><col>"
					cell.id = 'c' + (row-1) + (col-1);
				}
				else {
					cell.style.backgroundColor = Board.COORD_COLOR;
					cell.style.color = "white";
					if (row == 0 && col != 0) {
						cell.textContent = String.fromCharCode("A".charCodeAt(0) + col-1);
					}
					else if (col == 0 && row != 0) {
						cell.textContent = row;
					}
				}

				// The cells are absolute positioned in the board (see style.css)
				cell.style.top = row * Board.CELL_SIZE_PX + 'px';
				cell.style.left = col * Board.CELL_SIZE_PX + 'px';

				// Hit cells belonging to a ship will show the type of ship. This is to center the text vertically and horizontally.
				cell.style.textAlign = "center";
				cell.style.paddingTop = Math.floor(Board.CELL_SIZE_PX / 3) + "px";
			}
		}
	}

	/**
	 * Update board after a shot.
	 * @param row - The row of the cell that received the shot.
	 * @param col - The col of the cell that received the shot.
	 * @param {boolean} shot_hit - Whether a ship was hit or not.
	 * @param ship_size - The size of the ship that was hit.
	 * @return true - first shot; false - repeated shot
	 */
	update(row, col, shot_hit, ship_size = 0) {
		if (!shot_hit) {
			if (this.#gameBoard[row][col] == Board.CELL_EMPTY) {
				document.getElementById('c'+row.toString() + col.toString()).style.background = Board.MISS_COLOR;
				this.#gameBoard[row][col] = (this.#gameBoard[row][col] & 0xF0) | Board.CELL_MISSED_SHOT;
				return true;
			}
			else {
				alert("Para de desperdiçar torpedos! Já disparaste nesta posição.");
				return false;
			}
		}
		else {
			if (this.#gameBoard[row][col] == Board.CELL_EMPTY) {
				// A hit on a ship changes the color to red and cell's value to 2 (hit)
				document.getElementById('c'+row.toString() + col.toString()).style.background = Board.HIT_COLOR;
				this.#gameBoard[row][col] = (this.#gameBoard[row][col] & 0xF0) | Board.CELL_SHIP_PART_HIT;

				// Show what type of ship was hit.
				document.getElementById('c' + row.toString() + col.toString()).textContent = ship_size;

				return true;
			}
			else {
				alert("Para de desperdiçar torpedos! Já disparaste nesta posição.");
				return false;
			}
		}
	}
}

