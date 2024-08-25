const express = require('express'); //express 라는 프레임워크 모듈을 부른다
const router = express.Router(); //express의 라우터 객체를 사용하여 라우트 정의를 모듈화하고 이를 주 서버 파일에서 사용
const db = require('../db.js'); //db.js 파일을 모듈 요청해 불러온다
const { generateToken, comparePassword } = require('../utils/auth'); //generateToken, comparePassword 유틸리티 함수를 불러 오는데 토큰 생성과 비밀번호 비교를 위해 utils 폴더에 auth.js 파일을 요청해 불러온다

router.post('/login_process', async (req, res) => { //로그인 프로세스 경로에 post 요청이 들어오면 요청을 처리하는데 post는 제출하거나 업데이트 할때 사용 비동기 함수로 작성되어 작업을 간편하게 처리 비동기 함수는 작업이 완료될 때까지 기다리지 않고 다른 작업을 계속 수행할 수 있게해주는 함수 async, await를 사용
    const { user_id, user_password } = req.body; // 아이디와 패스워트를 요청하는 곳에서 추출합니다 즉 req.body에서 추출하는데 req.body는 클라이언트가 보낸 JSON 데이터
    console.log(req.body);

    if (!user_id || !user_password) { //만약 아이디와 패스워드를 제공하지 않으면 밑 과 같이 에러 메세지 반환
        return res.status(300).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
    }

    try { // 밑 코드 블록 내에서 발생하는 오류 감지 처리 오류가 발생하면 catch 블록으로  제어가 이동해 오류 처리 finally도 있는데 오류 발생 여부와 상관없이 항상 실행하는 코드
        const [user] = await db.promise().query('SELECT * FROM user WHERE user_id = ?', [user_id]); //db에서 id에 해당하는 사용자 조회
        console.log(user);
        if (user.length === 0) { //조회된 사용자가 없는 경우 밑과 같이 에러 메세지 반환
            console.log("!");
            return res.status(400).json({ success: false, message: '잘못된 사용자 아이디 또는 비밀번호입니다.' });
        }

        const isMatch = await comparePassword(user_password, user[0].user_password); // 사용자가 입력한 비밀번호가 db에 저장된 비밀번호 비교 일지 하지 않을 경우 밑과 같은 에러 메세지 반환~
        console.log("!!!");
        if (!isMatch) {
            console.log("!!!!");
            return res.status(400).json({ success: false, message: '잘못된 사용자 아이디 또는 비밀번호입니다.' });
        }

        console.log("Generating token for user:", user[0]);
        const token = generateToken(user[0]); //사용자 정보를 가진 jwt 토큰 생성
        console.log("!!");
        req.session.is_logined = true; //세션에 로그인 상태 유지
        req.session.nickname = user_id; //세션에 사용자의 닉네임 저장
        res.json({ success: true, token }); // true 값과 함께 생성된 토큰 반환
    } catch (error) { //에러 발생시 밑 에러 메세지 나옴
        console.error('Token generation error:', error);
        res.status(500).json({ success: false, message: '토큰 오류가 발생했습니다.' });
    }
});

module.exports = router; //라우터를 모듈로 내보냄