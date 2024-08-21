var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost', // 접속 주소
    port: '3306', // 접속 포트
    user: 'root', // 접속 계정
    password: '1102', // 패스워드
    database: 'lostitem', // 데이터베이스 이름
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;