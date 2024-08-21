const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const db = require('../db');


router.post('/submitLostItem', (req, res) => {
    req.upload.single('lostImageUrl')(req, res, (err) => {
        if (err) {
            console.error('이미지 업로드 오류:', err);
            return res.status(500).json({ message: '이미지 업로드 실패', success: false });
        }

        // 이후의 로직은 동일
        const { lostTitle, lostContent, lostCategory, lostDate, lostLatitude, lostLongitude, lostAward } = req.body;
        const lostImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        // const noImage = req.body.noImage || false; // 프론트에서 올릴수 있는 사진이 없어요 체크시 그냥 null인지만 확인하면돼서 주석처리


        let finalImageUrl = null;

        if (!lostImageUrl) {
            // 업로드된 이미지가 없을 때 기본 이미지 사용
            const categoryQ = `SELECT category_image FROM category WHERE category_id = ?`;
            db.query(categoryQ, [lostCategory], (err, results) => {
                if (err) {
                    console.error('카테고리 이미지 불러오기 오류:', err);
                    return res.status(500).json({ message: '카테고리 이미지 불러오기 실패', success: false });
                }

                if (results.length > 0) {
                    finalImageUrl = results[0].category_image;
                    insertLostBoard(finalImageUrl);
                } else {
                    res.status(400).json({ message: '카테고리 이미지를 찾을 수 없음', success: false });
                }
            });
        } else {
            finalImageUrl = lostImageUrl;
            insertLostBoard(finalImageUrl);
        }

        function insertLostBoard(finalImageUrl) {
            const lostboardQ = `
                INSERT INTO lostboard (category_id, lost_title, lost_content, lost_create_date, lost_date, lost_state, lost_latitude, lost_longitude, id, award)
                VALUES (?, ?, ?, NOW(), ?, true, ?, ?, 1, ?)
                `;

            db.query(lostboardQ, [lostCategory, lostTitle, lostContent, lostDate, lostLatitude, lostLongitude, lostAward], (err, lostboardR) => {
                if (err) {
                    console.error('게시물 등록 중 데이터베이스 오류:', err);
                    return res.status(500).json({ message: '게시물 등록 실패', success: false });
                }

                const lostBoardId = lostboardR.insertId;

                if (finalImageUrl) {
                    const lostimageaddQ = `
                        INSERT INTO lostimage (lost_board_id, lost_image_url) VALUES (?, ?)
                        `;

                    db.query(lostimageaddQ, [lostBoardId, finalImageUrl], (err) => {
                        if (err) {
                            console.error('이미지 데이터베이스 업데이트 중 오류:', err);
                            return res.status(500).json({ message: '이미지 등록 실패', success: false });
                        }
                        res.json({ message: '분실물 게시물 등록 성공', success: true });
                    });
                } else {
                    res.json({ message: '분실물 게시물 등록 성공', success: true });
                }
            });
        }
    });
});

module.exports = router;





// const express = require('express');
// const path = require('path');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// const router = express.Router();
// const db = require('../db');

// // // 사진 업로드 라우트 get
// // router.get('/uploadlostimage', (req, res) => {
// //   res.sendFile(path.join(__dirname, '../uploadlostimage.html'));
// // });

// // 사진 업로드 처리 post
// router.post('/uploadlostimage', upload.single('lostImageUrl'), (req, res) => {
//   const lostImageUrl = req.file ? req.file.filename : null;
//   const noImage = req.body.noImage || false;

//   // 세션에 이미지 정보 저장
//   req.session.noImage = noImage;
//   req.session.lostImageUrl = lostImageUrl;

//   if (noImage || lostImageUrl) {
//     res.json({ message: '이미지 업로드 성공', success: true }); // 성공 시 응답
//   } else {
//     res.status(400).json({ message: '이미지 업로드 실패', success: false });
//   }
// });

// // // 분실물 게시물 정보 작성 페이지 라우트 (GET 요청)
// // router.get('/writelostboard', (req, res) => {
// //   res.sendFile(path.join(__dirname, '../writelostboard.html'));
// // });
// // 분실물 게시물 정보 작성 라우트(카테고리 정하기, 제목, 내용 쓰기)
// router.post('/writelostboard', (req, res) => {
//   const { lostTitle, lostContent, lostCategory } = req.body;

//   // 세션에 저장
//   req.session.lostTitle = lostTitle;
//   req.session.lostContent = lostContent;
//   req.session.lostCategory = lostCategory;

//   res.json({ message: '게시물 정보 저장 성공', success: true });
// });


// // 카테고리 선택 라우트
// router.get('/selectlostcategory', (req, res) => {
//   const categoryQ = `SELECT category_id, category_name FROM category`;

//   db.query(categoryQ, (err, results) => {
//     if (err) {
//       console.error('카테고리 불러오기 오류:', err);
//       return res.status(500).send('카테고리 데이터를 불러오는 중 오류가 발생했습니다.');
//     }
//     res.json(results);  // 카테고리 데이터를 클라이언트로 전송
//   });
// });

// // // 분실물 게시물 등록 페이지 라우트 (GET 요청)
// // router.get('/registerlostboard', (req, res) => {
// //   res.sendFile(path.join(__dirname, '../registerlostboard.html'));
// // });

// // 분실물 게시물 등록 라우트 (세 번째 UI 화면)
// router.post('/registerlostboard', (req, res) => {
//   const { lostDate, lostLatitude, lostLongitude, lostAward } = req.body;

//   // 세션에서 제목, 내용, 카테고리 가져오기
//   const lostTitle = req.session.lostTitle;
//   const lostContent = req.session.lostContent;
//   const lostCategory = req.session.lostCategory;

//   // 기본 이미지 또는 업로드된 이미지 URL 설정
//   let lostImageUrl = null;

//   // 체크박스 값에 따라 기본 이미지 설정 또는 세션에서 이미지 가져오기
//   if (req.session.noImage) {
//     const categoryQ = `SELECT category_image FROM category WHERE category_id = ?`;
//     db.query(categoryQ, [lostCategory], (err, results) => {
//       if (err) {
//         console.error('카테고리 이미지 불러오기 오류:', err);
//         return res.status(500).json({ message: '카테고리 이미지 불러오기 실패', success: false });
//       }

//       if (results.length > 0) {
//         lostImageUrl = results[0].category_image;
//         insertLostBoard();
//       } else {
//         res.status(400).json({ message: '카테고리 이미지를 찾을 수 없음', success: false });
//       }
//     });
//   } else {
//     lostImageUrl = req.session.lostImageUrl || null;
//     insertLostBoard();
//   }

//   // lostboard 테이블에 데이터 삽입
//   function insertLostBoard() {
//     const lostboardQ = `
//       INSERT INTO lostboard (category_id, lost_title, lost_content, lost_create_date, lost_date, lost_state, lost_latitude, lost_longitude, id, award)
//       VALUES (?, ?, ?, NOW(), ?, true, ?, ?, 1, ?)
//     `;

//     db.query(lostboardQ, [lostCategory, lostTitle, lostContent, lostDate, lostLatitude, lostLongitude, lostAward], (err, lostboardR) => {
//       if (err) {
//         console.error('게시물 등록 중 데이터베이스 오류:', err);
//         return res.status(500).json({ message: '게시물 등록 실패', success: false });
//       }

//       // lostboard 테이블에 삽입된 레코드의 ID 가져오기
//       const lostBoardId = lostboardR.insertId;

//       // lostimage 테이블에 이미지 경로 삽입
//       if (lostImageUrl) {
//         const lostimageaddQ = `
//           INSERT INTO lostimage (lost_board_id, lost_image_url)
//           VALUES (?, ?)
//         `;

//         db.query(lostimageaddQ, [lostBoardId, lostImageUrl], (err) => {
//           if (err) {
//             console.error('이미지 데이터베이스 업데이트 중 오류:', err);
//             return res.status(500).json({ message: '이미지 등록 실패', success: false });
//           }
//           res.json({ message: '분실물 게시물 등록 성공', success: true });
//         });
//       } else {
//         res.json({ message: '분실물 게시물 등록 성공', success: true });
//       }
//     });
//   }
// });



// module.exports = router;





