var Game = {};

var canvas;
var ctx;
/* Called on beginning of the start of game*/
Game.init = function() {
  console.log("Initializing\n");
  
  this.Speed = 1000;    //Speed to run the simulation, 1000 = 1ms
  this.Cells = [];      //Array to hold all the cell
  this.GridWidth = 20;
  this.GridHeight = 20;     //default grid size
  this.CellSize = 5;
  this.NeighborRadius = 1;
  this.LonelinessThreshold =  2;
  this.OverpopulationThreshold = 3;
  this.GenerationMin = 3;
  this.GenerationMax = 4;
  this.IntervalID = false;    //Id of game if running, false if not running
  
  ctx.canvas.width = this.GridWidth * this.CellSize;
  ctx.canvas.height = this.GridHeight * this.CellSize;
  
  this.initCells();
};
/* Initialize Cells by total height and width */
Game.initCells = function() {
  for (var y = 0; y < this.GridHeight; ++y)
      for (var x = 0; x < this.GridWidth; ++x)
        this.Cells.push(new Cell(x, y));
};
/* Start the game loop running at certain fps */
Game.start = function() {
  if (!this.isRunning())
  {
    console.log("Starting\n");
    this.IntervalID = setInterval( this.run, this.speed );
  }
};
/* Call this to end the game */
Game.end = function() {
  console.log("Ending\n");
  clearInterval(this.IntervalID);
  this.IntervalID = false;
};
Game.step = function() {
  if (!this.isRunning())
    this.run();
};
/**/
Game.isRunning = function() {
  return this.IntervalID !== false;
};
/* Restart Just calls end and start*/
Game.restart = function() {
  this.end();
  this.start();
};
/* Called with setinterval to do updates and draws */
Game.run = function() {
	Game.update();
	Game.draw();
};
/* Update all cells in the Game*/
Game.update = function() {
  for (var i = 0; i < this.Cells.length; ++i)
    this.Cells[i].update();
};
/* Call draw on all cells*/
Game.draw = function() {
	for (var i = 0; i < this.Cells.length; ++i)
	      this.Cells[i].draw();
};
/* Change Speed */
Game.changeSpeed = function(NewSpeed) {
  console.log("Change speed: " + NewSpeed);
  this.speed = NewSpeed;
  this.restart();
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
  
  if (this.alive)
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
      console.log("Death by op");
    }
  }
  else if (neighborcount >= Game.GenerationMin && neighborcount < Game.GenerationMax)
  {
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
    var counter = 0;
  
    var Top = this.y - Game.radius;
    Top = (Top < 0) ? 0 : Top;
    var Bot = this.y + Game.radius;
    Bot = (Bot > Game.GridHeight) ? Game.GridHeight : Bot;
    var Left = this.x - Game.radius;
    Left = (Left < 0) ? 0 : Left;
    var Right = this.x + Game.radius;
    Right = (Right > Game.GridWidth) ? Game.GridWidth : Right;
  
    for (var y = Top; y < Bot; ++y)
      for (var x = Left; x < Right; ++x)
         if (Game.Cells[x + y * Game.GridWidth].alive)
           ++counter;
    
    return counter;
};

Cell.prototype.reset = function() {
  this.evaluated = false;
  this.alive = false;
};
/* Randomize all cells to be either alive or dad*/
Game.randomize = function() {
  console.log("Randomize called\n");
  
  for (var i = 0; i < this.Cells.length; ++i)
    {
      var rand = Math.random();
      
      if (rand < 0.5)
        this.Cells[i].alive = false;
      else
      {
        this.Cells[i].evaluated = true;
        this.Cells[i].alive = true;
      }
    }
};
/**/
Game.reset = function() {
  Game.end();
  
  for (var y = 0; y < this.Cells.length; ++y)
    this.Cells[y].reset();
    
  Game.draw();
};
/* First function called when the document is loaded MAIN */
$(document).ready(function() {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');
  
  Game.init();
  
  //$('#setSizeBtn').click( function() {
  //});

  $('#startBtn').click(Game.start);
  
  $('#stopBtn').click(Game.end);
  $('#stepBtn').click(Game.step);
  $('#resetBtn').click(Game.reset);
  $('#randomBtn').click(Game.randomize);
  $('#canvas').click(function() {});
  
  //$('#speedSlider').change(Game.changeSpeed($('#speedSlider').val()));
});