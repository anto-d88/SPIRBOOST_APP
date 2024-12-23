// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware pour vérifier l'authentification de l'utilisateur
// Si l'utilisateur n'est pas authentifié (pas de `userId`), il sera redirigé vers la page de connexion
const authenticate = (req, res, next) => {
  if (!req.query.userId) {
    return res.redirect('/login');
  }
  next(); // Passe au middleware suivant ou à la route
};

// Route pour la page de contact
router.get('/contact', async (req, res) => {
  // Vérifie si un `userId` est passé en paramètre dans la requête
  if (!req.query.userId) {
    const user = 0; // Si l'utilisateur n'est pas connecté, on initialise `user` à 0
    return res.render('contact', { user: user }); // Affiche la page de contact sans informations sur l'utilisateur
  } else {
    // Si un `userId` est passé, on récupère ses données depuis Supabase
    const userId = req.query.userId; // Récupère l'ID de l'utilisateur à partir des paramètres de la requête
    const id = Number(userId); // Convertit l'ID en nombre (assurez-vous que `userId` est bien un nombre valide)
    

    try {
      // Récupère les informations de l'utilisateur à partir de la table 'users' de Supabase
      let { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id); // Filtre par l'ID de l'utilisateur

      if (error) {
        return res.status(500).json({ error: error.message }); // Si une erreur se produit lors de la récupération, elle est renvoyée
      }
      console.log(users[0]); // Affiche les informations de l'utilisateur dans la console pour le débogage

      // Récupère les informations d'un produit spécifique à partir de la table 'products'
      const { data: products, error2 } = await supabase
        .from('products')
        .select('*')
        .eq('id', 1); // Sélectionne le produit avec l'ID = 1 (exemple d'utilisation)

      if (error2) throw error2; // Si une erreur se produit lors de la récupération du produit, elle est lancée

      console.log(products); // Affiche les informations du produit dans la console

      // Rendu de la vue 'contact' avec les données de l'utilisateur et du produit
      res.render('contact', { user: users[0], products: products }); // Transmet l'utilisateur et le produit à la vue 'contact'
    } catch (error) {
      // Gère les erreurs générales
      console.error(error); // Affiche l'erreur dans la console
      res.status(500).json({ error: "Une erreur s'est produite lors du chargement des données." }); // Envoie une réponse d'erreur si quelque chose échoue
    }
  }
});

module.exports = router; // Exportation du routeur pour l'utiliser dans d'autres parties de l'application
