
// --- Check if script is loaded ---
console.log("Lucky Draw Script Loaded");

// --- Global Variables ---
let currentMode = 'green'; // 'red' or 'green'
const redPrizes = ["獎項1", "獎項2", "獎項3", "獎項4", "獎項5", "獎項6", "獎項7", "獎項8"];
const greenPrizes = ["大獎", "二獎", "三獎", "四獎", "五獎", "六獎"];
const greenColors = ["#FFEB3B", "#4CAF50", "#FFC107", "#8BC34A", "#FF5722", "#009688"]; // Yellows and Greens

// --- DOM Elements ---
const modal = document.getElementById("result-modal");
const modalResult = document.getElementById("modal-result");
const redGameSection = document.getElementById("game-red");
const greenGameSection = document.getElementById("game-green");
const btnRedMode = document.getElementById("btn-red-mode");
const btnGreenMode = document.getElementById("btn-green-mode");

// --- Mode Switching ---
function switchMode(mode) {
    currentMode = mode;
    if (mode === 'red') {
        redGameSection.classList.add('active');
        greenGameSection.classList.remove('active');
        btnRedMode.classList.add('active');
        btnGreenMode.classList.remove('active');
    } else {
        redGameSection.classList.remove('active');
        greenGameSection.classList.add('active');
        btnRedMode.classList.remove('active');
        btnGreenMode.classList.add('active');
        // Redraw wheel when switching to make sure it renders
        drawWheel();
    }
}

// --- Modal Functions ---
function showModal(text) {
    modalResult.textContent = text;
    modal.style.display = "flex";
    // Trigger reflow for transition
    setTimeout(() => {
        modal.classList.add("show");
    }, 10);
}

function closeModal() {
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // Match transition duration
}


// ==========================================
// RED GRID GAME LOGIC
// ==========================================

// Map grid indices (0-8) to visual order (clockwise)
// 0 1 2
// 7 8 3  (8 is center, not part of loop usually, but here 8 is button)
// 6 5 4
// So path is: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 0 ...
const gridOrder = [0, 1, 2, 3, 4, 5, 6, 7];
let redCurrentIndex = -1; // Current active grid index
let redSpeed = 100;       // Initial speed (ms)
let redTimer = null;
let redIsRunning = false;
let redSteps = 0;         // Total steps taken
let redTargetSteps = 0;   // Target steps to stop

function startRedGame() {
    if (redIsRunning) return;
    redIsRunning = true;
    document.getElementById("start-btn-red").disabled = true;

    // Reset logic
    redSpeed = 300;
    redSteps = 0;
    // Determine random stop position (relative to current or fresh)
    // We want to run at least 3 rounds (8 * 3 = 24 steps) + random offset
    const randomOffset = Math.floor(Math.random() * 8);
    redTargetSteps = 24 + randomOffset;

    runRedStep();
}

function runRedStep() {
    // 1. Highlight current block
    // Calculate actual grid index from step count
    const currentPos = redSteps % 8;
    const gridIndex = gridOrder[currentPos];

    // Clear previous highlights
    document.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));

    // Add highlight to current
    const activeItem = document.querySelector(`.grid-item[data-index='${gridIndex}']`);
    if (activeItem) activeItem.classList.add('active');

    // 2. Control Speed
    // Accelerate (start slow -> fast)
    if (redSteps < 5) {
        redSpeed -= 40;
    } else if (redSteps > redTargetSteps - 8) {
        // Decelerate (end fast -> slow)
        redSpeed += 60;
    } else {
        // Max Speed
        redSpeed = 50;
    }

    // 3. Check for End
    if (redSteps >= redTargetSteps) {
        redIsRunning = false;
        document.getElementById("start-btn-red").disabled = false;
        // Show result
        const prizeName = activeItem.textContent || "未知獎品";
        setTimeout(() => showModal(prizeName), 300);
        return;
    }

    // 4. Next Step
    redSteps++;
    redTimer = setTimeout(runRedStep, redSpeed);
}

// Initialize Grid Labels (Optional: Set prizes to grid items)
function initRedGrid() {
    const items = document.querySelectorAll('.grid-item');
    items.forEach((item, i) => {
        // item has data-index. 
        // NOTE: Our gridOrder is [0,1,2,3...]. 
        // Let's just assign sequential prizes to the DOM order or Logical order.
        // Simple: Assign by data-index
        const idx = parseInt(item.getAttribute('data-index'));
        if (idx < 8) {
            item.textContent = redPrizes[idx];
        }
    });
}


// ==========================================
// GREEN WHEEL GAME LOGIC
// ==========================================
const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");
let wheelAngle = 0;       // Current rotation angle
let wheelSpinning = false;
let wheelSpeed = 0;
let wheelDecel = 0.98;   // Deceleration factor

function drawWheel() {
    const numSegments = greenPrizes.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Padding

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelAngle); // Rotate the whole wheel

    for (let i = 0; i < numSegments; i++) {
        const angle = i * arcSize;

        // Draw Segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + arcSize);
        ctx.fillStyle = greenColors[i % greenColors.length];
        ctx.fill();
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.rotate(angle + arcSize / 2);
        ctx.fillStyle = "#333";
        ctx.font = "bold 20px 'Roboto', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(greenPrizes[i], radius - 20, 10);
        ctx.restore();
    }
    ctx.restore();
}

function startGreenGame() {
    if (wheelSpinning) return;
    wheelSpinning = true;
    document.getElementById("start-btn-green").disabled = true;

    // Initial random kick
    wheelSpeed = 0.4 + Math.random() * 0.3; // Speed for animation loop

    requestAnimationFrame(animateWheel);
}

function animateWheel() {
    if (!wheelSpinning) return;

    wheelAngle += wheelSpeed;
    // Decelerate
    wheelSpeed *= 0.985; // Friction

    drawWheel();

    // Check stop condition
    if (wheelSpeed < 0.002) {
        wheelSpinning = false;
        document.getElementById("start-btn-green").disabled = false;

        // Calculate result
        // Pointer is at Top ( -PI/2 in canvas space, but we rotated canvas)
        // Effectively, we just check where the pointer (Angle 0 or 270deg relative to wheel start) lands.
        // Actually, our pointer CSS is at Top. Canvas 0 is at 3 o'clock (Right). 
        // So Top is 270 deg (3*PI/2) or -90 deg (-PI/2).

        // Normalize angle to 0 - 2PI
        const actualAngle = wheelAngle % (2 * Math.PI);

        // The wheel rotates Clockwise. The pointer is fixed at Top (-PI/2).
        // To find which segment is at Top, we need to correct the rotation.
        // Segment 0 starts at 0 (Right) and goes to arcSize (Clockwise).
        // Wait, standard arc is clockwise? yes default.

        // Let's simplify: 
        // We rotated the context by `wheelAngle`. 
        // The pointer is at 270 degrees (-PI/2) in the "World" space.
        // In the "Wheel" space, the pointer location is: WorldPointer - WheelRotation.
        // Pointer Angle in Wheel Space = (3*Math.PI/2) - actualAngle;

        const numSegments = greenPrizes.length;
        const arcSize = (2 * Math.PI) / numSegments;

        // Math correction to ensure positive modulus
        let pointerAngle = (3 * Math.PI / 2 - actualAngle) % (2 * Math.PI);
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;

        const winningIndex = Math.floor(pointerAngle / arcSize);

        setTimeout(() => showModal(greenPrizes[winningIndex]), 200);
    } else {
        requestAnimationFrame(animateWheel);
    }
}

// --- Initialization ---
// window.onload = function() {
initRedGrid();
drawWheel(); // Initial draw
// };
