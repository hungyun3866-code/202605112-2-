let capture;
let faceMesh;
let faces = [];

// 模型參數設定
let options = { 
  maxFaces: 1, 
  refineLandmarks: false, 
  flipHorizontal: false 
};

function preload() {
  // 載入 ml5 faceMesh
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 建立攝影機
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');

  // 1. 繪製文字 (置中上方)
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  textSize(20);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);

  // 2. 計算影像顯示的範圍 (畫布的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  // 3. 繪製攝影機影像 (鏡像處理)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, xOffset, yOffset, imgW, imgH);
  pop();

  // 4. 繪製耳環 (關鍵：這裡要根據鏡像邏輯重新計算座標)
  if (faces.length > 0) {
    let face = faces[0];
    
    // 177: 左耳垂, 401: 右耳垂
    let leftEar = face.keypoints[177];
    let rightEar = face.keypoints[401];

    drawEarring(leftEar, xOffset, yOffset, imgW, imgH);
    drawEarring(rightEar, xOffset, yOffset, imgW, imgH);
  }
}

function drawEarring(pt, ox, oy, iw, ih) {
  // 重要：因為影像做了 scale(-1, 1)，
  // 偵測到的 pt.x 需要被翻轉回來才能對準畫面上的耳朵位置
  let flippedX = 640 - pt.x; 

  // 將翻轉後的座標映射到畫布上顯示的影像區域
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  fill(255, 255, 0); // 黃色
  noStroke();

  // 繪製三個垂直圓圈 (耳環樣式)
  let circleSize = iw * 0.025; 
  let spacing = circleSize * 1.3; 
  
  for (let i = 0; i < 3; i++) {
    // 從耳垂位置 (mx, my) 開始向下繪製
    circle(mx, my + (i * spacing), circleSize);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}