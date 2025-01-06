var express = require('express');
var router = express.Router();
const connection = require('../connection');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:articleId', authMiddleware, async (req, res) => {
    const { contenu } = req.body;
    const articleId = req.params.articleId;

    if (!contenu) {
        return res.status(400).send('Le contenu du commentaire est requis');
    }

    try {
        const idUtilisateur = req.userId;
        const query = 'INSERT INTO commentaires (Contenu_Commentaires, Date_commentaires_Commentaires, ID_utilisateur_Utilisateur, ID_article_Articles) VALUES (?, NOW(), ?, ?)';
        const [result] = await connection.query(query, [contenu, idUtilisateur, articleId]);
        if (result.affectedRows === 1) {
            return res.status(201).send('Commentaire créé avec succès');
        } else {
            return res.status(500).send('Erreur lors de la création du commentaire');
        }
    } catch (err) {
        console.error('Erreur lors de la création du commentaire :', err);
        return res.status(500).send('Erreur : Impossible de créer le commentaire');
    }
});






router.put('/:commentId', authMiddleware, async (req, res) => {
    const { contenu } = req.body; // Le nouveau contenu du commentaire
    const commentId = req.params.commentId; // L'ID du commentaire à modifier

    if (!contenu) {
        return res.status(400).send('Le contenu du commentaire est requis');
    }

    try {
        const idUtilisateur = req.userId; // L'ID de l'utilisateur connecté

        // Vérifier si le commentaire existe et si l'utilisateur est l'auteur
        const [comment] = await connection.query('SELECT * FROM Commentaires WHERE ID_commentaires_Commentaires = ?', [commentId]);

        if (comment.length === 0) {
            return res.status(404).send('Commentaire non trouvé');
        }

        // Vérifier que l'utilisateur qui fait la requête est bien l'auteur du commentaire
        if (comment[0].ID_utilisateur_Utilisateur !== idUtilisateur) {
            return res.status(403).send('Vous n\'êtes pas autorisé à modifier ce commentaire');
        }

        // Mettre à jour le contenu du commentaire
        const query = 'UPDATE Commentaires SET Contenu_Commentaires = ?, Date_commentaires_Commentaires = NOW() WHERE ID_commentaires_Commentaires = ? AND ID_utilisateur_Utilisateur = ?';
        const [result] = await connection.query(query, [contenu, commentId, idUtilisateur]);

        if (result.affectedRows === 1) {
            return res.status(200).send('Commentaire modifié avec succès');
        } else {
            return res.status(500).send('Erreur lors de la modification du commentaire');
        }
    } catch (err) {
        console.error('Erreur lors de la modification du commentaire :', err);
        return res.status(500).send('Erreur : Impossible de modifier le commentaire');
    }
});

router.delete('/:commentId', authMiddleware, async (req, res) => {
    const commentId = req.params.commentId; // L'ID du commentaire à supprimer

    try {
        const idUtilisateur = req.userId; // L'ID de l'utilisateur connecté

        // Vérifier si le commentaire existe
        const [comment] = await connection.query('SELECT * FROM Commentaires WHERE ID_commentaires_Commentaires = ?', [commentId]);

        if (comment.length === 0) {
            return res.status(404).send('Commentaire non trouvé');
        }

        // Vérifier que l'utilisateur qui fait la requête est bien l'auteur du commentaire
        if (comment[0].ID_utilisateur_Utilisateur !== idUtilisateur) {
            return res.status(403).send('Vous n\'êtes pas autorisé à supprimer ce commentaire');
        }

        // Supprimer le commentaire
        const query = 'DELETE FROM Commentaires WHERE ID_commentaires_Commentaires = ? AND ID_utilisateur_Utilisateur = ?';
        const [result] = await connection.query(query, [commentId, idUtilisateur]);

        if (result.affectedRows === 1) {
            return res.status(200).send('Commentaire supprimé avec succès');
        } else {
            return res.status(500).send('Erreur lors de la suppression du commentaire');
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du commentaire :', err);
        return res.status(500).send('Erreur : Impossible de supprimer le commentaire');
    }
});



// ...existing code...

router.get('/:articleId', async (req, res) => {
    const { articleId } = req.params;

    try {
        // Vérifier si l'article existe
        const [article] = await connection.query(
            'SELECT * FROM Articles WHERE ID_article_Articles = ?',
            [articleId]
        );

        if (article.length === 0) {
            return res.status(404).send('Article non trouvé');
        }

        // Requête pour récupérer les commentaires liés à un article spécifique
        const [comments] = await connection.query(
            'SELECT * FROM Commentaires WHERE ID_article_Articles = ?',
            [articleId]
        );

        if (comments.length === 0) {
            return res.status(404).send('Aucun commentaire trouvé pour cet article');
        }

        return res.status(200).json(comments);
    } catch (err) {
        console.error('Erreur lors de la récupération des commentaires :', err);
        return res.status(500).send('Erreur : Impossible de récupérer les commentaires');
    }
});

module.exports = router;
