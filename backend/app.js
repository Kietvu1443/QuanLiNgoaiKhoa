const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const indexRouter = require('./routes/index');

app.use('/api', indexRouter);

app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Student activity API is running',
        data: null,
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        data: null,
    });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    const status = Number(err.status || err.statusCode || 500);
    const message = status >= 500 ? 'Internal server error' : (err.message || 'Request failed');

    res.status(status).json({
        success: false,
        message,
        data: null,
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;