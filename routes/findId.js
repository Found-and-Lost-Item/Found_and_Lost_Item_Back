const express = require('express');
const router = express.Router();
const db = require('../db.js');

// 아이디 찾기 API
router.post('/find_id', async (req, res) => {
  console.log('Request received for /find_id'); // 로그 추가
  const { phone_number } = req.body;

  console.log("Received phone number:", phone_number); // 요청 받은 데이터 출력

  try {
    const [user] = await db.promise().query(
      'SELECT user_id FROM lostitem.user WHERE user_phone_number = ?',
      [phone_number]
    );

    if (user.length === 0) {
      console.log("User not found for phone number:", phone_number); // 유저가 없는 경우 로그 출력
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    console.log("User found:", user[0].user_id); // 유저가 있는 경우 로그 출력
    res.json({ success: true, user_id: user[0].user_id });
  } catch (error) {
    console.error('Error during ID finding:', error); // 오류 로그 출력
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

