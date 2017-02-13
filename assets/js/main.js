class Node {
  constructor(status) {
    this.status = status;
  }
}

class Conway {
  constructor(grid_size) {
    this.grid_size = grid_size;

    this.speed = 1000;

    this.cells.fill(new Node, grid_size * grid_size);
  }
}

var Game = {};

var canvas;
var ctx;

Game.Speed = 1000;    //Speed to run the simulation, 1000 = 1ms
Game.Cells = [];      //Array to hold all the cell, 0 for non eval, 1 for dead, 2 for alive
Game.NewGen = [];
Game.GridSize = 20;
Game.NeighborRadius = 1;
Game.LonelinessThreshold = 2;
Game.OverpopulationThreshold = 3;
Game.GenerationMin = 3;
Game.GenerationMax = 3;
Game.IntervalID = false;    //Id of game. true if running, false if not running
/* Initialize Cells by total height and width */
Game.initCells = function () {
  var size = Game.GridSize;
  for (var y = 0; y < size; ++y)
    for (var x = 0; x < size; ++x)
    {
      Game.Cells.push(0);
      Game.NewGen.push(0);
    }

  console.log("Initializing Cells. Total cell size is: %d", Game.Cells.length);
};
/* Start the simulation if one is currently not running */
Game.start = function () {
  /* Check if game is currently running*/
  if (!Game.isRunning()) {
    console.log("Starting speed is: %d", Game.Speed);
    Game.IntervalID = setInterval(Game.run, Game.Speed);
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
  var l = Game.Cells.length;
  for (var i = 0; i < l; ++i)
    Game.Cells[i] = 0;
  /* Should clear the screen since every cell should be non evaluated */
  Game.draw();
};
/* Called with setinterval to do updates and draws */
Game.run = function () {
  Game.update();

  Game.copyNewGeneration();

  Game.draw();
};
/* Update all cells in the Game*/
Game.update = function () {
  var neighborcount;
  var cellcounter = 0;

  var size = Game.GridSize;
  for (var y = 0; y < size; ++y) {
    for (var x = 0; x < size; ++x, ++cellcounter ) {
      neighborcount = Game.NeighborFunction(x, y);

      /* If the cell is alive*/
      if (Game.Cells[cellcounter] === 2 && (neighborcount < Game.LonelinessThreshold || neighborcount > Game.OverpopulationThreshold)) {
          Game.NewGen[cellcounter] = 1;
      }
      /* If the cell is dead*/
      else if ( Game.Cells[cellcounter] != 2 && (neighborcount >= Game.GenerationMin && neighborcount <= Game.GenerationMax)) {
        //console.log("Generation");
        /* Check dead cells for generation*/
        Game.NewGen[cellcounter] = 2;
      }
      else {
        Game.NewGen[cellcounter] = Game.Cells[cellcounter];
      }
    }
  }
};
/* Call draw on all cells*/
Game.draw = function () {
  var cell;
  /* Variable for the draw y value*/
  var size = Game.GridSize;
  var l = Game.Cells.length;
  var cellSize = Game.CellSize;

  Game.clearScreen();

  for (var y = 0, drawY = 0; y < l; y += size, drawY += cellSize)
  {
    for (var x = 0, drawX = 0; x < size; ++x, drawX += cellSize )
    {
      /* Get the value of the cell */
      cell = Game.Cells[x + y];
      ctx.fillStyle = (cell === 0) ? "rgb(255, 255, 255)" : (cell === 1) ? "rgb(200, 200, 200)" : "rgb(0,0, 0)";
      ctx.fillRect(drawX, drawY, Game.CellSize, Game.CellSize);
    }
  }
};

Game.clearScreen = function() {
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

Game.copyNewGeneration = function() {
  var l = Game.NewGen.length;
  for (var i = 0; i < l; ++i)
    Game.Cells[i] = Game.NewGen[i];
}
/* Randomize all cells to be either alive or dad*/
Game.randomize = function () {
  //console.log("Randomize called\n");

  var l = Game.Cells.length;
  for (var i = 0; i < l; ++i)
    Game.NewGen[i] = Math.round(Math.random() + 1);

  Game.copyNewGeneration();

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
  Game.NewGen.length = 0;
  /* Reinitialize new cells*/
  Game.initCells();
};
/* Change the speed of the simulation to the input value*/
Game.changeSpeed = function(newspeed) {
  Game.stop();
  Game.Speed = newspeed;
  Game.start();
}

    /* Initial color of a cell is non existant white*/
/* Find all of the cells that are alive within the radius */
function checkBoundaryDead(cellX, cellY) {
//  console.log("Check boundary dead called");

  /* Counts the number of neighbors alive within the radius */
  var counter = 0;

  /* Get boundaries of the radius to check, currently just stop at edges*/
  var Top = Math.max(cellY - Game.NeighborRadius, 0);
  var Bot = Math.min(cellY + Game.NeighborRadius, Game.GridSize - 1);
  var Left = Math.max(cellX - Game.NeighborRadius, 0);
  var Right = Math.min(cellX + Game.NeighborRadius, Game.GridSize - 1);

  var rowY = Top * Game.GridSize;
  for (var y = Top; y <= Bot; ++y, rowY += Game.GridSize) {
    for (var x = Left; x <= Right; ++x) {
      /* If the neighbor is out of bounds then we consider it dead and dont count it */
      if (cellY === y && cellX === x)
        continue;

      /* If the neighbor is alive increment the counter*/
      if (Game.Cells[x + rowY] === 2)
        ++counter;
    }
  }

  return counter;
};

function checkBoundaryAlive(cellX, cellY) {
  var counter = 0;

  /* Find the start y row value in the array*/
  var rowY = (cellY - Game.NeighborRadius) * Game.GridSize;
  /* Get boundaries of the radius to check, currently just stop at edges*/
  for (var y = cellY - Game.NeighborRadius; y <= cellY + Game.NeighborRadius; ++y, rowY += Game.GridSize)
    for (var x = cellX - Game.NeighborRadius; x <=  cellX + Game.NeighborRadius; ++x) {
      /* We don't check ourselves*/
      if (cellY == y && cellX == x)
        continue;

      /* If the neighbor is alive increment the counter*/
      /* If in bounds check if cell is alive*/
      if (y < 0 || y >= Game.GridSize || x < 0 || x >= Game.GridSize || Game.Cells[x + rowY] == 2)
        ++counter;
    }

  return counter;
  };

function CheckBoundaryToroidal(cellX, cellY) {
  var counter = 0;

  /* Run through for all cells with the radius*/
  for (var y = cellY - Game.NeighborRadius; y <= cellY + Game.NeighborRadius; ++y)
  {
    var newY = y;
    if (y < 0)
      newY = Game.GridSize + y;
    else if (y >= Game.GridSize)
      newY = y - Game.GridSize;

    for (var x = cellX - Game.NeighborRadius; x <= cellX + Game.NeighborRadius; ++x) {
        /* If the current y is above the grid then loop around to bottom*/
      var newX = x;
      if (x < 0)
        newX = Game.GridSize + x;
      else if (x >= Game.GridSize)
        newX = x - Game.GridSize;

      //console.log("Cell tor %d %d", newX, newY);

      /* We don't check ourselves*/
      if (cellY == y && cellX == x)
        continue;

      if (Game.Cells[newX + newY * Game.GridSize] == 2)
        ++counter;
    }
  }

  return counter;
};

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

    var cellLocation = cellPos.x + cellPos.y * Game.GridSize;

    /* Event based on which click event occurred*/
    if (event.shiftKey)
      Game.Cells[cellLocation] = 2;
    else if (event.ctrlKey)
      Game.Cells[cellLocation] = 1;
    else
      Game.Cells[cellLocation] = (Game.Cells[cellLocation] != 2) ? 2 : 1;

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
