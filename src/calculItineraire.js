async function getItineraireGoogleMaps(depart, arrivee) {
    const directionsService = new google.maps.DirectionsService();

    const request = {
        origin: depart,
        destination: arrivee,
        travelMode: google.maps.TravelMode.DRIVING
    };

    try {
        const response = await directionsService.route(request);
        return response.routes[0]; // Retourne la première route trouvée
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'itinéraire:', error);
        return null;
    }
}
