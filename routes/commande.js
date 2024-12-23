// Importation des modules requis
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour parser les requêtes HTTP
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Configuration de Supabase
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route pour afficher la page de succès après commande
router.get('/success', async (req, res) => {
    try {
        // Récupération de l'ID utilisateur depuis la requête
        const userId = parseInt(req.query.userId);

        // Récupération des informations utilisateur depuis la base de données
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId);

        if (error) {
            // Gestion des erreurs de récupération
            return res.status(500).json({ error: error.message });
        }

        // Rendu de la vue "success" avec les données utilisateur
        res.render('success', { user: users[0] });
    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour afficher la page d'annulation
router.get('/cancel', (req, res) => {
    // Rendu de la vue "cancel"
    res.render('cancel');
});

// Exportation du routeur
module.exports = router;
