const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.PORT || 80;

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const favouriteRoutes = require('./routes/favourites');
const logsRoutes = require('./routes/logs');

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/files', upload.single('file'), fileRoutes);
app.use('/favourites', favouriteRoutes);
app.use('/logs', logsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});