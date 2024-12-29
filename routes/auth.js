const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit'); // Limiteur de requêtes
const Joi = require('joi'); // Validation des données
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const router = express.Router();

// Middleware
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(cookieParser());

// Protection CSRF
const csrfProtection = csrf({ cookie: true });

// -----------------------------------------------------------------------------
// Limiteur de requêtes
// -----------------------------------------------------------------------------
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes par IP
    message: "Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.",
});

// Appliquer le limiteur à toutes les routes
router.use(limiter);

// -----------------------------------------------------------------------------
// Validation avec Joi
// -----------------------------------------------------------------------------
const registrationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    adresseNumero: Joi.string().regex(/^\d+$/).required(),
    adresseRue: Joi.string().required(),
    adresseCodePostal: Joi.string()
    .pattern(/^\d{4,5}$|^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$|^[0-9]{3,6}$/)
    .required()
    .messages({
        "string.pattern.base": "Code postal invalide. Veuillez entrer un code postal européen valide.",
    }),
    adresseVille: Joi.string().required(),
    telephone: Joi.string().regex(/^\+?\d{10,15}$/).required(),
    Nom: Joi.string().regex(/^[a-zA-ZÀ-ÿ\s'-]+$/).required(),
    Prenom: Joi.string().regex(/^[a-zA-ZÀ-ÿ\s'-]+$/).required(),
}).unknown(true); // Ajout de .unknown(true) pour ignorer _csrf et autres champs inconnus


const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).unknown(true); // Ajouter ici .unknown(true) pour ignorer les champs comme _csrf


// -----------------------------------------------------------------------------
// FONCTIONS UTILITAIRES
// -----------------------------------------------------------------------------
async function getCoordinates(address) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data.length === 0) return null;
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des coordonnées :", error);
        return null;
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
// ROUTES
// -----------------------------------------------------------------------------

// Afficher le formulaire d'inscription
router.get('/register', csrfProtection, (req, res) => {
    res.render('register', { csrfToken: req.csrfToken() });
});

// Inscription d'un nouvel utilisateur
router.post('/register', csrfProtection, async (req, res) => {
    // Valider les données avec Joi
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const {
        email,
        password,
        adresseNumero,
        adresseRue,
        adresseCodePostal,
        adresseVille,
        telephone,
        Nom,
        Prenom,
    } = value;

    try {
        const adresseComplete = `${adresseNumero} ${adresseRue}, ${adresseCodePostal} ${adresseVille}`;
        const userCoords = await getCoordinates(adresseComplete);
        const destinationCoords = await getCoordinates('59200 Tourcoing');

        if (!userCoords || !destinationCoords) {
            return res.status(400).send('Adresse invalide ou introuvable.');
        }

        const distance = getDistanceFromLatLonInKm(
            userCoords.lat, userCoords.lon,
            destinationCoords.lat, destinationCoords.lon
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertData = {
            email,
            password: hashedPassword,
            address: adresseComplete,
            phone_number: telephone,
            last_name: Nom,
            first_name: Prenom,
            free_shipping: distance <= 15,
        };

        const { error: dbError } = await supabase.from('users').insert([insertData]);
        if (dbError) {
            return res.status(500).send('Erreur lors de l\'inscription.');
        }

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur.');
    }
});

// Afficher le formulaire de connexion
router.get('/login', csrfProtection, (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

// Connexion d'un utilisateur
router.post('/login', csrfProtection, async (req, res) => {
    // Valider les données avec Joi
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    try {
        if (email === "administrateur@hotmail.com") {
            const { data: admins, error: adminError } = await supabase.from('admin').select('*');
            if (adminError || admins.length === 0) {
                return res.status(400).send('Administrateur introuvable.');
            }
            res.redirect('/adminDashboard');
        } else {
            const { data: users, error: userError } = await supabase.from('users').select('*').eq('email', email);
            if (userError || users.length === 0) {
                return res.status(400).send('Utilisateur non trouvé.');
            }

            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).send('Mot de passe incorrect.');
            }

            res.redirect(`/accueil?userId=${encodeURIComponent(user.id)}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur.');
    }
});

// Déconnexion
router.get('/logout', (req, res) => {
    res.redirect('/');
});

// Exporter le router
module.exports = router;

