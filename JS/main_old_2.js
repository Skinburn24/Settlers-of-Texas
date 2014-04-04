 $(document).ready(function() {	

var canvas = new Kinetic.Stage({
		container: 'container',
		width: 1,
		height: 1
	});

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
        newimages[i].onload=function(){
            imageloadpost();
        }
        newimages[i].onerror=function(){
            imageloadpost();
        }
    }
    return { //return blank object with done() method
        done:function(f){
            postaction=f || postaction //remember user defined callback functions to be called when images load
        }
    }
}

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

preLoadImages([ 'img/Board.png', 'img/Cotton_2.png', 'img/settlement.png', 'img/ColorDice.png', 'img/wood.png']).done(function(arrayImages){
	//websocket communication code

	//This player variable will keep track of all of the players data on the client side
	var player = new create_player();
	
	$("#background-image").fullscreenBackground();
	$('.login-section').css('display', 'block');
	$('#container').css('display', 'none');

    // Initialize socket.io.
    // document.location.host returns the host of the current page.
    var socket = io.connect('http://' + document.location.host);

    // If a welcome message is received, it means the chat room is available.
    // The Log In button will be then enabled.
    socket.on(
      'welcome',
      function(message) {
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
		console.log(player.playerId);
		console.log(player);
      });

    // If a login_failed message is received, stay in the login section but
    // display an error message.
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
				player = message.pArray[player.playerId];
				console.log(player);

				isDiceOn = true;
				menuDie1.start();
				menuDie2.start();
				
				setTimeout( function() { isDiceOn = false; menuDie1.stop(); menuDie2.stop();}, 1500);
				
				var d1 = parseInt(message.dArray[0]);
				var d2 = parseInt(message.dArray[1]);
				
				var totValue = d1 + d2;

				setTimeout( function() { console.log("You rolled a " + totValue); }, 1500);
			}	 
		}
	);

	socket.on(
      'trade_player',
      function(message) {
			if(player.playerId == message.secondPlayer) {
				
				var firstPlayer = message.firstPlayer;
				var secondPlayer = message.secondPlayer;
				var firstPlayerResources = message.firstPlayerResources;
				var secondPlayerResources = message.secondPlayerResources;

				var j = 0;
				$('#receive-trade-form :input').each(function(i) {
					if(i % 2 === 0) {
						$(this).val(firstPlayerResources[j]);
						j = j + 1;
					}
				});

				j = 0;
				$('#receive-trade-form :input').each(function(i) {
					if(i % 2 !== 0) {
						$(this).val(secondPlayerResources[j]);
						j = j + 1;
					}
				});

				$('#receive-trade-modal').modal('show');
				
				$('#accept-trade-button').click(function() {
				
					socket.emit("trade_accepted", message);
					$('#receive-trade-modal').modal('hide');
					$('#receive-trade-form').find("input[type=text], textarea").val("0");
				});
				$('#reject-trade-button').click(function() {
				
					socket.emit("trade_rejected", {firstPlayer: firstPlayer});
					$('#receive-trade-modal').modal('hide');
					$('#receive-trade-form').find("input[type=text], textarea").val("0");
				});
				$('#counter-trade-button').click(function() {
				
			    	var $inputs = $('#receive-trade-form :input');

				    var tradeTerms = [];
				    $inputs.each(function(i) {
				        tradeTerms[i] = $(this).val();
				    });
			
				    var firstPlayerResources = [];
				    var secondPlayerResources = [];
					for(var i = 0; i < tradeTerms.length; i++) {
						if(i % 2 === 0) {
							firstPlayerResources.push(tradeTerms[i]);
						}
						else {
							secondPlayerResources.push(tradeTerms[i]);
						}
					}
					console.log(firstPlayerResources);
					console.log(secondPlayerResources);
					socket.emit("trade_player", {firstPlayer: secondPlayer, secondPlayer: firstPlayer, 
										 		 firstPlayerResources: secondPlayerResources, 
										         secondPlayerResources: firstPlayerResources});
					
					$('#receive-trade-modal').modal('hide');
					//$('#receive-trade-form').find("input[type=text], textarea").val("0");
				});
				
			}
      });

    // When the Log In button is clicked, the provided function will be called,
    // which sends a login message to the server.
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




//
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

	var texas = arrayImages[0];
	var hexPic = arrayImages[1];
	var settlementimg = arrayImages[2];
	var diePic = arrayImages[3];
	var wood = arrayImages[4];
	
	
	//sizing properties
	
	if(detectmob())
	{
		var screenWidth = window.outerWidth;
	}
	else
	{
		var screenWidth = screen.availWidth;
		console.log('PC');
	}
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
	
	/*
	var canvas = new Kinetic.Stage({
		container: 'container',
		width: screenWidth,
		height: screenHeight
	});
	*/
	
	canvas.setWidth(screenWidth);
	canvas.setHeight(screenHeight);
	canvas.setId('canvas');
	
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
	//drawAllLayers();
	
	
	var board = new Kinetic.Image({
		x: screenWidth * .1,
		y: 0,
		image: texas,
		width: boardWidth,
		height: boardHeight,
		id: 'texas'
	});
	boardLayer.add(board);
	//canvas.add(boardLayer);
	//drawAllLayers();
	
	
	//make array that hold hexagon positions
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
	
	//set properties for kinetic hexagon types
	for(var i = 0; i < 17; i++)
	{
		var hex = new Kinetic.Image({
			x:arrayHexPos[i*2],
			y:arrayHexPos[i*2+1],
			width: hexWidth,
			height: hexHeight,
			image: hexPic,
			id: 'H' + i
		});
		hexagonLayer.add(hex);
	}
	//drawAllLayers();
	
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
	canvas.add(backgroundLayer);
	canvas.add(boardLayer);
	canvas.add(hexagonLayer);
	//var settlementWidth = trailWidth;
	//var settlementHeight = settlementWidth;
	
	var arraySettlementsPos = [];
	
	//console.log(findCoordHex(0,0,0));
	//console.log(findCoordHex(0,0,1));
	
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
	
	var arraySettlements = [];
	for(var i=0; i<=52; i++) //
	{
		var settlement = new Kinetic.Image({
			x: arraySettlementsPos[i*2],
			y: arraySettlementsPos[i*2+1],
			image: settlementimg,
			width: settlementWidth,
			height: settlementHeight,
			id: 'S' + i
		});
		arraySettlements.push(settlement);
		pieceLayer.add(arraySettlements[i])
	}
	//canvas.add(pieceLayer);
	//drawAllLayers();
	
	var arrayTrails = [];
	var arrayTrailsPos = []; //will hold coordinates for 
	var arrayTrailsRot = [];
	
	arrayTrailsPos.push(findCoordHex('H0',0,0));
	arrayTrailsPos.push(findCoordHex('H0',0,1));
	arrayTrailsRot.push(270);
	
	for(var i=0; i<=-1; i++) //
	{
		var trail = new Kinetic.Rect({
			x: arrayTrailsPos[i*2] + 28,
			y: arrayTrailsPos[i*2+1],
			fill: 'orange',
			width: trailWidth,
			height: trailHeight - 20,
			rotation: arrayTrailsRot[i],
			id: 'T' + i
		});
		arrayTrails.push(trail);
		pieceLayer.add(arrayTrails[i]);
	}
	//drawAllLayers();
	
	canvas.add(pieceLayer);
	
	
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
		height: menuButHeight
	});
	menuTrade.on('click', function(){ 
		$('#send-trade-modal').modal('show');

		$('#send-trade-button').click(function() {
			
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

			//$('#send-trade-form').find("input[type=text], textarea").val("0");
		});
	});
	
	//Create Duel menu button
	var menuDuel = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + menuButHeight + menuButSpacing,
		fill: 'red',
		width: menuButWidth,
		height: menuButHeight
	});
	
	//Create Buy menu button
	var menuBuy = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*2,
		fill: 'white',
		width: menuButWidth,
		height: menuButHeight
	});
	
	//Create Cards menu button
	var menuCards = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*3,
		fill: 'blue',
		width: menuButWidth,
		height: menuButHeight
	});
	
	//Create End Turn menu button
	var menuEndTurn = new Kinetic.Rect({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*4,
		fill: 'blue',
		width: menuButWidth,
		height: menuButHeight
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
	
	//Create Roll Dice menu button
	var menuRollDice = new Kinetic.Image({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*5,
		image: wood,
		width: menuButWidth,
		height: menuButHeight
	});
	//When clicked, send the message 'end_turn' to the server
	menuRollDice.on('click' || 'tap', function(){
		socket.emit('resource_production');
	});
	//When mouse is over the button the cursor will be changed
	menuRollDice.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	menuRollDice.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	var diceSpriteHeight = 64;
	var animateDice = {
			cycle1: [	0, 64, 64, 64,
						0, 320, 64, 64,
						0, 192, 64, 64,
						0, 0, 64, 64,
						0, 128, 64, 64,
						0, 256, 64, 64
					],
			cycle2: [	64, 128, 64, 64,
						64, 0, 64, 64,
						64, 192, 64, 64,
						64, 64, 64, 64,
						64, 320, 64, 64,
						64, 256, 64, 64
					]};
			
	var menuDie1 = new Kinetic.Sprite({
		x: menuPosStartX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*6,
		width: menuButWidth/2 - menuButSpacing,
		height: menuButWidth/2 - menuButSpacing,
		image: diePic,
		id: 'D0',
		animation: 'cycle1',
		animations: animateDice,
		frameRate: 15,
		frameIndex: 0
	});
	var menuDie2 = new Kinetic.Sprite({
		x: menuPosStartX + menuButWidth/2 + hexSpacingX,
		y: menuPosStartY + (menuButHeight + menuButSpacing)*6,
		width: menuButWidth/2 - menuButSpacing,
		height: menuButWidth/2 - menuButSpacing,
		image: diePic,
		id: 'D1',
		animation: 'cycle2',
		animations: animateDice,
		frameRate: 10,
		frameIndex: 0
	});
	menuLayer.add(menuTrade);
	menuLayer.add(menuDuel);
	menuLayer.add(menuBuy);
	menuLayer.add(menuCards);
	menuLayer.add(menuEndTurn);
	menuLayer.add(menuRollDice);
	menuLayer.add(menuDie1);
	menuLayer.add(menuDie2);
	//canvas.add(menuLayer);

	//drawAllLayers();
	
	
	canvas.add(menuLayer);
	
	var isDiceOn = false;
	
	
	menuRollDice.on('click' || 'tap',  function() {
		if(!isDiceOn)
		{
			isDiceOn = true;
			menuDie1.start();
			menuDie2.start();
			setTimeout( function() { isDiceOn = false; menuDie1.stop(); menuDie2.stop();}, 1500);
		}	
	});
	/*
	var isDiceOn = true;
	menuDie1.start();
	menuDie2.start();
	//canvas.get('#D0')[0].start();
	//canvas.get('#D1')[0].start();
	
	menuRollDice.on('click', function() {
		if(isDiceOn)
		{
			isDiceOn = false;
			menuDie1.stop();
			menuDie2.stop();
		}
		else
		{
			isDiceOn = true;
			menuDie1.start();
			menuDie2.start();
		}
	});
		menuRollDice.on('tap', function() {
		if(isDiceOn)
		{
			isDiceOn = false;
			menuDie1.stop();
			menuDie2.stop();
		}
		else
		{
			isDiceOn = true;
			menuDie1.start();
			menuDie2.start();
		}
	});
	console.log(canvas.toJSON());
	
	
	});
	*/
	
});

});

