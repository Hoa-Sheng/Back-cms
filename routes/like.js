var express = require('express');
var router = express.Router();
const connection = require('../connection');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/likearticle/:articleId', authMiddleware, async (req, res) => {
    const articleId = req.params.articleId;
    const utilisateur_Id = req.userId;  
    try {
        const checkQuery = 'SELECT * FROM Likes WHERE ID_utilisateur_Utilisateur = ? AND ID_article_Articles = ?';
        const [existingLike] = await connection.query(checkQuery, [utilisateur_Id, articleId]);

        if (existingLike.length > 0) {
            return res.status(400).send('Vous avez déjà liké cet article');
        }
        const query = 'INSERT INTO Likes (ID_utilisateur_Utilisateur, ID_article_Articles) VALUES (?, ?)';
        const result = await connection.query(query, [utilisateur_Id, articleId]);

        if (result.affectedRows === 1) {
            return res.status(201).send('Like ajouté');
        } else {
            return res.status(400).send('Like ajouté');
        }
    } catch (err) {
        console.error('Erreur :', err);
        return res.status(500).send('Erreur interne');
    }
});

router.delete('/likearticle/:articleId', authMiddleware, async (req, res) => {
    const articleId = req.params.articleId;
    const utilisateur_Id = req.userId; 
    try {
        const query = 'DELETE FROM Likes WHERE ID_utilisateur_Utilisateur = ? AND ID_article_Articles = ?';
        const result = await connection.query(query, [utilisateur_Id, articleId]);

        if (result.affectedRows === 1) {
            return res.status(200).send('Like supprimé avec succès');
        } else {
            return res.status(404).send('Like supprimé avec succès');
        }
    } catch (err) {
        console.error('Problème lors de la suppression du like :', err);
        return res.status(500).send('Problème interne du serveur');
    }
});

router.post('/likecomment/:commentId', authMiddleware, async (req, res) => {
    const commentId = req.params.commentId;
    const utilisateur_Id = req.userId; 

    try {
        const checkQuery = 'SELECT * FROM Likes WHERE ID_utilisateur_Utilisateur = ? AND ID_commentaire_Commentaires = ?';
        const [existingLike] = await connection.query(checkQuery, [utilisateur_Id, commentId]);

        if (existingLike.length > 0) {
            return res.status(400).send('Vous avez déjà liké ce commentaire');
        }
        const query = 'INSERT INTO Likes (ID_utilisateur_Utilisateur, ID_commentaire_Commentaires) VALUES (?, ?)';
        const result = await connection.query(query, [utilisateur_Id, commentId]);

        if (result.affectedRows === 1) {
            return res.status(201).send('Like ajouté');
        } else {
            return res.status(400).send('Like ajouté');
        }
    } catch (err) {
        console.error('Erreur :', err);
        return res.status(500).send('Erreur interne');
    }
});

router.delete('/likecomment/:commentId', authMiddleware, async (req, res) => {
    const commentId = req.params.commentId;
    const utilisateur_Id = req.userId; 

    try {
        // Requête pour supprimer le like
        const query = 'DELETE FROM Likes WHERE ID_utilisateur_Utilisateur = ? AND ID_commentaire_Commentaires = ?';
        const result = await connection.query(query, [utilisateur_Id, commentId]);

        if (result.affectedRows === 1) {
            return res.status(200).send('Like supprimé avec succès');
        } else {
            return res.status(404).send('Like supprimé avec succès');
        }
    } catch (err) {
        console.error('Problème lors de la suppression du like :', err);
        return res.status(500).send('Problème interne du serveur');
    }
});


module.exports = router;





