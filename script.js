// === Lucky Draw - Wheel Only ===

// Prize Config
const greenPrizeConfig = [
    { name: "頭獎", code: "DP300", offer: "折500元" },
    { name: "普獎", code: "SPFREE", offer: "免運" },
    { name: "二獎", code: "SP200", offer: "折150元" },
    { name: "普獎", code: "SPFREE", offer: "免運" },
    { name: "一獎", code: "FP200", offer: "折200元" },
    { name: "普獎", code: "SPFREE", offer: "免運" },
    { name: "二獎", code: "SP200", offer: "折150元" },
    { name: "普獎", code: "SPFREE", offer: "免運" },
    { name: "一獎", code: "FP200", offer: "折200元" },
    { name: "普獎", code: "SPFREE", offer: "免運" },
    { name: "二獎", code: "SP200", offer: "折150元" },
    { name: "普獎", code: "SPFREE", offer: "免運" }
];

const segmentColors = [
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"
];

// DOM
const modal = document.getElementById("result-modal");
const modalResult = document.getElementById("modal-result");

// Canvas
const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");
let wheelAngle = 0;
let wheelSpinning = false;
let wheelSpeed = 0;
const PLAYED_KEY = "luckyDrawPlayed";
const PRIZE_KEY = "luckyDrawPrize";

// --- Modal ---
function showModal(content, isHTML = false) {
    if (isHTML) {
        modalResult.innerHTML = content;
    } else {
        modalResult.textContent = content;
    }
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
}

function closeModal() {
    modal.classList.remove("show");
    setTimeout(() => { modal.style.display = "none"; }, 300);
}

// --- Draw Wheel ---
function drawWheel() {
    const numSegments = greenPrizeConfig.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelAngle);

    for (let i = 0; i < numSegments; i++) {
        const angle = i * arcSize;

        // Segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + arcSize);
        ctx.fillStyle = segmentColors[i];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(angle + arcSize / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 3;
        ctx.fillText(greenPrizeConfig[i].name, radius - 25, 7);
        ctx.restore();
    }

    // Center circle decoration
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fill();

    ctx.restore();
}

// --- Start Game ---
function startGreenGame() {
    if (wheelSpinning) return;
    if (localStorage.getItem(PLAYED_KEY)) {
        const saved = JSON.parse(localStorage.getItem(PRIZE_KEY));
        showAlreadyPlayed(saved);
        return;
    }
    wheelSpinning = true;
    document.getElementById("start-btn-green").disabled = true;
    wheelSpeed = 0.35 + Math.random() * 0.25;
    requestAnimationFrame(animateWheel);
}

function showAlreadyPlayed(prize) {
    const html = `
        <div style="font-size: 20px; font-weight:700; color:#e65100;">⚠️ 您已經抽過囉！</div>
        <div style="font-size: 14px; color: #888; margin: 8px 0;">每人限抽一次</div>
        ${prize ? `
        <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border: 2px dashed #4CAF50; border-radius: 10px;">
            您的獎項：<strong>${prize.name}</strong> (${prize.offer})<br><br>
            折扣碼：<strong style="color: #d32f2f; font-size: 22px; letter-spacing: 2px;">${prize.code}</strong>
        </div>
        <div style="font-size: 12px; color: #999; margin-top: 8px;">(請截圖保存折扣碼)</div>
        ` : ''}
    `;
    showModal(html, true);
}

// --- Animate ---
function animateWheel() {
    if (!wheelSpinning) return;

    wheelAngle += wheelSpeed;
    wheelSpeed *= 0.986;
    drawWheel();

    if (wheelSpeed < 0.002) {
        wheelSpinning = false;
        document.getElementById("start-btn-green").disabled = false;

        const actualAngle = wheelAngle % (2 * Math.PI);
        const numSegments = greenPrizeConfig.length;
        const arcSize = (2 * Math.PI) / numSegments;

        let pointerAngle = (3 * Math.PI / 2 - actualAngle) % (2 * Math.PI);
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;

        const winningIndex = Math.floor(pointerAngle / arcSize);
        const prize = greenPrizeConfig[winningIndex];

        const resultHTML = `
            <div style="font-size: 26px; font-weight:900; color:#2e7d32;">🎉 ${prize.name} 🎉</div>
            <div style="font-size: 18px; color: #555; margin: 8px 0;">${prize.offer}</div>
            <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border: 2px dashed #4CAF50; border-radius: 10px;">
                您的折扣碼：<br>
                <strong style="color: #d32f2f; font-size: 26px; letter-spacing: 2px;">${prize.code}</strong>
            </div>
            <div style="font-size: 12px; color: #999; margin-top: 8px;">(請截圖保存折扣碼)</div>
        `;
        // Save to localStorage
        localStorage.setItem(PLAYED_KEY, "true");
        localStorage.setItem(PRIZE_KEY, JSON.stringify(prize));
        setTimeout(() => showModal(resultHTML, true), 300);
    } else {
        requestAnimationFrame(animateWheel);
    }
}

// --- Init ---
drawWheel();

// Check if already played
if (localStorage.getItem(PLAYED_KEY)) {
    const btn = document.getElementById("start-btn-green");
    btn.textContent = "已抽過";
    btn.style.fontSize = "12px";
    btn.disabled = true;
}
