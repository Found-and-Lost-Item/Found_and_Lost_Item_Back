// const express = require('express');
// const router = express.Router();
// const db = require('../db.js');
// const { hashPassword } = require('../utils/auth');

// // 중복 확인 처리
// router.get('/check_duplicate', (request, response) => { // '/check_duplicate' 경로에 대한 GET 요청을 처리하는 라우트 핸들러
//     const field = Object.keys(request.query)[0]; //// 요청 쿼리의 첫 번째 키(필드 이름)를 추출
//     const value = request.query[field]; // 해당 필드 이름에 대한 값을 추출

//     let query = ''; //쿼리 문자열 초기화
//     if (field === 'user_phone_number') { //필드가 유저 폰 넘버
//         query = 'SELECT * FROM user WHERE user_phone_number = ?';//해당 전화번호로 사용자를 조회하는 쿼리
//     } else if (field === 'user_id') { //필드가 유저 아이디
//         query = 'SELECT * FROM user WHERE user_id = ?'; //해당 아이디 사용자를 조회하는 쿼리
//     }

//     db.query(query, [value], (error, results) => { //db 쿼리 실행 value는 매개변수로 사용
//         if (error) { //에러 발생시 오류 메세지 출력
//             console.error('Error during SELECT query:', error);
//             response.json({ exists: false }); //클라이언트한테 오류 발생 알림
//             return;
//         }
//         response.json({ exists: results.length > 0 }); //조회된 결과가 있으면 클라이언트에 응답 있으면 true 아님 flase
//     });
// });

// // 회원가입 처리
// router.post('/register', async (request, response) => {
//     const { user_id, user_phone_number, user_password, user_password2, user_name, user_profile_image, user_address, user_nickname } = request.body;

//     if (!user_id || !user_phone_number || !user_password || !user_password2 || !user_name || !user_profile_image || !user_address || !user_nickname) {
//         return response.status(400).json({ success: false, message: '모든 필드를 입력하세요.' });
//     }

//     if (user_password !== user_password2) {
//         return response.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
//     }

//     try {
//         const [user] = await db.promise().query('SELECT * FROM user WHERE user_id = ?', [user_id]);
//         if (user.length > 0) {
//             return response.status(400).json({ success: false, message: '이미 존재하는 사용자 이름입니다.' });
//         }

//         const hashedPassword = await hashPassword(user_password);
//         await db.promise().query(
//           'INSERT INTO user (user_id, user_phone_number, user_password, user_name, user_profile_image, user_address, user_nickname) VALUES (?, ?, ?, ?, ?, ?, ?)',
//           [user_id, user_phone_number, hashedPassword, user_name, user_profile_image, user_address, user_nickname]
//         );
//         response.json({ success: true, message: '회원가입이 완료되었습니다.' });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         response.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
//     }
// });

// module.exports = router;













const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { hashPassword } = require('../utils/auth');
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름을 고유하게 설정
  },
});

const upload = multer({ storage: storage });

// 중복 확인 처리
router.get('/check_duplicate', (request, response) => {
  const field = Object.keys(request.query)[0];
  const value = request.query[field];

  let query = '';
  if (field === 'user_phone_number') {
    query = 'SELECT * FROM user WHERE user_phone_number = ?';
  } else if (field === 'user_id') {
    query = 'SELECT * FROM user WHERE user_id = ?';
  }

  db.query(query, [value], (error, results) => {
    if (error) {
      console.error('Error during SELECT query:', error);
      response.json({ exists: false });
      return;
    }
    response.json({ exists: results.length > 0 });
  });
});

// 회원가입 처리
router.post('/register', async (request, response) => {
  const { user_id, user_phone_number, user_password, user_password2, user_name, user_profile_image, user_address, user_detailed_address } = request.body;

  // 모든 필드가 제공되었는지 확인
  if (!user_id || !user_phone_number || !user_password || !user_password2 || !user_name || !user_address || !user_detailed_address) {
    return response.status(400).json({ success: false, message: '모든 필드를 입력하세요.' });
  }

  // 비밀번호 확인
  if (user_password !== user_password2) {
    return response.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  }

  try {
    // 이미 존재하는 사용자 확인
    const [user] = await db.promise().query('SELECT * FROM user WHERE user_id = ?', [user_id]);
    if (user.length > 0) {
      return response.status(400).json({ success: false, message: '이미 존재하는 사용자 이름입니다.' });
    }

    const hashedPassword = await hashPassword(user_password);
    await db.promise().query(
      'INSERT INTO user (user_id, user_phone_number, user_password, user_name, user_profile_image, user_address, user_detailed_address, user_nickname) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_phone_number, hashedPassword, user_name, user_profile_image || null, user_address, user_detailed_address, null] // user_profile_image와 user_nickname을 null로 처리
    );
    response.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('Error during registration:', error);
    response.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 프로필 이미지와 이름 처리
router.post('/register_step2', upload.single('profile_image'), async (req, res) => {
  const { name } = req.body;
  const profileImage = req.file ? req.file.filename : '';

  // DB에 저장 로직을 추가하세요. 여기서는 예시로 콘솔에 출력합니다.
  console.log(`Name: ${name}`);
  console.log(`Profile Image: ${profileImage}`);

  // 성공적으로 처리되었음을 클라이언트에 응답합니다.
  res.json({ success: true, message: '회원가입 2단계가 완료되었습니다.' });
});

// 주소와 상세주소 처리
router.post('/register_step3', async (req, res) => {
  const { address, detailedAddress } = req.body;

  if (!address || !detailedAddress) {
    return res.status(400).json({ success: false, message: '주소와 상세주소를 입력하세요.' });
  }

  // 주소와 상세주소를 DB에 저장하는 로직을 추가하세요. 예시로 콘솔에 출력합니다.
  console.log(`Address: ${address}`);
  console.log(`Detailed Address: ${detailedAddress}`);

  // 성공적으로 처리되었음을 클라이언트에 응답합니다.
  res.json({ success: true, message: '회원가입 3단계가 완료되었습니다.' });
});

// 최종 회원가입 처리
router.post('/register_final', async (req, res) => {
  const { user_id, user_phone_number, user_password, user_name, user_profile_image, user_address, user_nickname, user_detailed_address } = req.body;

  if (!user_id || !user_phone_number || !user_password || !user_name || !user_address || !user_detailed_address) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력하세요.' });
  }

  try {
    // 최종 사용자 데이터를 DB에 저장하는 로직을 추가하세요
    await db.promise().query(
      'UPDATE user SET user_name = ?, user_profile_image = ?, user_address = ?, user_nickname = ?, user_detailed_address = ? WHERE user_id = ?',
      [user_name, user_profile_image || null, user_address, user_nickname, user_detailed_address, user_id]
    );
    res.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('Error during final registration:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;