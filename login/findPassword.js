const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { hashPassword } = require('../utils/auth');

// 비밀번호 찾기 (재설정) API
router.post('/find_password', async (req, res) => {
  const { user_id, phone_number } = req.body;

  console.log("Received user id:", user_id, "Received phone number:", phone_number);

  try {
    const [user] = await db.promise().query(
      'SELECT * FROM user WHERE user_id = ? AND user_phone_number = ?',
      [user_id, phone_number]
    );

    if (user.length === 0) {
      return res.json({ exists: false, message: '사용자를 찾을 수 없습니다.' });
    }

    return res.json({ exists: true, message: '사용자를 찾았습니다.' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});


// 비밀번호 변경 API
router.post('/change_password', async (req, res) => {
    const { user_id, phone_number, new_password } = req.body;
  
    console.log("user id:", user_id, "phone number:", phone_number, "new password.");
  
    try {
      const [user] = await db.promise().query(
        'SELECT * FROM user WHERE user_id = ? AND user_phone_number = ?',
        [user_id, phone_number]
      );
  
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
      }
  
      const hashedPassword = await hashPassword(new_password);
  
      await db.promise().query('UPDATE user SET user_password = ? WHERE user_id = ?', [hashedPassword, user_id]);
  
      res.json({ success: true, message: '비밀번호가 성공적으로 업데이트되었습니다.' });
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
  });
  
  module.exports = router;