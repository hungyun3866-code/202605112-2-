let capture;
let faceMesh;
let faces = [];

// 模型設定
let options = { 
  maxFaces: 1, 
  refineLandmarks: false, 
  flipHorizontal: false 
};

// 用於平滑座標，防止耳環抖動閃爍
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true;

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 建立全螢幕畫布
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
  // 【修正】背景改回寶寶藍
  background('#E1F0FF');

  // 1. 繪製文字資訊 (置中上方)
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  textSize(20);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);

  // 2. 計算影像顯示尺寸 (畫布 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  push();
  // 3. 處理影像左右顛倒 (鏡像效果)
  translate(width, 0);
  scale(-1, 1);
  image(capture, xOffset, yOffset, imgW, imgH);
  pop();

  // 4. 影像辨識：繪製耳環
  if (faces.length > 0) {
    let face = faces[0];
    let leftEarRaw = face.keypoints[177];
    let rightEarRaw = face.keypoints[401];

    if (leftEarRaw && rightEarRaw) {
      // 座標平滑化 (防閃爍)
      if (isFirstFrame) {
        leftEarSmooth = { x: leftEarRaw.x, y: leftEarRaw.y };
        rightEarSmooth = { x: rightEarRaw.x, y: rightEarRaw.y };
        isFirstFrame = false;
      } else {
        let amt = 0.3; // 數值越小越平滑，跟隨感越重
        leftEarSmooth.x = lerp(leftEarSmooth.x, leftEarRaw.x, amt);
        leftEarSmooth.y = lerp(leftEarSmooth.y, leftEarRaw.y, amt);
        rightEarSmooth.x = lerp(rightEarSmooth.x, rightEarRaw.x, amt);
        rightEarSmooth.y = lerp(rightEarSmooth.y, rightEarRaw.y, amt);
      }

      // 繪製耳環：帶入平滑後的點位與顯示參數
      drawEarring(leftEarSmooth, xOffset, yOffset, imgW, imgH);
      drawEarring(rightEarSmooth, xOffset, yOffset, imgW, ih = imgH);
    }
  }
}

function drawEarring(pt, ox, oy, iw, ih) {
  // 【核心校正】計算對齊鏡像影像的 X 座標
  let flippedX = 640 - pt.x; 

  // 將偵測座標映射至畫布顯示區域
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  fill(255, 255, 0); // 黃色
  noStroke();

  let circleSize = iw * 0.025; 
  let spacing = circleSize * 1.3; 
  
  for (let i = 0; i < 3; i++) {
    circle(mx, my + (i * spacing), circleSize);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}