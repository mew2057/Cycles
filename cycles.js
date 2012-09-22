//**********************************************
// The Cycle class used by agents, artificial or otherwise.
function Cycle()
{
    this.currentVector = [0,0]; //X,Y
    this.previousVector = [0,0];
    this.direction = 0; // 0-E, 1-S, 2-W, 3-N
    this.velocity = 0;
    this.turningRadius = 0;
    this.lastInput = 0;
    this.color = "blue";
    
    this.actualPos = function (vector){
        return [vector[0] * Cycle.translation[2] +Cycle.translation[0] ,
            vector[1] * Cycle.translation[2] + Cycle.translation[1]];  
    };
} 

Cycle.translation = [0,0,0]; //Static variable used in translation. X,Y,Z

Cycle.prototype.collides = function(x,y)
{
      return this.currentVector[0] === x &&
        this.currentVector[1] === y;
};

Cycle.prototype.update = function ()
{
    if(this.currentVector[0] % this.turningRadius &&
        this.currentVector[0]% this.turningRadius)
    {
        switch (this.lastInput)
        {
            case 1:
                // Left
                this.direction = (this.direction - 1) % 4;                
                break;
            case 2:
                // Right
                this.direction = (this.direction + 1) % 4;                
                break;
            default:
                // Forward.
                break;
        }   
    }
    
    this.previousVector = this.currentVector;
    
    switch (this.direction)
    {
        case 0:
            this.currentVector[0] -= this.velocity;
            break;
        case 1:
            this.currentVector[1] -= this.velocity;
            break;
        case 2:
            this.currentVector[0] += this.velocity;
            break;
        case 3:
            this.currentVector[1] += this.velocity;
            break;
    }
};

Cycle.prototype.draw = function(context)
{
    
    context.save();
    
    context.strokeStyle = this.color;

    var actual = this.actualPos(this.previousVector);
    context.moveTo(actual[0],actual[1]);
    
    actual = this.actualPos(this.currentVector);
    context.lineTo(actual[0],actual[1]);
    
    context.stroke();

    context.restore();
};
//**********************************************

function CycleGame()
{
    this.difficulty = 0; // 0-easy, 1-medium, 2-hard
    this.gameOver = false;
    this.updateDelay = 1/60 * 1000; // Gives 60fps.    
    this.cycles = [];
    this.cellWidth = 0;
    this.upperBound = 0;
    this.lowerBound = 0;
    this.leftBound = 0;
    this.rightBound = 0;
    
    this.canvas = null;
    this.context = null;
    
    this.update = function ()
    { 
        return;
    };
    
    this.draw = function ()
    {
        
        for( var cycle in this.cycles)
        {
            this.cycles[cycle].draw(this.context);   
        }
    };
    
    this.gameLoop = function()
    {
        this.update();
        this.draw();
        
        if(!this.gameOver)
        {
            setTimeout(this.gameLoop,this.updateDelay); //This doesn't work!!!
        }
    };
}


CycleGame.prototype.setBounds = function(bounds)
{
    this.leftBound = bounds[0];
    this.upperBound = bounds[1];
    this.lowerBound = bounds[2] *this.cellWidth;
    this.rightBound = bounds[3] * this.cellWidth;
};

CycleGame.prototype.spawnCycle = function()
{
    var newCycle = new Cycle();
    newCycle.velocity = 1;
    newCycle.turningRadius = 10;
    
    switch(this.cycles.length)
    {
        case 0:
            newCycle.currentVector = [Math.floor((this.rightBound-this.leftBound)/2),
                this.lowerBound-1];
            newCycle.color = "blue";
            break;
        case 1:
            newCycle.currentVector = [Math.floor((this.rightBound-this.leftBound)/2),
                this.upperBound+1];
            newCycle.color = "red";
            break;
        case 2:
            newCycle.currentVector = [this.leftBound+1,
                Math.floor((this.lowerBound-this.upperBound)/2)];
            newCycle.color = "yellow";
            break;
        case 3:
            newCycle.currentVector = [this.rightBound-1,
                Math.floor((this.lowerBound-this.upperBound)/2)];
            newCycle.color = "green";
            break;            
    }
    
    newCycle.currentVector[0] *= newCycle.turningRadius;
    newCycle.currentVector[1] *= newCycle.turningRadius;
    newCycle.previousVector = newCycle.currentVector;

    this.cycles.push(newCycle);
};

CycleGame.init = function(difficulty, numPlayers, numCycles)
{
    var cycleGame = new CycleGame();
    
    if(numPlayers.length > 2 || numPlayers < 1)
    {
        //invalid # of players do something.   
        return;
    }
    
    if(numCycles < 2 && numCycles > 4)
    {
        //Alert this   
        return;
    }    
    
    if(difficulty < 0 || difficulty > 2)
    {
        return;   
    }
    
    
    $('<canvas id="cyclesGameCanvas">HTML5 not supported in your browser</canvas>').appendTo('body');
    
    // Sets up the canvas and drawing context details for the game.
    cycleGame.canvas = document.getElementById("cyclesGameCanvas");
    cycleGame.canvas.width = 500;
    cycleGame.canvas.height = 500;
    
    cycleGame.context = cycleGame.canvas.getContext("2d");    
    cycleGame.context.fillStyle = "#02181d";
    cycleGame.context.strokeStyle = "#b5ffff";
    
    
    
    drawRoundedBox(cycleGame.context,cycleGame.canvas.width, cycleGame.canvas.height, 10);
    
    cycleGame.cellWidth = 25;
    cycleGame.difficulty = difficulty;
    cycleGame.setBounds(drawGrid(cycleGame.canvas,cycleGame.context,cycleGame.cellWidth));
    
    Cycle.translation = [cycleGame.upperBound, cycleGame.lowerBound, cycleGame.cellWidth/10];//TODO fix magic number

    for(var cycle = 0; cycle < numCycles; cycle ++)
    {
        cycleGame.spawnCycle();
    }
    
   // cycleGame.gameLoop();
};
//**********************************************

/**
 *  Draws a rounded box starting at 0,0 in a canvas.
 * @param context The drawing context for the canvas that a rounded box is needed in.
 * @param rectWidth The width of the rounded box.
 * @param rectHeight The height of the rounded box.
 * @param cornerRadius The radius that all the corners will recieve.
 */
function drawRoundedBox (context, rectWidth, rectHeight, cornerRadius)
{        
    context.save();
    context.beginPath();
    
    context.moveTo(cornerRadius,0);

    // Top line and top right corner.
    context.arcTo(rectWidth,0,rectWidth,cornerRadius,cornerRadius);

    // Right line and bottom right corner.
    context.arcTo(rectWidth,rectHeight,rectWidth-cornerRadius,rectHeight,cornerRadius); 

    // Bottom line and bottom left corner.
    context.arcTo(0,rectHeight,0,rectHeight-cornerRadius,cornerRadius);

    // Right line and top left corner.
    context.arcTo(0,0,cornerRadius,0,cornerRadius);

    
    context.closePath();    
    context.lineWidth = 3;
    context.fill();
    context.stroke();
    context.restore();
}

/**
 * Draws the grid that the game will take place on.
 * @param canvas The drawing canvas (contains width and heights).
 * @param context The drawing context of the canvas.
 * @param cellWidth The width of each individual cell in the grid.
 * @return An array of the bounding conditions for the grid [left, top, width, height].
 */
function drawGrid (canvas,context,cellWidth)
{
    var numVerticalIterations = canvas.width/cellWidth - 2;
    var numHorizontalIterations = canvas.height/cellWidth - 2;
    
    var left = cellWidth;
    var top = cellWidth;
    var grad = null;

    
    context.save();
    // This is used to reset the default path and present issues with drawing.
    context.beginPath();
    
    // Create the bounding box that will spell death for all daring enough to crash into it.
    context.strokeRect(left+cellWidth, top+cellWidth,
        (numHorizontalIterations-2) * cellWidth,(numVerticalIterations-2)* cellWidth);
    
    // The grid elements should have rounded caps.
    context.lineCap = "round";
    context.lineWidth = 1;
    
    context.beginPath();
    
    // Draw a vertical gradient for each vertical line.
    grad = context.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,"#02181d");
    grad.addColorStop(0.5,"#b5ffff");
    grad.addColorStop(1,"#02181d");
    context.strokeStyle = grad;
    
    // Draw each line iteratively.
    for(var x =1; x < numVerticalIterations; x++)
    {
        context.moveTo(left + x * cellWidth, top);
        context.lineTo(left + x * cellWidth, top + numHorizontalIterations * cellWidth);
    }
    
    context.stroke();
    context.beginPath();
    
    // Draw a horizontal gradient for each horizontal line.
    grad = context.createLinearGradient(0,0,canvas.width,0);    
    grad.addColorStop(0,"#02181d");
    grad.addColorStop(0.5,"#b5ffff");
    grad.addColorStop(1,"#02181d");    
    context.strokeStyle = grad;

    // Draw each line iteratively.
    for(var y =1; y < numVerticalIterations; y++)
    {
        context.moveTo(left, top + cellWidth*y);
        context.lineTo(left + numVerticalIterations * cellWidth, top + cellWidth*y);
    }
    
    context.stroke();    
    context.restore();
    
    return [left+cellWidth,top+cellWidth,numHorizontalIterations-2,numVerticalIterations-2];
}
