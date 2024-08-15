// require('dotenv').config(); // .env 파일의 내용을 로드합니다.
// const express = require('express');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const MySQLStore = require('express-mysql-session')(session);
// const path = require('path');
// const db = require('./db.js'); // db.js 파일 불러오기

// const app = express();
// const port = 3000;

// const sessionStore = new MySQLStore({}, db); // MySQLStore 생성

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공

// app.use(session({
//   secret: process.env.JWT_SECRET, // 환경 변수로 비밀키 설정
//   resave: false,
//   saveUninitialized: true,
//   store: sessionStore,
// }));

// // 루트 경로에 대한 라우트 추가
// app.get('/', (req, res) => {
//   res.send('Welcome to the backend server!');
// });

// // 라우터 설정
// const authRouter = require('./login/auth');
// const ensureAuthenticated = require('./login/authCheck');
// const registerRouter = require('./login/register');

// app.use('/auth', authRouter);
// app.use('/auth', registerRouter);

// // 보호된 라우트 설정
// app.get('/protected-route', ensureAuthenticated, (req, res) => {
//   res.json({ message: 'This is a protected route' });
// });

// // 메인 페이지
// app.get('/main.html', ensureAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'main.html'));
// });

// // 지도 페이지
// app.get('/map.html', ensureAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'map.html'));
// });

// app.listen(port, '0.0.0.0', () => {
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
const authRouter = require('./login/auth');
const ensureAuthenticated = require('./login/authCheck');
const registerRouter = require('./login/register');
const profileRouter = require('./login/profile');
const passwordRouter = require('./login/password');
const findIdRouter = require('./login/findId');
const findPasswordRouter = require('./login/findPassword');

app.use('/auth', authRouter);
app.use('/auth', registerRouter);
app.use('/profile', profileRouter);
app.use('/password', passwordRouter);
app.use('/find', findIdRouter); // /find_id로 접근
app.use('/find', findPasswordRouter); // /find_password로 접근

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

