
var devoCardArray = [];    //Deck of development cards
var outpostArray = [];     //Array of owned outposts
var trailArray = [];    //Array of owned trails



//Creating player objects for the clients
function create_player()
{
   var devoCardArray = [];    //Deck of development cards
   var outpostArray = [];     //Array of owned outposts
   var trailArray = [];    //Array of owned trails
   
   this.playerId = -1;
   this.playerName = "";
   this.playerColor = "";
   this.developmentCards = devoCardArray;
   this.outpostsOwned = outpostArray;
   this.isTurn = false;
   this.victoryPoints = 0;
   this.totalResources = 0;
   this.numCotton = 0;
   this.numLimestone = 0; 
   this.numOil = 0;
   this.numCattle = 0;
   this.numClay = 0;
   this.trailsOwned = trailArray;
   this.numRangersPlayed = 0;
   this.longestRoad = 0;
   this.outpostRemaining = 5;
   this.townsRemaining = 5;
   this.trailsRemaining = 15;
}