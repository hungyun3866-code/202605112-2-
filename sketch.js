let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earImages = [];
let currentEarIndex = 1; // 預設為 1

// 平滑化參數，讓耳環不閃爍
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true;

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipHorizontal: false });
  handPose = ml5.handPose({ flipHorizontal: false });

  // 嚴格對應編號載入圖片
  earImages[1] = loadImage('pic/acc/acc1_ring.png');
  earImages[2] = loadImage('pic/acc/acc2_pearl.png');
  earImages[3] = loadImage('pic/acc/acc3_tassel.png');
  earImages[4] = loadImage('pic/acc/acc4_jade.png');
  earImages[5] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  faceMesh.detectStart(capture, results => { faces = results; });
  handPose.detectStart(capture, results => { hands = results; });
}

function draw() {
  background('#E1F0FF'); // 寶寶藍

  // 文字資訊
  fill(0); noStroke(); textAlign(CENTER, CENTER);
  textSize(24); text("414730860洪千涵", width / 2, 40);
  textSize(20); text("作品為影像辨識_手勢耳環", width / 2, 75);

  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let ox = (width - imgW) / 2;
  let oy = (height - imgH) / 2;

  // 繪製畫面 (鏡像)
  push();
  translate(width, 0); scale(-1, 1);
  image(capture, ox, oy, imgW, imgH);
  pop();

  // 手勢偵測邏輯：直接連動圖片索引
  if (hands.length > 0) {
    let fingerCount = getFingerCount(hands[0]);
    // 只有在比出 1~5 時才切換
    if (fingerCount >= 1 && fingerCount <= 5) {
      currentEarIndex = fingerCount;
    }
  }

  // 臉部辨識與耳環繪製
  if (faces.length > 0) {
    let face = faces[0];
    let leftPt = face.keypoints[177];
    let rightPt = face.keypoints[401];

    if (leftPt && rightPt) {
      if (isFirstFrame) {
        leftEarSmooth = { x: leftPt.x, y: leftPt.y };
        rightEarSmooth = { x: rightPt.x, y: rightPt.y };
        isFirstFrame = false;
      } else {
        leftEarSmooth.x = lerp(leftEarSmooth.x, leftPt.x, 0.2);
        leftEarSmooth.y = lerp(leftEarSmooth.y, leftPt.y, 0.2);
        rightEarSmooth.x = lerp(rightEarSmooth.x, rightPt.x, 0.2);
        rightEarSmooth.y = lerp(rightEarSmooth.y, rightPt.y, 0.2);
      }
      
      drawEarring(leftEarSmooth, ox, oy, imgW, imgH, "left");
      drawEarring(rightEarSmooth, ox, oy, imgW, imgH, "right");
    }
  }
}

// 判定手指數量的函式
function getFingerCount(hand) {
  let count = 0;
  let tips = [8, 12, 16, 20]; // 食、中、無名、小指
  let joints = [6, 10, 14, 18];
  
  for (let i = 0; i < 4; i++) {
    if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
  }
  
  // 大拇指獨立判定：檢查拇指尖端與手掌中心的距離
  let thumbTip = hand.keypoints[4];
  let palm = hand.keypoints[0]; 
  let thumbBase = hand.keypoints[2];
  if (dist(thumbTip.x, thumbTip.y, palm.x, palm.y) > dist(thumbBase.x, thumbBase.y, palm.x, palm.y)) {
    count++;
  }
  return count;
}

function drawEarring(pt, ox, oy, iw, ih, side) {
  let img = earImages[currentEarIndex];
  if (!img) return;

  let fx = 640 - pt.x; 
  let mx = map(fx, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  let rw = iw * 0.12; 
  let rh = (img.height / img.width) * rw;

  // 比率位移：往上 2%，往外 2%
  let yShift = ih * 0.02;
  let xShift = iw * 0.02;

  push();
  imageMode(CENTER);
  // 這裡根據 side 決定往哪邊「往外」移
  let finalX = (side === "left") ? mx - xShift : mx + xShift;
  image(img, finalX, my - yShift + (rh / 2), rw, rh);
  pop();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }