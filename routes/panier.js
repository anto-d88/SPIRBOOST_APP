const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Middleware pour analyser les données envoyées dans les requêtes
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
 
// Initialisation des clients Supabase et Stripe
const dotenv = require('dotenv');
// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
dotenv.config(); // Charge les variables d'environnement depuis .env
// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------------------------------------------------------
// Route pour afficher le panier
// -----------------------------------------------------------------------------
router.get('/panier', async (req, res) => {
    const userId = req.query.userId;
    const iduser = Number(userId);

    try {
        // Récupérer les articles du panier de l'utilisateur
        const { data: cartItems, error: errorcart } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', iduser);

        if (errorcart) {
            return res.status(500).send('Erreur lors de la récupération du panier');
        }

        // Récupérer les informations de l'utilisateur
        const { data: users, error: erroruser } = await supabase
            .from('users')
            .select('*')
            .eq('id', iduser);

        if (erroruser) {
            return res.status(500).json({ error: erroruser.message });
        }

         
        // Rendre la page panier avec les données
        res.render('panier', { user: users[0], title: 'Panier', cart: cartItems });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------------------------------------------------------
// Route pour ajouter un produit au panier
// -----------------------------------------------------------------------------
router.post('/panier', async (req, res) => {
    const productId = req.query.id;
    const { quantity, price } = req.body;
    const userId = req.query.userId;

    try {
        
     

        // Vérifier si le produit existe déjà dans le panier
        const { data: existingCartItem } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existingCartItem) {
            // Mettre à jour la quantité et le prix total si l'article existe déjà
            const { error: updateError } = await supabase
                .from('cart')
                .update({
                    quantity: existingCartItem.quantity + parseInt(quantity),
                    total_price: (price * existingCartItem.quantity) + (price * quantity)
                })
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (updateError) {
                return res.status(500).json({ error: 'Erreur lors de la mise à jour du panier' });
            }
        } else {
            // Ajouter un nouveau produit au panier
            const { error } = await supabase
                .from('cart')
                .insert([{ user_id: userId, product_id: productId, quantity: quantity, total_price: price * quantity }]);

            if (error) {
                return res.status(500).json({ error: 'Erreur lors de l\'ajout au panier' });
            }
        }

        res.status(200).json({ message: 'Produit ajouté au panier' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// -----------------------------------------------------------------------------
// Route pour supprimer un article du panier
// -----------------------------------------------------------------------------
router.post('/delete', async (req, res) => {
    const userId = parseInt(req.query.userId);

    try {
        // Supprimer les articles du panier de l'utilisateur
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({ message: 'Erreur lors de la suppression de l\'article', error });
        }

        // Rediriger vers la page panier
        res.redirect(`/panier?userId=${userId}`);
    } catch (err) {
        res.status(500).json({ message: 'Erreur interne du serveur', err });
    }
});


// -----------------------------------------------------------------------------
// Route pour valider la commande
// -----------------------------------------------------------------------------
router.post('/checkout', async (req, res) => {
    const userId = req.query.userId;
    const id = Number(userId);

    try {
        // Récupérer les informations de l'utilisateur
        const { data: users, error: errorUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', id);

        if (errorUser) {
            return res.status(500).json({ error: errorUser.message });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        const reduction = users[0].promo || 0; // Réduction (en pourcentage)
        const fraisDePort = users[0].free_shipping ? 0 : 500; // 5€ de frais de port si non gratuit
console.log(reduction)
        // Récupérer les articles du panier
        const { data: cartItems, error: errorCart } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', id);

        if (errorCart) {
            return res.status(500).send('Erreur lors de la récupération du panier.');
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send('Le panier est vide.');
        }

        // Calculer le montant total du panier
        let totalPrice = cartItems.reduce((sum, item) => sum + item.total_price, 0); // Total initial en euros

        // Appliquer la réduction si elle existe
        if (reduction > 0) {
            totalPrice = totalPrice - ( (totalPrice * reduction) / 100); // Réduire le total en fonction du pourcentage
        }

        // Ajouter les frais de port au total
        totalPrice = Math.round(totalPrice * 100); // Convertir en centimes et ajouter les frais de port
console.log(totalPrice)
        // Transformer les données du panier pour Stripe
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name || "Produit", // Utilisez le nom réel si disponible
                },
                unit_amount: totalPrice, // Prix en centimes
            },
            quantity: 1, // Quantité
        }));
        console.log(lineItems)

        // Ajouter les frais de port comme un article séparé si applicable
        if (fraisDePort > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: "Frais de port",
                    },
                    unit_amount: fraisDePort, // Frais de port en centimes
                },
                quantity: 1,
            });
        }

        // Créer une session Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                customer_id: id,
            },
            success_url: `http://localhost:3000/chargementPaiement?userId=${id}`,
            cancel_url: `http://localhost:3000/panier?userId=${id}`,
        });

        // Rediriger l'utilisateur vers Stripe Checkout
        res.redirect(303, session.url);
    } catch (err) {
        console.error('Erreur Stripe:', err);
        res.status(500).send('Erreur serveur : Impossible de créer une session Stripe.');
    }
});


// Exporter le routeur
module.exports = router;
