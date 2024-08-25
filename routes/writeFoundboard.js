const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const db = require('../db');

router.post('/submitFoundItem', upload.single('foundImageUrl'), (req, res) => {
  const { foundTitle, foundContent, foundCategory, foundDate, foundLatitude, foundLongitude } = req.body;
  
  // 1. 업로드된 파일이 있는지 확인하여 `foundImageUrl`에 경로 저장
  const foundImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  // 조건식 ? 참일 때 값 : 거짓일 때 값
  
  // 2. 있으면 파일경로 들어가고 없으면 null들어감 위의 삼항연산자때문에
  let finalImageUrl = foundImageUrl;

  // 3. 업로드된 이미지가 없을 경우 기본 이미지로 대체
  if (!foundImageUrl) {
    const categoryQ = `SELECT category_image FROM category WHERE category_id = ?`;
    db.query(categoryQ, [foundCategory], (err, categoryR) => { // 쿼리가 성공적으로 실행되면 categoryR이라는 변수에 쿼리 결과가 배열 형태로 할당됨.
      if (err) {
        console.error('카테고리 이미지 불러오기 오류:', err);
        return res.status(500).json({ message: '카테고리 이미지 불러오기 실패', success: false });
      }

      if (categoryR.length > 0) { //categoryR.length는 이 배열의 크기 나타냄 즉 저거 의미는 쿼리결과가 1개이상일 경우를 의미(배열에 최소 하나의 항목이 있을때 나타냄) -> category_id에 해당하는 카테고리_이미지가 디비에 존재한다 의미
        finalImageUrl = categoryR[0].category_image;
        insertFoundBoard(finalImageUrl);  // 기본 이미지 경로로 게시글 등록
      } else {
        return res.status(400).json({ message: '카테고리 이미지를 찾을 수 없음', success: false });
      }
    });
  } else {
   insertFoundBoard(finalImageUrl);  // 업로드된 이미지 경로로 게시글 등록 finalImageURL이 바로밑 매개변수imageUrl로 전달됨.,
  }

  // 4. 게시글 정보를 `foundboard` 테이블에 저장
  //  imageUrl이라는 인자를 받아오는데 이건 게시글과 연결될 이미지의 경로임.
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

      // 5. 방금 foundboard 에 삽입된 게시물 고유ID 가져오기
      const foundBoardId = foundboardR.insertId;
      // foundBoardId는 foundimage테이블에 이미지를 저장할때 게시글과 이미지를 연결하는데 사용됨

      // 6. 이미지 URL을 `foundimage` 테이블에 저장
      if (imageUrl) { //imageUrldl 존재하는지 확인하는 조건문임 이미지 함께 업로드했는지.
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
//

// const express = require('express');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// const router = express.Router();
// const db = require('../db');

// router.post('/submitFoundItem', upload.single('foundImageUrl'), (req, res) => {
//   // 프론트엔드에서 전달된 데이터 받기
//   const { foundTitle, foundContent, foundCategory, foundDate, foundLatitude, foundLongitude } = req.body;
//   const foundImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
//   // 조건식 ? 참일 때 값 : 거짓일 때 값
//   // 이미지 처리 로직
//   let finalImageUrl = null;

//   if (!foundImageUrl) { 
//     // 올릴 수 있는 사진이 없을 때, 카테고리 기본 이미지 사용
//     const categoryQ = `SELECT category_image FROM category WHERE category_id = ?`;
//     db.query(categoryQ, [foundCategory], (err, results) => {
//       if (err) {
//         console.error('카테고리 이미지 불러오기 오류:', err);
//         return res.status(500).json({ message: '카테고리 이미지 불러오기 실패', success: false });
//       }

//       if (results.length > 0) {
//         finalImageUrl = results[0].category_image;
//         insertFoundBoard(finalImageUrl);
//       } else {
//         return res.status(400).json({ message: '카테고리 이미지를 찾을 수 없음', success: false });
//       }
//     });
//   } else {
//     finalImageUrl = foundImageUrl;
//     insertFoundBoard(finalImageUrl);
//   }

//   // 습득물 게시글 데이터 삽입 함수
//   function insertFoundBoard(imageUrl) {
//     const foundboardQ = `
//       INSERT INTO foundboard (category_id, found_title, found_content, found_create_date, found_date, found_state, found_latitude, found_longitude, id)
//       VALUES (?, ?, ?, NOW(), ?, true, ?, ?, 1)
//     `;

//     db.query(foundboardQ, [foundCategory, foundTitle, foundContent, foundDate, foundLatitude, foundLongitude], (err, foundboardR) => {
//       if (err) {
//         console.error('게시물 등록 중 데이터베이스 오류:', err);
//         return res.status(500).json({ message: '게시물 등록 실패', success: false });
//       }

//       const foundBoardId = foundboardR.insertId;

//       if (imageUrl) {
//         const foundimageaddQ = `
//           INSERT INTO foundimage (found_board_id, found_image_url)
//           VALUES (?, ?)
//         `;

//         db.query(foundimageaddQ, [foundBoardId, imageUrl], (err) => {
//           if (err) {
//             console.error('이미지 데이터베이스 업데이트 중 오류:', err);
//             return res.status(500).json({ message: '이미지 등록 실패', success: false });
//           }
//           res.json({ message: '습득물 게시물 등록 성공', success: true });
//         });
//       } else {
//         res.json({ message: '습득물 게시물 등록 성공', success: true });
//       }
//     });
//   }
// });

// module.exports = router;