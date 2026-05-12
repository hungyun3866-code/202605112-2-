let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earImages = {};
let currentEarringIndex = 1; // 預設顯示 acc1_ring.png

// 座標平滑處理 (防止耳環閃爍)
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true;

function preload() {
  // 載入模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipHorizontal: false });
  handPose = ml5.handPose({ flipHorizontal: false });

  // 載入五張耳環圖片
  earImages[1] = loadImage('pic/acc/acc1_ring.png');
  earImages[2] = loadImage('pic/acc/acc2_pearl.png');
  earImages[3] = loadImage('pic/acc/acc3_tassel.png'); // 比 3 出現這張
  earImages[4] = loadImage('pic/acc/acc4_jade.png');   // 比 4 出現這張
  earImages[5] = loadImage('pic/acc/acc5_phoenix.png'); // 比 5 出現這張
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測
  faceMesh.detectStart(capture, gotFaces);
  handPose.detectStart(capture, gotHands);
}

function gotFaces(results) { faces = results; }
function gotHands(results) { hands = results; }

function draw() {
  background('#E1F0FF'); // 寶寶藍背景

  // 1. 文字顯示 (位於畫布上方)
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  textSize(20);
  text("作品為影像辨識_手勢耳環", width / 2, 75);

  // 2. 影像位置與尺寸 (50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let ox = (width - imgW) / 2;
  let oy = (height - imgH) / 2;

  // 3. 繪製鏡像攝影機畫面
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, ox, oy, imgW, imgH);
  pop();

  // 4. 手勢判斷：切換耳環索引
  if (hands.length > 0) {
    let count = countFingers(hands[0]);
    // 當偵測到 1~5 根手指時切換圖片
    if (count >= 1 && count <= 5) {
      currentEarringIndex = count;
    }
  }

  // 5. 耳環跟隨與繪製
  if (faces.length > 0) {
    let face = faces[0];
    let leftEarRaw = face.keypoints[177];
    let rightEarRaw = face.keypoints[401];

    if (leftEarRaw && rightEarRaw) {
      // 平滑座標
      if (isFirstFrame) {
        leftEarSmooth = { x: leftEarRaw.x, y: leftEarRaw.y };
        rightEarSmooth = { x: rightEarRaw.x, y: rightEarRaw.y };
        isFirstFrame = false;
      } else {
        let amt = 0.25;
        leftEarSmooth.x = lerp(leftEarSmooth.x, leftEarRaw.x, amt);
        leftEarSmooth.y = lerp(leftEarSmooth.y, leftEarRaw.y, amt);
        rightEarSmooth.x = lerp(rightEarSmooth.x, rightEarRaw.x, amt);
        rightEarSmooth.y = lerp(rightEarSmooth.y, rightEarRaw.y, amt);
      }

      // 繪製耳環 (含比率位移)
      drawEarring(leftEarSmooth, ox, oy, imgW, imgH, "left");
      drawEarring(rightEarSmooth, ox, oy, imgW, imgH, "right");
    }
  }
}

// 手指數量計算邏輯
function countFingers(hand) {
  let count = 0;
  // 食指(8), 中指(12), 無名指(16), 小指(20) 的尖端與關節
  let tips = [8, 12, 16, 20];
  let joints = [6, 10, 14, 18];
  
  // 檢查四根長手指是否伸直
  for (let i = 0; i < 4; i++) {
    if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
  }
  
  // 大拇指判定：判斷大拇指尖端(4)與小指根部(17)的距離，是否大於大拇指關節(3)到小指根部的距離
  let dTip = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[17].x, hand.keypoints[17].y);
  let dJoint = dist(hand.keypoints[3].x, hand.keypoints[3].y, hand.keypoints[17].x, hand.keypoints[17].y);
  if (dTip > dJoint) count++;

  return count;
}

function drawEarring(pt, ox, oy, iw, ih, side) {
  let img = earImages[currentEarringIndex];
  if (!img) return;

  // 鏡像校正
  let flippedX = 640 - pt.x; 
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  // 尺寸比率：耳環寬度為影像寬度的 12%
  let rw = iw * 0.12; 
  let rh = (img.height / img.width) * rw;

  // 【比率位移】 往上移 2% 高度，往外移 2% 寬度，讓它看起來掛在耳垂邊緣
  let yShift = ih * 0.02;
  let xShift = iw * 0.02;

  push();
  imageMode(CENTER);
  if (side === "left") {
    image(img, mx - xShift, my - yShift + (rh / 2), rw, rh);
  } else {
    image(img, mx + xShift, my - yShift + (rh / 2), rw, rh);
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}