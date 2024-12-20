var express = require('express');
var router = express.Router();
const connection = require('../connection');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/abo/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params; // L'utilisateur auquel on souhaite s'abonner
    const idUtilisateur = req.userId; // L'utilisateur qui effectue l'abonnement

    if (idUtilisateur === parseInt(userId)) {
        return res.status(400).send("Vous ne pouvez pas vous abonner à vous-même");
    }

    try {
        // Vérifier si l'abonnement existe déjà
        const [existingSubscription] = await connection.query(
            'SELECT * FROM Abonnements WHERE ID_utilisateur_Utilisateur = ? AND ID_utilisateur_abonne = ?',
            [idUtilisateur, userId]
        );

        if (existingSubscription.length > 0) {
            return res.status(400).send('Vous êtes déjà abonné à cet utilisateur');
        }

        // Créer l'abonnement
        const query = 'INSERT INTO Abonnements (ID_utilisateur_Utilisateur, ID_utilisateur_abonne) VALUES (?, ?)';
        const [result] = await connection.query(query, [idUtilisateur, userId]);

        if (result.affectedRows === 1) {
            return res.status(201).send('Abonnement réussi');
        } else {
            return res.status(500).send('Erreur lors de l\'abonnement');
        }
    } catch (err) {
        console.error('Erreur lors de l\'abonnement :', err);
        return res.status(500).send('Erreur : Impossible de créer l\'abonnement');
    }
});

router.delete('/abo/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params; 
    const idUtilisateur = req.userId; 

    if (idUtilisateur === parseInt(userId)) {
        return res.status(400).send("Vous ne pouvez pas vous désabonner de vous-même");
    }

    try {
        const [existingSubscription] = await connection.query(
            'SELECT * FROM Abonnements WHERE ID_utilisateur_Utilisateur = ? AND ID_utilisateur_abonne = ?',
            [idUtilisateur, userId]
        );

        if (existingSubscription.length === 0) {
            return res.status(404).send('Vous n\'êtes pas abonné à cet utilisateur');
        }
        const query = 'DELETE FROM Abonnements WHERE ID_utilisateur_Utilisateur = ? AND ID_utilisateur_abonne = ?';
        const [result] = await connection.query(query, [idUtilisateur, userId]);

        if (result.affectedRows === 1) {
            return res.status(200).send('Désabonnement réussi');
        } else {
            return res.status(500).send('Erreur lors du désabonnement');
        }
    } catch (err) {
        console.error('Erreur lors du désabonnement :', err);
        return res.status(500).send('Erreur : Impossible de supprimer l\'abonnement');
    }
});


module.exports = router;