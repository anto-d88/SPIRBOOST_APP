// Masquer l'élément contenant l'identifiant utilisateur et mettre à jour les liens dynamiques
// Récupérer l'ID utilisateur depuis l'élément caché
var element = document.getElementById('hidenid');

// Vérifier si l'élément a une valeur
if (element && element.value !== "") {
    const hidenid = document.getElementById('hidenid').innerHTML;
    const userId = hidenid;
    
    // Masquer l'élément 'hidenid' pour qu'il ne soit pas visible
    document.getElementById("hidenid").style.display = "none";
    
    document.addEventListener('DOMContentLoaded', () => {
      
  // Fonction pour mettre à jour les liens dynamiques avec l'ID utilisateur
  const updateLinkWithUserId = (id, path) => {
      const link = document.getElementById(id);
      if (link) link.href = `${path}?userId=${encodeURIComponent(userId)}`;
    };
    
    // Mettre à jour les liens dynamiques
    updateLinkWithUserId('accueil', '/accueil');
    updateLinkWithUserId('panier', '/panier');
    updateLinkWithUserId('spirulineBio', '/spirulineBio');
    updateLinkWithUserId('espaceClient', '/espaceClient');
    updateLinkWithUserId('histoiredelaspiruline', '/histoiredelaspiruline');
    updateLinkWithUserId('contact', '/contact');
  });
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', () => {
        setTimeout(() => {
            window.location.href = `/accueil?userId=${encodeURIComponent(userId)}`; // Redirige vers la page d'accueil
        }, 500); // Délai pour permettre au formulaire de se soumettre
    });
  });
}else{
  
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', () => {
      setTimeout(() => {
          window.location.href = '/'; // Redirige vers la page d'accueil
      }, 500); // Délai pour permettre au formulaire de se soumettre
  });
});
}