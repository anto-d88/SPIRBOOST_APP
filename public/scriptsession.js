// Récupérer l'identifiant utilisateur caché et le masquer
const hidenid = document.getElementById('hidenid').innerHTML;
const userId = hidenid;
document.getElementById("hidenid").style.display = "none";

/**
 * Ajouter des événements lorsque le DOM est complètement chargé
 */
document.addEventListener('DOMContentLoaded', () => {
    // Mettre à jour le lien vers la page spiruline avec l'identifiant utilisateur
    const userLinkspiruline = document.getElementById('spirulineBio');
    userLinkspiruline.href = `/spirulineBio?userId=${encodeURIComponent(userId)}`;

    // Mettre à jour le lien vers l'histoire de la spiruline avec l'identifiant utilisateur
    const userLinkhistoirespiruline = document.getElementById('histoiredelaspiruline');
    userLinkhistoirespiruline.href = `/histoiredelaspiruline?userId=${encodeURIComponent(userId)}`;

    // Mettre à jour le lien vers l'espace client avec l'identifiant utilisateur
    const userLinkautreProduit = document.getElementById('autreProduit');
    userLinkautreProduit.href = `/autreProduit?userId=${encodeURIComponent(userId)}`;

    // Mettre à jour le lien vers l'espace client avec l'identifiant utilisateur
    const userLinkespaceClient = document.getElementById('espaceClient');
    userLinkespaceClient.href = `/espaceClient?userId=${encodeURIComponent(userId)}`;
    
    // Mettre à jour le lien vers la page de contact avec l'identifiant utilisateur
    const userLinkcontact = document.getElementById('contact');
    userLinkcontact.href = `/contact?userId=${encodeURIComponent(userId)}`;
    // Mettre à jour le lien vers le formulaire d'enregistrement avec l'identifiant utilisateur
    const userLinkregister = document.getElementById('register');
    userLinkregister.href = `/register?userId=${encodeURIComponent(userId)}`;

});
