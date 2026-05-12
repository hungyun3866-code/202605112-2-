let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 載入 ml5 faceMesh 影像辨識模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始臉部偵測
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 1. 繪製文字資訊（置中上方，位於擷取影像之外）
  fill(0); // 文字顏色設為黑色
  noStroke();
  textAlign(CENTER, CENTER);
  
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  
  textSize(20);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);

  // 2. 計算影像顯示尺寸（畫布寬高的 50%）
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  push();
  // 3. 處理左右顛倒（鏡像）
  // 先將原點移到畫布中心，翻轉後再畫影像
  translate(width, 0);
  scale(-1, 1);

  // 在畫面中間顯示影像
  image(capture, xOffset, yOffset, imgW, imgH);

  // 4. 影像辨識：繪製耳環
  if (faces.length > 0) {
    let face = faces[0];

    // FaceMesh 關鍵點：177 為左耳垂區域, 401 為右耳垂區域
    let leftEar = face.keypoints[177];
    let rightEar = face.keypoints[401];

    if (leftEar) drawEarring(leftEar, xOffset, yOffset, imgW, imgH);
    if (rightEar) drawEarring(rightEar, xOffset, yOffset, imgW, imgH);
  }
  pop();
}

function drawEarring(pt, ox, oy, iw, ih) {
  // 座標映射：將攝影機原始座標 (640, 480) 映射到影像顯示區域
  let mx = map(pt.x, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  fill(255, 255, 0); // 黃色
  noStroke();

  // 繪製三個垂直排列的圓圈，模擬耳環掛在耳垂並往下垂
  let circleSize = iw * 0.02; 
  let spacing = circleSize * 1.5; 
  
  for (let i = 0; i < 3; i++) {
    circle(mx, my + (i * spacing), circleSize);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}