var express = require('express');
var router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Article = require('../models/articleModel'); 
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
    cb(null, './routes/uploads/mainArticle/'); 
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


router.post('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const categorieID = req.params.id;
    const { titre, contenu, tags } = req.body;
    const photo = req.file ? `/uploads/mainArticle/${req.file.filename}` : null;
    
    if (!titre || !contenu || !tags || tags.length === 0) {
      return res.status(400).json({ message: 'Titre, contenu et au moins un tag sont requis.' });
    }
    const idUtilisateur = req.userId; 

    const articleId = await Article.create(titre, contenu, idUtilisateur, tags, categorieID, photo);
    
    res.status(201).json({ message: 'Article créé avec succès', articleId });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'article', error: error.message });
  }
});




// Route pour mettre à jour un article
router.put('/:id', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { titre, contenu } = req.body;
  const photo = req.file ? `/uploads/mainArticle/${req.file.filename}` : null;

  try {
    const articleToUpdate = await Article.findById(id);
    if (!articleToUpdate) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    if (photo && articleToUpdate.photo) {
      deleteImage(`./routes${articleToUpdate.photo}`);
    }

    const affectedRows = await Article.update(id, titre, contenu, photo);
    if (affectedRows > 0) {
      res.status(200).json({ message: 'Article mis à jour avec succès.' });
    } else {
      res.status(400).json({ message: 'Aucune modification effectuée.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});





router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const articleToDelete = await Article.findById(req.params.id);
    if (!articleToDelete) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    if (articleToDelete.photo) {
      deleteImage(`./routes${articleToDelete.photo}`);
    }

    await Article.delete(req.params.id);
    res.json({ message: 'Article supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: error.message });
  }
});


router.get('/', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const articles = await Article.findAllWithPagination(limit, offset);
    const totalCount = await Article.getTotalCount();

    res.json({ articles, totalCount, currentPage: page });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des articles.', error: error.message });
  }
});





module.exports = router;