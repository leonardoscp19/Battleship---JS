/**
 * @file Object Oriented version of a simple Battleship game.
 * @author Carlos Limão <carlos.limao@ipluso.pt>
 * @license MIT
 */

/**
 * The game class.
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

	/**
	 * Create a new game.
	 * @param {boolean} start_game - true if game should be started after creation; false otherwise.
	 */
	constructor(start_game = true) {
		if (start_game) {
			this.#board = new Board(Battleship.MAX_ROWS, Battleship.MAX_COLS);
			this.#board.draw();

			// Initialize the game.
			this.#winCount = this.initGame();
			this.showHitCount();
			this.showShotCount();

			// Define an event listener to handle shots on the game board cells.
			let thisObject = this; // "this" will not be available when fire is called, so keep it's value.
			document.getElementById("gameboard").addEventListener("click", function(e) { thisObject.fire(e) }, false);
		}
	}

	/**
	 * Place all the ships on the gaming board.
	 * @return Number of cells occupied by all ships.
	 */
	initGame() {
		let s, i;

		for (i = 0; i < this.#shipLengths.length; i++) {
			if (this.#shipLengths[i] == 5) {
				s = this.createCarrier();
			}
			else {
				s = this.createLinearShip(this.#shipLengths[i]);
			}
			this.addShipToGame(s);
			
		}

		// Return number of hits to win (number of cells containing ships)
		return this.getNumberOfOccupiedCells();
	}

	/**
	 * Add a ship to the game board.
	 * @param ship - The ship to add.
	 */
	addShipToGame(ship) {
		if (ship.size < 1 || ship.size > 5 || ship.location.length != ship.size) throw new Error("Invalid ship size");
		this.#ships.push(ship);
	}

	/**
	 * @returns Get number of ships in game.
	 */
	getNumberOfShips() {
		return this.#ships.length;
	}

	/**
	 * Clear all ships in game.
	 */
	clearShips() {
		this.#ships = [];
	}

	/**
	 * @returns Get number of occupied cells.
	 */
	getNumberOfOccupiedCells() {
		return this.#ships.reduce((currentCount, ship) => currentCount + ship.size, 0);
	}

	/**
	 * Randomly places an aircraft carrier in the game board.
	 * This a T-shaped ship, occupying 5 cells.
	 * @param must_fit - If the ship should fit in the game board.
	 * @return {Ship} - The created ship.
	 */
	createCarrier(must_fit = true) {
		let fits = true;
		let carrier = new Ship(5);
		let location = [];
		let non_overlapping_area = [];
		let i;
		let firstRow, firstCol;

		do {
			location = [];
			non_overlapping_area = [];
			fits = true;
			switch (this.getRandomInt(0, 4)) { // "orientation"
				case 0: 	// T
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS - 2);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS - 2);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push(firstRow.toString() + (firstCol + 1).toString());
					location.push(firstRow.toString() + (firstCol + 2).toString());
					location.push((firstRow + 1).toString() + (firstCol + 1).toString());
					location.push((firstRow + 2).toString() + (firstCol + 1).toString());

					break;

				case 1:		// ┤
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS - 2);
					firstCol = this.getRandomInt(2, Battleship.MAX_COLS);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push((firstRow + 1).toString() + firstCol.toString());
					location.push((firstRow + 2).toString() + firstCol.toString());
					location.push((firstRow + 1).toString() + (firstCol - 1).toString());
					location.push((firstRow + 1).toString() + (firstCol - 2).toString());

					break;

				case 2:		// ⟂
					firstRow = this.getRandomInt(2, Battleship.MAX_ROWS);
					firstCol = this.getRandomInt(2, Battleship.MAX_COLS);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push(firstRow.toString() + (firstCol - 1).toString());
					location.push(firstRow.toString() + (firstCol - 2).toString());
					location.push((firstRow - 1).toString() + (firstCol - 1).toString());
					location.push((firstRow - 2).toString() + (firstCol - 1).toString());

					break;

				case 3:		// ├
					firstRow = this.getRandomInt(2, Battleship.MAX_ROWS);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS - 2);

					// Define ship locations
					location.push(firstRow.toString() + firstCol.toString());
					location.push((firstRow - 1).toString() + firstCol.toString());
					location.push((firstRow - 2).toString() + firstCol.toString());
					location.push((firstRow - 1).toString() + (firstCol + 1).toString());
					location.push((firstRow - 1).toString() + (firstCol + 2).toString());

					break;
			}

			if (must_fit) {
				non_overlapping_area = this.getShipNonOverlappingLocations(location);

				for (i = 0; i < this.#ships.length; i++) {
					if (this.#ships[i].is_overlapped(non_overlapping_area)) {
						fits = false;
						break;
					}
				}
			}
		} while (!fits);

		carrier.location = location;
		return carrier;
	}

	/**
	 * Randomly places a "linear" ship in the game board.
	 * @param size - Number of cells of the ship.
	 * @param must_fit - If the ship should fit in the game board.
	 * @return {Ship} - The created ship.
	 */
	createLinearShip(size, must_fit = true) {
		let fits = true;
		let firstRow, firstCol;
		let i;
		let location = [];
		let non_overlapping_area = [];
		let ship = new Ship(size);

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

					break;

				case 1:		// N-S
					firstRow = this.getRandomInt(0, Battleship.MAX_ROWS - size + 1);
					firstCol = this.getRandomInt(0, Battleship.MAX_COLS);

					// Define ship locations
					for (i = 0; i < size; i++) {
						location.push((firstRow + i).toString() + firstCol.toString());
					}

					break;
			}

			if (must_fit) {
				non_overlapping_area = this.getShipNonOverlappingLocations(location);

				for (i = 0; i < this.#ships.length; i++) {
					if (this.#ships[i].is_overlapped(non_overlapping_area)) {
						fits = false;
						break;
					}
				}
			}
		} while (!fits);

		ship.location = location;
		return ship;
	}

	/**
	 * Returns the ship locations, including non-overlapping locations around the ship.
	 * This is used to avoid ships in adjacent cells.
	 * @param shipLocations - Locations array with strings of row/col coordinates. Ex.: "75" for row 7, col 5.
	 * @return {string[]} - The ship locations, including non-overlapping cells.
	 */
	getShipNonOverlappingLocations(shipLocations) {
		let non_overlapping_area = new Set();
		let i, j, l, row, col;

		for (l = 0; l < shipLocations.length; l++) {
			row = parseInt(shipLocations[l].substring(0, 1));
			col = parseInt(shipLocations[l].substring(1, 2));
			for (i = row - 1; i <= row + 1; i++) {
				for (j = col - 1; j <= col + 1; j++) {
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
	 * @param row - Cell row where the shot was made.
	 * @param col - Cell col where the shot was made.
	 */
	handleShot(row, col) {
		if (this.#hitCount == this.#winCount) return;

		this.#shotCount++;

		let shot_location = [row.toString() + col.toString()];
		let shot_status = Battleship.SHOT_MISS;
		let i;
		let first_hit;

		for (i = 0; i < this.#ships.length; i++) {
			if (this.#ships[i].is_overlapped(shot_location)) {
				// Hit! Possibly repeated, so check below before updating hitCount.
				shot_status = (this.#ships[i].size << 4) | Battleship.SHOT_HIT;
				break;
			}
		}

		first_hit = this.#board.update(row, col, (shot_status & 0x0F) == Battleship.SHOT_MISS ? false : true, shot_status >> 4);
		if (first_hit) {
			this.#hitCount++;
			this.showHitCount();

			if (this.#hitCount == this.#winCount) {
				let that = this;
				setTimeout(function() { that.#board.message("Todos os navios foram afundados. Parabéns!"); }, 100);
			}
		}
	}

	/**
	 * Handle clicks on the game board.
	 * @param e Event.
	 * @returns Nothing.
	 */
	fire(e) {
		// if item clicked (e.target) is not the parent element on which the event listener was set (e.currentTarget).
		if (e.target !== e.currentTarget) {
			// Get row and column indexes from the id of the HTML element.
			let row = e.target.id.substring(1, 2);
			let col = e.target.id.substring(2, 3);
			//alert("Click on row " + row + ", col " + col);

			if (row && col) {
				this.handleShot(row, col);
			}
		}
		this.showShotCount();
		e.stopPropagation();
	}

	/**
	 * Get a random int in the interval [min, max[
	 * @param min The minimum value (inclusive)
	 * @param max The maximum value (exclusive)
	 * @returns {number} A random integer value in the specified interval.
	 */
	getRandomInt(min, max) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
	}

	/**
	 * Show number of hits in ships.
	 */
	showHitCount() {
		document.getElementById("hit-counter").innerHTML = this.#hitCount;
	}

	/**
	 * Show number of shots fired.
	 */
	showShotCount() {
		document.getElementById("shots-fired").innerHTML = this.#shotCount;
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
	static INITIAL_COLOR = '#bbbbbb'; // Neutral color
	static MISS_COLOR = '#006994';    // This reveals WATER
	static HIT_COLOR = 'red';         // This reveals a ship
	static COORD_COLOR = 'black';     // Edge cells

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

	/**
	 * Create board with the specified number of rows and columns.
	 * @param {number} numRows - Number of rows in board.
	 * @param {number} numCols - Number of columns in board.
	 */
	constructor(numRows, numCols) {
		this.#numRows = numRows;
		this.#numCols = numCols;
		this.clear();
	}

	/**
	 * Clear board of all existing ships.
	 */
	clear() {
		this.#gameBoard = Array(this.#numRows).fill().map(() => Array(this.#numCols).fill(Board.CELL_EMPTY));
	}

	/**
	 * Draw the initial, empty, board.
	 */
	draw() {
		let row, col;

		for (row = 0; row <= this.#numRows; row++) {
			for (col = 0; col <= this.#numCols; col++) {

				// create a div HTML element for each grid cell.
				let cell = document.createElement("div");
				document.getElementById("gameboard").appendChild(cell);

				if (row != 0 && col != 0) {
					// Each cell is a div element with an ID with format: "c<row><col>"
					cell.id = 'c' + (row - 1) + (col - 1);
					cell.style.background = Board.INITIAL_COLOR;
				}
				else {
					cell.style.backgroundColor = Board.COORD_COLOR;
					cell.style.color = "white";
					if (row == 0 && col != 0) {
						cell.textContent = String.fromCharCode("A".charCodeAt(0) + col - 1);
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
		this.message("");
		if (!shot_hit) {
			if (this.#gameBoard[row][col] == Board.CELL_EMPTY) {
				document.getElementById('c' + row.toString() + col.toString()).style.background = Board.MISS_COLOR;
				this.#gameBoard[row][col] = (this.#gameBoard[row][col] & 0xF0) | Board.CELL_MISSED_SHOT;
				return false;
			}
			else {
				this.message("Para de desperdiçar torpedos! Já disparaste nesta posição.");
				return false;
			}
		}
		else {
			if (this.#gameBoard[row][col] == Board.CELL_EMPTY) {
				// A hit on a ship changes the color to red and cell's value to 2 (hit)
				document.getElementById('c' + row.toString() + col.toString()).style.background = Board.HIT_COLOR;
				this.#gameBoard[row][col] = (this.#gameBoard[row][col] & 0xF0) | Board.CELL_SHIP_PART_HIT;

				// Show what type of ship was hit.
				document.getElementById('c' + row.toString() + col.toString()).textContent = ship_size;

				return true;
			}
			else {
				this.message("Para de desperdiçar torpedos! Já disparaste nesta posição.");
				return false;
			}
		}
	}

	/**
	 * Write message in message area.
	 * @param {String} msg - The message to write.
	 */
	message(msg) {
		let msg_el;
		msg_el = document.getElementById("game-messages");
		msg_el.textContent = msg;
	}
}

