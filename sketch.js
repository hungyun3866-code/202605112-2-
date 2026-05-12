let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earImages = {};
let currentEarringIndex = 1; // 預設顯示第一款

// 座標平滑處理 (Smoothing) 防止抖動
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true;

function preload() {
  // 載入臉部與手勢模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipHorizontal: false });
  handPose = ml5.handPose({ flipHorizontal: false });

  // 載入五張耳環圖片
  earImages[1] = loadImage('pic/acc/acc1_ring.png');
  earImages[2] = loadImage('pic/acc/acc2_pearl.png');
  earImages[3] = loadImage('pic/acc/acc3_tassel.png');
  earImages[4] = loadImage('pic/acc/acc4_jade.png');
  earImages[5] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 攝影機設定
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
  // 背景顏色：寶寶藍
  background('#E1F0FF');

  // 1. 顯示文字資訊
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  textSize(20);
  text("作品為影像辨識_手勢耳環", width / 2, 75);

  // 2. 計算影像顯示範圍 (50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let ox = (width - imgW) / 2;
  let oy = (height - imgH) / 2;

  // 3. 繪製鏡像影像
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, ox, oy, imgW, imgH);
  pop();

  // 4. 手勢判斷邏輯
  if (hands.length > 0) {
    let count = countFingers(hands[0]);
    if (count >= 1 && count <= 5) {
      currentEarringIndex = count;
    }
  }

  // 5. 臉部辨識與耳環繪製
  if (faces.length > 0) {
    let face = faces[0];
    let leftEarRaw = face.keypoints[177];  // 左耳垂點
    let rightEarRaw = face.keypoints[401]; // 右耳垂點

    if (leftEarRaw && rightEarRaw) {
      // 應用平滑濾波
      if (isFirstFrame) {
        leftEarSmooth = { x: leftEarRaw.x, y: leftEarRaw.y };
        rightEarSmooth = { x: rightEarRaw.x, y: rightEarRaw.y };
        isFirstFrame = false;
      } else {
        let amt = 0.25; // 平滑係數
        leftEarSmooth.x = lerp(leftEarSmooth.x, leftEarRaw.x, amt);
        leftEarSmooth.y = lerp(leftEarSmooth.y, leftEarRaw.y, amt);
        rightEarSmooth.x = lerp(rightEarSmooth.x, rightEarRaw.x, amt);
        rightEarSmooth.y = lerp(rightEarSmooth.y, rightEarRaw.y, amt);
      }

      // 繪製耳環圖片
      drawEarring(leftEarSmooth, ox, oy, imgW, imgH, "left");
      drawEarring(rightEarSmooth, ox, oy, imgW, imgH, "right");
    }
  }
}

// 判定手指伸出數量的邏輯
function countFingers(hand) {
  let count = 0;
  // 偵測食指(8)、中指(12)、無名指(16)、小指(20) 的尖端是否高於關節
  let tips = [8, 12, 16, 20];
  let joints = [6, 10, 14, 18];
  for (let i = 0; i < 4; i++) {
    if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
  }
  // 大拇指判定 (4號點與3號點的水平距離)
  let thumbTip = hand.keypoints[4];
  let thumbJoint = hand.keypoints[3];
  if (dist(thumbTip.x, thumbTip.y, hand.keypoints[17].x, hand.keypoints[17].y) > 
      dist(thumbJoint.x, thumbJoint.y, hand.keypoints[17].x, hand.keypoints[17].y)) {
    count++;
  }
  return count;
}

function drawEarring(pt, ox, oy, iw, ih, side) {
  let img = earImages[currentEarringIndex];
  if (!img) return;

  // 鏡像座標校正
  let flippedX = 640 - pt.x; 
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  // 設定顯示大小
  let rw = iw * 0.12; 
  let rh = (img.height / img.width) * rw;

  // 【比率位移】 往上移 2% 高度，往外移 1.5% 寬度
  let yShift = ih * 0.02;
  let xShift = iw * 0.015;

  push();
  imageMode(CENTER);
  if (side === "left") {
    // 畫面左側耳朵往左位移
    image(img, mx - xShift, my - yShift + (rh / 2), rw, rh);
  } else {
    // 畫面右側耳朵往右位移
    image(img, mx + xShift, my - yShift + (rh / 2), rw, rh);
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}