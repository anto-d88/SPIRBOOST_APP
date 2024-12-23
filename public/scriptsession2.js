// Récupérer l'identifiant utilisateur caché et le masquer
// Accéder à l'élément avec l'ID 'hidenid'
var element = document.getElementById('hidenid');

// Vérifier si l'élément a une valeur
if (element && element.value !== "") {
    const hidenid = document.getElementById('hidenid').innerHTML;
    const userId = hidenid;

document.getElementById("hidenid").style.display = "none";

// Ajouter des liens dynamiques basés sur l'utilisateur
document.addEventListener('DOMContentLoaded', () => {
    // Mettre à jour les liens avec l'identifiant utilisateur
    const updateLinkWithUserId = (id, path) => {
        const link = document.getElementById(id);
        if (link) link.href = `${path}?userId=${encodeURIComponent(userId)}`;
    };

    updateLinkWithUserId('accueil', '/accueil');
    updateLinkWithUserId('panier', '/panier');
    updateLinkWithUserId('panier2', '/panier');
    updateLinkWithUserId('spirulineBio', '/spirulineBio');
    updateLinkWithUserId('espaceClient', '/espaceClient');
    updateLinkWithUserId('histoiredelaspiruline', '/histoiredelaspiruline');
    updateLinkWithUserId('contact', '/contact');
});

// Gestion des boutons d'augmentation et de diminution des quantités
document.addEventListener('DOMContentLoaded', () => {
    const increaseButtons = document.querySelectorAll('.increase');
    const decreaseButtons = document.querySelectorAll('.decrease');

    // Fonction pour augmenter la quantité
    const increaseQuantity = (button) => {
        const quantityInput = button.closest('.boxquantity').querySelector('.quantity');
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    };

    // Fonction pour diminuer la quantité
    const decreaseQuantity = (button) => {
        const quantityInput = button.closest('.boxquantity').querySelector('.quantity');
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    };

    // Ajouter les gestionnaires d'événements aux boutons
    increaseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Empêcher tout comportement par défaut
            increaseQuantity(button);
        });
    });

    decreaseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Empêcher tout comportement par défaut
            decreaseQuantity(button);
        });
    });
});

// Gestion de la soumission des formulaires pour ajouter au panier
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.add-to-cart-form');

    // Parcourir chaque formulaire pour ajouter un gestionnaire de soumission
    forms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêcher la soumission classique

            // Récupérer les données nécessaires
            const productId = form.getAttribute('data-product-id');
            const productPrice = form.getAttribute('data-product-price');
            const quantityInput = form.querySelector('input[name="quantity"]');
            const quantity = quantityInput.value;
            const statusMessage = document.getElementById(`status-${productId}`);
            const btnpanier = document.getElementById('panier2');

            try {
                // Envoyer une requête POST au serveur
                const response = await fetch(`/panier?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(productId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantity, price: productPrice })
                });

                if (!response.ok) throw new Error('Erreur lors de l\'ajout au panier');

                // Mettre à jour le statut en cas de succès
                statusMessage.textContent = 'Produit ajouté au panier!';
                statusMessage.style.color = 'green';
                btnpanier.style.display = "block";

            } catch (error) {
                // Gérer les erreurs
                statusMessage.textContent = 'Échec de l\'ajout au panier.';
                statusMessage.style.color = 'red';
            }
        });
    });
});

// Gestion du carrousel d'images
document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 0;

    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const slides = document.querySelector('.slides');

    // Fonction pour afficher un slide spécifique
    const showSlide = (index) => {
        const totalSlides = slides.children.length;
        if (index >= totalSlides) {
            currentSlide = 0; // Retour au premier slide
        } else if (index < 0) {
            currentSlide = totalSlides - 1; // Aller au dernier slide
        } else {
            currentSlide = index;
        }
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    };

    // Navigation entre les slides
    const nextSlide = () => showSlide(currentSlide + 1);
    const prevSlide = () => showSlide(currentSlide - 1);

    // Ajouter les gestionnaires d'événements
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
});

// Gestion de l'interaction avec le menu mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const body = document.body;

    // Ajouter ou supprimer la classe 'no-scroll' en fonction de l'état de la case à cocher
    menuToggle.addEventListener('change', function () {
        if (this.checked) {
            body.classList.add('no-scroll'); // Empêcher le défilement
        } else {
            body.classList.remove('no-scroll'); // Réactiver le défilement
        }
    });
});
} else{
    // Attendez que la page soit complètement chargée

window.onload = function() {
    // Affichez la popup après 1 seconde
    setTimeout(function() {
      document.getElementById("popup").style.display = "flex";
    }, 1000);
  
    // Fermez la popup quand l'utilisateur clique sur "Continuez votre visite"
    document.getElementById("closePopup").onclick = function() {
      document.getElementById("popup").style.display = "none";
    };
  };
}
