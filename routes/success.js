const express = require('express');
const router = express.Router();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
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

//const pool = new Pool({ connectionString: process.env.SUPABASE_BD_URL});

// Afficher le la page success 

router.get('/success', async (req, res) => {
    const userId = req.query.userId;
    const id = Number(userId);
    console.log(id, "OK")
     
   
    res.render(`/success?userId=${id}`);

});

module.exports = router;
