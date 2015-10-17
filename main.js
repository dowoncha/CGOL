var Game = {};

var canvas;
var ctx;

Game.Speed = 1;    //Speed to run the simulation, 1000 = 1ms
Game.Cells = [];      //Array to hold all the cell
Game.GridSize = 50;
Game.CellSize = 5;
Game.NeighborRadius = 1;
Game.LonelinessThreshold =  2;
Game.OverpopulationThreshold = 3;
Game.GenerationMin = 3;
Game.GenerationMax = 4;
Game.IntervalID = false;    //Id of game. true if running, false if not running

/* Initialize Cells by total height and width */
Game.initCells = function() {
  for (var y = 0; y < Game.GridSize; ++y)
      for (var x = 0; x < Game.GridSize; ++x)
        Game.Cells.push(new Cell(x, y));
        
  console.log("Initializing Cells. Total cell size is: %d", Game.Cells.length);
};
/* Star the simulation if one is currently not running */
Game.start = function() {
  if (!Game.isRunning())
  {
    console.log("Starting\n");
    Game.IntervalID = setInterval( Game.run, Game.speed );
  }
};
/* Stop the simulation*/
Game.stop = function() {
  console.log("Stopping\n");
  clearInterval(Game.IntervalID);
  Game.IntervalID = false;
};
/* Run the simulation one step*/
Game.step = function() {
  console.log("Stepping\n");
    if (!Game.isRunning())
      Game.run();
};
/* boolean to check if the game is currently running*/
Game.isRunning = function() {
  return Game.IntervalID !== false;
};
/* Reset will clear the screen, end the simulation, and start a new one*/
Game.reset = function() {
  Game.stop();
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].reset();
  /* Should clear the screen since every cell should be non evaluated*/
  Game.draw();
};
/* Called with setinterval to do updates and draws */
Game.run = function() {
	Game.update();
	Game.draw();
};
/* Update all cells in the Game*/
Game.update = function() {
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].update();
};
/* Call draw on all cells*/
Game.draw = function() {
	for (var i = 0; i < Game.Cells.length; ++i)
	      Game.Cells[i].draw();
};
/* Randomize all cells to be either alive or dad*/
Game.randomize = function() {
  console.log("Randomize called\n");
  
  for (var i = 0; i < Game.Cells.length; ++i)
    {
      var rand = Math.random();
      
      if (rand < 0.5)
        Game.Cells[i].alive = false;
      else
      {
        Game.Cells[i].evaluated = true;
        Game.Cells[i].alive = true;
      }
    }
    
  Game.draw();
};
Game.resize = function(newsize) {
  console.log("Resize called with new size: %d", newsize);
  
  Game.stop();
  
  Game.GridSize = newsize;
  
  ctx.canvas.width = Game.GridSize * Game.CellSize;
  ctx.canvas.height = Game.GridSize * Game.CellSize;
};
/* new class for cells */
function Cell(x, y) {
  this.x = x;
  this.y = y;
  this.evaluated = false;
  this.alive = false;
}
/* Function to call when */
Cell.prototype.update = function() {
  var neighborcount = this.NeighborsAlive();
  
  if (this.alive === true)
  {
    /* Death by loneliness*/
    if (neighborcount < Game.LonelinessThreshold)
    {
      console.log("Death by loneliness");
      this.alive = false;
    }
    /* Death by overpopulation*/
    else if (neighborcount > Game.OverpopulationThreshold)
    {
      console.log("Death by overpopulation");
      this.alive = false;
    }
  }
  /* Generation*/
  else if (neighborcount >= Game.GenerationMin && neighborcount < Game.GenerationMax)
  {
    console.log("Generation");
    this.evaluated = true;
    this.alive = true;
  }
};
/* Draw the cell */
Cell.prototype.draw = function() {
  if (!this.evaluated) ctx.fillStyle = "rgb(255, 255, 255)";         //Has never existed
  else if (!this.alive) ctx.fillStyle = "rgb(100, 0, 0)"; //Dead
  else if (this.alive) ctx.fillStyle = "rgb(0, 100, 0)";  //Alive
  
  var size = Game.CellSize;
  ctx.fillRect( this.x * size, this.y * size, size, size );
};
/* Find all of the cells that are alive within the radius */
Cell.prototype.NeighborsAlive = function() {
    /* Counts the number of neighbors alive within the radius */
    var counter = 0;
    var radius = Game.NeighborRadius;
  
    /* Get boundaries of the radius to check, currently just stop at edges*/
    var Top = this.y - radius;
    Top = (Top < 0) ? 0 : Top;
    var Bot = this.y + radius;
    Bot = (Bot >= Game.GridSize) ? Game.GridSize: Bot;
    var Left = this.x - radius;
    Left = (Left < 0) ? 0 : Left;
    var Right = this.x + radius;
    Right = (Right >= Game.GridSize) ? Game.GridSize: Right;
  
    for (var y = Top; y < Bot; ++y)
      for (var x = Left; x < Right; ++x)
      {
        if (this.x == x && this.y == y)
          continue;
        
        if (!Game.Cells[x + y * Game.GridSize])
          console.log("Cell at x:%d, y: %d undefined", x, y);
        
        if (Game.Cells[x + y * Game.GridSize].alive === true)
          ++counter;
      }
      
    return counter;
};
/* Set cell to non evaluated and dead*/
Cell.prototype.reset = function() {
  this.evaluated = false;
  this.alive = false;
};
/* First function called when the document is loaded MAIN */
$(document).ready(function() {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');
    
  /* Set the canvas width and height*/
  ctx.canvas.width = Game.GridSize * Game.CellSize;
  ctx.canvas.height = Game.GridSize * Game.CellSize;
  
  /* Initialize a grid of cells*/
  Game.initCells();
  
  $('#startBtn').click(Game.start);
  
  $('#stopBtn').click(Game.stop);
  
  $('#stepBtn').click(Game.step);
  
  $('#resetBtn').click(Game.reset);
  
  $('#randomBtn').click(Game.randomize);
  
  $('#canvas').click(function() {
    console.log("Canvas has been clicked\n");
  });
 
  $('#speedSlider').change(function(e) {
    console.log(e.target.value);
  });
  
  $('#gridSlider').change(function(e) {
    Game.resize(e.target.value);
  });
  
});