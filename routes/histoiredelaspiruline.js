// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour gérer les données envoyées par les formulaires (encodées en URL et en JSON)
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

// Route pour afficher la page 'histoiredelaspiruline'
router.get('/histoiredelaspiruline', async (req, res) => {
    // Vérifie si un `userId` est présent dans les paramètres de la requête
    if (!req.query.userId) {
        const user = 0; // Si l'utilisateur n'est pas authentifié, on passe un objet `user` à 0
        return res.render('histoiredelaspiruline', { user: user }); // Rendu de la page sans informations sur l'utilisateur
    } else {
        // Si un `userId` est présent, on récupère les informations de l'utilisateur
        const userId = req.query.userId;
        const id = Number(userId); // Convertir l'ID utilisateur en nombre pour l'utiliser dans la requête SQL

        try {
            // Requête pour récupérer les données de l'utilisateur dans la table 'users'
            let { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id); // Filtre les résultats en fonction de l'ID de l'utilisateur
            
            // Si une erreur se produit lors de la récupération des données, on retourne une erreur 500
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            console.log(users[0]); // Affiche les données de l'utilisateur dans la console pour le débogage

            // Rendu de la vue 'histoiredelaspiruline' avec les données de l'utilisateur
            res.render('histoiredelaspiruline', { user: users[0] });
        } catch (err) {
            // Gère les erreurs générales (p. ex. erreurs liées à la connexion à la base de données)
            console.error('Erreur lors de la récupération des données utilisateur:', err);
            res.status(500).send('Erreur serveur : Impossible de récupérer les informations de l\'utilisateur.');
        }
    }
});

module.exports = router; // Exportation du routeur pour l'utiliser ailleurs dans l'application
