const express = require('express');
const path = require('path');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = 3000;
const rootDir = path.join(__dirname, '..');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

app.use('/products', productsRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ZALLSTORE DIGITAL HUB berjalan di http://localhost:${PORT}`);
});
