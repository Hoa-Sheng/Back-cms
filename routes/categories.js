var express = require('express');
var router = express.Router();
const connection = require('../connection'); 
const multer = require('multer');
const path = require('path');



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
    cb(null, './routes/uploads/mainCateg/'); 
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

// Route pour créer une catégorie avec un fichier et des données de formulaire
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Vérification des champs obligatoires
    if (!name || !description) {
      return res.status(400).send('Le nom et la description de la catégorie sont requis.');
    }
    const photo = req.file ? `/uploads/mainCateg/${req.file.filename}` : null;

    // Insérer dans la base de données
    const query = 'INSERT INTO Categories (Nom_Categories, Description_Categories, Photo_Categorie) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [name, description, photo]);

    if (result.affectedRows === 1) {
      return res.status(201).json({ message: 'Catégorie créée avec succès' });
    } else {
      return res.status(400).json({ message: 'Erreur lors de la création de la catégorie.' });
    }
  } catch (err) {
    console.error('Erreur lors de la création de la catégorie :', err);
    return res.status(500).json({ message: 'Erreur lors de la création de la catégorie.' });
  }
});




// Modifier une catégorie existante
router.put('/:id', upload.single('photo'), (req, res) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    const photo = req.file ? `/uploads/mainCateg/${req.file.filename}` : null;

    if (!name) {
        return res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
    }

    const query = 'UPDATE Categories SET Nom_Categories = ?, Description_Categories = ?, Photo_Categorie = ? WHERE ID_Categories_Categories = ?';
    connection.query(query, [name || null, description || null, categoryId, photo], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la modification de la catégorie.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée.' });
        }

        res.status(200).json({ message: 'Catégorie modifiée avec succès.' });
    });
});

// Supprimer une catégorie
router.delete('/:id', (req, res) => {
    const categoryId = req.params.id;

    const query = 'DELETE FROM Categories WHERE ID_Categories_Categories = ?';
    connection.query(query, [categoryId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Catégorie non trouvée.' });
        }

        res.status(200).json({ message: 'Catégorie supprimée avec succès.' });
    });
});

router.get('/', (req, res) => {
  const query = 'SELECT * FROM Categories';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      return res.status(500).send('Erreur lors de la récupération des catégories');
    }
    if (results.length === 0) {
      return res.status(404).send('Aucune catégorie trouvée');
    }
    res.status(200).json(results);
  });
});


module.exports = router;