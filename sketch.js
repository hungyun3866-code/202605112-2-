let capture;
let faceMesh;
let faces = [];

// 模型設定
let options = { 
  maxFaces: 1, 
  refineLandmarks: false, 
  flipHorizontal: false // 保持偵測座標為原始狀態
};

// 為了平滑座標採用的全局變數，防止閃爍
let leftEarSmooth = { x: 0, y: 0 };
let rightEarSmooth = { x: 0, y: 0 };
let isFirstFrame = true; // 用於初始化平滑座標

function preload() {
  // 載入 ml5 faceMesh (確保 index.html 已引入 ml5 函式庫)
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
  // 背景顏色設為 #e7c6ff
  background('#e7c6ff');

  // 1. 繪製文字 (置中上方)
  fill(0); // 文字顏色為黑色
  noStroke();
  textAlign(CENTER, CENTER);
  
  textSize(24);
  text("414730860洪千涵", width / 2, 40);
  
  textSize(20);
  text("作品為影像辨識_耳環臉譜", width / 2, 75);

  // 2. 計算影像顯示尺寸 (畫布的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let xOffset = (width - imgW) / 2;
  let yOffset = (height - imgH) / 2;

  push();
  // 3. 處理影像左右顛倒 (鏡像效果)
  // 將畫布原點移至右側並翻轉 X 軸
  translate(width, 0);
  scale(-1, 1);

  // 繪製攝影機影像於中央
  image(capture, xOffset, yOffset, imgW, imgH);
  pop();

  // 4. 影像辨識：繪製耳環 (關鍵校正區域)
  if (faces.length > 0) {
    let face = faces[0];
    
    // FaceMesh 關鍵點索引：177 為左耳垂區域, 401 為右耳垂區域
    let leftEarRaw = face.keypoints[177];
    let rightEarRaw = face.keypoints[401];

    if (leftEarRaw && rightEarRaw) {
      // 應用座標平滑，大幅減少閃爍
      if (isFirstFrame) {
        // 第一幀直接初始化
        leftEarSmooth = { x: leftEarRaw.x, y: leftEarRaw.y };
        rightEarSmooth = { x: rightEarRaw.x, y: rightEarRaw.y };
        isFirstFrame = false;
      } else {
        // 抖動濾波器：使用 70% 的權重給予前一幀的座標，30% 給予新點位
        // 這會使移動更平滑，但反應仍足夠靈敏
        let smoothFactor = 0.7;
        leftEarSmooth.x = lerp(leftEarRaw.x, leftEarSmooth.x, smoothFactor);
        leftEarSmooth.y = lerp(leftEarRaw.y, leftEarSmooth.y, smoothFactor);
        rightEarSmooth.x = lerp(rightEarRaw.x, rightEarSmooth.x, smoothFactor);
        rightEarSmooth.y = lerp(rightEarRaw.y, rightEarSmooth.y, smoothFactor);
      }

      // 對平滑後的座標進行精準對齊繪製
      // 這裡使用了新的座標翻轉邏輯
      drawEarring(leftEarSmooth, xOffset, yOffset, imgW, imgH);
      drawEarring(rightEarSmooth, xOffset, yOffset, imgW, imgH);
    }
  }
}

/**
 * 繪製平滑且對齊的耳環函式
 * @param {object} smoothedPt - 平滑後的原始偵測座標
 * @param {number} ox - 影像顯示的 X 偏移量
 * @param {number} oy - 影像顯示的 Y 偏移量
 * @param {number} iw - 顯示影像的寬度
 * @param {number} ih - 顯示影像的高度
 */
function drawEarring(smoothedPt, ox, oy, iw, ih) {
  // 關鍵校正：計算翻轉後的 X 座標
  // 原始影像寬度為 640，flippedX 會將 X 座標進行左右對調
  let flippedX = 640 - smoothedPt.x; 

  // 將翻轉後的 X 與 Y 座標映射到畫布上實際顯示的影像區域
  let mx = map(flippedX, 0, 640, ox, ox + iw);
  let my = map(smoothedPt.y, 0, 480, oy, oy + ih);

  fill(255, 255, 0); // 黃色圓圈
  noStroke();

  // 繪製三個垂直排列的圓圈 (耳環樣式)
  let circleSize = iw * 0.025; // 圓圈大小隨影像比例縮放
  let spacing = circleSize * 1.3; // 圓圈垂直間距
  
  for (let i = 0; i < 3; i++) {
    // 從平滑過後的耳垂位置 (mx, my) 開始往下繪製
    circle(mx, my + (i * spacing), circleSize);
  }
}

function windowResized() {
  // 當視窗大小改變時，重新設定全螢幕畫布
  resizeCanvas(windowWidth, windowHeight);
}