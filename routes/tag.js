var express = require('express');
var router = express.Router();
const connection = require('../connection.js');
const authMiddleware = require('../middleware/authMiddleware');
const Article = require('../models/articleModel'); 




router.put('/:id', (req, res) => {
    const tagID = req.params.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Le nom du tag est requis');
    }

    const query = 'UPDATE Tags SET nom_Tags = ? WHERE ID_Tags_Tags = ?';
    connection.query(query, [name, tagID], (err, result) => {
        if (err) {
            return res.status(500).send('Erreur lors de la modification du tag');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Tag non trouvé');
        }

        res.status(200).send('Tag modifié avec succès');
    });
});


router.delete('/:articleId', authMiddleware, async (req, res) => {
    try {
      const { articleId } = req.params; 
      const { tags } = req.body; 
  
      if (!tags || typeof tags !== 'string' || tags.trim() === '') {
        return res.status(400).json({ message: 'Le tags doit être une chaîne non vide.' });
      }
  
      const result = await Article.removeTags(articleId, tags.trim());
  
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'tag supprimé avec succès.' });
      } else {
        res.status(404).json({ message: 'Le tag spécifié n\'existe pas pour cet article.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du tag', error: error.message });
    }
  });
  
  

router.get('/', (req, res) => {
  const query = 'SELECT * FROM Tags';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des articles:', err);
      return res.status(500).send('Erreur lors de la récupération des articles');
    }

    if (results.length === 0) {
      return res.status(404).send('Aucun article trouvé');
    }

    res.status(200).json(results);
  });
});
module.exports = router;