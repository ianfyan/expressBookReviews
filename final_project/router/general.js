const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
    return new Promise((resolve, reject) => {
      // Simulasi delay asynchronous (misal 500ms)
      setTimeout(() => {
        resolve(books);
      }, 500);
    });
}

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
public_users.get('/',async function (req, res) {
    try {
        const allBooks = await getBooks();
        return res.status(200).json(allBooks);
      } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const allBooks = await getBooks();
        const book = allBooks[isbn];
        if (book) {
          return res.status(200).json(book);
        } else {
          return res.status(404).json({ message: "Buku dengan ISBN tersebut tidak ditemukan" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    try {
        const authorParam = req.params.author.toLowerCase();
        const allBooks = await getBooks();
        const matchingBooks = [];
        // Iterasi semua key dari objek books
        Object.keys(allBooks).forEach(key => {
          if (allBooks[key].author.toLowerCase() === authorParam) {
            matchingBooks.push(allBooks[key]);
          }
        });
        if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
        } else {
          return res.status(404).json({ message: "Buku dari penulis tersebut tidak ditemukan" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try {
        const titleParam = req.params.title.toLowerCase();
        const allBooks = await getBooks();
        const matchingBooks = [];
        // Iterasi semua key dari objek books
        Object.keys(allBooks).forEach(key => {
          if (allBooks[key].title.toLowerCase().includes(titleParam)) {
            matchingBooks.push(allBooks[key]);
          }
        });
        if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
        } else {
          return res.status(404).json({ message: "Buku dengan judul tersebut tidak ditemukan" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
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
