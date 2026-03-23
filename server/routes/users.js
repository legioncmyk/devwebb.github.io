const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

function readUsers() {
  const raw = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(raw || '[]');
}

router.get('/', (req, res) => {
  const users = readUsers().map(({ password, ...user }) => user);
  res.json(users);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Username atau password salah.' });
  }

  return res.json({
    message: 'Login berhasil.',
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    }
  });
});

module.exports = router;
