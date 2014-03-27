$(document).ready(function() {

	$('#container').css('display', 'none');
    $('#login_section').css('display', 'block');

    // Initialize socket.io.
    // document.location.host returns the host of the current page.
    var socket = io.connect('http://' + document.location.host);

    // If a welcome message is received, it means the chat room is available.
    // The Log In button will be then enabled.
    socket.on(
      'welcome',
      function(message) {
        $('#status').text(message);
        $('#login').attr('disabled', false);
      });

    // If a login_ok message is received, proceed to the chat section.
    socket.on(
      'login_ok',
      function() {
        $('#login_section').css('display', 'none');
        $('#container').css('display', 'block');
        $('#status').text('Logged In.');
      });

    // If a login_failed message is received, stay in the login section but
    // display an error message.
    socket.on(
      'login_failed',
      function() {
        $('#status').text('Failed to log in!');
      });

    // When the Log In button is clicked, the provided function will be called,
    // which sends a login message to the server.
    $('#login').click(function() {
      var name = $('#name').val();
      if (name) {
        name = name.trim();
        if (name.length > 0) {
          socket.emit('login', { user_name: name });
        }
      }
      // Clear the input field.
      $('#name').val('');
    });
  });
  
  
  
	
	var screenWidth = screen.availWidth;
	//var screenHeight = screen.availHeight - 100;
	var screenHeight = screenWidth * .65;
	var boardWidth = screenWidth * .8;
	var boardHeight = screenHeight * .95;
	var hexSizeMod = .12;
	var hexWidth = boardWidth * hexSizeMod;
	var hexHeight = boardHeight * hexSizeMod;
	var trailWidth = screenWidth / 91.07;
	var trailHeight = hexWidth * 0.57735;
	var hexSide = trailHeight;
	var hexPosStartX = screenWidth * .27;
	var hexPosStartY = screenHeight * .467;
	//two below are for diagonal spacing
	var hexSpacingX = trailWidth;
	var hexSpacingY = .57735 * hexSpacingX; //tan(30) * hexSpacingX
	
	var canvas = new Kinetic.Stage({
		container: 'container',
		width: screenWidth,
		height: screenHeight
	});
	
	/* Will hold background */
	var backgroundLayer = new Kinetic.Layer(); //first layer
	
	/* Will hold board */
	var boardLayer = new Kinetic.Layer(); //second layer
	
	/* Will hold hexagons */
	var hexagonLayer = new Kinetic.Layer(); //third layer
	
	/* Will hold chits, outposts, towns, trails */
	var pieceLayer = new Kinetic.Layer(); //fourth layer
	
	/* Will hold menu */
	var menuLayer = new Kinetic.Layer(); //fifth layer
	
	function drawAllLayers()
	{	
		canvas.clear();
		canvas.add(backgroundLayer);
		canvas.add(boardLayer);
		canvas.add(hexagonLayer);
		canvas.add(pieceLayer);
		canvas.add(menuLayer);
	}
	
	/* Place background */
	var rect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: screenWidth,
		height: screenHeight,
		fill: 'black',
		stroke: 'red',
		strokeWidth: 4
	});
	// add the background to canvas
	backgroundLayer.add(rect);
	drawAllLayers()
	//canvas.add(backgroundLayer);
	
	
	//place board
	var texas = new Image();
	texas.src = 'IMG/Board.png';
	texas.onload = function() {
		var board = new Kinetic.Image({
			x: screenWidth * .1,
			y: 0,
			image: texas,
			width: boardWidth,
			height: boardHeight
		});
	boardLayer.add(board);
	//canvas.add(boardLayer);
	drawAllLayers()
	};
	
	//place hexagons
	var arrayHexPos = [];
	arrayHexPos.push(hexPosStartX);
	arrayHexPos.push(hexPosStartY);
	
	arrayHexPos.push(hexPosStartX + hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(hexPosStartY - hexHeight/2 - hexSpacingY);
	
	arrayHexPos.push(arrayHexPos[2]);
	arrayHexPos.push(arrayHexPos[3] - hexHeight - trailWidth);
	
	arrayHexPos.push(arrayHexPos[4]);
	arrayHexPos.push(arrayHexPos[5] - hexHeight - trailWidth);
	
	arrayHexPos.push(arrayHexPos[6]+ hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(arrayHexPos[7] + hexHeight/2 + hexSpacingY);
	
	arrayHexPos.push(arrayHexPos[8]);
	arrayHexPos.push(arrayHexPos[9] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[10]);
	arrayHexPos.push(arrayHexPos[11] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[8]+ hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(arrayHexPos[9] + hexHeight/2 + hexSpacingY);
	
	arrayHexPos.push(arrayHexPos[14]);
	arrayHexPos.push(arrayHexPos[15] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[16]);
	arrayHexPos.push(arrayHexPos[17] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[18]);
	arrayHexPos.push(arrayHexPos[19] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[14] + hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(arrayHexPos[15] + hexHeight/2 + hexSpacingY);
	
	arrayHexPos.push(arrayHexPos[22]);
	arrayHexPos.push(arrayHexPos[23] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[24]);
	arrayHexPos.push(arrayHexPos[25] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[22] + hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(arrayHexPos[23] - hexHeight/2 - hexSpacingY);
	
	arrayHexPos.push(arrayHexPos[28]);
	arrayHexPos.push(arrayHexPos[29] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[30]);
	arrayHexPos.push(arrayHexPos[31] + hexHeight + trailWidth);
	
	var arrayHexs = [];
	var hexPic = new Image();
	hexPic.src = 'IMG/Cotton_1.png';
	hexPic.onload = function(){
		for(var i=0; i<17; i++) //17
		{
			var hex = new Kinetic.Image({
				x:arrayHexPos[i*2],
				y:arrayHexPos[i*2+1],
				image: hexPic,
				width: hexWidth,
				height: hexHeight
			});
			arrayHexs.push(hex);
			hexagonLayer.add(arrayHexs[i]);
		}
		//canvas.add(hexagonLayer);
		drawAllLayers()
	};
	
	
	var arraySettlementsPos = [];
	arraySettlementsPos.push(hexPosStartX);
	arraySettlementsPos.push(hexPosStartY);
	
	var arraySettlements = [];
	var settlementImg = new Image();
	settlementImg.src='IMG/settlement.jpg';
	settlementImg.onload = function() {
		for(var i=0; i<1; i++) //17
		{
			var settlement = new Kinetic.Image({
				x: arraySettlementsPos[0],
				y: arraySettlementsPos[1],
				image: settlementImg,
				width: 30,
				height: 30
			});
			arraySettlements.push(settlement);
			pieceLayer.add(arraySettlements[i])
		}
		//canvas.add(pieceLayer);
		drawAllLayers()
	};
	
	
	/* menu setup */
	var menuPosStartX = screenWidth * .02;
	var menuPosStartY = screenHeight * .05;
	var menuButHeight = screenHeight * .1;
	var menuButWidth = screenWidth * .1;
	var menuButSpacing = screenHeight * .02;
	var menuTrade = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY,
		fill: 'blue',
		width: menuButWidth,
		height: menuButHeight,
	});
	menuTrade.on('click', function() {
        $('#tradeModal').modal('show')
    });
	
	var menuDuel = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + menuButHeight + menuButSpacing,
		fill: 'red',
		width: menuButWidth,
		height: menuButHeight
	});
	var menuBuy = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*2,
		fill: 'white',
		width: menuButWidth,
		height: menuButHeight
	});
	var menuCards = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*3,
		fill: 'blue',
		width: menuButWidth,
		height: menuButHeight
	});
	menuLayer.add(menuTrade);
	menuLayer.add(menuDuel);
	menuLayer.add(menuBuy);
	menuLayer.add(menuCards);
	drawAllLayers();
});	
	
	
	
	