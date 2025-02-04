const express = require('express');
const cors = require('cors');
const { Client } = require('pg');  // 引入 PostgreSQL 客戶端
const app = express();
app.use(cors());
app.use(express.json());

// 連接 PostgreSQL 資料庫
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Render 可能需要開啟 SSL
});
client.connect();  // 連接到資料庫

// 取得事件資料的 API
app.get('/events', (req, res) => {
    const query = 'SELECT * FROM events';  // SQL 查詢語句
    client.query(query, (err, result) => {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).send('Error fetching events');
        }
        res.json(result.rows);  // 返回查詢到的所有事件資料
    });
});

// 儲存事件的 API
app.post('/events', (req, res) => {
    const { InputContent, InputStartDate, InputEndDate, InputColor } = req.body;
    const query = 'INSERT INTO events (content, startDate, endDate, color) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [InputContent, InputStartDate, InputEndDate, InputColor];

    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting event', err.stack);
            return res.status(500).send('Error saving event');
        }
        res.json({ id: result.rows[0].id });  // 返回新增事件的 ID
    });
});

// 修改事件的 API (更新)
app.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { InputContent, InputStartDate, InputEndDate, InputColor } = req.body;
    const query = 'UPDATE events SET content = $1, startDate = $2, endDate = $3, color = $4 WHERE id = $5';
    const values = [InputContent, InputStartDate, InputEndDate, InputColor, eventId];

    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating event', err.stack);
            return res.status(500).send('Error updating event');
        }
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Event updated successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    });
});

// 刪除事件的 API
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const query = 'DELETE FROM events WHERE id = $1';

    client.query(query, [eventId], (err, result) => {
        if (err) {
            console.error('Error deleting event', err.stack);
            return res.status(500).send('Error deleting event');
        }
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
