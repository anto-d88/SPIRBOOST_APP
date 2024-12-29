// Importation des dépendances nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Middleware pour gérer les données envoyées par les formulaires
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// URL et clé d'authentification pour se connecter à Supabase
const dotenv = require('dotenv');
dotenv.config(); // Charge les variables d'environnement depuis .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware pour vérifier l'authentification de l'utilisateur
const authenticate = async (req, res, next) => {
  const userId = req.query.userId; // On vérifie si un userId est présent dans les paramètres de requête
  console.log(userId)
  if (!userId) {
    return res.redirect('/login'); // Redirige vers la page de connexion si aucun userId
  }

  try {
    // Vérifie si l'utilisateur existe dans la base de données
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.redirect('/login'); // Redirige si l'utilisateur n'existe pas
    }

    // Ajoute les informations de l'utilisateur à la requête pour les utiliser dans les routes
    
    req.user = user;
    next(); // Passe à la route suivante
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Une erreur s'est produite lors de la vérification de l'utilisateur." });
  }
};



router.get('/contact', authenticate, async (req, res) => {
  try {
    const user = req.user; // Informations utilisateur récupérées par le middleware
    const adminId = 1; // ID de l'administrateur

    // Récupère les messages entre l'utilisateur connecté et l'administrateur
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

      
    if (messageError) { 
      throw new Error(messageError.message);
    }
// Récupère les réponses de l'administrateur
const { data: responses, error: responseError } = await supabase
.from('responses')
.select('*')
.in('message_id', messages.map(msg => msg.id)); // Récupère les réponses pour les messages

if (responseError) {
throw new Error(responseError.message);
}

// Passe les données nécessaires à la vue
res.render('contact', { user, messages, responses, admin_id: adminId }); // Ajout des réponses ici
  } catch (error) {
    console.error('Erreur lors du chargement des messages :', error);
    res.status(500).json({ error: "Une erreur s'est produite lors du chargement des données." });
  }
});


// Route pour envoyer un message
router.post('/contact/send', async (req, res) => {
  const {sender_id, message } = req.body;
   // L'utilisateur connecté est l'expéditeur
  const receiver_id = 1; // ID de l'administrateur ou autre destinataire
console.log(sender_id)
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, message }]);

    if (error) {
      throw new Error(error.message);
    }

    // Redirige vers la page de contact après l'envoi
    res.redirect(`/contact?userId=${sender_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Une erreur s'est produite lors de l'envoi du message." });
  }
});

module.exports = router; 
