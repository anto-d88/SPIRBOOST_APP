// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
dotenv.config();

// Création du client Supabase pour interagir avec la base de données
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/**
 * Route principale pour afficher le tableau de bord administrateur.
 */
router.get('/adminDashboard', async (req, res) => {
  try {
    // Récupération des commandes en attente
    const { data: pendingOrders, error: errorPending } = await supabase
      .from('orders')
      .select('*');

    // Récupération des commandes en cours de livraison
    const { data: deliveringOrders, error: errorDelivering } = await supabase
      .from('pending_deliveries')
      .select('*');

    // Récupération des commandes livrées
    const { data: deliveredOrders, error: errorDelivered } = await supabase
      .from('delivered_orders')
      .select('*');
      
   // Récupération des messages des utilisateurs
   const { data: messages, error: errorMessages } = await supabase
   .from('messages')
   .select('*')
   .eq('receiver_id', 1) // ID de l'administrateur
   .order('created_at', { ascending: false });
     // Récupération des réponses associées aux messages
     const { data: responses, error: errorResponses } = await supabase
     .from('responses')
     .select('*')
     .in('message_id', messages.map(msg => msg.id));  // Récupère les réponses pour les messages récupérés

    // Gestion des erreurs potentielles
    if (errorPending || errorDelivering || errorDelivered || errorMessages || errorResponses) {
      return res.status(500).send('Erreur lors de la récupération des commandes.');
    }

    // Rendu de la vue avec les données récupérées
    res.render('adminDashboard', {
      pendingOrders,
      deliveringOrders,
      deliveredOrders,
      messages,  // Ajoutez les messages dans le rendu
      responses,  // Ajouter les réponses dans le rendu
      
    });
  } catch (err) {
    console.error('Erreur serveur lors du rendu du tableau de bord:', err);
    res.status(500).send('Erreur serveur.');
  }
});
router.get('/admin/visitor-stats', async (req, res) => {
  try {
    const { data, error } = await supabase
        .from('visitor_logs')
        .select('visit_time, page_visited');

    if (error) {
        return res.status(500).send('Erreur lors de la récupération des statistiques.');
    }

    // Structurez les données pour le graphique, regroupées par page visitée
    const stats = data.reduce((acc, log) => {
        const page = log.page_visited;
        acc[page] = (acc[page] || 0) + 1;  // Comptage des visites pour chaque page
        return acc;
    }, {});

    res.json(stats);  // Envoie des données JSON regroupées par page visitée
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur.');
  }
});


/**
 * Route pour mettre à jour le statut de livraison d'une commande.
 */
router.post('/update-delivery-status', async (req, res) => {
  const { orderId } = req.body;
console.log(orderId)
  try {
    // Validation des données d'entrée
    if (!orderId) {
      return res.status(400).json({ message: 'ID de commande requis.' });
    }

    // Vérification de l'existence de la commande dans `pending_deliveries`
    const { data: order, error: orderError } = await supabase
      .from('pending_deliveries')
      .select('*')
      .eq('orders_id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
console.log(order)
    // Déplacement de la commande vers la table `delivered_orders`
    const { error: insertError } = await supabase
      .from('delivered_orders')
      .insert([{
        orders_id: orderId,
        id: order.id,
        user_id: order.user_id,
        product_id: order.product_id, 
        quantity: order.quantity,
        total_price: order.total_price,
        delivery_status: "delivered",
    }]);

    if (insertError) {
      console.error('Erreur lors de l\'insertion dans delivered_orders:', insertError);
      return res.status(500).json({ message: 'Erreur interne lors de la livraison.' });
    }

    // Mise à jour du statut dans la table `orders`
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ delivery_status: 'delivered' })
      .eq('orders_id', orderId)
       

    if (updateOrderError) {
      console.error('Erreur lors de la mise à jour de orders:', updateOrderError);
      return res.status(500).json({ message: 'Erreur interne lors de la mise à jour.' });
    }

    // Suppression de la commande dans la table `pending_deliveries`
    const { error: deleteError } = await supabase
      .from('pending_deliveries')
      .delete()
      .eq('orders_id', orderId);

    if (deleteError) {
      console.error('Erreur lors de la suppression de pending_deliveries:', deleteError);
      return res.status(500).json({ message: 'Erreur interne lors de la suppression.' });
    }

    // Succès
    res.status(200).json({ message: 'Commande livrée avec succès.' });
  } catch (error) {
    console.error('Erreur générale lors de la mise à jour du statut de livraison:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});
router.post('/admin/respond', async (req, res) => {
  const { sender_id, message_id, response } = req.body; // Récupération des données du formulaire de réponse
  
  try {
    // Validation des données
    if (!sender_id || !message_id || !response) {
      return res.status(400).json({ message: 'Données manquantes.' });
    }

    // Insertion de la réponse dans la table responses
    const { error } = await supabase
      .from('responses')
      .insert([
        {
          message_id: message_id,  // Référence au message d'origine
          response: response,      // Le message de réponse
          admin_id: 1,             // ID de l'administrateur (vous pouvez le rendre dynamique)
        },
      ]);

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la réponse :', error);
      return res.status(500).json({ message: 'Erreur interne lors de l\'envoi de la réponse.' });
    }

    // Rediriger vers la page d'administration après la réponse
    res.redirect('/adminDashboard');
  } catch (err) {
    console.error('Erreur lors de la réponse:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});



// Exportation du routeur pour l'utiliser dans l'application principale
module.exports = router;
