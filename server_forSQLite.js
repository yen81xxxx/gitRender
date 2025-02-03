// server.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(cors());
app.use(express.json());

// 建立 SQLite 資料庫，並創建事件表格
const db = new sqlite3.Database('./events.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    }
});


// 取得事件資料的 API
app.get('/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);  // 返回所有事件資料
    });
});

// 儲存事件的 API
app.post('/events', (req, res) => {
    const { InputContent, InputStartDate, InputEndDate, InputColor} = req.body;
    db.run('INSERT INTO events (content, startDate, endDate,color) VALUES (?, ?, ?, ?)', [InputContent, InputStartDate, InputEndDate,InputColor], function (err) {
        if (err) {
            return console.log(err.message);
        }
        res.json({ id: this.lastID });  // 返回新增事件的 ID
    });
});

// 刪除事件
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;  // 這裡接收的是事件的 id
    const query = 'DELETE FROM events WHERE id = ?';

    db.run(query, [eventId], function(err) {
        if (err) {
            return res.status(500).json({ message: '刪除事件失敗', error: err });
        }
        if (this.changes > 0) {  // 檢查是否有行被刪除
            res.status(200).json({ message: '事件刪除成功' });
        } else {
            res.status(404).json({ message: '事件未找到' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
