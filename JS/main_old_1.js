
//initialize stage of game
var canvas = new Kinetic.Stage({
		container: 'container',
		width: 1,
		height: 1
	});

//preload ALL of the images used in the game
//input an array of javascript images
//output an array of Kinetic.image
function preLoadImages(arr){
    var newimages=[], loadedimages=0
    var postaction=function(){}
    var arr=(typeof arr!="object")? [arr] : arr
    function imageloadpost(){
        loadedimages++
        if (loadedimages==arr.length){
            postaction(newimages); //call postaction and pass in newimages array as parameter
			console.log('loaded images');
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image();
        newimages[i].src=arr[i];
		//setTimeout(function() {console.log('Waiting on image')}, 50000);
        newimages[i].onload=function(){
            imageloadpost();
			console.log('Loaded image ' + i);
        }
        newimages[i].onerror=function(){
            imageloadpost();
			console.log('ERROR LOADING IMAGE');
        }
    }
    return { //return blank object with done() method
        done:function(f){
            postaction=f || postaction //remember user defined callback functions to be called when images load
        }
    }
}
//check if the client is run on a mobile browser
function detectmob() { 
	if( navigator.userAgent.match(/Android/i)
	 || navigator.userAgent.match(/webOS/i)
	 || navigator.userAgent.match(/iPhone/i)
	 || navigator.userAgent.match(/iPad/i)
	 || navigator.userAgent.match(/iPod/i)
	 || navigator.userAgent.match(/BlackBerry/i)
	 || navigator.userAgent.match(/Windows Phone/i)
	 )
	{
		return true;
	}
	else 
	{
		return false;
	}
}

//basically the 'main' function of the client
//the first part of this function will be used to initialize the game board
var arrayImageAddreses = [ 'IMG/Board_2.png', 	//0
					'IMG/Desert.png', 			//1
					'IMG/Cotton_2.png', 		//2
					'IMG/Limestone.png', 		//3
					'IMG/Oil.png', 				//4
					'IMG/RedClay.png', 			//5 
					'IMG/Cattle.png', 			//6
					'IMG/settlement.png',		//7 
					'IMG/ColorDice.png', 		//8
					'IMG/rollDice.png', 		//9
					'IMG/texaspasture2.jpg',	//10 
					'IMG/trophyclip.png', 		//11
					'IMG/trailclip.png', 		//12
					'IMG/tradeclip.png',		//13
					'IMG/redclayclip.png', 		//14
					'IMG/posseclip.png', 		//15
					'IMG/oilclip.png', 			//16
					'IMG/limestoneclip.png', 	//17 
					'IMG/hammerclip.png', 		//18
					'IMG/duelclip.png', 		//19
					'IMG/diceclip.png', 		//20
					'IMG/cottonclip.png',		//21
					'IMG/cattleclip.png', 		//22
					'IMG/endTurn.png' 			//23
					];
preLoadImages(arrayImageAddreses).done(function(arrayImages){
//websocket communication code
		var messageCopy;

		$('#accept-trade-button').click(function () {
			socket.emit("trade_accepted", messageCopy);
			$('#receive-trade-modal').modal('hide');
			$('#receive-trade-form').find("input[type=text], textarea").val("0");
			messageCopy = null;
		});
		
		$('#reject-trade-button').click(function () {
			var firstPlayer = messageCopy.firstPlayer;
			var secondPlayer = messageCopy.secondPlayer;
			socket.emit("trade_rejected", {firstPlayer: firstPlayer, secondPlayer: secondPlayer});
			$('#receive-trade-modal').modal('hide');
			$('#receive-trade-form').find("input[type=text], textarea").val("0");
			messageCopy = null;
		});
		
		$('#counter-trade-button').click(function() {
			var firstPlayer = messageCopy.firstPlayer;
			var secondPlayer = messageCopy.secondPlayer;
		
			var tradeTerms = [];
			var $inputs = $('#receive-trade-form :input');
			$inputs.each(function(i) {
					tradeTerms[i] = $(this).val();
			});
			tradeTerms.splice(0,1);
			console.log(tradeTerms);
		
			var firstPlayerResources = [];
			var secondPlayerResources = [];
			for(var i = 0; i < tradeTerms.length; i++) {
				if(i % 2 === 0 ) {
					firstPlayerResources.push(tradeTerms[i]);
				}
				else {
					secondPlayerResources.push(tradeTerms[i]);
				}
			}
			socket.emit("trade_player", {firstPlayer: secondPlayer, secondPlayer: firstPlayer, 
										 firstPlayerResources: secondPlayerResources, 
										 secondPlayerResources: firstPlayerResources});
			
			$('#receive-trade-modal').modal('hide');
			$('#receive-trade-form').find("input[type=text], textarea").val("0");
			messageCopy = null;
		});
	
	//This player variable will keep track of all of the players data on the client side
	var player = new create_player();
	
	$("#background-image").fullscreenBackground();
	$('.login-section').css('display', 'block');
	$('#container').css('display', 'none');

    // Initialize socket.io.
    var socket = io.connect('http://' + document.location.host);

    socket.on(
      'welcome',
      function() {
        $('#join-game-button').attr('disabled', false);
      });

    socket.on(
      'login_ok',
      function(message) {
        $( "div" ).remove(".login-section");
        $( "div" ).remove("#background-image");
        $('#container').css('display', 'block');
		player.playerId = message.playerId;
		player.playerName = message.playersName;
		player.playerColor = message.playersColor;
      });

    socket.on(
      'login_failed',
      function() {
        
      });
	  
	// If a end_turn message is received, update isTurn of all players
	socket.on(
      'end_turn',
      function(message) {
			checkTurn(message.playerTurns[player.playerId].isTurn);
      });

	// If a resource_production message is received, show dice roll animation and display roll value
	socket.on(
		'resource_production',
		function(message) { 
			if(!isDiceOn)
			{
			    player.totalResources = message.pArray[player.playerId].totalResources;
			    player.numCotton = message.pArray[player.playerId].numCotton;
			    player.numLimestone = message.pArray[player.playerId].numLimestone; 
			    player.numOil = message.pArray[player.playerId].numOil;
			    player.numCattle = message.pArray[player.playerId].numCattle;
			    player.numClay = message.pArray[player.playerId].numClay;
				
				isDiceOn = true;
				menuDie1.start();
				menuDie2.start();
				
				setTimeout( function() { isDiceOn = false; menuDie1.stop(); menuDie2.stop();}, 1500);
				
				var d1 = parseInt(message.dArray[0]);
				var d2 = parseInt(message.dArray[1]);
				
				var totValue = d1 + d2;
			}	 
		}
	);
	
	// If the buy_outpost message is received...
	socket.on(
		'buy_outpost',
		function(message) {
			for(var i = 0; i < arraySettlements.length; i++)
			{
				arraySettlements[i].listening(false);
				if(arraySettlements[i].getId() == message.OPID)
				{
					arraySettlements[i].shadowEnabled(true);
					console.log(arraySettlements[i]);
				}
			}

	});
	
	socket.on(
      'trade_player',
      function tradeTerms(message) {
			if(player.playerId == message.secondPlayer) {
				messageCopy = message;

				$('#receive-trade-form :input:first').val(message.firstPlayer);
				var j = 0;
				$('#receive-trade-form :input').each(function(i) {
					if(i % 2 === 0 && i != 0) {
						$(this).val(message.secondPlayerResources[j]);
						j = j + 1;
					}
				});
				j = 0;
				$('#receive-trade-form :input').each(function(i) {
					if(i % 2 !== 0 && i != 0) {
						$(this).val(message.firstPlayerResources[j]);
						j = j + 1;
					}
				});
				$('#receive-trade-modal').modal('show');		
			}
      });

		socket.on(
      'trade_accepted',
      function tradeTerms(message) {
      		console.log(message);
			if(player.playerId == message.firstPlayer || player.playerId == message.secondPlayer) {
				player.totalResources = message.pArray[player.playerId].totalResources;
				player.numCotton = message.pArray[player.playerId].numCotton;
				player.numLimestone = message.pArray[player.playerId].numLimestone;
				player.numOil = message.pArray[player.playerId].numOil;
				player.numCattle = message.pArray[player.playerId].numCattle;
				player.numClay = message.pArray[player.playerId].numClay;

				resourceCottonText.setText((player.numCotton).toString());
				resourceLimestoneText.setText((player.numLimestone).toString());
				resourceOilText.setText((player.numOil).toString());
				resourceCattleText.setText((player.numCattle).toString());
				resourceRedClayText.setText((player.numClay).toString());
				menuLayer.draw();

				$('#accept-trade-modal').modal('show');		
			}
      });

	  socket.on(
      'trade_rejected',
      function tradeTerms(message) {
			if(player.playerId == message.firstPlayer || player.playerId == message.secondPlayer) {
				$('#reject-trade-modal').modal('show');		
			}
      });

    $('#join-game-button').click(function() {
      var name = $('#player-name').val();
      if (name) {
        name = name.trim();
        if (name.length > 0) {
          socket.emit('login', { user_name: name });
        }
      }
      // Clear the input field.
      $('#player-name').val('');
    });

	function checkTurn(bool)
	{
		if(bool) {
			console.log('It is your turn');
			menuTrade.listening(true);
			menuEndTurn.listening(true);
			menuRollDice.listening(true);
			player.isTurn = true;
		}
		else {
			console.log('It is NOT your turn');
			menuTrade.listening(false);
			menuEndTurn.listening(false);
			menuRollDice.listening(false);
			player.isTurn = false;
		}
	}
	
	//need to get this from client
	hexResourceArray = [4, 2, 5, 1, 1, 4, 2, 3, 2, 5, 3, 0, 4, 3, 5, 1, 5];

//
	//arrayImages is the array of Kinetic.image already preloaded
	var texas = arrayImages[0];
	var hexDesertPic = arrayImages[1];
	var hexCottonPic = arrayImages[2];
	var hexLimestonePic = arrayImages[3];
	var hexOilPic = arrayImages[4];
	var hexRedClayPic = arrayImages[5];
	var hexCattlePic = arrayImages[6];
	var settlementImg = arrayImages[7];
	var diePic = arrayImages[8];
	var rollDicePic = arrayImages[9];
	var texasPasture = arrayImages[10];
	var trophyClip = arrayImages[11];
	var trailClip = arrayImages[12];
	var tradeClip = arrayImages[13];
	var redClayClip = arrayImages[14];
	var posseClip = arrayImages[15];
	var oilClip = arrayImages[16];
	var limestoneClip = arrayImages[17];
	var buyClip = arrayImages[18];
	var duelClip = arrayImages[19];
	var diceClip = arrayImages[20];
	var cottonClip = arrayImages[21];
	var cattleClip = arrayImages[22];
	var endTurnPic = arrayImages[23];
	
	//sizing properties
	//get screen size for mobile or desktop
	if(window.outerWidth > screen.availWidth)
		var screenWidth = window.outerWidth;
	else
		var screenWidth = screen.availWidth;
		
	var screenHeight = screenWidth * .65;
	var boardWidth = screenWidth * .8;
	var boardHeight = screenHeight * .95;
	//sizing for hexagons and trails
	var hexSizeMod = .12;
	var hexWidth = boardWidth * hexSizeMod;
	var hexHeight = boardHeight * hexSizeMod;
	var trailWidth = screenWidth / 91.07;
	var trailHeight = hexWidth * 0.57735;
	var hexSide = trailHeight;
	var hexPosStartX = screenWidth * .27;
	var hexPosStartY = screenHeight * .467;
	//two below are for diagonal spacing of hexagons
	var hexSpacingX = trailWidth;
	var hexSpacingY = .57735 * hexSpacingX; //tan(30) * hexSpacingX
	//size of outposts/town
	var settlementWidth = hexWidth * .2;
	var settlementHeight = hexWidth * .2;
	var settlementMoveRight = settlementWidth/2;
	var settlementMoveLeft = 0 - settlementWidth/2;
	var settlementMoveDown = settlementHeight/2;
	var settlementMoveUp = 0 - settlementHeight/2;
	//menu underlay vars
	var menuUnderlayStartY1 = screenHeight - screenWidth * .1302;
	var menuUnderlayStartY2 = menuUnderlayStartY1 * .5
	
	//set dimensions for stage
	canvas.setWidth(screenWidth);
	canvas.setHeight(screenHeight);
	canvas.setId('canvas');
	
	//initialize layers to go on stage
	/* Will hold background */
	var backgroundLayer = new Kinetic.Layer({
		id: 'backgroundLayer'
	}); //first layer
	
	/* Will hold board */
	var boardLayer = new Kinetic.Layer({
		id: 'boardLayer'
	}); //second layer
	
	/* Will hold hexagons */
	var hexagonLayer = new Kinetic.Layer({
		id: 'hexagonLayer'
	}); //third layer
	
	/* Will hold chits, outposts, towns, trails */
	var pieceLayer = new Kinetic.Layer({
		id: 'pieceLayer'
	}); //fourth layer
	
	/* Will hold menu */
	var menuLayer = new Kinetic.Layer({
		id: 'menuLayer'
	}); //fifth layer
	
	//refreshes the layers and draws canvas
	function drawAllLayers()
	{	
		canvas.clear();
		backgroundLayer.remove();
		boardLayer.remove();
		hexagonLayer.remove();
		pieceLayer.remove();
		menuLayer.remove();
		canvas.add(backgroundLayer);
		canvas.add(boardLayer);
		canvas.add(hexagonLayer);
		canvas.add(pieceLayer);
		canvas.add(menuLayer);
	}
	
	/* Place background */
	var rect = new Kinetic.Image({
		x: 0,
		y: 0,
		width: screenWidth,
		height: screenHeight,
		image: texasPasture
	});
	// add the background to canvas
	backgroundLayer.add(rect);
	
	var board = new Kinetic.Image({
		x: screenWidth * .1,
		y: 0,
		image: texas,
		width: boardWidth,
		height: boardHeight,
		id: 'texas'
	});
	boardLayer.add(board);
	
	//make array that hold hexagon positions
	{
	var arrayHexPos = [];
	arrayHexPos.push(hexPosStartX);
	arrayHexPos.push(hexPosStartY);
	
	arrayHexPos.push(hexPosStartX + hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(hexPosStartY - hexHeight/2 - hexSpacingY + (- hexHeight - trailWidth)*2);
	
	arrayHexPos.push(arrayHexPos[2]);
	arrayHexPos.push(arrayHexPos[3] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[4]);
	arrayHexPos.push(arrayHexPos[5] + hexHeight + trailWidth);
	
	arrayHexPos.push(arrayHexPos[2]+ hexWidth - hexSide/2 + hexSpacingX);
	arrayHexPos.push(arrayHexPos[3] + hexHeight/2 + hexSpacingY);
	
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
	}
	
	//set properties for kinetic hexagon types
	for(var i = 0; i < 17; i++)
	{
		var hex = new Kinetic.Image({
			x:arrayHexPos[i*2],
			y:arrayHexPos[i*2+1],
			width: hexWidth,
			height: hexHeight,
			id: 'H' + i
		});
		switch(hexResourceArray[i]) 
		{
			case 0: hex.setImage(hexDesertPic); break;
			case 1: hex.setImage(hexCottonPic); break;
			case 2: hex.setImage(hexLimestonePic); break;
			case 3: hex.setImage(hexOilPic); break;
			case 4: hex.setImage(hexRedClayPic); break;
			case 5: hex.setImage(hexCattlePic); break;
		}
		hexagonLayer.add(hex);
	}
	
	//function that finds the coordinates of a specific
		//corner of a hexagon
	//hexId: the index of the hex in arrayHexs
	//corner: the corner you want to get the coordinate for	
		/*
			0 ____ 1
			/      \
		5  /        \ 2
		   \        /
			\ ____ /
			4	   3
		*/
	//coord: 0 = X  	1 = Y
	function findCoordHex(hexId, corner, coord)
	{
		//var X = arrayHexs[hexId].getAbsolutePosition().x;
		//var Y = arrayHexs[hexId].getAbsolutePosition().y;
		//console.log(hexagonLayer.find('#hex')[0]);//.getAbsolutePosition().x;
		//console.log(hexagonLayer.find('#hex')[1]);//.getAbsolutePosition().y;
		var X = canvas.find('#'+hexId)[0].getAbsolutePosition().x; 
		var Y = canvas.find('#' + hexId)[0].getAbsolutePosition().y; 
		if(corner == 0)
		{
			if(coord) //true when wanting Y
				return Y;
			else //when wanting X
				return X + hexSpacingX;
		}
		else if(corner == 1)
		{
			if(coord) //true when wanting Y
				return Y;
			else //when wanting X
				return X + hexSpacingX + hexSide;
		}
		else if(corner == 2)
		{
			if(coord) //true when wanting Y
				return Y + hexHeight / 2;
			else //when wanting X
				return X + hexWidth;
				//return X + hexSpacingX * 2 + hexSide;
		}
		else if(corner == 3)
		{
			if(coord) //true when wanting Y
				return Y + hexHeight;
			else //when wanting X
				return X + hexSpacingX + hexSide;
		}
		else if(corner == 4)
		{
			if(coord) //true when wanting Y
				return Y + hexHeight;
			else //when wanting X
				return X + hexSpacingX;
		}
		else if(corner == 5)
		{
			if(coord) //true when wanting Y
				return Y + hexHeight/2;
			else //when wanting X
				return X;
		}
	}
	//add layers to stage
	canvas.add(backgroundLayer);
	canvas.add(boardLayer);
	canvas.add(hexagonLayer);
	
		var arrayTrails = [];
	var arrayTrailsPos = []; //will hold coordinates for 
	var arrayTrailsRot = [];
	{
	arrayTrailsPos.push(findCoordHex('H0',0,0) + screenWidth * .00469);
	arrayTrailsPos.push(findCoordHex('H0',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H0',5,0) - screenWidth * .00885);
	arrayTrailsPos.push(findCoordHex('H0',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H0',0,0) + screenWidth * .01459);
	arrayTrailsPos.push(findCoordHex('H0',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H0',4,0) + screenWidth * .01459);
	arrayTrailsPos.push(findCoordHex('H0',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H1',0,0) + screenWidth * .00469);
	arrayTrailsPos.push(findCoordHex('H1',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H1',5,0) - screenWidth * .00885);
	arrayTrailsPos.push(findCoordHex('H1',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H2',0,0) + screenWidth * .00469);
	arrayTrailsPos.push(findCoordHex('H2',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H2',5,0) - screenWidth * .00885);
	arrayTrailsPos.push(findCoordHex('H2',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H3',0,0) + screenWidth * .00469);
	arrayTrailsPos.push(findCoordHex('H3',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H3',5,0) - screenWidth * .00885);
	arrayTrailsPos.push(findCoordHex('H3',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H0',3,0) + screenWidth * .01308);
	arrayTrailsPos.push(findCoordHex('H0',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);

	arrayTrailsPos.push(findCoordHex('H1',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H1',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H1',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H1',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H3',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H3',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H3',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H3',4,1) + trailWidth);
	arrayTrailsRot.push(270);

	arrayTrailsPos.push(findCoordHex('H1',2,0) + screenWidth * .00885);//down right
	arrayTrailsPos.push(findCoordHex('H1',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H1',3,0) + screenWidth * .01308);//top right
	arrayTrailsPos.push(findCoordHex('H1',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H2',2,0) + screenWidth * .00885);//down right
	arrayTrailsPos.push(findCoordHex('H2',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H2',3,0) + screenWidth * .01308);//top right
	arrayTrailsPos.push(findCoordHex('H2',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H3',2,0) + screenWidth * .00885);//down right
	arrayTrailsPos.push(findCoordHex('H3',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H3',3,0) + screenWidth * .01308);//top right
	arrayTrailsPos.push(findCoordHex('H3',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H6',5,0) - screenWidth * .00885);//left down
	arrayTrailsPos.push(findCoordHex('H6',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H4',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H4',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H4',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H4',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H6',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H6',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H6',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H6',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H4',2,0) + screenWidth * .00885);//up right
	arrayTrailsPos.push(findCoordHex('H4',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);

	arrayTrailsPos.push(findCoordHex('H7',0,0) + screenWidth * .00469);//left up
	arrayTrailsPos.push(findCoordHex('H7',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H7',5,0) - screenWidth * .00885);//left down
	arrayTrailsPos.push(findCoordHex('H7',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H8',0,0) + screenWidth * .00469);//left up
	arrayTrailsPos.push(findCoordHex('H8',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H8',5,0) - screenWidth * .00885);//left down
	arrayTrailsPos.push(findCoordHex('H8',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H9',0,0) + screenWidth * .00469);//left up
	arrayTrailsPos.push(findCoordHex('H9',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H9',5,0) - screenWidth * .00885);//left down
	arrayTrailsPos.push(findCoordHex('H9',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H10',0,0) + screenWidth * .00469);//left up
	arrayTrailsPos.push(findCoordHex('H10',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H10',5,0) - screenWidth * .00885);//left down
	arrayTrailsPos.push(findCoordHex('H10',5,1) + screenWidth * .00573);
	arrayTrailsRot.push(-33);
	
	arrayTrailsPos.push(findCoordHex('H7',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H7',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H7',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H7',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	
	arrayTrailsPos.push(findCoordHex('H9',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H9',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H9',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H9',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H10',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H10',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H7',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H7',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);

	arrayTrailsPos.push(findCoordHex('H7',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H7',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);

	arrayTrailsPos.push(findCoordHex('H8',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H8',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
		
	arrayTrailsPos.push(findCoordHex('H8',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H8',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);

	
	arrayTrailsPos.push(findCoordHex('H9',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H9',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
		
	arrayTrailsPos.push(findCoordHex('H9',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H9',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);

	arrayTrailsPos.push(findCoordHex('H10',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H10',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
		
	arrayTrailsPos.push(findCoordHex('H10',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H10',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H11',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H11',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H11',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H11',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H13',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H13',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H13',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H13',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H14',0,0) + screenWidth * .00469);//left up
	arrayTrailsPos.push(findCoordHex('H14',0,1) - screenWidth * .00573);
	arrayTrailsRot.push(33);
	
	arrayTrailsPos.push(findCoordHex('H11',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H11',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H11',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H11',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H12',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H12',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H12',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H12',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H13',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H13',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H13',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H13',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H14',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H14',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H14',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H14',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H16',0,0) + screenWidth * .01459);//up
	arrayTrailsPos.push(findCoordHex('H16',0,1));
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H16',4,0) + screenWidth * .01459);//down
	arrayTrailsPos.push(findCoordHex('H16',4,1) + trailWidth);
	arrayTrailsRot.push(270);
	
	arrayTrailsPos.push(findCoordHex('H14',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H14',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);

	arrayTrailsPos.push(findCoordHex('H14',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H14',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);

	arrayTrailsPos.push(findCoordHex('H15',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H15',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H15',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H15',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	
	arrayTrailsPos.push(findCoordHex('H16',2,0) + screenWidth * .00885);//top right
	arrayTrailsPos.push(findCoordHex('H16',2,1) - screenWidth * .00573);
	arrayTrailsRot.push(-213);
	
	arrayTrailsPos.push(findCoordHex('H16',3,0) + screenWidth * .01308);//down right
	arrayTrailsPos.push(findCoordHex('H16',3,1) + screenWidth * .00889);
	arrayTrailsRot.push(213);
	}
	
	//make trails and add them to pieceLayer and then stage
	for(var i=0; i<69; i++) //
	{
		var trail = new Kinetic.Rect({
			x: arrayTrailsPos[i*2],
			y: arrayTrailsPos[i*2+1],
			fill: 'orange',
			width: trailWidth,
			height: trailHeight - screenWidth * .01042,
			rotation: arrayTrailsRot[i],
			id: 'T' + i
		});
		arrayTrails.push(trail);
		pieceLayer.add(arrayTrails[i]);
		console.log(screenWidth);
	}

	//put coordinates for settlements into array
	{
	var arraySettlementsPos = [];
	
	arraySettlementsPos.push(findCoordHex('H0',0,0) + settlementMoveLeft/4);//0
	arraySettlementsPos.push(findCoordHex('H0',0,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H0',5,0) + settlementMoveLeft);//1
	arraySettlementsPos.push(findCoordHex('H0',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H0',4,0));//2
	arraySettlementsPos.push(findCoordHex('H0',4,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H1',0,0) + settlementMoveLeft/4);//3
	arraySettlementsPos.push(findCoordHex('H1',0,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H1',5,0) + settlementMoveLeft);//4
	arraySettlementsPos.push(findCoordHex('H1',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H1',4,0));//5
	arraySettlementsPos.push(findCoordHex('H1',4,1) + settlementMoveUp/2);

	arraySettlementsPos.push(findCoordHex('H2',5,0) + settlementMoveLeft);//6
	arraySettlementsPos.push(findCoordHex('H2',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H2',4,0));//7
	arraySettlementsPos.push(findCoordHex('H2',4,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H3',5,0) + settlementMoveLeft);//8
	arraySettlementsPos.push(findCoordHex('H3',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H3',4,0));//9
	arraySettlementsPos.push(findCoordHex('H3',4,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H0',3,0));//10
	arraySettlementsPos.push(findCoordHex('H0',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H1',1,0));//11
	arraySettlementsPos.push(findCoordHex('H1',1,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H1',2,0) + settlementMoveLeft);//12
	arraySettlementsPos.push(findCoordHex('H1',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H1',3,0));//13
	arraySettlementsPos.push(findCoordHex('H1',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H2',2,0) + settlementMoveLeft/2);//14
	arraySettlementsPos.push(findCoordHex('H2',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H2',3,0));//15
	arraySettlementsPos.push(findCoordHex('H2',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H6',0,0));//16
	arraySettlementsPos.push(findCoordHex('H6',0,1) + settlementMoveUp * 1.5);
	arraySettlementsPos.push(findCoordHex('H6',5,0) + settlementMoveLeft * 1.5);//17
	arraySettlementsPos.push(findCoordHex('H6',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H6',4,0));//18
	arraySettlementsPos.push(findCoordHex('H6',4,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H4',1,0));//19
	arraySettlementsPos.push(findCoordHex('H4',1,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H4',2,0) + settlementMoveLeft);//20
	arraySettlementsPos.push(findCoordHex('H4',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H4',3,0));//21
	arraySettlementsPos.push(findCoordHex('H4',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H5',2,0) + settlementMoveLeft);//22
	arraySettlementsPos.push(findCoordHex('H5',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H5',3,0));//23
	arraySettlementsPos.push(findCoordHex('H5',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H6',2,0) + settlementMoveLeft);//24
	arraySettlementsPos.push(findCoordHex('H6',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H6',3,0));//25
	arraySettlementsPos.push(findCoordHex('H6',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H10',0,0));//26
	arraySettlementsPos.push(findCoordHex('H10',0,1) + settlementMoveUp * 1.5);
	arraySettlementsPos.push(findCoordHex('H10',5,0) + settlementMoveLeft * 1.5);//27
	arraySettlementsPos.push(findCoordHex('H10',5,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H10',4,0));//28
	arraySettlementsPos.push(findCoordHex('H10',4,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H7',1,0));//29
	arraySettlementsPos.push(findCoordHex('H7',1,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H7',2,0) + settlementMoveLeft);//30
	arraySettlementsPos.push(findCoordHex('H7',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H7',3,0));//31
	arraySettlementsPos.push(findCoordHex('H7',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H8',2,0) + settlementMoveLeft);//32
	arraySettlementsPos.push(findCoordHex('H8',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H8',3,0));//33
	arraySettlementsPos.push(findCoordHex('H8',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H9',2,0) + settlementMoveLeft);//34
	arraySettlementsPos.push(findCoordHex('H9',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H9',3,0));//35
	arraySettlementsPos.push(findCoordHex('H9',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H10',2,0) + settlementMoveLeft);//36
	arraySettlementsPos.push(findCoordHex('H10',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H10',3,0));//37
	arraySettlementsPos.push(findCoordHex('H10',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H14',0,0));//38
	arraySettlementsPos.push(findCoordHex('H14',0,1) + settlementMoveUp);
	
	arraySettlementsPos.push(findCoordHex('H11',1,0));//39
	arraySettlementsPos.push(findCoordHex('H11',1,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H11',2,0) + settlementMoveLeft);//40
	arraySettlementsPos.push(findCoordHex('H11',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H11',3,0));//41
	arraySettlementsPos.push(findCoordHex('H11',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H12',2,0) + settlementMoveLeft);//42
	arraySettlementsPos.push(findCoordHex('H12',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H12',3,0));//43
	arraySettlementsPos.push(findCoordHex('H12',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H13',2,0) + settlementMoveLeft);//44
	arraySettlementsPos.push(findCoordHex('H13',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H13',3,0));//45
	arraySettlementsPos.push(findCoordHex('H13',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H14',1,0));//46
	arraySettlementsPos.push(findCoordHex('H14',1,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H14',2,0) + settlementMoveLeft);//47
	arraySettlementsPos.push(findCoordHex('H14',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H14',3,0));//48
	arraySettlementsPos.push(findCoordHex('H14',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H15',2,0) + settlementMoveLeft);//49
	arraySettlementsPos.push(findCoordHex('H15',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H15',3,0));//50
	arraySettlementsPos.push(findCoordHex('H15',3,1) + settlementMoveUp/2);
	
	arraySettlementsPos.push(findCoordHex('H16',2,0) + settlementMoveLeft);//51
	arraySettlementsPos.push(findCoordHex('H16',2,1) + settlementMoveUp);
	arraySettlementsPos.push(findCoordHex('H16',3,0));//52
	arraySettlementsPos.push(findCoordHex('H16',3,1) + settlementMoveUp/2);
	}
	
	//create settlements and add them to pieceLayer and then add to stage
	var arraySettlements = [];
	for(var i=0; i<=52; i++) //
	{
		var settlement = new Kinetic.Image({
			x: arraySettlementsPos[i*2],
			y: arraySettlementsPos[i*2+1],
			image: settlementImg,
			width: settlementWidth,
			height: settlementHeight,
			id: 'S' + i,
			shadowEnabled: false
		});

		arraySettlements.push(settlement);
		pieceLayer.add(arraySettlements[i]);

		arraySettlements[i].on('mouseover', function () {
			document.body.style.cursor = 'pointer';
		});
		arraySettlements[i].on('mouseout', function () {
			document.body.style.cursor = 'default';
		});

		arraySettlements[i].listening(false);
	}
	canvas.add(pieceLayer);
	
	/* menu setup */
	//menu sizing variables
	var menuPosStartX = screenWidth * .02;
	var menuPosStartY = screenHeight * .05;
	var menuButHeight = screenHeight * .05;
	var menuButWidth = screenWidth * .05;
	var menuButSpacing = screenHeight * .02;
	//make each menu item and add to board
	var menuTrade = new Kinetic.Image({
		x: menuPosStartX + menuButSpacing + menuButWidth,
		y: menuUnderlayStartY1 + menuButSpacing * 2 + menuButHeight,
		image: tradeClip,
		width: menuButWidth,
		height: menuButHeight
	});
	menuTrade.on('click', function(){ 
		$('#send-trade-modal').modal('show');
	});
	$('#send-trade-button').click(function() {
		$('#send-trade-modal').modal('hide');
		var $inputs = $('#send-trade-form :input');

		var tradeTerms = [];
		$inputs.each(function(i) {
			tradeTerms[i] = $(this).val();
		});
		
		var firstPlayerResources = [];
		var secondPlayerResources = [];
		for(var i = 1; i < tradeTerms.length; i++) {
			if(i % 2 === 0) {
				firstPlayerResources.push(tradeTerms[i]);
			}
			else {
				secondPlayerResources.push(tradeTerms[i]);
			}
		}
		socket.emit("trade_player", {firstPlayer: player.playerId, secondPlayer: tradeTerms[0], 
									 firstPlayerResources: firstPlayerResources, 
									 secondPlayerResources: secondPlayerResources});

		$('#send-trade-form').find("input[type=text], textarea").val("0");
		console.log('hello');
	});
	var menuDuel = new Kinetic.Image({
		x: menuPosStartX + menuButSpacing + menuButWidth,
		y: menuUnderlayStartY1 + menuButSpacing,
		image: duelClip,
		width: menuButWidth,
		height: menuButHeight
	});
	var menuBuy = new Kinetic.Image({
		x: menuPosStartX,
		y: menuUnderlayStartY1 + menuButSpacing * 2 + menuButHeight,
		image: buyClip,
		width: menuButWidth,
		height: menuButHeight
	});
	menuBuy.on('click', function() {
		$('#buy-modal').modal('show');
	});
	
	//When the Buy Outpost button in the buyModal has been clicked...
	$('#buy-outpost-button').click(function() {
	//console.log('You tried to buy an outpost sucker!!!!');

	//TODO Check for needed resources

	var tempOpId;

	for(var i = 0; i < arraySettlements.length; i++)
	{
		//tempOpId = arraySettlements[i].getId();

		arraySettlements[i].on('click' || 'tap', function(evt) {
			var shape = evt.target;
			socket.emit('buy_outpost', { pID: player.playerId, opID: shape.getId() });
			(player.victoryPoints)++;
			(player.numOil)--;
			(player.numClay)--;
			(player.numCotton)--;
			(player.numCattle)--;
		});

		if(!arraySettlements[i].shadowEnabled())
		{
			arraySettlements[i].listening(true);	
		}
	}
	pieceLayer.drawHit();
	//socket.emit('buy_outpost', { pID: id });
	});
	
	//When mouse is over the button the cursor will be changed
	menuBuy.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	menuBuy.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	
	//make dice and add to board
	var menuCards = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*3,
		fill: 'blue',
		width: menuButWidth,
		height: menuButHeight
	});
	//Create End Turn menu button
	var menuEndTurn = new Kinetic.Image({
		x: menuPosStartX,
		y: menuUnderlayStartY1 - (menuButHeight * 2 + menuButSpacing),
		image: endTurnPic,
		width: menuButWidth * 2,
		height: menuButHeight * 2
	});
	//When clicked, send the message 'end_turn' to the server
	menuEndTurn.on('click' || 'tap', function(){
		socket.emit('end_turn');
	});
	//When mouse is over the button the cursor will be changed
	menuEndTurn.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	menuEndTurn.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	
	var menuRollDice = new Kinetic.Image({
		x: menuPosStartX,
		y: menuUnderlayStartY1 + menuButSpacing,
		image: diceClip,
		width: menuButWidth,
		height: menuButHeight
	});
	
	//var diceSpriteHeight = screenWidth * .033333;
	//diePic.height = diceSpriteHeight * 6;
	//diePic.width = diceSpriteHeight * 6;
	var diceSpriteHeight = 64;
	diePic.height = 64;
	diePic.width = 64;
	var animateDice = {
			cycle1: [	0, diceSpriteHeight, diceSpriteHeight, diceSpriteHeight,
						0, diceSpriteHeight * 5, diceSpriteHeight, diceSpriteHeight,
						0, diceSpriteHeight * 3, diceSpriteHeight, diceSpriteHeight,
						0, 0, diceSpriteHeight, diceSpriteHeight,
						0, diceSpriteHeight * 2, diceSpriteHeight, diceSpriteHeight,
						0, diceSpriteHeight * 4, diceSpriteHeight, diceSpriteHeight
					],
			cycle2: [	diceSpriteHeight, diceSpriteHeight * 2, diceSpriteHeight, diceSpriteHeight,
						diceSpriteHeight, 0, diceSpriteHeight, diceSpriteHeight,
						diceSpriteHeight, diceSpriteHeight * 3, diceSpriteHeight, diceSpriteHeight,
						diceSpriteHeight, diceSpriteHeight, diceSpriteHeight, diceSpriteHeight,
						diceSpriteHeight, diceSpriteHeight * 5, diceSpriteHeight, diceSpriteHeight,
						diceSpriteHeight, diceSpriteHeight * 4, diceSpriteHeight, diceSpriteHeight
					],
			dieOne1:[	0, 0, diceSpriteHeight, diceSpriteHeight],
			dieOne2:[	0, diceSpriteHeight * 2, diceSpriteHeight, diceSpriteHeight],
			dieOne3:[	0, diceSpriteHeight * 3, diceSpriteHeight, diceSpriteHeight],
			dieOne4:[	0, diceSpriteHeight * 4, diceSpriteHeight, diceSpriteHeight],
			dieOne5:[	0, diceSpriteHeight * 5, diceSpriteHeight, diceSpriteHeight],
			dieOne6:[	0, diceSpriteHeight * 6, diceSpriteHeight, diceSpriteHeight],
			dieTwo1:[	diceSpriteHeight, 0, diceSpriteHeight, diceSpriteHeight],
			dieTwo2:[	diceSpriteHeight, diceSpriteHeight * 2, diceSpriteHeight, diceSpriteHeight],
			dieTwo3:[	diceSpriteHeight, diceSpriteHeight * 3, diceSpriteHeight, diceSpriteHeight],
			dieTwo4:[	diceSpriteHeight, diceSpriteHeight * 4, diceSpriteHeight, diceSpriteHeight],
			dieTwo5:[	diceSpriteHeight, diceSpriteHeight * 5, diceSpriteHeight, diceSpriteHeight],
			dieTwo6:[	diceSpriteHeight, diceSpriteHeight * 6, diceSpriteHeight, diceSpriteHeight]
					};
	var menuDie1 = new Kinetic.Sprite({
		x: menuPosStartX,
		y: menuUnderlayStartY2 - 64,
		width: diceSpriteHeight * 6,
		height: diceSpriteHeight * 6,
		image: diePic,
		id: 'D0',
		animation: 'cycle1',
		animations: animateDice,
		frameRate: 10,
		frameIndex: 0
	});
	var menuDie2 = new Kinetic.Sprite({
		x: menuPosStartX * 2 + 64,
		y: menuUnderlayStartY2 - 64,
		width: menuButWidth/2 - menuButSpacing,
		height: menuButWidth/2 - menuButSpacing,
		image: diePic,
		id: 'D1',
		animation: 'cycle2',
		animations: animateDice,
		frameRate: 10,
		frameIndex: 0
	});
	
	//dice functionality
	//When clicked, send the message 'end_turn' to the server
	var isDiceOn = false;
	menuRollDice.on('click' || 'tap', function(){
		if(!isDiceOn)
		{
			isDiceOn = true;
			menuDie1.start();
			menuDie2.start();
			setTimeout( function() { isDiceOn = false; menuDie1.stop(); menuDie2.stop();}, Math.random() * (1800 - 1500) + 1500);
		}	
		socket.emit('resource_production');
		//console.log("Sent resource_production from client");
	});
	//When mouse is over the button the cursor will be changed
	menuRollDice.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	menuRollDice.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	
	var menuUnderlay1 = new Kinetic.Rect({
		x: 0,
		y: menuUnderlayStartY1,
		width: screenWidth * .46875,
		height:screenWidth * .1302,
		fill: 'brown',
		cornerRadius: 15
	});
	var menuUnderlay2 = new Kinetic.Rect({
		x: 0,
		y: menuUnderlayStartY2,
		width: screenWidth * .1302,
		height: screenHeight - menuUnderlayStartY1 * .5,
		fill: 'brown',
		cornerRadius: 15
	});
	var resourceCattle = new Kinetic.Image({
		x: screenWidth * .18229,
		y: screenHeight - screenWidth * .125,
		width: screenWidth * .05208,
		height: screenWidth * .05208,
		Image: cattleClip
	});
	var resourceCattleText = new Kinetic.Text({
		x: resourceCattle.getAbsolutePosition().x + resourceCattle.getHeight() / 2,
		y: resourceCattle.getAbsolutePosition().y + resourceCattle.getHeight(),
		text: '0',
		fontSize: screenWidth * .010417,
		ontFamily: 'Calibri',
        fill: 'black'
	});
	var resourceRedClay = new Kinetic.Image({
		x: screenWidth * .23958,
		y: screenHeight - screenWidth * .125,
		width: screenWidth * .05208,
		height: screenWidth * .05208,
		Image: redClayClip
	});
	var resourceRedClayText = new Kinetic.Text({
		x: resourceRedClay.getAbsolutePosition().x + resourceRedClay.getHeight() / 2,
		y: resourceRedClay.getAbsolutePosition().y + resourceRedClay.getHeight(),
		text: '0',
		fontSize: screenWidth * .010417,
		ontFamily: 'Calibri',
        fill: 'black'
	});
	var resourceCotton = new Kinetic.Image({
		x: screenWidth * .2969,
		y: screenHeight - screenWidth * .125,
		width: screenWidth * .05208,
		height: screenWidth * .05208,
		Image: cottonClip
	});
	var resourceCottonText = new Kinetic.Text({
		x: resourceCotton.getAbsolutePosition().x + resourceCotton.getHeight() / 2,
		y: resourceCotton.getAbsolutePosition().y + resourceCotton.getHeight(),
		text: '0',
		fontSize: screenWidth * .010417,
		ontFamily: 'Calibri',
        fill: 'black'
	});
	var resourceLimestone = new Kinetic.Image({
		x: screenWidth * .35417,
		y: screenHeight - screenWidth * .125,
		width: screenWidth * .05208,
		height: screenWidth * .05208,
		Image: limestoneClip
	});
	var resourceLimestoneText = new Kinetic.Text({
		x: resourceLimestone.getAbsolutePosition().x + resourceLimestone.getHeight() / 2,
		y: resourceLimestone.getAbsolutePosition().y + resourceLimestone.getHeight(),
		text: '0',
		fontSize: screenWidth * .010417,
		ontFamily: 'Calibri',
        fill: 'black'
	});
	var resourceOil = new Kinetic.Image({
		x: screenWidth * .41146,
		y: screenHeight - screenWidth * .125,
		width: screenWidth * .05208,
		height: screenWidth * .05208,
		Image: oilClip
	});
	var resourceOilText = new Kinetic.Text({
		x: resourceOil.getAbsolutePosition().x + resourceOil.getHeight() / 2,
		y: resourceOil.getAbsolutePosition().y + resourceOil.getHeight(),
		text: '0',
		fontSize: screenWidth * .010417,
		ontFamily: 'Calibri',
        fill: 'black'
	});
	
	menuLayer.add(menuUnderlay1);
	menuLayer.add(menuUnderlay2);
	menuLayer.add(menuTrade);
	menuLayer.add(menuDuel);
	menuLayer.add(menuBuy);
	//menuLayer.add(menuCards);
	menuLayer.add(menuEndTurn);
	menuLayer.add(menuRollDice);
	menuLayer.add(menuDie1);
	menuLayer.add(menuDie2);
	menuLayer.add(resourceCattle);
	menuLayer.add(resourceCattleText);
	menuLayer.add(resourceRedClay);
	menuLayer.add(resourceRedClayText);
	menuLayer.add(resourceCotton);
	menuLayer.add(resourceCottonText);
	menuLayer.add(resourceLimestone);
	menuLayer.add(resourceLimestoneText);
	menuLayer.add(resourceOil);
	menuLayer.add(resourceOilText);
	
	canvas.add(menuLayer);
	
});