const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    const user = users.find(user => user.username === username);
    return !user;
}

const authenticatedUser = (username,password)=>{
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password harus disediakan" });
    }

    if (isValid(username)) {
      return res.status(401).json({ message: "User belum terdaftar" });
    }

    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Username atau password tidak valid" });
    }

    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    req.session.token = token;
    req.session.username = username;
    
    return res.status(200).json({ message: "Customer successfully logged in", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Buku dengan ISBN tersebut tidak ditemukan" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review harus disediakan sebagai query parameter" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review berhasil ditambahkan/dimodifikasi", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;
  console.log(username);

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Buku dengan ISBN tersebut tidak ditemukan" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review dari user ini tidak ditemukan" });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review berhasil dihapus", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
