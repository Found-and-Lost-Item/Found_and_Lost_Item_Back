const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { hashPassword } = require('../utils/auth');
const bcrypt = require('bcrypt');

// 비밀번호 재설정 API
router.post('/reset_password', async (req, res) => {
  const { user_id, current_password, new_password } = req.body;

  try {
    const [user] = await db.promise().query('SELECT user_password FROM user WHERE user_id = ?', [user_id]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(current_password, user[0].user_password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
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
