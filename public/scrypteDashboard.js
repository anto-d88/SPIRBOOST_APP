
// Fonction pour afficher une section spécifique en masquant les autres
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
  }
  
  // Gestion des boutons de navigation
  const btnMessage = document.getElementById('btn-message');
  const btnPending = document.getElementById('btn-pending');
  const btnDelivering = document.getElementById('btn-delivering');
  const btnDelivered = document.getElementById('btn-delivered');
  const btnSuivis = document.getElementById('btn-suivis');
  
  btnMessage.addEventListener('click', () => showSection('messages'));
  btnPending.addEventListener('click', () => showSection('pending'));
  btnDelivering.addEventListener('click', () => showSection('delivering'));
  btnDelivered.addEventListener('click', () => showSection('delivered'));
  let currentChart = null;  // Variable pour stocker l'instance du graphique
  btnSuivis.addEventListener('click', async () => {
    showSection('suivis');
  
    try {
      const response = await fetch('/admin/visitor-stats');
      const stats = await response.json();
  
      // Préparez les données pour le graphique
      const labels = Object.keys(stats);  // Les pages visitées
      const data = Object.values(stats);  // Nombre de visites par page
  
      // Dessiner le graphique initial avec le type par défaut (courbe)
      const ctx = document.getElementById('visitChart').getContext('2d');
      const chartType = document.getElementById('chartType').value;  // Type de graphique sélectionné
  
      // Si un graphique existe déjà, on le détruit
      if (currentChart) {
        currentChart.destroy();
      }
  
      // Créer un nouveau graphique avec les données
      currentChart = new Chart(ctx, {
        type: chartType,  // Utilise 'line' ou 'bar' en fonction de l'option choisie
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre de Visites',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: chartType === 'bar' ? 'rgba(75, 192, 192, 0.2)' : 'transparent',
            borderWidth: 2,
            fill: chartType === 'line',  // Remplissage pour la courbe
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
          },
          scales: {
            x: {
              title: { display: true, text: 'Pages Visitées' },
            },
            y: {
              title: { display: true, text: 'Nombre de Visites' },
            }
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  });
  
  // Écouteur d'événement pour changer le type de graphique
  document.getElementById('chartType').addEventListener('change', async () => {
    const response = await fetch('/admin/visitor-stats');
    const stats = await response.json();
  
    const labels = Object.keys(stats);
    const data = Object.values(stats);
  
    // Redessiner le graphique avec le nouveau type choisi
    const ctx = document.getElementById('visitChart').getContext('2d');
    const chartType = document.getElementById('chartType').value;
  
    // Si un graphique existe déjà, on le détruit
    if (currentChart) {
      currentChart.destroy();
    }
  
    // Créer un nouveau graphique avec le type sélectionné
    currentChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de Visites',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: chartType === 'bar' ? 'rgba(75, 192, 192, 0.2)' : 'transparent',
          borderWidth: 2,
          fill: chartType === 'line',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          x: {
            title: { display: true, text: 'Pages Visitées' },
          },
          y: {
            title: { display: true, text: 'Nombre de Visites' },
          }
        }
      }
    });
  });
  
  // Gestion des boutons pour changer le statut des commandes
  const statusButtons = document.querySelectorAll('.status-btn');
  
  statusButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const orderId = button.getAttribute('data-id');
  
      try {
        // Envoi d'une requête POST pour mettre à jour le statut
        const response = await fetch('/update-delivery-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });
  
        if (response.ok) {
          // Mise à jour visuelle après une réponse réussie
          const row = document.getElementById(`row-${orderId}`);
          if (row) {
            row.remove();
          }
          alert('Commande marquée comme livrée avec succès.');
        } else {
          // Gestion des erreurs côté serveur
          const error = await response.json();
          console.error('Erreur:', error.message);
          alert('Erreur lors de la mise à jour : ' + error.message);
        }
      } catch (error) {
        // Gestion des erreurs réseau
        console.error('Erreur réseau :', error);
        alert('Erreur réseau. Veuillez réessayer.');
      }
    });
  });
  