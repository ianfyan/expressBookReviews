const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 500);
    });
}

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password must be provided" });
    }
  
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "The user already exists. Please use another username" });
    }
  
    users.push({ username, password });
    return res.status(200).json({ message: "User has been successfully registered" });
});

public_users.get('/',async function (req, res) {
    try {
        const allBooks = await getBooks();
        return res.status(200).json(allBooks);
      } catch (error) {
        return res.status(500).json({ message: "There is an error", error: error.message });
      }
});

public_users.get('/isbn/:isbn',async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const allBooks = await getBooks();
        const book = allBooks[isbn];
        if (book) {
          return res.status(200).json(book);
        } else {
          return res.status(404).json({ message: "The book with the ISBN was not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "There is an error", error: error.message });
    }
 });

public_users.get('/author/:author',async function (req, res) {
    try {
        const authorParam = req.params.author.toLowerCase();
        const allBooks = await getBooks();
        const matchingBooks = [];

        Object.keys(allBooks).forEach(key => {
          if (allBooks[key].author.toLowerCase() === authorParam) {
            matchingBooks.push(allBooks[key]);
          }
        });
        if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
        } else {
          return res.status(404).json({ message: "Books by this author were not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "There is an error", error: error.message });
    }
});

public_users.get('/title/:title',async function (req, res) {
    try {
        const titleParam = req.params.title.toLowerCase();
        const allBooks = await getBooks();
        const matchingBooks = [];

        Object.keys(allBooks).forEach(key => {
          if (allBooks[key].title.toLowerCase().includes(titleParam)) {
            matchingBooks.push(allBooks[key]);
          }
        });
        if (matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
        } else {
          return res.status(404).json({ message: "No book with that title found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "There is an error", error: error.message });
    }
});

public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "The book with the ISBN was not found" });
    }
});

module.exports.general = public_users;
