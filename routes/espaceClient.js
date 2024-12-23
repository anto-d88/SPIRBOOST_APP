// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

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

// Route pour la page 'espaceClient', qui est protégée par le middleware 'authenticate'
router.get('/espaceClient', authenticate, async (req, res) => {
  // Récupère l'ID de l'utilisateur depuis la requête
  const userId = req.query.userId;
  const id = Number(userId); // Conversion de l'ID en nombre pour la requête SQL
  
  try {
    // Récupère les informations de l'utilisateur à partir de la table 'users' de Supabase
    let { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id); // Filtre les résultats pour ne récupérer que l'utilisateur avec l'ID spécifié
    
    if (error) {
      return res.status(500).json({ error: error.message }); // Si une erreur se produit, renvoyer un message d'erreur
    }

    // Récupère les articles de commande associés à cet utilisateur dans la table 'orders'
    const { data: ordersItems, error2: errorcart } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', id); // Filtre par l'ID du client pour récupérer les commandes de l'utilisateur
    
    // Si une erreur se produit lors de la récupération du panier (les commandes), renvoyer une erreur
    if (errorcart) {
      return res.status(500).send('Erreur lors de la récupération du panier');
    }

    // Si tout se passe bien, rendre la vue 'espaceClient' en passant les données utilisateur et les articles de commande
    res.render('espaceClient', { user: users[0], ordersItems });
  } catch (err) {
    // Gère les erreurs globales et de serveur
    console.error('Erreur lors de la récupération des données:', err);
    res.status(500).send('Erreur serveur : Impossible de récupérer les informations de l\'utilisateur.');
  }
});
// Route pour mettre à jour les informations utilisateur
router.post('/espaceClient/update', authenticate, async (req, res) => {
  const userId = req.query.userId;
  const { last_name, first_name, phone_number, email, address } = req.body;

  try {
    // Mise à jour des informations utilisateur dans la base de données
    const { error } = await supabase
      .from('users')
      .update({ last_name, first_name, phone_number, email, address })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Rediriger vers l'espace client après la mise à jour
    res.redirect(`/espaceClient?userId=${encodeURIComponent(userId)}`);
  } catch (err) {
    console.error('Erreur lors de la mise à jour des informations utilisateur:', err);
    res.status(500).send('Erreur serveur : Impossible de mettre à jour les informations utilisateur.');
  }
});


module.exports = router; // Exportation du routeur pour l'utiliser dans d'autres parties de l'application
