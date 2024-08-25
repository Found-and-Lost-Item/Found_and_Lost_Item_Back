// require('dotenv').config(); // .env 파일의 내용을 로드합니다.
// const express = require('express');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const MySQLStore = require('express-mysql-session')(session);
// const path = require('path');
// const db = require('./db.js'); // db.js 파일 불러오기
// const cors = require('cors');

// const app = express();
// const port = 3000;

// const allowedOrigins = ['http://localhost:8081', 'http://192.168.0.116:3000'];
// app.use(cors({
//   origin: function(origin, callback) {
//     // allow requests with no origin
//     // (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   }
// }));  const sessionStore = new MySQLStore({}, db); // MySQLStore 생성

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// app.use(session({
//   secret: process.env.JWT_SECRET, // 환경 변수로 비밀키 설정
//   resave: false,
//   saveUninitialized: true,
//   store: sessionStore,
// }));

// // 라우터 설정
// const authRouter = require('./routes/auth');
// const ensureAuthenticated = require('./routes/authCheck');
// const registerRouter = require('./routes/register');
// const profileRouter = require('./routes/profile');
// const passwordRouter = require('./routes/password');
// const findIdRouter = require('./routes/findId');
// const findPasswordRouter = require('./routes/findPassword');

// app.use('/auth', authRouter);
// app.use('/auth', registerRouter);
// app.use('/profile', profileRouter);
// app.use('/password', passwordRouter);
// app.use('/find', findIdRouter); 
// app.use('/find', findPasswordRouter); 

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });







require('dotenv').config(); // .env 파일의 내용을 로드합니다.
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const db = require('./db.js'); // db.js 파일 불러오기
const cors = require('cors');
const multer = require('multer'); // 파일 업로드 처리 미들웨어

const app = express();
const port = 3000;

// CORS 설정
const allowedOrigins = ['http://localhost:8081', 'http://192.168.0.82:3000'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// MySQL 세션 저장소 설정
const sessionStore = new MySQLStore({}, db); // MySQLStore 생성

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// 세션 미들웨어 설정
app.use(session({
  secret: '1102', 
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
}));

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  // 파일 저장 위치 설정
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);  // 파일 이름 설정
  }
});
const upload = multer({ storage: storage });

// upload를 모든 라우터에서 사용 가능하게 설정
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// 라우터 설정
const authRouter = require('./routes/auth');
const ensureAuthenticated = require('./routes/authCheck');
const registerRouter = require('./routes/register');
const profileRouter = require('./routes/profile');
const passwordRouter = require('./routes/password');
const findIdRouter = require('./routes/findId');
const findPasswordRouter = require('./routes/findPassword');
const writeLostRouter = require('./routes/writeLostboard'); // 분실물 라우터 추가
const writeFoundRouter = require('./routes/writeFoundboard'); // 습득물 라우터 추가
const viewLostRouter = require('./routes/viewLostboard');
const viewFoundRouter = require('./routes/viewFoundboard');
// const categoryRoutes = require('./routes/category.js');


app.use('/auth', authRouter);
app.use('/auth', registerRouter);
app.use('/profile', profileRouter);
app.use('/password', passwordRouter);
app.use('/find', findIdRouter); 
app.use('/find', findPasswordRouter); 
app.use('/add', writeLostRouter);  // 분실물 등록 라우터 설정
app.use('/found', writeFoundRouter); // 습득물 등록 라우터 설정
app.use('/lost', viewLostRouter);
app.use('/found', viewFoundRouter);
// app.use('/category', categoryRoutes);
// // 정적 HTML 파일 제공 (category.html 위치에 따라 경로 변경 필요)
// app.get('/category', (req, res) => {
//   res.sendFile(path.join(__dirname, 'category.html'));
// });

// 정적 파일 제공 설정 (이미지 업로드 경로)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 서버 시작
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
////

// const express = require('express');
// const session = require('express-session');
// const path = require('path');
// const bodyParser = require('body-parser');
// const multer = require('multer'); //파일 업로드 처리 미들웨어
// const cors = require('cors');

// // 먼저 express 애플리케이션 초기화
// const app = express();

// app.use(cors());

// // multer 설정
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function(req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });
// const upload = multer({ storage: storage });

// // upload를 모든 라우터에서 사용 가능하게 설정
// app.use((req, res, next) => {
//   req.upload = upload;
//   next();
// });

// // 세션 미들웨어 설정
// app.use(session({
//   secret: '1102',  // 세션 암호화에 사용될 키
//   resave: false,              // 세션이 수정되지 않더라도 세션을 다시 저장할지 여부
//   saveUninitialized: true     // 초기화되지 않은 세션을 저장할지 여부
// }));

// // body-parser 설정 . 폼데이터를 파싱하기위한 미들웨어 설정(라우터 설정 이전에 위치)
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // 라우터 설정
// const routes = require('./routes/index');
// const writeFound = require('./routes/foundboard'); 

// app.use('/add', routes);  //  /submit
// app.use('/found', writeFound); //  /found/submitFoundItem

// // 정적 파일 제공 설정 (이미지 업로드 경로)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const port = 3000;
// app.listen(port, () => {
//   console.log(`${port}번 포트 가동`);
// });

// module.exports = app;

