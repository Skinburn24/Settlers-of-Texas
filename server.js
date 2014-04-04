//Function for randomizing the hexes on the board and for shuffling the development card deck.
//This function takes in an array, and outputs the same array with elements in random positions
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//**************************************************************************************************
//******************************************Game Set-up*********************************************
//**************************************************************************************************

// 0 = desert, 1 = cotton, 2 = limestone, 3 = oil, 4 = red clay, 5 = cattle
var hexResourceArray = [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5];

hexResourceArray = shuffleArray(hexResourceArray);

//Array of chit values
var chitArray = [2, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 12];

chitArray = shuffleArray(chitArray);

//Global variables
var playersTurn = 0;
//playerArray[playersTurn].isTurn = true;

//Initialize arrays
var playerArray = [];		//List of players: 2 - 4 players needed
var devoCardArray = [];		//Deck of development cards
var outpostArray = [];		//Array of owned outposts
var trailArray = [];		//Array of owned trails
var hexArray = [];			//Array of hex objects

//Creating hex objects
function hex(rType, hID)
{
	this.resourceType = rType;
	this.hexID = hID;
	this.chitValue = 0;
	this.playerResourceCount = [0, 0, 0, 0];
}

//Create array of hex objects
function createHexArray()
{
	var seenDesertFlag = false;

	for(var i = 0; i < hexResourceArray.length; i++)
	{
		Hex = new hex(hexResourceArray[i], i);
		hexArray.push(Hex);
		if(hexResourceArray[i] != 0 && !seenDesertFlag)
		{
			hexArray[i].chitValue = chitArray[i];
		}
		else if(seenDesertFlag)
		{
			hexArray[i].chitValue = chitArray[i - 1];
		}
		else
		{
			seenDesertFlag = true;
		}
	}
}

createHexArray();

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

//console.log(hexArray);

//Creating player objects
function player(pName, pColor, devoArray, opArray, tArray)
{
   this.playerName = pName;
   this.playerColor = pColor;
   this.developmentCards = devoArray;
   this.outpostsOwned = opArray;
   this.isTurn = false;
   this.victoryPoints = 0;
   this.totalResources = 0;
   this.numCotton = 0;
   this.numLimestone = 0; 
   this.numOil = 0;
   this.numCattle = 0;
   this.numClay = 0;
   this.trailsOwned = tArray;
   this.numRangersPlayed = 0;
   this.longestRoad = 0;
   this.outpostRemaining = 5;
   this.townsRemaining = 5;
   this.trailsRemaining = 15;
}

//Roll dice function
function rollDice()
{
	var die1 = Math.floor((Math.random()*6)+1);
	var die2 = Math.floor((Math.random()*6)+1);
	var diceValues = [die1, die2];
	var totalRoll = die1 + die2;
	
	console.log("You rolled a " + totalRoll);
	return diceValues;
}

//Get the player's next turn
function getNextPlayer()
{
	playerArray[playersTurn].isTurn = false;
	if(playersTurn < playerArray.length - 1)
	{
		playersTurn++;
	}
	else 
	{
		playersTurn = 0;
	}
	playerArray[playersTurn].isTurn = true;
	
	return playersTurn;
}

//**************************************************************************************************
//************************************Allocating Resources******************************************
//**************************************************************************************************

//Given a hex object, this function will allocate the correct number of resources to each player
function allocateResources(currentHex)
{
	// 0 = desert, 1 = cotton, 2 = limestone, 3 = oil, 4 = red clay, 5 = cattle
	switch(currentHex.resourceType) {
		case 1: 
			for(var i = 0; i < playerArray.length; i++)
			{
				playerArray[i].numCotton += currentHex.playerResourceCount[i];
			}
			break;
		case 2:
			for(var i = 0; i < playerArray.length; i++)
			{
				playerArray[i].numLimestone += currentHex.playerResourceCount[i];
			}
			break;
		case 3:
			for(var i = 0; i < playerArray.length; i++)
			{
				playerArray[i].numOil += currentHex.playerResourceCount[i];
			}
			break;
		case 4:
			for(var i = 0; i < playerArray.length; i++)
			{
				playerArray[i].numClay += currentHex.playerResourceCount[i];
			}
			break;
		case 5:
			for(var i = 0; i < playerArray.length; i++)
			{
				playerArray[i].numCattle += currentHex.playerResourceCount[i];
			}
			break;
	}
} 

//Produce resources
function produceResources(totalDiceValue)
{
	var foundFlag = 0;
	for(var i = 0; (i < hexArray.length) && (foundFlag != 2); i++)
	{
		if(hexArray[i].chitValue = totalDiceValue)
		{
			allocateResources(hexArray[i]);
			foundFlag++;
		}
	}
}

//Update the total number of resources for each player
function updateTotalResources()
{
	for(var i = 0; i < playerArray; i++)
	{
		playerArray[i].totalResources = playerArray[i].numCattle + playerArray[i].numClay + playerArray[i].numOil + playerArray[i].numCotton + playerArray[i].numLimestone;
	}

}



//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

//**************************************************************************************************
//*************************Outposts, Towns, Trails, and Development Cards***************************
//**************************************************************************************************

function devoCard(name, cID, cIDt)
{
	this.image;
	this.cardName = name;
	this.cardID = cID;
	this.cardIDtype = cIDt;
}

var townIDs = 0;
var outpostIDs = 0;
var trailIDs = 0;
var cardIDs = 0;

Ranger1 = new devoCard("Texas Ranger", cardIDs, 0);
devoCardArray.push(Ranger1);
Ranger2 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger2);
Ranger3 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger3);
Ranger4 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger4);
Ranger5 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger5);
Ranger6 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger6);
Ranger7 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger7);
Ranger8 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger8);
Ranger9 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger9);
Ranger10 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger10);
Ranger11 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger11);
Ranger12 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger12);
Ranger13 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger13);
Ranger14 = new devoCard("Texas Ranger", cardIDs++, 0);
devoCardArray.push(Ranger14);
Building1 = new devoCard("Saloon", cardIDs++, 1);
devoCardArray.push(Building1);
Building2 = new devoCard("Sheriff's Office", cardIDs++, 1);
devoCardArray.push(Building2);
Building3 = new devoCard("School House", cardIDs++, 1);
devoCardArray.push(Building3);
Building4 = new devoCard("Barber Shop", cardIDs++, 1);
devoCardArray.push(Building4);
Building5 = new devoCard("General Store", cardIDs++, 1);
devoCardArray.push(Building5);
Harvest1 = new devoCard("Bountiful Harvest", cardIDs++, 2);
devoCardArray.push(Harvest1);
Harvest2 = new devoCard("Bountiful Harvest", cardIDs++, 2);
devoCardArray.push(Harvest2);
Steal1 = new devoCard("Steal", cardIDs++, 3);
devoCardArray.push(Steal1);
Steal2 = new devoCard("Steal", cardIDs++, 3);
devoCardArray.push(Steal2);
Trail1 = new devoCard("Trail Blazing", cardIDs++, 4);
devoCardArray.push(Trail1);
Trail2 = new devoCard("Trail Blazing", cardIDs++, 4);
devoCardArray.push(Trail2);

devoCardArry = shuffleArray(devoCardArray);

function town(tID, oplayer)
{
	this.townID = tID;
	this.owningPlayer = oplayer;
}

function outpost(oID, oplayer)
{
	this.outpostID = oID;
	this.owningPlayer = oplayer;
}

function trial(tID, oplayer)
{
	this.trialID = tID;
	this.owningPlayer = oplayer;
}

function buyOutpost(currPlayer)
{
		//Outpost = new outpost(outpostIDs, oplayer);
		//outpostIDs++;
		//outpostArray.push(Outpost);
		//(playerArray[currPlayer].outpostsOwned).push(Outpost);
		(playerArray[currPlayer].victoryPoints)++;
		(playerArray[currPlayer].numOil)--;
		(playerArray[currPlayer].numClay)--;
		(playerArray[currPlayer].numCotton)--;
		(playerArray[currPlayer].numCattle)--;


		//TODO add giant switch case to figure out which hexes need to be updated.	
}

function buyTown(oplayer)
{
	if(((oplayer.numLimestone) >= 3) && ((oplayer.numCattle) >= 2))
	{
		Town = new town(townIDs, oplayer);
		townIDs++;
		townArray.push(Town);
		(oplayer.townsOwned).push(Town);
		(oplayer.numLimestone) - 3;
		(oplayer.numCattle) - 2;
	}
}

function buyTrail(oplayer)
{
	if(((oplayer.numOil) >= 1) && ((oplayer.numClay) >= 1))
	{
		Trail = new trail(trailIDs, oplayer);
		tailIDs++;
		trailArray.push(Trail);
		(oplayer.trailsOwned).push(Trail);
		(oplayer.numOil)--;
		(oplayer.numClay)--;
	}
}

function buyDevoCard(oplayer)
{
	if(((oplayer.numLimestone) >= 1) && ((oplayer.numCotton) >= 1) && ((oplayer.numCattle) >= 1))
	{
		(oplayer.developmentCards).push(devoCardArray[0]);
		devoCardArray.shift();
		(oplayer.numLimestone)--;
		(oplayer.numCotton)--;
		(oplayer.numCattle)--;
	}
}

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

var static = require('node-static');
var fileServer = new static.Server();

// The node.js HTTP server.
var app = require('http').createServer(handler);

// The socket.io WebSocket server, running with the node.js server.
var io = require('socket.io').listen(app);

// Allows access to local file system.
var fs = require('fs');

// Listen on a high port.
app.listen(10037);

// Handles HTTP requests.
function handler(request, response) {
   request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}

io.sockets.on(
  'connection',
  function(client) {
    // Send a welcome message first.
    client.emit('welcome', 'Welcome to my chat room!');

    // Listen to an event called 'login'. The client should emit this event when
    // it wants to log in to the chat room.
    client.on(
      'login',
      function(message) {
			if (message && message.user_name) {

			var nextColor = "";

			switch(playerArray.length) {
							case 0:
								nextColor = "Maroon";
								break;
							case 1:
								nextColor = "Blue";
								break;
							case 2:
								nextColor = "Yellow";
								break;
							case 3:
								nextColor = "White";
								break;
			}
				
			if(playerArray.length < 2) {
			  
			  //Create new players
			  Player = new player(playerArray.length-1 ,message.user_name, nextColor, devoCardArray, outpostArray, trailArray);
			  playerArray.push(Player);
			  
			  client.emit('login_ok', {playerId: playerArray.length-1, playersName: message.user_name, playersColor: nextColor});
			}
			else{
				//Player limit reached
				client.emit('login_failed');
			}
			
			//Start game: set isTurn to true for first player
			if(playerArray.length == 2) {
				playerArray[playersTurn].isTurn = true
				client.broadcast.emit('end_turn', {playerTurns: playerArray});
				client.emit('end_turn', {playerTurns: playerArray});
			}
        }
		else {
			// When something is wrong, send a login_failed message to the client.
			client.emit('login_failed');
		}
      });
	
	//The server receives a 'end_turn' message, changes the current player and sends an 'end_turn' message	
	client.on(
		'end_turn',
		function(message) {
			getNextPlayer();
			client.broadcast.emit('end_turn', {playerTurns: playerArray});
			client.emit('end_turn', {playerTurns: playerArray});
		}
	);
	  
	//The server receives a 'resource_production' message, rolls the dice and sends an 'resource_production' message with the dice values
	client.on(
		'resource_production',
		function(message) {
			//console.log("Received resource_production from client");
			var diceArray = rollDice();
			
			var d1 = diceArray[0];
			var d2 = diceArray[1];
			
			var totDiceVal = d1 + d2;
			
			produceResources(totDiceVal);
			updateTotalResources();
			
			client.broadcast.emit('resource_production', {dArray: diceArray, pArray: playerArray});
			client.emit('resource_production', {dArray: diceArray, pArray: playerArray});
			//console.log("Sent resource_production from server");
		}
	); 
		
	client.on(
		'trade_player',
		function(message) {
			var firstPlayer = message.firstPlayer;
			var secondPlayer = message.secondPlayer;
			var firstPlayerResources = message.firstPlayerResources;
			var secondPlayerResources = message.secondPlayerResources;
			client.broadcast.emit('trade_player', {firstPlayer: firstPlayer, secondPlayer: secondPlayer,
												   firstPlayerResources: firstPlayerResources,
												   secondPlayerResources: secondPlayerResources});
		}
	);

	client.on(
		'trade_accepted',
		function(message) {
			//Send accept message to sender
		
		}
	);
	
	client.on(
		'trade_rejected',
		function(message) {
			//Send reject message to sender
		}
	);

	client.on(
		'buy_outpost',
		function(message) {
			//console.log("Received buy_outpost from client");
			
			var currentPlayerID = message.pID;

			//console.log('Current player id' + currentPlayerID);
			console.log('Outpost ID' + message.opID)

			buyOutpost(currentPlayerID);

			client.broadcast.emit('buy_outpost', { OPID: message.opID });
			client.emit('buy_outpost', { OPID: message.opID });
			//console.log("Sent resource_production from server");
		}
	);
	  
  });

