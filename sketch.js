let capture;
let faceMesh;
let faces = [];

// 模型設定參數
let options = { 
  maxFaces: 1, 
  refineLandmarks: false, 
  flipHorizontal: false 
};

function preload() {
  // 使用 ml5.faceMesh 初始化模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像內容
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 畫布背景顏色：更淺的寶寶藍
  background('#E1F0FF');

  // 計算顯示影像的寬高 (整個畫布寬高的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  
  // 計算置中位置
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  push();
  // 左右顛倒處理 (鏡像)
  translate(width, 0);
  scale(-1, 1);

  // 將影像正常顯示在視窗中間
  image(capture, xOffset, yOffset, imgW, imgH);

  // 影像辨識處理
  if (faces.length > 0) {
    let face = faces[0];

    // FaceMesh 關鍵點索引：177 為左耳垂區域, 401 為右耳垂區域
    let leftEar = face.keypoints[177];
    let rightEar = face.keypoints[401];

    if (leftEar) drawEarring(leftEar, xOffset, yOffset, imgW, imgH);
    if (rightEar) drawEarring(rightEar, xOffset, yOffset, imgW, imgH);
  }
  pop();
}

/**
 * 繪製耳環函式
 * @param {object} pt - 偵測到的特徵點座標
 * @param {number} ox - 影像顯示的 X 偏移量
 * @param {number} oy - 影像顯示的 Y 偏移量
 * @param {number} iw - 顯示影像的寬度
 * @param {number} ih - 顯示影像的高度
 */
function drawEarring(pt, ox, oy, iw, ih) {
  // 將攝影機原始座標 (640, 480) 映射到畫布上實際顯示的影像位置
  let mx = map(pt.x, 0, 640, ox, ox + iw);
  let my = map(pt.y, 0, 480, oy, oy + ih);

  fill(255, 255, 0); // 黃色圓圈
  noStroke();

  // 由耳垂位置往下顯示三個圓圈
  let circleSize = iw * 0.02; // 圓圈大小隨影像比例縮放
  let spacing = circleSize * 1.5; // 圓圈垂直間距
  
  for (let i = 0; i < 3; i++) {
    circle(mx, my + (i * spacing), circleSize);
  }
}

function windowResized() {
  // 當瀏覽器視窗改變大小時，重新設定全螢幕畫布
  resizeCanvas(windowWidth, windowHeight);
}