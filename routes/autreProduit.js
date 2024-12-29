// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour analyser les données envoyées par les formulaires (URL-encoded et JSON)
router.use(express.urlencoded({ extended: true }));
router.use(express.json());  

const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route pour la page 'spirulineBio'
router.get('/autreProduit', async (req, res) => {
  // Si l'utilisateur n'est pas connecté (pas de 'userId' dans la requête)
  if (!req.query.userId) {
    const user = 0; // On définit l'utilisateur comme étant un objet 0 (non authentifié)
    
    // On récupère les produits de la base de données Supabase
    try {
      const { data: products, error2 } = await supabase
        .from('products')
        .select('*')
        .eq('id', 1); // On filtre les produits avec un id de 1
      if (error2) throw error2; // Si une erreur survient lors de la récupération des produits, on lève l'exception
    
      // Une fois les produits récupérés, on affiche la vue 'spirulineBio' avec les données
      console.log(products);
      res.render('autreProduit', { user: user, products: products });
    } catch (error) {
      // Gère les erreurs liées à la récupération des produits
      console.error('Erreur lors de la récupération des produits:', error);
      res.status(500).send('Erreur serveur : Impossible de récupérer les produits.');
    }
  } else {
    // Si un 'userId' est présent, cela signifie que l'utilisateur est authentifié
    const userId = req.query.userId;
    const id = Number(userId); // On convertit l'ID en nombre pour l'utiliser dans la requête

    try {
      // On récupère les informations de l'utilisateur depuis Supabase
      let { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id); // On filtre pour récupérer l'utilisateur par son ID

      // Si une erreur survient lors de la récupération des données de l'utilisateur
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // On récupère également les produits de la base de données
      const { data: products, error2 } = await supabase
        .from('products')
        .select('*')
        .eq('id', 1); // On filtre les produits avec un id de 1
      if (error2) throw error2; // Si une erreur survient, on lève l'exception

      // Une fois les données utilisateur et produits récupérées, on affiche la vue 'spirulineBio'
     
      res.render('autreProduit', { user: users[0], products: products });
    } catch (err) {
      // Gestion des erreurs globales
      console.error('Erreur lors de la récupération des données:', err);
      res.status(500).send('Erreur serveur : Impossible de récupérer les informations.');
    }
  }
});

module.exports = router; // Exportation du routeur pour l'utiliser ailleurs dans l'application
