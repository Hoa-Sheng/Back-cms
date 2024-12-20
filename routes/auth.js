var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');



const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images JPEG, PNG sont autorisées.'), false);
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './routes/uploads/profiles/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});




router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null; 

    // Vérifiez si l'email existe déjà
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
      return res.status(401).json({ message: 'Email ou mot de passe incorrect', err});
    }

    const token = jwt.sign({ userId: user.ID_utilisateur_Utilisateur }, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});


// Route pour récupérer tous les utilisateurs
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Utilisateur';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      return res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }

    if (results.length === 0) {
      return res.status(404).send('Aucun utilisateur trouvé');
    }

    res.status(200).json(results);
  });
});


router.put('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.userId; // Extraire l'ID utilisateur depuis le middleware JWT
    const { name, password } = req.body;
    let photo;

    // Si une photo a été uploadée, enregistrez son chemin
    if (req.file) {
      photo = `/uploads/profiles/${req.file.filename}`;
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await User.update(userId, { name, password: hashedPassword, photo });

    res.status(200).json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil", error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Supprimer la photo associée si elle existe
    router.delete('/:id', async (req, res) => {
      const userId = req.params.id;
    
      try {
        // Récupérer l'utilisateur et la photo associée
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    
        // Supprimer la photo si elle existe
        if (user.photo) {
          const photoPath = path.join(__dirname, '..', user.photo);
    
          console.log('Chemin complet du fichier à supprimer :', photoPath);
    
          fs.access(photoPath, fs.constants.F_OK, (err) => {
            if (err) {
              console.error(`Le fichier n'existe pas : ${photoPath}`);
            } else {
              fs.unlink(photoPath, (err) => {
                if (err) {
                  console.error(`Erreur lors de la suppression du fichier : ${photoPath}`, err);
                } else {
                  console.log(`Fichier supprimé avec succès : ${photoPath}`);
                }
              });
            }
          });
        }
    
        // Supprimer l'utilisateur de la base de données
        await User.deleteById(userId);
    
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        res.status(500).json({ message: "Erreur interne", error: error.message });
      }
    });
    

    // Supprimer l'utilisateur de la base de données
    await User.deleteById(userId);

    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne", error: error.message });
  }
});

module.exports = router;

module.exports = router;