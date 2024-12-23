const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour analyser les données envoyées dans les requêtes
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Initialisation du client Supabase
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware d'authentification
const authenticate = (req, res, next) => {
    if (!req.query.userId) {
        return res.redirect('/login');
    }
    next();
};

// -----------------------------------------------------------------------------
// Route pour afficher la page d'accueil (non authentifié)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
    const user = 0; // Valeur par défaut pour un utilisateur non connecté

    // Rendu de la page d'accueil avec un utilisateur non connecté
    res.render('accueil', { user: user });
});

// -----------------------------------------------------------------------------
// Route pour afficher la page d'accueil (authentifié)
// -----------------------------------------------------------------------------
router.get('/accueil', async (req, res) => {
    if (!req.query.userId) {
        // Si aucun ID utilisateur n'est fourni, afficher la page d'accueil par défaut
        const user = 0;
        res.render('accueil', { user: user });
    } else {
        const userId = req.query.userId;
        const id = Number(userId);

        try {
            // Récupérer les informations de l'utilisateur depuis Supabase
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', id);

            if (userError) {
                return res.status(500).json({ error: userError.message });
            }

            console.log(users[0]);

            // Récupérer les informations des produits depuis Supabase
            const { data: products, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', 1);

            if (productError) {
                throw productError;
            }

            console.log(products);

            // Rendu de la page d'accueil avec les informations utilisateur et produits
            res.render('accueil', { user: users[0], products: products });
        } catch (error) {
            console.error('Erreur serveur:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// Exporter le routeur
module.exports = router;
