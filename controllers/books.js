const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid image file (jpg, jpeg, png).' });
    }
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
    .then(() => {res.status(201).json({message: 'Livre enregistré'})})
    .catch(error => {res.status(400).json({error})});
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyBook = (req, res, next) => {
  let bookObject;
  if (req.file) {
      bookObject = {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      };
  } else {
      bookObject = { ...req.body };
  }

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé !'});
        } else {
            Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id}) 
            .then(() => res.status(200).json({message: 'Livre modifié !'}))
            .catch(error => res.status(401).json({error}));
        }
    })
    .catch((error) => {
        res.status(400).json({error});
    });
};
  

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => {
    if (book.userId != req.auth.userId){
        res.status(401).json({message: 'Non-autorisé'});
    } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
            .then(() => {res.status(200).json({message: 'Livre supprimé'})})
            .catch(error => res.status(401).json({error}));
        })
    }
  })
  .catch(error => {
    res.status(500).json({error});
  });
};

exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getThreeBestBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      books.sort((a, b) => {
        return b.averageRating - a.averageRating;
      });
      const topThreeBooks = books.slice(0, 3);
      res.status(200).json(topThreeBooks);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.giveRating = async (req, res, next) => {
  try {
    const { userId, rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const existingRating = book.ratings.find(r => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ error: "User has already rated this book." });
    }

    book.ratings.push({ userId, grade : rating });

    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    const averageRating = sumRatings / totalRatings;
    book.averageRating = Math.round(averageRating * 10 / 10);

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error('Error while rating the book', error);
    res.status(500).json({ error: error.message });
  }
};