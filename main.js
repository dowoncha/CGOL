var Game = {};

/* First function called when the document is loaded MAIN */
$(document).ready(function() {
  var canvas = $('#canvas')[0];
  var ctx = canvas.getContext('2d');
  
  Game.Speed = 1000;    //Speed to run the simulation, 1000 = 1ms
  Game.Cells = [];      //Array to hold all the cell
  Game.GridWidth = 20;
  Game.GridHeight = 20;     //default grid size
  Game.CellSize = 5;
  Game.NeighborRadius = 1;
  Game.LonelinessThreshold =  2;
  Game.OverpopulationThreshold = 3;
  Game.GenerationMin = 3;
  Game.GenerationMax = 4;
  Game.IntervalID = false;    //Id of game if running, false if not running
    
  ctx.canvas.width = Game.GridWidth * Game.CellSize;
  ctx.canvas.height = Game.GridHeight * Game.CellSize;
  
  /* Initialize Cells by total height and width */
  Game.initCells = function() {
    for (var y = 0; y < this.GridHeight; ++y)
        for (var x = 0; x < this.GridWidth; ++x)
          this.Cells.push(new Cell(x, y));
  };
  /**/
  Game.start = function() {
    if (!this.isRunning())
    {
      console.log("Starting\n");
      this.IntervalID = setInterval( this.run, this.speed );
    }
  };
  /* Stop the simulation*/
  Game.stop = function() {
    console.log("Stopping\n");
    clearInterval(this.IntervalID);
    this.IntervalID = false;
  };
  /* Run the simulation one step*/
  Game.step = function() {};
  /* boolean to check if the game is currently running*/
  Game.isRunning = function() {
    return this.IntervalID !== false;
  };
  /* Reset will clear the screen, end the simulation, and start a new one*/
  Game.reset = function() {
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
          this.Cells[i].evaluated = true;
          this  .Cells[i].alive = true;
        }
      }
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
  
  $('#startBtn').click(Game.start);
  $('#stopBtn').click(Game.stop);
  $('#stepBtn').click(function() {
    console.log("Stepping\n");
    if (!Game.isRunning())
      Game.run();
  });
  $('#resetBtn').click(function() {
    console.log("Restarting\n");
    clearInterval(Game.IntervalID);
    Game.IntervalID = false;
    
    /* Reset all cells to default value*/
    for (var y = 0; y < Game.Cells.length; ++y)
      Game.Cells[y].reset();
  });
  $('#randomBtn').click(Game.randomize);
  $('#canvas').click(function() {
    console.log("Canvas has been clicked\n");
  });
  $('#speedSlider').change(function(e) {
    console.log("Change speed: " + e.val());
    //Game.speed = NewSpeed;
  });
});