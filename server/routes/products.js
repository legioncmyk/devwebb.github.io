const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

function readProducts() {
  const raw = fs.readFileSync(productsFile, 'utf8');
  return JSON.parse(raw || '[]');
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

router.get('/', (req, res) => {
  const products = readProducts();
  res.json(products);
});

router.post('/', (req, res) => {
  const products = readProducts();
  const { name, price, stock, status, category, description } = req.body;

  if (!name || price === undefined || stock === undefined || !status) {
    return res.status(400).json({ message: 'Data produk tidak lengkap.' });
  }

  const newProduct = {
    id: products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1,
    name,
    price: Number(price),
    stock: Number(stock),
    status,
    category: category || 'premium',
    description: description || ''
  };

  products.push(newProduct);
  writeProducts(products);
  return res.status(201).json(newProduct);
});

router.put('/:id', (req, res) => {
  const products = readProducts();
  const productId = Number(req.params.id);
  const productIndex = products.findIndex((product) => product.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    id: productId,
    price: req.body.price !== undefined ? Number(req.body.price) : products[productIndex].price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[productIndex].stock
  };

  writeProducts(products);
  return res.json(products[productIndex]);
});

router.delete('/:id', (req, res) => {
  const products = readProducts();
  const productId = Number(req.params.id);
  const filteredProducts = products.filter((product) => product.id !== productId);

  if (filteredProducts.length === products.length) {
    return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  }

  writeProducts(filteredProducts);
  return res.json({ message: 'Produk berhasil dihapus.' });
});

module.exports = router;
