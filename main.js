var Game = {};

Game.fps = 60;

var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var canvas = $('#canvas');
var ctx = $('#canvas').get(0).getContext('2d');

Game.run = function() {
	Game.update();
	Game.draw();
};

Game.draw = function () {
	
};

Game.update = function() {
	
};

Game.IntervalID = setInterval( Game.run, 1000, Game.fps );

//var randomBtn = document.getElementById("randomBtn");
$("#screenwidthBtn").click(function() {
	var width = $("#screenwidth").val();
	alert(width);
	canvas.attr("width", width);
});

$("#screenheightBtn").click(function() {
	alert("Height has been pressed");
});

$("#resetBtn").click(function() {
	alert("Reset pressed");
});