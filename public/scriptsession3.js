// Masquer l'élément contenant l'identifiant utilisateur et préparer les liens dynamiques
document.addEventListener('DOMContentLoaded', () => {
  // Récupérer l'ID utilisateur depuis l'élément caché
  const hidenid = document.getElementById('hidenid').innerHTML;
  const userId = hidenid;

  // Masquer l'élément 'hidenid' pour qu'il ne soit pas visible
  document.getElementById("hidenid").style.display = "none";

  // Fonction pour mettre à jour les liens dynamiquement avec l'ID utilisateur
  const updateLinkWithUserId = (id, path) => {
      const link = document.getElementById(id);
      if (link) link.href = `${path}?userId=${encodeURIComponent(userId)}`;
  };

  // Fonction pour mettre à jour les actions des formulaires avec l'ID utilisateur
  const updateFormActionWithUserId = (id, actionPath) => {
      const form = document.getElementById(id);
      if (form) form.action = `${actionPath}?userId=${encodeURIComponent(userId)}`;
  };

  // Mettre à jour les liens dynamiques
  updateLinkWithUserId('accueil', '/accueil');
  updateLinkWithUserId('panier', '/panier');
  updateLinkWithUserId('spirulineBio', '/spirulineBio');
  updateLinkWithUserId('espaceClient', '/espaceClient');
  updateLinkWithUserId('histoiredelaspiruline', '/histoiredelaspiruline');
  updateLinkWithUserId('contact', '/contact');
  updateLinkWithUserId('success', '/chargementPaiement');

  // Mettre à jour l'action du formulaire de paiement
  updateFormActionWithUserId('paiement', '/checkout');
});
