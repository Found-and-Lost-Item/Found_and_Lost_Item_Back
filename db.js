var mysql = require('mysql2');
require('dotenv').config();

// MySQL 연결 풀(pool) 생성
const db = mysql.createConnection({
    host: 'localhost', // 접속 주소
    port: '3306', // 접속 포트
    user: 'root', // 접속 계정
    password: '1102', // 패스워드
    database: 'lostitem', // 데이터베이스 이름
    waitForConnections: true,
    connectionLimit: 10, // 최대 연결 수 설정
    queueLimit: 0
});

// 테스트 연결
db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('db 연결됨');
    });

module.exports = db;


// var mysql = require('mysql2');
// var db = mysql.createConnection({
//     host: 'localhost', // 접속 주소
//     port: '3306', // 접속 포트
//     user: 'root', // 접속 계정
//     password: '1102', // 패스워드
//     database: 'lostitem', // 데이터베이스 이름
// });


// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('db 연결됨');
// });

// module.exports = db;