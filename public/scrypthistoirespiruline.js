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

const slides = document.querySelector('.slider');
      const dots = document.querySelectorAll('.dot');
      let currentIndex = 0;
      const totalSlides = dots.length;
      let autoSlideInterval;

      // Function to update active slide and dot
      function updateSlide(index) {
          slides.style.transform = `translateX(-${index * 100}%)`;
          dots.forEach((dot, i) => {
              dot.classList.toggle('active', i === index);
          });
          currentIndex = index;
      }

      // Automatic slide show
      function startAutoSlide() {
          autoSlideInterval = setInterval(() => {
              let nextIndex = (currentIndex + 1) % totalSlides;
              updateSlide(nextIndex);
          }, 10000); // Change slide every 3 seconds
      }

      // Stop auto slide when user clicks a dot
      function stopAutoSlide() {
          clearInterval(autoSlideInterval);
      }

      // Add click event to dots
      dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
              stopAutoSlide();
              updateSlide(index);
              startAutoSlide(); // Restart auto slide after manual navigation
          });
      });

      // Start the slideshow
      updateSlide(currentIndex); // Initialize
      startAutoSlide();
