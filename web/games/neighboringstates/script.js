const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const numStates = 50; // Number of states
const radius = 450; // Radius of the circle
const centerX = 500; // X coordinate of the circle center
const centerY = 500; // Y coordinate of the circle center
const angleStep = (2 * Math.PI) / numStates; // Angle between each state

const state_names = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];


const lineColor = 'black'; // Color for the permanent lines
const currentLineColor = 'gray'; // Color for the line being drawn
const color1 = 'blue'; // Color for the first half of the states
const color2 = 'red'; // Color for the second half of the states


let experiment_mode = true;
let wrong_connections_count = 0;
let lines = [];
const linePairs = new Set(); // To keep track of existing lines

const state_status = state_names.map((state_name, index) => {
    return {
      name: state_name,
      x: centerX + radius * Math.cos(index * angleStep),
      y: centerY + radius * Math.sin(index * angleStep),
      index: index, // Store the index for color determination
      //isChosen: false,
      //isMoved: false
    };
  });

  let currentMouseX = 0;
  let currentMouseY = 0;
  let game_status = ["nothing", "nothing"]; // "nothing", "moving_state_around", "drawing_line" X "nothing", "Alabama" ,..., "Wyoming"
  

function drawStates() {
    //console.log("entering drawStates");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state_status.forEach(state => {
        // Alternate colors
        const fillColor = state.index % 2 === 0 ? color1 : color2;
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        ctx.arc(state.x, state.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(state.name, state.x + 10, state.y);
    });
    //console.log("exiting drawStates");
}

function drawLines() {
    //console.log("entering drawLines");
    ctx.strokeStyle = lineColor; // Set color for the permanent lines
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
    });
    //console.log("exiting drawLines");
}

function ggg(state_name)
{
    return state_status.find(state => state.name === state_name);
}

function drawCurrentLine() {
    //console.log("entering drawCurrentLine");

    if (game_status[0] === "drawing_line") {
        ctx.strokeStyle = currentLineColor; // Set color for the current line
        ctx.beginPath();
        state = ggg(game_status[1]);
        ctx.moveTo(state.x, state.y);
        ctx.lineTo(currentMouseX, currentMouseY);
        ctx.stroke();
    }
    //console.log("exiting drawCurrentLine");
}

function distanceToLine(x1, y1, x2, y2, px, py) {
    //console.log("entering distanceToLine");
    // Compute the distance from a point to a line segment
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = (len_sq !== 0) ? dot / len_sq : -1;
    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;

    //console.log("exiting distanceToLine");
    return Math.sqrt(dx * dx + dy * dy);
}



function onCanvasMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    currentMouseX = event.clientX - rect.left;
    currentMouseY = event.clientY - rect.top;
    if (game_status[0] === "moving_state_around") {
        // Update position of the dragging state
        state = ggg(game_status[1])
        state.x = currentMouseX;
        state.y = currentMouseY;
    }
    drawStates();
    drawLines();
    drawCurrentLine();

}

function touched_state(event)
{
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Check if a state is clicked
    return state_status.find(state => Math.hypot(state.x - x, state.y - y) < 10);
}

function asdf(state1, state2)
{
    if(state1.name === state2.name)
        return;

    let key = [state1.name, state2.name].sort().join('-');
    if (linePairs.has(key))
    {
        linePairs.delete(key);
        lines = lines.filter(line => 
            !((line[0].name === state1.name && line[1].name === state2.name) || (line[0].name === state2.name && line[1].name === state1.name))
        );
    }
    else
    {
        if(experiment_mode === false || answerPairs.has(key))
        {
            linePairs.add(key);
            lines.push([state1, state2]);
        }
        if(!answerPairs.has(key))
        {
            wrong_connections_count = wrong_connections_count + 1;
        }
    }
}

// right click = moving state around
function onCanvasMouseDown(event) {
    //console.log(game_status[0]);
    //console.log(game_status[1]);

    const state = touched_state(event);
    //console.log(state);

    if (state)
    {
        if(event.button === 2)
        {
            if(game_status[0] != "moving_state_around")
            {
                game_status[0] = "moving_state_around";
                game_status[1] = state.name;
            }
            else
            {
                game_status[0] = "nothing";
                game_status[1] = "nothing";    
            }
        }
        else if(game_status[0] === "drawing_line")
        {
            asdf(state, ggg(game_status[1]))
            game_status[0] = "nothing";
            game_status[1] = "nothing";
        }
        else
        {
            game_status[0] = "drawing_line";
            game_status[1] = state.name;
        }
    }
    else // didn't touch a state
    {
        game_status[0] = "nothing";
        game_status[1] = "nothing";

        // Check if a line is clicked
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;    
        const threshold = 5; // Distance threshold to consider a click on the line
        const lineToRemove = lines.find(line => 
            distanceToLine(line[0].x, line[0].y, line[1].x, line[1].y, x, y) < threshold
        );

        if (lineToRemove)
        {
            // Remove the line from lines and linePairs
            lines = lines.filter(line => line !== lineToRemove);
            let key = [lineToRemove[0].name, lineToRemove[1].name].sort().join('-');
            linePairs.delete(key);
        }

    }
    drawStates();
    drawLines();
    drawCurrentLine();
}


canvas.addEventListener('mousemove', onCanvasMouseMove);


canvas.addEventListener('mousedown', onCanvasMouseDown);
// Prevent context menu from showing on right-click
canvas.addEventListener('contextmenu', event => event.preventDefault());


// canvas.addEventListener('mouseup', onCanvasMouseUp);
// canvas.addEventListener('click', onCanvasClick);





drawStates();
drawLines();



function computeDifferenceCardinality(set1, set2) {

    // Compute the difference: elements in set1 that are not in set2
    const difference1 = new Set([...set1].filter(x => !set2.has(x)));
    console.log(difference1);
    const difference2 = new Set([...set2].filter(x => !set1.has(x)));
    console.log(difference2);

    // Return the cardinality (number of unique elements in the difference)
    return [difference1.size, difference2.size];
}



answerPairs = new Set(['Alabama-Florida', 'Alabama-Georgia', 'Alabama-Mississippi', 'Alabama-Tennessee', 'Arizona-California', 'Arizona-Colorado', 'Arizona-Nevada', 'Arizona-New Mexico', 'Arizona-Utah', 'Arkansas-Louisiana', 'Arkansas-Mississippi', 'Arkansas-Missouri', 'Arkansas-Oklahoma', 'Arkansas-Tennessee', 'Arkansas-Texas', 'California-Nevada', 'California-Oregon', 'Colorado-Kansas', 'Colorado-Nebraska', 'Colorado-New Mexico', 'Colorado-Oklahoma', 'Colorado-Utah', 'Colorado-Wyoming', 'Connecticut-Massachusetts', 'Connecticut-New York', 'Connecticut-Rhode Island', 'Delaware-Maryland', 'Delaware-New Jersey', 'Delaware-Pennsylvania', 'Florida-Georgia', 'Georgia-North Carolina', 'Georgia-South Carolina', 'Georgia-Tennessee', 'Idaho-Montana', 'Idaho-Nevada', 'Idaho-Oregon', 'Idaho-Utah', 'Idaho-Washington', 'Idaho-Wyoming', 'Illinois-Indiana', 'Illinois-Iowa', 'Illinois-Kentucky', 'Illinois-Missouri', 'Illinois-Wisconsin', 'Indiana-Kentucky', 'Indiana-Michigan', 'Indiana-Ohio', 'Iowa-Minnesota', 'Iowa-Missouri', 'Iowa-Nebraska', 'Iowa-South Dakota', 'Iowa-Wisconsin', 'Kansas-Missouri', 'Kansas-Nebraska', 'Kansas-Oklahoma', 'Kentucky-Missouri', 'Kentucky-Ohio', 'Kentucky-Tennessee', 'Kentucky-Virginia', 'Kentucky-West Virginia', 'Louisiana-Mississippi', 'Louisiana-Texas', 'Maine-New Hampshire', 'Maryland-Pennsylvania', 'Maryland-Virginia', 'Maryland-West Virginia', 'Massachusetts-New Hampshire', 'Massachusetts-New York', 'Massachusetts-Rhode Island', 'Massachusetts-Vermont', 'Michigan-Ohio', 'Michigan-Wisconsin', 'Minnesota-North Dakota', 'Minnesota-South Dakota', 'Minnesota-Wisconsin', 'Mississippi-Tennessee', 'Missouri-Nebraska', 'Missouri-Oklahoma', 'Missouri-Tennessee', 'Montana-North Dakota', 'Montana-South Dakota', 'Montana-Wyoming', 'Nebraska-South Dakota', 'Nebraska-Wyoming', 'Nevada-Oregon', 'Nevada-Utah', 'New Hampshire-Vermont', 'New Jersey-New York', 'New Jersey-Pennsylvania', 'New Mexico-Oklahoma', 'New Mexico-Texas', 'New Mexico-Utah', 'New York-Pennsylvania', 'New York-Vermont', 'North Carolina-South Carolina', 'North Carolina-Tennessee', 'North Carolina-Virginia', 'North Dakota-South Dakota', 'Ohio-Pennsylvania', 'Ohio-West Virginia', 'Oklahoma-Texas', 'Oregon-Washington', 'Pennsylvania-West Virginia', 'South Dakota-Wyoming', 'Tennessee-Virginia', 'Utah-Wyoming', 'Virginia-West Virginia']);


document.getElementById('computeButton').addEventListener('click', function() {
    const cardinality = computeDifferenceCardinality(linePairs, answerPairs);
    document.getElementById('result').textContent = `Cardinality of the difference: ${cardinality} wrong connections count ${wrong_connections_count}`;
});
