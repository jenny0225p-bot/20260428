// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let statusMsg = "系統檢查中...";
let isWebglSupported = false;

function preload() {
  isWebglSupported = checkWebGL();
  if (isWebglSupported) {
    statusMsg = "正在載入 ml5 模型...";
    try {
      // 初始化 HandPose，並加入載入完成的回呼函式
      handPose = ml5.handPose({ flipped: true }, modelLoaded);
    } catch (e) {
      statusMsg = "模型載入失敗: " + e.message;
    }
  } else {
    statusMsg = "錯誤：此裝置不支援 WebGL，無法執行影像辨識。";
  }
}

function modelLoaded() {
  statusMsg = "模型載入成功！";
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (isWebglSupported) {
    // 嘗試啟動攝影機，並加入成功/失敗判斷
    video = createCapture(VIDEO, { flipped: true }, function(stream) {
      if (stream) {
        console.log("Camera ready");
      } else {
        statusMsg = "無法存取攝影機，請檢查權限設定";
      }
    });
    
    // 關鍵修正：確保在手機上視訊能正常在網頁內播放，且不會自動跳轉全螢幕
    video.elt.setAttribute('playsinline', ''); 
    video.hide();
  }
}

function draw() {
  background('#e7c6ff');

  // 確保視訊已經準備好且有寬高資訊
  if (!video || video.width <= 1) {
    drawStatusMessage();
    return;
  }

  // 計算影像顯示的大小（畫布的 50%）
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  // 計算置中座標
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  image(video, x, y, displayW, displayH);

  drawStatusMessage();

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          
          // 將原始影像座標映射到畫布縮放後的座標
          let mappedX = map(keypoint.x, 0, video.width, x, x + displayW);
          let mappedY = map(keypoint.y, 0, video.height, y, y + displayH);
          
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 繪製狀態訊息的輔助函式
function drawStatusMessage() {
  push();
  fill(0, 150); // 半透明背景
  rect(0, 0, width, 40);
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text(statusMsg, width / 2, 20);
  pop();
}

// 檢查瀏覽器是否支援 WebGL 的輔助函式
function checkWebGL() {
  try {
    let canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}
