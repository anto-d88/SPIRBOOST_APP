// Masquer l'élément contenant l'identifiant utilisateur et mettre à jour les liens dynamiques
document.addEventListener('DOMContentLoaded', () => {
  // Récupérer l'ID utilisateur depuis l'élément caché
  const hidenid = document.getElementById('hidenid').innerHTML;
  const userId = hidenid;

  // Masquer l'élément 'hidenid' pour qu'il ne soit pas visible
  document.getElementById("hidenid").style.display = "none";

  // Fonction pour mettre à jour les liens dynamiques avec l'ID utilisateur
  const updateLinkWithUserId = (id, path) => {
      const link = document.getElementById(id);
      if (link) link.href = `${path}?userId=${encodeURIComponent(userId)}`;
  };

  // Mettre à jour les liens dynamiques
  updateLinkWithUserId('accueil', '/accueil');
  updateLinkWithUserId('spirulineBio', '/spirulineBio');
  updateLinkWithUserId('histoiredelaspiruline', '/histoiredelaspiruline');
  updateLinkWithUserId('panier', '/panier');
  updateLinkWithUserId('espaceClient', '/espaceClient');
  updateLinkWithUserId('contact', '/contact');
});

document.querySelector('.informations').addEventListener('click', () => {
    let informations = document.querySelector('.boxInfoClient');;
    informations.style.display = "block"
    let commandes = document.querySelector('.boxCommandes');;
    commandes.style.display = "none"

});
document.querySelector('.commandes').addEventListener('click', () => {
    let informations = document.querySelector('.boxInfoClient');;
    informations.style.display = "none"
    let commandes = document.querySelector('.boxCommandes');;
    commandes.style.display = "block"

});
document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const updateForm = document.querySelector('.hidden');
    const infoDisplay = document.querySelector('.infoDisplay');
    const cancelButton = document.getElementById('cancelButton');
  
    editButton.addEventListener('click', () => {
      // Masquer les informations affichées
      infoDisplay.style.display = 'none';
      updateForm.style.display= 'flex';
  
    });
      // Lorsque l'utilisateur clique sur "Annuler", réafficher les informations et masquer le formulaire
  cancelButton.addEventListener('click', () => {
    infoDisplay.style.display = 'block';  // Afficher les informations
    updateForm.style.display= 'none';  // Masquer le formulaire
  });
  });
  