// Récupérer l'identifiant utilisateur caché et le masquer
const hidenid = document.getElementById('hidenid').innerHTML;
const userId = hidenid;
document.getElementById("hidenid").style.display = "none";

/**
 * Fonction asynchrone pour traiter la commande
 */
async function processOrder() { 
  try {
    // Envoi d'une requête pour charger le paiement
    const response = await fetch(`/api/chargementPaiement?userId=${userId}`);
    const result = await response.json();

    // Vérification de la réponse
    if (result.success) {
      // Redirection vers une page de succès si tout va bien
      window.location.href = `/success?userId=${encodeURIComponent(userId)}`;
    } else {
      // Affichage d'un message d'erreur en cas de problème
      alert('Erreur : ' + result.error);
    }
  } catch (error) {
    // Gestion des erreurs réseau ou de serveur
    console.error('Erreur réseau:', error);
    alert('Impossible de communiquer avec le serveur.');
  }
}

// Simuler une attente de chargement avant de lancer la requête
setTimeout(processOrder, 2000);
