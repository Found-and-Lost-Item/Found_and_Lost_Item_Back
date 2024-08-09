const jwt = require('jsonwebtoken'); //jwt 라이브러리  생성하고 검증하는 라이브러리 
const bcrypt = require('bcrypt'); //비밀번호 해싱하는 라이브러리
require('dotenv').config(); //.env 파일의 환경 변수를 불러온다

const { JWT_SECRET } = process.env; //.env 파일에 정의된 jwt 시크릿 환경 변수 가져옴

const generateToken = (user) => { // 사용자 정보를 기반으로 jwt 토큰 생성 함수
  return jwt.sign({ id: user.id, username: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
}; // jwt.sign 함수를 사용해 토큰 생성
   // payload로 사용자 아이디와 이름을 포함하고 토큰의 유효기간은 1시간으로 지정 payload는 토큰에 담을 실제 데이터

const hashPassword = async (password) => { //해싱 패스워드를 해싱하는 비동기 함수 
  const salt = await bcrypt.genSalt(10); // 솔트 값 생성 10은 라운드 수를 말하는데 값이 높을수록 해싱은 늦지만 보안성이 높아진다 
  return bcrypt.hash(password, salt); //bcrypt.hash 함수는 비밀번호와 솔트를 사용하여 해싱된 비밀번호 생성 솔트는 보안을 강화하기 위해 사용하는데 동일한 비밀번호라도 서로 다른 해시 값을 가지게 하는 것
};

const comparePassword = async (password, hashedPassword) => { //comparePassword 함수는 입력된 비밀번호를 비교하는 비동기 함수 
  return bcrypt.compare(password, hashedPassword); //bcrypt.compare 함수는 입력된 비밀번호와 해싱된 비밀번호를 비교해 일치하는지 확인하고 반환
};

module.exports = { generateToken, hashPassword, comparePassword }; // 세가지 함수를 모듈로 내보내 다른 파일에서 사용할 수 있게 함
