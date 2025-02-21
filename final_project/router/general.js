const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Cek apakah username dan password disediakan
    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password harus disediakan" });
    }
  
    // Cek apakah user sudah ada
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "User sudah ada. Silakan gunakan username lain" });
    }
  
    // Tambahkan user baru
    users.push({ username, password });
    return res.status(200).json({ message: "User berhasil didaftarkan" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Buku dengan ISBN tersebut tidak ditemukan" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorParam = req.params.author.toLowerCase();
    const matchingBooks = [];
  
    // Ambil semua key dari objek books
    const keys = Object.keys(books);
    
    // Iterasi melalui setiap key dan periksa apakah author sesuai
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === authorParam) {
        matchingBooks.push(books[key]);
      }
    });
  
    // Jika ditemukan buku-buku dengan penulis tersebut, kembalikan hasilnya
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "Buku dari penulis tersebut tidak ditemukan" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title.toLowerCase();
    const matchingBooks = [];
  
    // Ambil semua key dari objek books
    const keys = Object.keys(books);
  
    // Iterasi setiap key dan periksa apakah title mengandung kata kunci yang diberikan
    keys.forEach(key => {
      if (books[key].title.toLowerCase().includes(titleParam)) {
        matchingBooks.push(books[key]);
      }
    });
  
    // Jika ditemukan buku dengan judul yang sesuai, kembalikan hasilnya
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "Buku dengan judul tersebut tidak ditemukan" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  
    // Cari buku berdasarkan ISBN
    const book = books[isbn];
    
    // Jika buku ditemukan, kembalikan reviewnya
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Buku dengan ISBN tersebut tidak ditemukan" });
    }
});

module.exports.general = public_users;
