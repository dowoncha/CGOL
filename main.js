var Game = {};

var canvas;
var ctx;

Game.Speed = 1000;    //Speed to run the simulation, 1000 = 1ms
Game.Cells = [];      //Array to hold all the cell
Game.GridSize = 50;
Game.NeighborRadius = 1;
Game.LonelinessThreshold = 2;
Game.OverpopulationThreshold = 3;
Game.GenerationMin = 3;
Game.GenerationMax = 4;
Game.IntervalID = false;    //Id of game. true if running, false if not running

/* Initialize Cells by total height and width */
Game.initCells = function () {
  for (var y = 0; y < Game.GridSize; ++y)
    for (var x = 0; x < Game.GridSize; ++x)
      Game.Cells.push(new Cell(x, y));

  console.log("Initializing Cells. Total cell size is: %d", Game.Cells.length);
};
/* Start the simulation if one is currently not running */
Game.start = function () {
  /* Check if game is currently running*/
  if (!Game.isRunning()) {
    console.log("Starting\n");
    Game.IntervalID = setInterval(Game.run, Game.speed);
  }
};
/* Stop the simulation*/
Game.stop = function () {
  console.log("Stopping\n");
  clearInterval(Game.IntervalID);
  Game.IntervalID = false;
};
/* Run the simulation one step*/
Game.step = function () {
  console.log("Stepping\n");
  if (!Game.isRunning())
    Game.run();
};
/* boolean to check if the game is currently running*/
Game.isRunning = function () {
  return Game.IntervalID !== false;
};
/* Reset will clear the screen, end the simulation, and start a new one*/
Game.reset = function () {
  Game.stop();
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].reset();
  /* Should clear the screen since every cell should be non evaluated*/
  Game.draw();
};
/* Called with setinterval to do updates and draws */
Game.run = function () {
  Game.update();
  Game.draw();
};
/* Update all cells in the Game*/
Game.update = function () {
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].update();
};
/* Call draw on all cells*/
Game.draw = function () {
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].draw();
};
/* Randomize all cells to be either alive or dad*/
Game.randomize = function () {
  console.log("Randomize called\n");

  for (var i = 0; i < Game.Cells.length; ++i) {
    var rand = Math.random();

    if (rand < 0.5)
      Game.Cells[i].setDead();
    else {
      Game.Cells[i].setAlive();
    }
  }

  Game.draw();
};
/* Change the number of cells within the grid. Does not change canvas size */
Game.resize = function (newsize) {
  console.log("Resize called with new size: %d", newsize);

  Game.stop();  
  /* Set the gridsize to the slider value */
  Game.GridSize = newsize;
  /* We resize the cell size to fit the canvas with the appropriate grid size*/
  Game.CellSize = ctx.canvas.width / Game.GridSize;
};
/* new class for cells */
function Cell(x, y) {
  this.x = x;
  this.y = y;
  this.evaluated = false;
  this.alive = false;
  this.color = "rgb(255, 255, 255)";    /* Initial color of a cell is non existant white*/
}
/* Function to call when */
Cell.prototype.update = function () {
  var neighborcount = this.NeighborsAlive();

  /* Only check alive cells */
  if (this.alive === true) {
    /* Death by loneliness*/
    if (neighborcount < Game.LonelinessThreshold || neighborcount > Game.OverpopulationThreshold) {
      console.log("Death by loneliness or overpopulation");
      this.setDead();
    }
  }
  /* Check dead cells for generation*/
  else if (neighborcount >= Game.GenerationMin && neighborcount < Game.GenerationMax) {
    console.log("Generation");
    this.setAlive();
  }
};
/* Draw the cell */
Cell.prototype.draw = function () {
  ctx.fillStyle = this.color;
  var size = Game.CellSize;
  ctx.fillRect(this.x * size, this.y * size, size, size);
};
/* Find all of the cells that are alive within the radius */
Cell.prototype.NeighborsAlive = function () {
  /* Counts the number of neighbors alive within the radius */
  var counter = 0;
  var radius = Game.NeighborRadius;
  
  /* Get boundaries of the radius to check, currently just stop at edges*/
  var Top = this.y - radius;
  Top = (Top < 0) ? 0 : Top;
  var Bot = this.y + radius;
  Bot = (Bot >= Game.GridSize) ? Game.GridSize : Bot;
  var Left = this.x - radius;
  Left = (Left < 0) ? 0 : Left;
  var Right = this.x + radius;
  Right = (Right >= Game.GridSize) ? Game.GridSize : Right;

  for (var y = Top; y < Bot; ++y)
    for (var x = Left; x < Right; ++x) {
      /* Don't add the center cell to the neighbour count*/
      if (this.x == x && this.y == y)
        continue;
      /* If the neighbor is alive increment the counter*/
      if (Game.Cells[x + y * Game.GridSize].alive === true)
        ++counter;
    }

  return counter;
};
/* Set cell to non evaluated and dead*/
Cell.prototype.reset = function () {
  this.evaluated = false;
  this.alive = false;
};

Cell.prototype.setDead = function() {
  this.alive = false;
  this.color = "rgba(192,192,192,0.7)";
}

Cell.prototype.setAlive = function() {
  this.evaluated = true;
  this.alive = true;  
  this.color = this.color = "rgb(255,255,0)";
}

/* If the cell is alive then set dead or if dead set alive */
Cell.prototype.flipState = function() {
  if (this.alive)
    this.setDead();
  else 
    this.setAlive();  
}

function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function getCellPos(mousePos) {
  return {
    x: Math.floor(mousePos.x / Game.CellSize),
    y: Math.floor(mousePos.y / Game.CellSize)
  };
}

/* First function called when the document is loaded MAIN */
$(document).ready(function () {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');

  Game.CellSize = ctx.canvas.width / Game.GridSize;
  console.log("Cell Size is: %f", Game.CellSize);
    
  /* Initialize a grid of cells*/
  Game.initCells();

  $('#startBtn').click(Game.start);

  $('#stopBtn').click(Game.stop);

  $('#stepBtn').click(Game.step);

  $('#resetBtn').click(Game.reset);

  $('#randomBtn').click(Game.randomize);

  $('#canvas').click(function (event) {
    var mousePos = getMousePos(canvas, event);
    var cellPos = getCellPos(mousePos);
    var clickedCell = Game.Cells[cellPos.x + cellPos.y * Game.GridSize];
    
    var message = "Clicked cell position: " + cellPos.x + ',' + cellPos.y;
    console.log(message);
    
    if (event.shiftKey)
      clickedCell.setAlive();
    else if (event.ctrlKey)
      clickedCell.setDead();
    /* Flip the cells state*/
    else
      clickedCell.flipState();
  });

  $('#speedSlider').change(function (event) {
    console.log(event.target.value);
  });

  $('#gridSlider').change(function (event) {
    Game.resize(event.target.value);
  });
});