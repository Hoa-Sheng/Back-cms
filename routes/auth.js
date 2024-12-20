const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { body, validationResult } = require('express-validator');



// Configuration de CORS pour autoriser les requêtes venant de React (port 5178)
const corsOptions = {
  origin: 'http://localhost:5178', // Assurez-vous que c'est le bon port pour React
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Autoriser les cookies si nécessaire
};

// Appliquer les options de CORS
router.use(cors(corsOptions));


// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/profiles'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Route d'inscription
router.post('/register', 
  upload.single('photo'),
  [
    body('name').isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;
      const photo = req.file ? `/uploads/profiles/${req.file.filename}` : null;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "L'email est déjà utilisé." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create(name, email, hashedPassword, 'user', photo);

      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
    }
  });

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const isValidPassword = await bcrypt.compare(password, user.Mot_de_passe_Utilisateur);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ userId: user.ID_utilisateur_Utilisateur }, process.env.JWT_SECRET, { expiresIn: '3h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

module.exports = router;
