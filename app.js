require('dotenv').config(); // .env 파일의 내용을 로드합니다.
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const db = require('./db.js'); // db.js 파일 불러오기
const cors = require('cors');

const app = express();
const port = 3000;

const allowedOrigins = ['http://localhost:8081', 'http://192.168.0.116:3000'];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));  const sessionStore = new MySQLStore({}, db); // MySQLStore 생성

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

app.use(session({
  secret: process.env.JWT_SECRET, // 환경 변수로 비밀키 설정
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
}));

// 라우터 설정
const authRouter = require('./routes/auth');
const ensureAuthenticated = require('./routes/authCheck');
const registerRouter = require('./routes/register');
const profileRouter = require('./routes/profile');
const passwordRouter = require('./routes/password');
const findIdRouter = require('./routes/findId');
const findPasswordRouter = require('./routes/findPassword');

app.use('/auth', authRouter);
app.use('/auth', registerRouter);
app.use('/profile', profileRouter);
app.use('/password', passwordRouter);
app.use('/find', findIdRouter); 
app.use('/find', findPasswordRouter); 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

