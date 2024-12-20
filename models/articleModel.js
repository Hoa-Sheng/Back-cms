const connection = require('../connection'); // Importer le pool de connexions

class Article {
  static async create(titre, contenu, idUtilisateur, tags, categorieID, photo) {
    try {
      await connection.beginTransaction();
  

      const [articleResult] = await connection.query(
        "INSERT INTO Articles (Titre_Articles, Contenu_Articles, ID_utilisateur_Utilisateur, Photo_Articles) VALUES (?, ?, ?, ?)",
        [titre, contenu, idUtilisateur, photo]
      );
      const articleId = articleResult.insertId;
  

      for (let tag of tags) {
        tag = tag.trim();
  
        if (tag === '') continue; 
  
        // Vérification si le tag existe déjà
        const [existingTag] = await connection.query("SELECT ID_Tags_Tags FROM Tags WHERE Nom_Tags = ?", [tag]);
        let tagId;
  
        if (existingTag.length > 0) {
          // Le tag existe, utiliser son ID
          tagId = existingTag[0].ID_Tags_Tags;
        } else {
          // Le tag n'existe pas, le créer
          const [newTag] = await connection.query("INSERT INTO Tags (Nom_Tags, ID_Categories_Categories) VALUES (?, ?)", [tag, categorieID]);
          tagId = newTag.insertId;
        }
  
        // Vérification si la relation entre l'article et le tag existe déjà
        const [existingRelation] = await connection.query(
          "SELECT 1 FROM Articles_tags WHERE ID_article_Articles = ? AND ID_Tags_Tags = ?",
          [articleId, tagId]
        );
  
        if (existingRelation.length === 0) {
          //ajoute
          await connection.query(
            "INSERT INTO Articles_tags (ID_article_Articles, ID_Tags_Tags) VALUES (?, ?)",
            [articleId, tagId]
          );
        }
      }
  
      await connection.commit();
      return articleId;
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }
  



  static async findAll() {
    try {
      const [rows] = await connection.query("SELECT * FROM Articles");
      return rows; // Retourne tous les articles
    } catch (err) {
      throw err;
    }
  }

  static async finconnectionyId(id) {
    try {
      const [rows] = await connection.query("SELECT * FROM Articles WHERE ID_article_Articles = ?", [id]);
      return rows[0]; // Retourne l'article trouvé ou undefined
    } catch (err) {
      throw err;
    }
  }

  static async update(id, titre, contenu, photo) {
    try {
      const [result] = await connection.query(
        "UPDATE Articles SET Titre_Articles = ?, Contenu_Articles = ? , Photo_Articles = ? WHERE ID_article_Articles = ?",
        [titre, contenu, id, photo]
      );
      return result.affectedRows; // Retourne le nombre de lignes affectées
    } catch (err) {
      throw err;
    }
  }

  static async removeTags(articleId, tags) {
    try {
      await connection.beginTransaction();
  
      // Vérifier si le tag est associé à l'article
      const [existingTag] = await connection.query(
        "SELECT * FROM Articles_tags WHERE ID_article_Articles = ? AND ID_Tags_Tags IN (SELECT ID_Tags_Tags FROM Tags WHERE Nom_Tags = ?)",
        [articleId, tags]
      );
  
      if (existingTag.length === 0) {
        throw new Error(`Le tag "${tags}" n'est pas associé à cet article.`);
      }
  
      // Supprimer la relation entre l'article et le tag
      const [result] = await connection.query(
        "DELETE FROM Articles_tags WHERE ID_article_Articles = ? AND ID_Tags_Tags IN (SELECT ID_Tags_Tags FROM Tags WHERE Nom_Tags = ?)",
        [articleId, tags]
      );
  
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }  

  static async delete(id) {
    try {
      await connection.beginTransaction();
  
      // Supprimer les relations entre l'article et les tags
      await connection.query(
        "DELETE FROM Articles_tags WHERE ID_article_Articles = ?",
        [id]
      );
  
      // Supprimer l'article de la table Articles
      const [result] = await connection.query(
        "DELETE FROM Articles WHERE ID_article_Articles = ?",
        [id]
      );
  
      await connection.commit();
      return result; // Retourne le résultat de la suppression (affectRows)
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }
  static async findAllWithPagination(limit, offset) {
    try {
        const [rows] = await connection.query(
            `
            SELECT 
                a.ID_article_Articles,
                a.Titre_Articles,
                a.Contenu_Articles,
                a.Photo_Articles,
                a.Date_de_creation_Articles,
                u.Nom_Utilisateur
            FROM 
                Articles a
            JOIN 
                Utilisateur u ON a.ID_utilisateur_Utilisateur = u.ID_utilisateur_Utilisateur
            ORDER BY 
                a.Date_de_creation_Articles DESC
            LIMIT ? OFFSET ?
            `,
            [parseInt(limit), parseInt(offset)]
        );
        return rows; // Retourne les articles avec les informations sur l'utilisateur
    } catch (err) {
        throw err;
    }


  }
  
  
  static async getTotalCount() {
    try {
      const [rows] = await connection.query(
        "SELECT COUNT(*) as totalCount FROM Articles"
      );
      return rows[0].totalCount; // Retourne le total des articles
    } catch (err) {
      throw err;
    }
  }
  
  
  
}

module.exports = Article; 