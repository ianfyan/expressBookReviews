const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const user = users.find(user => user.username === username);
    return !user;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
  
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password harus disediakan" });
    }
    
    // Validasi bahwa user terdaftar
    if (isValid(username)) {
      return res.status(401).json({ message: "User belum terdaftar" });
    }
    
    // Cek apakah kombinasi username dan password benar
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Username atau password tidak valid" });
    }
    
    // Jika valid, buat token JWT dengan payload username dan secret 'access'
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    
    // Simpan token dan username di session (pastikan session middleware sudah diatur di app.js)
    req.session.token = token;
    req.session.username = username;
    
    return res.status(200).json({ message: "Customer successfully logged in", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
