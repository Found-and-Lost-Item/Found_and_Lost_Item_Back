const express = require('express'); // 익스프레스는 http 요청.응답.미들웨어등 처리
const router = express.Router(); // router는 익스프레스에서 제공하는 라우터 기능으로 경로에 따라 요청 처리
const db = require('../db');

// 습득물 게시글 조회 API
router.get('/viewFoundItems', (req, res) => {
  const { category, order, search } = req.query; // req.query는 클라이언트가 보낸 URL의 쿼리 파라미터를 가져옴. 차례대로 카테고리, 정렬, 검색인데 맞춰야 함 

  // 쿼리문을 작성할 변수를 let으로 선언
  let viewFoundQ = `
    SELECT foundboard.*, foundimage.found_image_url 
    FROM foundboard 
    LEFT JOIN foundimage 
    ON foundboard.found_board_id = foundimage.found_board_id 
    WHERE true
  `; 
  // 밑에서 DB에서 더 불러올 수 있어서 쿼리문이 수정, 확장될 수 있어야 하므로 const 말고 let 사용 (let을 쓰면 변수 재할당 가능)
  // WHERE true 하는 이유는 동적으로 쿼리 조건 추가해야 하는 경우, 조건 추가하기 전에 항상 WHERE 절이 필요함. 뒤에는 AND만 사용하면 됨

  if (category) {
    viewFoundQ += ` AND foundboard.category_id = ${db.escape(category)}`; // category 값을 안전하게 처리하여 SQL 인젝션 공격 방지
  }

  if (search) {
    viewFoundQ += ` AND (found_title LIKE ${db.escape('%' + search + '%')} OR found_content LIKE ${db.escape('%' + search + '%')})`; 
    // 제목 또는 내용에 검색어가 포함된 게시글을 선택함. SQL의 LIKE 연산자는 제목이나 내용에 검색어가 포함된 항목을 선택함. 
  }

  switch (order) {
    case 'oldest':
      viewFoundQ += ' ORDER BY found_create_date ASC'; // 작성일 기준으로 오래된 순으로 정렬 
      break;
    case 'nameorder':
      viewFoundQ += ' ORDER BY found_title ASC'; // 제목을 알파벳 순서대로 (이름순)
      break;
    default:
      viewFoundQ += ' ORDER BY found_create_date DESC'; // 기본: 작성일 기준으로 최신 순
      break;
  }

  // DB 쿼리 실행
  db.query(viewFoundQ, (err, viewFoundR) => {
    if (err) {
      console.error('게시글 조회 중 오류:', err);
      return res.status(500).json({ message: '게시글 조회 실패', success: false });
    }

    // 조회 성공 시 결과를 클라이언트에 전송
    res.json({ message: '게시글 조회 성공', success: true, data: viewFoundR });
  });
});


//여기부턴 습득물 상세페이지

router.get('/viewFoundItem/:id', (req, res) => { // :id는 URL에서 동적으로 변하는 부분. 
  const { id } = req.params; // req.params는 요청된 URL의 파라미터를 가져오며 id를 가져와서 변수로 할당

  const viewFoundDetailQ = `
    SELECT foundboard.*, foundimage.found_image_url 
    FROM foundboard 
    LEFT JOIN foundimage 
    ON foundboard.found_board_id = foundimage.found_board_id 
    WHERE foundboard.found_board_id = ${db.escape(id)} 
  `;
  //foundboard 테이블에서 found_board_id가 요청된 id와 일치하는 행만 선택됨(where절)
  // 조인 절-> foundboard테이블과 foundimage 테이블을 연결함 left join은 foundboard에 해당하는 항목이 없더라도 결과를 반환함. foundboard와 foundimage 테이블을 found_board_id필드를 기준으로 연결함(on)



  db.query(viewFoundDetailQ, (err, viewFoundDetailR) => {
    if (err) {
      console.error('게시글 조회 중 오류:', err);
      return res.status(500).json({ message: '게시글 조회 실패', success: false });
    }

    if (viewFoundDetailR.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.', success: false });
    }

    res.json({ message: '게시글 조회 성공', success: true, data: viewFoundDetailR[0] });
  });
});

module.exports = router;