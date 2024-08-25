const express = require('express');
const router = express.Router();
const db = require('../db');

// 분실물 게시글 조회 API
router.get('/viewLostItems', (req, res) => {
  const { category, order, search } = req.query;

  // 쿼리문을 작성할 변수를 let으로 선언합니다.
  let viewLostQ = `
    SELECT lostboard.*, lostimage.lost_image_url 
    FROM lostboard 
    LEFT JOIN lostimage 
    ON lostboard.lost_board_id = lostimage.lost_board_id 
    WHERE true
  `;

  // 카테고리 필터링이 있을 경우 쿼리문에 추가합니다.
  if (category) {
    viewLostQ += ` AND lostboard.category_id = ${db.escape(category)}`;
  }

  // 검색 필터링이 있을 경우 쿼리문에 추가합니다.
  if (search) {
    viewLostQ += ` AND (lost_title LIKE ${db.escape('%' + search + '%')} OR lost_content LIKE ${db.escape('%' + search + '%')})`;
  }

  // 정렬 옵션에 따라 쿼리문을 수정합니다.
  switch (order) {
    case 'oldest':
      viewLostQ += ' ORDER BY lost_create_date ASC';
      break;
    case 'nameorder':  
      viewLostQ += ' ORDER BY lost_title ASC';
      break;
    default:
      viewLostQ += ' ORDER BY lost_create_date DESC';
      break;
  }

  // 데이터베이스에 쿼리를 실행하고 결과를 가져옵니다.
  db.query(viewLostQ, (err, viewLostR) => {
    if (err) {
      console.error('게시글 조회 중 오류:', err);
      return res.status(500).json({ message: '게시글 조회 실패', success: false });
    }

    // 결과를 클라이언트에 JSON 형식으로 전송합니다.
    res.json({ message: '게시글 조회 성공', success: true, data: viewLostR });
  });
});


// 여기부터 상세페이지

router.get('/viewLostItem/:id', (req, res) => {
  const { id } = req.params;

  const viewLostDetailQ = `
    SELECT lostboard.*, lostimage.lost_image_url 
    FROM lostboard 
    LEFT JOIN lostimage 
    ON lostboard.lost_board_id = lostimage.lost_board_id 
    WHERE lostboard.lost_board_id = ${db.escape(id)}
  `;

  db.query(viewLostDetailQ, (err, viewLostDetailR) => {
    if (err) {
      console.error('게시글 조회 중 오류:', err);
      return res.status(500).json({ message: '게시글 조회 실패', success: false });
    }

    if (viewLostDetailR.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.', success: false });
    }

    res.json({ message: '게시글 조회 성공', success: true, data: viewLostDetailR[0] });
  });
});

module.exports = router;