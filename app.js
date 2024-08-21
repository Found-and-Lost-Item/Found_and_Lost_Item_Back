const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer'); //파일 업로드 처리 미들웨어
const cors = require('cors');

// 먼저 express 애플리케이션 초기화
const app = express();

app.use(cors());

// multer 설정
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// upload를 모든 라우터에서 사용 가능하게 설정
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// 세션 미들웨어 설정
app.use(session({
  secret: '1102',  // 세션 암호화에 사용될 키
  resave: false,              // 세션이 수정되지 않더라도 세션을 다시 저장할지 여부
  saveUninitialized: true     // 초기화되지 않은 세션을 저장할지 여부
}));

// body-parser 설정 . 폼데이터를 파싱하기위한 미들웨어 설정(라우터 설정 이전에 위치)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우터 설정
const routes = require('./routes/index');
const writeFound = require('./routes/foundboard'); 

app.use('/add', routes);  //  /submit
app.use('/found', writeFound); //  /found/submitFoundItem

// 정적 파일 제공 설정 (이미지 업로드 경로)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3000;
app.listen(port, () => {
  console.log(`${port}번 포트 가동`);
});

module.exports = app;