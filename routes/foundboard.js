const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const db = require('../db');

router.post('/submitFoundItem', upload.single('foundImageUrl'), (req, res) => {
  const { foundTitle, foundContent, foundCategory, foundDate, foundLatitude, foundLongitude } = req.body;
  const foundImageUrl = req.file ? req.file.filename : null;
  const noImage = req.body.noImage || false;

  req.session.noImage = noImage;
  req.session.foundImageUrl = foundImageUrl;

  let finalImageUrl = null;

  if (noImage) {
    const categoryQ = `SELECT category_image FROM category WHERE category_id = ?`;
    db.query(categoryQ, [foundCategory], (err, results) => {
      if (err) {
        console.error('카테고리 이미지 불러오기 오류:', err);
        return res.status(500).json({ message: '카테고리 이미지 불러오기 실패', success: false });
      }

      if (results.length > 0) {
        finalImageUrl = results[0].category_image;
        insertFoundBoard(finalImageUrl);
      } else {
        res.status(400).json({ message: '카테고리 이미지를 찾을 수 없음', success: false });
      }
    });
  } else {
    finalImageUrl = foundImageUrl;
    insertFoundBoard(finalImageUrl);
  }

  function insertFoundBoard(imageUrl) {
    const foundboardQ = `
      INSERT INTO foundboard (category_id, found_title, found_content, found_create_date, found_date, found_state, found_latitude, found_longitude, id)
      VALUES (?, ?, ?, NOW(), ?, true, ?, ?, 1)
    `;

    db.query(foundboardQ, [foundCategory, foundTitle, foundContent, foundDate, foundLatitude, foundLongitude], (err, foundboardR) => {
      if (err) {
        console.error('게시물 등록 중 데이터베이스 오류:', err);
        return res.status(500).json({ message: '게시물 등록 실패', success: false });
      }

      const foundBoardId = foundboardR.insertId;

      if (imageUrl) {
        const foundimageaddQ = `
          INSERT INTO foundimage (found_board_id, found_image_url)
          VALUES (?, ?)
        `;

        db.query(foundimageaddQ, [foundBoardId, imageUrl], (err) => {
          if (err) {
            console.error('이미지 데이터베이스 업데이트 중 오류:', err);
            return res.status(500).json({ message: '이미지 등록 실패', success: false });
          }
          res.json({ message: '습득물 게시물 등록 성공', success: true });
        });
      } else {
        res.json({ message: '습득물 게시물 등록 성공', success: true });
      }
    });
  }
});

module.exports = router;