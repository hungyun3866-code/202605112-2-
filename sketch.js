let capture;
let faceMesh;
let faces = [];
let imgRing; // 耳環圖片變數

// 模型設定
let options = { 
  maxFaces: 1, 
  refineLandmarks: false, 
  flipHorizontal: false 
};

// 座標平滑處理
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true;

function preload() {
  // 1. 載入 FaceMesh 模型
  faceMesh = ml5.faceMesh(options);
  // 2. 載入指定的耳環圖片
  imgRing = loadImage('pic/acc/acc1_ring.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 背景設為寶寶藍
  background('#E1F0FF');

  // 1. 繪製文字資訊 (不隨影像翻轉)
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  textSize(20);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);

  // 2. 計算影像顯示範圍 (50% 畫布大小)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  // 3. 繪製影像 (鏡像處理)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, xOffset, yOffset, imgW, imgH);
  pop();

  // 4. 偵測與耳環顯示
  if (faces.length > 0) {
    let face = faces[0];
    let leftEarRaw = face.keypoints[177];
    let rightEarRaw = face.keypoints[401];

    if (leftEarRaw && rightEarRaw) {
      // 座標平滑濾波
      if (isFirstFrame) {
        leftEarSmooth = { x: leftEarRaw.x, y: leftEarRaw.y };
        rightEarSmooth = { x: rightEarRaw.x, y: rightEarRaw.y };
        isFirstFrame = false;
      } else {
        let amt = 0.3; 
        leftEarSmooth.x = lerp(leftEarSmooth.x, leftEarRaw.x, amt);
        leftEarSmooth.y = lerp(leftEarSmooth.y, leftEarRaw.y, amt);
        rightEarSmooth.x = lerp(rightEarSmooth.x, rightEarRaw.x, amt);
        rightEarSmooth.y = lerp(rightEarSmooth.y, rightEarRaw.y, amt);
      }

      // 繪製耳環圖片
      drawEarringImage(leftEarSmooth, xOffset, yOffset, imgW, imgH);
      drawEarringImage(rightEarSmooth, xOffset, yOffset, imgW, imgH);
    }
  }
}

function drawEarringImage(pt, ox, oy, iw, ih) {
  // 鏡像座標校正
  let flippedX = 640 - pt.x; 

  // 映射到畫布位置
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  // 設定耳環顯示大小 (根據影像寬度動態縮放)
  let ringW = iw * 0.08; 
  let ringH = (imgRing.height / imgRing.width) * ringW;

  // 繪製圖片，讓圖片頂部對準耳垂位置 (CENTER 模式方便對齊)
  imageMode(CENTER);
  image(imgRing, mx, my + (ringH/2), ringW, ringH);
  imageMode(CORNER); // 畫完切換回預設模式
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}