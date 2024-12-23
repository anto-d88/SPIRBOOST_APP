const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs'); // Importer bcrypt.js
const router = express.Router();
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Middleware pour analyser les données et gérer les cookies
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(cookieParser());

// Initialisation du client Supabase
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const csrfProtection = csrf({ cookie: true });

// -----------------------------------------------------------------------------
// Route REGISTER - GET
// Affiche le formulaire d'inscription avec protection CSRF
// -----------------------------------------------------------------------------
router.get('/register', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('register', { csrfToken: csrfToken });
});

// -----------------------------------------------------------------------------
// Route REGISTER - POST
// Inscrit un nouvel utilisateur avec validation des données
// -----------------------------------------------------------------------------
router.post('/register', csrfProtection, async (req, res) => {
    const { email, password, adresse, telephone, Nom, Prenom } = req.body;

    try {
        // Obtenir les coordonnées des adresses utilisateur et destination
        const userCoords = await getCoordinates(adresse);
        const destinationCoords = await getCoordinates('59200 Tourcoing');

        if (!userCoords || !destinationCoords) {
            return res.status(400).json({ error: "Impossible de trouver les coordonnées de l'adresse." });
        }

        const distance = getDistanceFromLatLonInKm(
            userCoords.lon,
            userCoords.lat,
            destinationCoords.lon,
            destinationCoords.lat
        );
        console.log("Distance : " + distance + " km");

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        let insertData = {
            email,
            password: hashedPassword,
            address: adresse,
            phone_number: telephone,
            last_name: Nom,
            first_name: Prenom,
        };

        if (distance <= 15) {
            insertData.free_shipping = true;
        }

        const { error } = await supabase.from('users').insert([insertData]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// -----------------------------------------------------------------------------
// Fonction pour obtenir les coordonnées d'une adresse via Nominatim (OpenStreetMap)
// -----------------------------------------------------------------------------
async function getCoordinates(address) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) {
        return null;
    }
    return {
        lat: data[0].lat,
        lon: data[0].lon,
    };
}

// -----------------------------------------------------------------------------
// Fonction pour calculer la distance entre deux points géographiques
// -----------------------------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// -----------------------------------------------------------------------------
// Route LOGIN - GET
// Affiche le formulaire de connexion avec protection CSRF
// -----------------------------------------------------------------------------
router.get('/login', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('login', { csrfToken: csrfToken });
});

// -----------------------------------------------------------------------------
// Route LOGIN - POST
// Authentifie un utilisateur et redirige vers la page d'accueil
// -----------------------------------------------------------------------------
router.post('/login', csrfProtection, async (req, res) => {
    const { email, password } = req.body;
if(email != "administrateur@hotmail.com"){
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error || users.length === 0) {
            return res.status(400).send('Utilisateur non trouvé.');
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Mot de passe incorrect');
        }

        const { data: products, error: productError } = await supabase.from('products').select('*');

        if (productError) {
            return res.status(500).json({ error: productError.message });
        }

        console.log(user);

        res.render('accueil', { user, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}else{
    try {
        const { data: admins, error } = await supabase
            .from('admin')
            .select('*');

        if (error || admins.length === 0) {
            return res.status(400).send('Utilisateur non trouvé.');
        }

        const admin = admins[0];


        console.log(admin);

        res.redirect('/adminDashboard');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
});

// -----------------------------------------------------------------------------
// Route LOGOUT - GET
// Déconnecte un utilisateur et redirige vers la page d'accueil
// -----------------------------------------------------------------------------
router.get('/logout', (req, res) => {
    res.redirect('/');
});

module.exports = router;
 