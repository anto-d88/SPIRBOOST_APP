// Importation des modules requis
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Configuration de middleware pour le parsing des requêtes
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Configuration Supabase
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route pour afficher la page de chargement du paiement
router.get('/chargementPaiement', (req, res) => {
    const userId = req.query.userId; // Récupération de l'ID utilisateur depuis la requête
    res.render('chargementPaiement', { userId: userId }); // Rendu de la vue avec l'ID utilisateur
});

// API pour traiter le paiement
// Fonction pour générer un ID unique de 10 caractères commençant par 'sp-'
function generateOrderId() {
    const prefix = 'sp-';
    const uniqueNumber = Math.floor(Math.random() * 10000000000); // Génère un nombre aléatoire de 10 chiffres
    const orderId = prefix + uniqueNumber.toString().padStart(8, '0'); // Assurez-vous que l'ID soit de 10 caractères
    return orderId;
}

// Fonction pour vérifier si l'ID existe déjà dans la base de données
async function orderIdExists(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .select('orders_id')
        .eq('orders_id', orderId);

    if (error) {
        throw new Error('Erreur de vérification de l\'ID de commande : ' + error.message);
    }

    return data.length > 0; // Retourne true si l'ID existe, sinon false
}

router.get('/api/chargementPaiement', async (req, res) => {
    try {
        const userId = req.query.userId;
        const id = Number(userId);
        console.log(id, "OK");

        const { data: cartItems, error: cartItemserror } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', id);

        if (cartItemserror) {
            return res.status(500).json({ error: cartItemserror });
        }

        const product_id = cartItems[0]?.product_id;

        const { data: product, error: errorproduct } = await supabase
            .from('products')
            .select('*')
            .eq('id', product_id);

        if (errorproduct) {
            return res.status(500).json({ error: errorproduct });
        }

        const { data: user, error: erroruser } = await supabase
            .from('users')
            .select('*')
            .eq('id', id);

        if (erroruser) {
            return res.status(500).json({ error: erroruser });
        }

        const reduction = user[0].promo || 0;
        const fraisDePort = user[0].free_shipping ? 0 : 5;
        let totalPrice = Math.round(cartItems[0].total_price);

        if (reduction > 0) {
            totalPrice = totalPrice - ( (totalPrice * reduction) / 100);
        }

        totalPrice = Math.round(totalPrice);
        console.log(totalPrice);

        // Générer un identifiant de commande unique
        let orderId = generateOrderId();

        // Vérifier si l'ID existe déjà
        let idExists = await orderIdExists(orderId);
        while (idExists) {
            // Si l'ID existe déjà, générer un nouvel ID
            orderId = generateOrderId();
            idExists = await orderIdExists(orderId);
        }

        // Création d'une commande pour l'utilisateur
        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                orders_id: orderId, // Ajout de l'ID généré
                client_id: user[0].id,
                product: product[0].name,
                quantity: cartItems[0].quantity,
                amount_euros: totalPrice,
                fraisDePort: fraisDePort,
                order_status: 'validée',
                email: user[0].email,
            }]);

        if (orderError) {
            return res.status(500).json({ error: orderError });
        }

        const { error: orderError2 } = await supabase
            .from('pending_deliveries')
            .insert([{
                orders_id: orderId,
                user_id: user[0].id,
                product_id: product[0].id,
                quantity: cartItems[0].quantity,
                total_price: totalPrice + fraisDePort,
            }]);

        if (orderError2) {
            return res.status(500).json({ error: orderError2 });
        }

        await supabase
            .from('cart')
            .delete()
            .eq('user_id', id);


      


        res.json({ success: true, user: user[0] });
    } catch (error) {
        console.error('Erreur lors du traitement :', error);
        res.status(500).json({ error: error.message });
    }
});

// Exportation du routeur
module.exports = router;
