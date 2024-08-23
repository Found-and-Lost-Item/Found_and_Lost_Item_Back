const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const db = require('../db.js');


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

