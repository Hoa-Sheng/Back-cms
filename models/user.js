const db = require('../connection.js'); // Importer le pool de connexions

class User {
  static async create(nom, email, motDePasse, role = 'user', photoProfil = null) {
    try {
      const [result] = await db.query(
        `INSERT INTO Utilisateur 
         (Nom_Utilisateur, Email_Utilisateur, Mot_de_passe_Utilisateur, Role_Utilisateur, Photo_Profil_Utilisateur, Date_inscription_Utilisateur) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [nom, email, motDePasse, role, photoProfil]
      );
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }
  

  static async findByEmail(email) {
    try {
      const [rows] = await db.query("SELECT * FROM Utilisateur WHERE Email_Utilisateur = ?", [email]);
      return rows[0]; // Retourne le premier utilisateur trouvé
    } catch (err) {
      throw err; // Relancer l'erreur pour qu'elle soit gérée par le contrôleur
    }
  }
  static async update(userId, updates) {
    try {
      const query = `
        UPDATE Utilisateur 
        SET Nom_Utilisateur = COALESCE(?, Nom_Utilisateur),
            Mot_de_passe_Utilisateur = COALESCE(?, Mot_de_passe_Utilisateur),
            Photo_Profil_Utilisateur = COALESCE(?, Photo_Profil_Utilisateur)
        WHERE ID_utilisateur_Utilisateur = ?
      `;
      const { name, email, password, photo } = updates;
  
      await db.query(query, [name, email, password, photo, userId]);
    } catch (err) {
      throw err;
    }
  }
  static async findById(userId) {
    try {
      const [rows] = await db.query("SELECT * FROM Utilisateur WHERE ID_utilisateur_Utilisateur = ?", [userId]);
      return rows[0]; // Retourne les détails de l'utilisateur
    } catch (err) {
      throw err; // Relance l'erreur pour qu'elle soit gérée
    }
  }

  static async deleteById(userId) {
    try {
      await db.query("DELETE FROM Utilisateur WHERE ID_utilisateur_Utilisateur = ?", [userId]);
    } catch (err) {
      throw err; // Relance l'erreur pour qu'elle soit gérée
    }
  }
}


module.exports = User;