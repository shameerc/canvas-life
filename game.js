/**
* A Cell
*/
function Cell(x, y, cellSize, life) {
  this.x = x ;
  this.y = y ;
  this.radius = cellSize / 2;
  this.cellSize = cellSize;
  this.life = life;

  /**
  * Draw the cell in canvas
  * @param Object ctx  canvas context
  */
  this.draw = function(ctx){
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(( 
        this.x * this.cellSize) + this.radius
      , (this.y * this.cellSize) + this.radius 
      , this.radius
      , 0
      , 2 * Math.PI
      , false
    );
    ctx.fill(); 
  }
}
    
function Game(canvas) {
  this.canvas = document.getElementById(canvas);
  this.ctx = this.canvas.getContext('2d');
  this.current = []; 
  this.CELL_SIZE = 10;
  this.ALIVE = 1;
  this.DEAD = 0;
  this.TICK = 500;
  this.running = false;
  this.recording = false;
  var that = this;
  var interval = null;
  this.recorded = [];

  /** 
  * Initialize the game. Prepare the initial grid
  * @param array initalState seed/initial pattern
  */
  this.init = function(initalState) {
    // Create the empty grid
    for(var i = 0; i < this.canvas.width/ this.CELL_SIZE; i++) {
      this.current[i] = [];
      for(var j = 0; j <this.canvas.height/this.CELL_SIZE; j++) {
        this.current[i].push(new Cell(i, j, this.CELL_SIZE, this.DEAD));
      }
    }

    // Mark live cells based on intial state
    initalState.forEach(function(coords){
      if(that.current[coords[0]] &&
        that.current[[coords[0]]][[coords[1]]]) {
          that.current[[coords[0]]][[coords[1]]].life = that.ALIVE;
      }
    })
  }

  /**
  * Draw live cells in the canvas
  */
  this.drawCells = function() {
    this.current.forEach(function(row){
      row.forEach(function(cell) {
        // Check if the cell is alive
        if(cell.life == that.ALIVE){
          // Draw cell on canvas
          cell.draw(that.ctx);
        }
      })
    });
  }

  /**
  * Find the next generation of cells
  * based on the rules of game of life
  */
  this.findNextStep = function() {
    var next = this.current.map(function(row){
      return row.map(function(cell){
        // Calculate the neighbours of cell
        var neighbours = that.countNeighbours(cell);
        var life = ( (neighbours == 3 ) // If number of neighbours is exactly three
                                        // Or if live cell has 2 neighbours
                        || ( neighbours == 2 && cell.life == that.ALIVE ))
                    ? that.ALIVE  // The cell will be live
                    : that.DEAD;  // Or it is a dead cell
        return new Cell(cell.x, cell.y, that.CELL_SIZE, life)
      });
    });

    // Set the next generation as the current generation
    this.current = next;
  }

  /**
  * Count live neighbours of a cell.
  * @param Object cell
  */
  this.countNeighbours = function(cell) {
    return [-1,0,1].map(function(row){
      return [-1,0,1].reduce(function(val, j){
        return ( 
          (row == 0 && j==0)
          || !that.current[cell.x + row]
          || !that.current[cell.x + row][cell.y + j] )
            ? val
            : val + that.current[cell.x + row][cell.y + j].life
      }, 0)
    }).reduce(function(sum, i){
      return sum+i;
    },0);
  }

  /**
  * Clear canvas
  */
  this.clearCanvas = function() {
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
  }

  /*
  * The game loop
  * Find the next generation
  * Clear the canvas
  * Draw the cells
  */
  this.gameLoop = function() {
    that.findNextStep();
    that.clearCanvas();
    that.drawCells();
  }

  /**
  * Start the game
  * @param array initial state
  */
  this.start = function(initalState) {
    this.stop();
    this.running = true;
    this.init(initalState);
    that.clearCanvas();
    that.drawCells();
    interval = setInterval(this.gameLoop, that.TICK);
  }

  /**
  * Resume the game if it is not running
  */
  this.continue = function() {
    if(this.running == false) {
      this.running = true;
      interval = setInterval(this.gameLoop, that.TICK);
    }
  }

  /**
  * Stop the game if it is running
  */
  this.stop = function() {
    if(this.running == true) {
      this.running = false;
      clearInterval(interval);
    }
  }

  /*
  * Clear the game, icluding cells
  */
  this.clear = function() {
    this.clearCanvas();
    this.current = [];
  }

  /**
  * Draw a grid on the canvas
  * For creating pattern
  */
  this.drawGrid = function() {
    this.drawLine(this.canvas.width/2, 0, this.canvas.width, this.canvas.height);
    this.drawLine(this.canvas.height/2, 0, this.canvas.width, this.canvas.height);

    for(var i=this.CELL_SIZE; i < this.canvas.width; i += this.CELL_SIZE) {
      this.drawLine(i, 0, i, this.canvas.height);
    }

    for (var j = this.CELL_SIZE; j < this.canvas.height; j += this.CELL_SIZE ) {
      this.drawLine(0, j, this.canvas.width, j);
    };
  }

  /**
  * Draw a line on the canvas
  * @param int startX x of start point
  * @param int startY y of start point
  * @param int endX x of end point
  * @param int endY y of end point
  */
  this.drawLine = function(startX, startY, endX, endY) {
    this.ctx.beginPath();
    this.ctx.moveTo(startX,startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }
  
  /*
  * Record a pattern
  */
  this.record = function(e) {
    if(this.recording) {
      var x = Math.floor(e.offsetX/that.CELL_SIZE);
      var y = Math.floor(e.offsetY/that.CELL_SIZE);
      var cell = new Cell(x, y, that.CELL_SIZE, that.ALIVE );
      cell.draw(that.ctx);
      that.recorded.push([x, y]);
    }
  }

  /*
  * Start recording the patterns
  */
  this.startRecording = function() {
    that.recording = true;
    that.recorded = [];
    that.stop();
    that.clear();
    that.drawGrid();
  }

  /*
  * End pattern recording
  */
  this.endRecording = function() {
    that.recording = false;
    that.start(this.recorded);
  }
}

// Default types
var types = {
  glider : [[10,10],[11,11],[12,11],[10,12],[11,12]],
  oscillator: [[10,10],[10,11],[10,12]]
}

var game = new Game("canvas");
// Start the glider by default
game.start(types['glider']);

document.getElementById('life_type').onchange = function() {
  var type = this.value;
  if(type !="") {
    game.stop();
    game.start(types[type]);
  }
}
document.getElementById("clear").onclick = function() {
  game.clear();
}
document.getElementById("canvas").onclick = function(e) {
  game.record(e);
}
document.getElementById("record").onclick = function() {
  game.startRecording();
}
document.getElementById("endrecord").onclick = function() {
  game.endRecording();
}
