var Game = {};

var canvas;
var ctx;

Game.Speed = 1000;    //Speed to run the simulation, 1000 = 1ms
Game.Cells = [];      //Array to hold all the cell
Game.GridSize = 20;
Game.NeighborRadius = 1;
Game.LonelinessThreshold = 2;
Game.OverpopulationThreshold = 3;
Game.GenerationMin = 3;
Game.GenerationMax = 3;
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
/* Reset will clear the screen, reset all cells to non evaluated, clear the screen */
Game.reset = function () {
  Game.stop();
  for (var i = 0; i < Game.Cells.length; ++i)
    Game.Cells[i].reset();
  /* Should clear the screen since every cell should be non evaluated */
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
  /* Stop the current simulation*/
  Game.stop();
  /* Set the gridsize to the slider value */
  Game.GridSize = newsize;
  /* We resize the cell size to fit the canvas with the appropriate grid size*/
  Game.CellSize = ctx.canvas.width / Game.GridSize;
  /* Clear the array of cells */
  Game.Cells.length = 0;
  /* Reinitialize new cells*/
  Game.initCells();
};
/* Change the speed of the simulation to the input value*/
Game.changeSpeed = function(newspeed) {
  Game.stop();
  Game.Speed = newspeed;
  Game.start();
}

/** new class for cells
* Color key
* Non-evaluated: rgb(255, 255, 255)
* Dead: rgba(192,192,192,0.7)
* Alive: rgb(255,255,0) **/
function Cell(x, y) {
  this.x = x;
  this.y = y;
  this.evaluated = false;
  this.alive = false;
  this.color = "rgb(255, 255, 255)";    /* Initial color of a cell is non existant white*/
}
/* Function to call when */
Cell.prototype.update = function () {
  var neighborcount = Game.NeighborFunction(this);

  /* Only check alive cells */
  if (this.alive === true) {
    /* Death by loneliness*/
    if (neighborcount < Game.LonelinessThreshold || neighborcount > Game.OverpopulationThreshold) {
      console.log("Death by loneliness or overpopulation");
      this.setDead();
    }
  }
  /* Check dead cells for generation*/
  else if (neighborcount >= Game.GenerationMin && neighborcount <= Game.GenerationMax) {
    console.log("Generation");
    this.setAlive();
  }
};
/* Draw the cell */
Cell.prototype.draw = function () {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x * Game.CellSize, this.y * Game.CellSize, Game.CellSize, Game.CellSize);
};
/* Find all of the cells that are alive within the radius */
function checkBoundaryDead(cell) {
  /* Counts the number of neighbors alive within the radius */
  var counter = 0;

  /* Get boundaries of the radius to check, currently just stop at edges*/
  var Top = Math.max(cell.y - Game.NeighborRadius, 0);
  var Bot = Math.min(cell.y + Game.NeighborRadius, Game.GridSize-1);
  var Left = Math.max(cell.x - Game.NeighborRadius, 0);
  var Right = Math.min(cell.x + Game.NeighborRadius, Game.GridSize-1);

  for (var y = Top; y <= Bot; ++y)
    for (var x = Left; x <= Right; ++x) {
      /* If the neighbor is out of bounds then we consider it dead and dont count it */
      if (cell.y == y && cell.x == x)
        continue;

      /* If the neighbor is alive increment the counter*/
      if (Game.Cells[x + y * Game.GridSize].alive === true)
        ++counter;
    }

  return counter;
};

function checkBoundaryAlive(cell) {
  var counter = 0;

  /* Get boundaries of the radius to check, currently just stop at edges*/
  var Top = cell.y - Game.NeighborRadius;
  var Bot = cell.y + Game.NeighborRadius;
  var Left = cell.x - Game.NeighborRadius;
  var Right = cell.x + Game.NeighborRadius;

  for (var y = Top; y <= Bot; ++y)
    for (var x = Left; x <= Right; ++x) {
      /* We don't check ourselves*/
      if (this.y == y && this.x == x)
        continue;

      /* If the neighbor is alive increment the counter*/
      /* If in bounds check if cell is alive*/
      if (y < 0 || y >= Game.GridSize || x < 0 || x >= Game.GridSize || Game.Cells[x + y * Game.GridSize].alive === true)
        ++counter;
    }

  return counter;
  };

function CheckBoundaryToroidal(cell) {
  var counter = 0;

  /* Get boundaries of the radius to check, currently just stop at edges*/
  var Top = cell.y - Game.NeighborRadius;
  var Bot = cell.y + Game.NeighborRadius;
  var Left = cell.x - Game.NeighborRadius;
  var Right = cell.x + Game.NeighborRadius;

  for (var y = Top; y <= Bot; ++y)
    for (var x = Left; x <= Right; ++x) {
      /* We don't check ourselves*/
      if (cell.y == y && cell.x == x)
        continue;

        /* If the current y is above the grid then loop around to bottom*/
      var newY = y, newX = x;
      if (y < 0)
        newY = Game.GridSize + y;
      else if (y >= Game.GridSize)
        newY = y - Game.GridSize;

      if (x < 0)
        newX = Game.GridSize + x;
      else if (x >= Game.GridSize)
        newX = x - Game.GridSize;

        console.log("Cell tor %d %d", newX, newY);

      if (Game.Cells[newX + newY * Game.GridSize].alive === true)
        ++counter;
    }

  return counter;
};

/* Set cell to non evaluated and dead */
Cell.prototype.reset = function () {
  this.evaluated = false;
  this.alive = false;
  this.color = "rgb(255, 255, 255)";
};
/* Set the cell to dead*/
Cell.prototype.setDead = function() {
  this.alive = false;
  this.color = "rgb(192,192,192)";
}
/* Set the cell to alive and evaluated*/
Cell.prototype.setAlive = function() {
  this.evaluated = true;
  this.alive = true;
  this.color = "rgb(0,0,0)";
}
/* If the cell is alive then set dead or if dead set alive */
Cell.prototype.flipState = function() {
  if (this.alive)
    this.setDead();
  else
    this.setAlive();
}
/* Get position of mouse on the canvas*/
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}
/* Get the cell position on click using mouse position*/
function getCellPos(mousePos) {
  return {
    x: Math.floor( mousePos.x / Game.CellSize),
    y: Math.floor( mousePos.y / Game.CellSize)
  };
}
/* First function called when the document is loaded MAIN */
$(document).ready(function () {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');

  /* Get the size of a cell by dividing canvas width by grid size */
  Game.CellSize = ctx.canvas.width / Game.GridSize;

  console.log("Canvas %d, %d", ctx.canvas.width, ctx.canvas.height);

  /* Initialize a grid of cells*/
  Game.initCells();
  /* Set the check neighbor function to initial value of assume dead*/
  Game.NeighborFunction = checkBoundaryDead;
  /* Start the simulation*/
  $('#startBtn').click(Game.start);
  $('#stopBtn').click(Game.stop);
  $('#stepBtn').click(Game.step);
  $('#resetBtn').click(Game.reset);
  $('#randomBtn').click(Game.randomize);
  $('#canvas').click(function (event) {
    var mousePos = getMousePos(canvas, event);
    var cellPos = getCellPos(mousePos);
    var clickedCell = Game.Cells[cellPos.x + cellPos.y * Game.GridSize];

    /* Event based on which click event occurred*/
    if (event.shiftKey)
      clickedCell.setAlive();
    else if (event.ctrlKey)
      clickedCell.setDead();
    else
      clickedCell.flipState();

    Game.draw();
  });

  /* Set initial display values here*/
  $('#speedValue').val(Game.Speed);   //Set inital speed value
  $('#gridValue').val(Game.GridSize + " x " + Game.GridSize);
  $('#radiusValue').val(Game.NeighborRadius);   //Set initial radius display value
  $('#deathValue').val(Game.LonelinessThreshold + " - " + Game.OverpopulationThreshold);
  $('#genValue').val(Game.GenerationMin + " - " + Game.GenerationMax);

  /* Menu items here */
  $('#speedSlider').slider({
    range: "min",
    min: 1,
    max: 1000,
    value: Game.Speed,
    slide: function(event, ui) {
      Game.changeSpeed(ui.value);
      $('#speedValue').val(ui.value);
    }
  });

  $('#gridSlider').slider({
    range: "min",
    value: Game.GridSize,
    min: 20,
    max: 200,
    slide: function(event, ui) {
      Game.resize(ui.value);
      $('#gridValue').val(ui.value + " x " + ui.value);
    }
  });

  $('#radiusSlider').slider({
    range: "min",
    value: Game.NeighborRadius,
    min: 1,
    max: 10,
    slide: function (event, ui) {
      var newMax = 4 * ui.value * ui.value + 4 * ui.value - 1;
      Game.NeighborRadius = ui.value;
      $('#deathSlider').slider("option", "max", newMax);  //Change death slider max
      $('#generationSlider').slider("option", "max", newMax);   //Change generation max value
      $('#radiusValue').val(ui.value);      //Change the radius display vlaue
    }
  });

  $('#deathSlider').slider({
    range: true,
    max: 4 * Game.NeighborRadius * Game.NeighborRadius + 4 * Game.NeighborRadius,
    values: [ Game.LonelinessThreshold, Game.OverpopulationThreshold ],
    slide: function(event, ui) {
      Game.LonelinessThreshold = ui.values[0];      //Set loneliness and overpopulation threshold
      Game.OverpopulationThreshold = ui.values[1];
      $('#deathValue').val(ui.values[0] + " - " + ui.values[1]);
    }
  });

  $('#generationSlider').slider({
    range: true,
    max: 4 * Game.NeighborRadius * Game.NeighborRadius + 4 * Game.NeighborRadius,
    values: [Game.GenerationMin, Game.GenerationMax],
    slide: function(event, ui) {
      Game.GenerationMin = ui.values[0];
      Game.GenerationMax = ui.values[1];
      $('#genValue').val(ui.values[0] + " - " + ui.values[1]);
    }
  });

  $('#boundaryMenu').selectmenu({
    select: function(event, ui) {
      if (ui.item.value == "boundaryDead")
        Game.NeighborFunction = checkBoundaryDead;
      else if (ui.item.value == "boundaryAlive")
        Game.NeighborFunction = checkBoundaryAlive;
      else if (ui.item.value == "boundaryToroidal")
        Game.NeighborFunction = CheckBoundaryToroidal;
    }
  });
});
