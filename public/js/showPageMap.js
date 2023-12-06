  // This is the section for declaring what type or mapbox
 mapboxgl.accessToken = mapToken; // dont forget mapToken as declared in the show page
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11', // stylesheet location
    center: campground.geometry.coordinates,
    zoom: 8 // starting zoom
  });
  
  // added controls
  map.addControl(new mapboxgl.FullscreenControl());
  map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
      }));
  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-right');
 
  // this is for marking the pop up// costumizations
  const marker = new mapboxgl.Marker({ "color": "#ffae42" })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25, closeOnClick: true})
            .setHTML(
                `<h5>${campground.title}</h5>
                 <p>${campground.location}</p>`
            )
        )
    .addTo(map);
