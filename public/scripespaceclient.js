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
  