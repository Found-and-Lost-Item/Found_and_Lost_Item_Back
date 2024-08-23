const express = require('express');
const router = express.Router();
const db = require('../db.js');
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

// 프로필 수정 API
router.post('/update_profile', upload.single('profile_image'), async (req, res) => {
  const { user_id, user_name } = req.body;
  const user_profile_image = req.file ? req.file.filename : null;

  console.log("user :", user_id, user_name, user_profile_image);

  try {
    await db.promise().query(
      'UPDATE user SET user_name = ?, user_profile_image = ? WHERE user_id = ?',
      [user_name, user_profile_image, user_id]
    );
    res.json({ success: true, message: '프로필이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('Error during profile update:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
