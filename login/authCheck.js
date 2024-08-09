const jwt = require('jsonwebtoken'); //JSON Web Token 라이브러리를 불러온다
require('dotenv').config(); //.env 파일에 설정된 환경 변수 부른다 

const { JWT_SECRET } = process.env; //시크릿 키를 가져온다

function ensureAuthenticated(req, res, next) { 
    const token = req.headers['authorization']; //클라이언트가 보낸 요청의 'authorization' 헤더에서 토큰을 가져온다 이 헤더는 클라이언트 측에서 http 요청을 보낼 때 포함하고 jwt 토큰과 같은 인증 정보 포함 이때 fetch나 axios를 사용해 헤더 설정
                                                // 서버측은 클라이언트가 보낸 모든 헤더에 접근 함 req.headers['authorization'] 이렇게 가져온 토큰을 유효성 검사하는 거

    if (!token) { //요청에 토큰이 없으면 밑 에러 메세지 나옴
        return res.status(401).json({ success: false, message: '토큰이 필요합니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => { //토큰을 검증하는데 jwt.verify 이 함수 사용 토큰이 유효하지 않으면 에러 메세지가 나오고  유효하면 디코딩된 사용자 정보가 req.user에 담기고 next로 함수 호출해 다음 미들웨어로 제어
        if (err) {
            return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
        }

        req.user = decoded; //디코딩은 원래 정보를 추출하는과정
        next();
    });
}

module.exports = ensureAuthenticated; // 이 함수는 요청이 적절한 jwt 토큰을 포함하고 있는지 확인하는 미들웨어 유효한지 먼저 확인하고 유효하지 않으면 에러 메세지 유효하면 다음 미들웨어 함수로제어


//미들웨어 함수 express에서 요청과 응답 사이에 실행되는 함수 요청 응답 다음 미들웨어 함수 호출 (req, res, next) 함수를 세 가지 인수 가짐 
//역할은 요청 정보 변경 가공 , 응답 정보 변경 가공등있음
//애플리케이션 레벨 미들웨어: app.use() 또는 app.METHOD()로 설정합니다.
// 라우터 레벨 미들웨어: router.use() 또는 router.METHOD()로 설정합니다.
// 에러 처리 미들웨어: err 객체를 포함하여 네 가지 인수를 가집니다 (err, req, res, next).
// 내장 미들웨어: Express에 내장된 미들웨어입니다 (express.static 등).
// 서드파티 미들웨어: 타사 라이브러리가 제공하는 미들웨어입니다 (body-parser 등).
