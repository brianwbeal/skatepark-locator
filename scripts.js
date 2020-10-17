// controls toggle
const appDiv = document.querySelector('.app');
const controlsPanel = document.querySelector('.controls');
const controlsToggle = document.querySelector('#controlsDrawerToggle');
controlsToggle.addEventListener('click', () => {
    controlsPanel.classList.toggle('collapsed');
    appDiv.classList.toggle('expanded');
});



/*------------------------------
*
*      data
*
------------------------------*/

// Google Cloud Console API key - Maps JavaScript API & Geocoding API enabled
const myApiKey = 'AIzaSyCbdIV4Lzz9YI9tiue5HD-534nxnl89oqM';

// skate park location data
const locations = [
    {
        name: 'gabriel park',
        position: {
            lat: 45.474,
            lng: -122.722
        },
        id: 1,
        distance: 0
    },
    {
        name: 'burnside',
        position: {
            lat: 45.523,
            lng: -122.666
        },
        id: 2,
        distance: 0
    },
    {
        name: 'pier park',
        position: {
            lat: 45.603,
            lng: -122.760
        },
        id: 3,
        distance: 0
    },
    {
        name: 'ed benedict',
        position: {
            lat: 45.496,
            lng: -122.562
        },
        id: 4,
        distance: 0
    },
    {
        name: 'glenhaven',
        position: {
            lat: 45.543,
            lng: -122.580
        },
        id: 5,
        distance: 0
    },
    {
        name: 'tigard',
        position: {
            lat: 45.426,
            lng: -122.766
        },
        id: 6,
        distance: 0
    },
    {
        name: 'west linn',
        position: {
            lat: 45.364,
            lng: -122.642
        },
        id: 7,
        distance: 0
    },
    {
        name: 'lincoln city',
        position: {
            lat: 44.982,
            lng: -124.006
        },
        id: 8,
        distance: 0
    },
    {
        name: 'eugene - WJ',
        position: {
            lat: 44.058,
            lng: -123.102
        },
        id: 9,
        distance: 0
    },
    {
        name: 'estacada',
        position: {
            lat: 45.296,
            lng: -122.340
        },
        id: 10,
        distance: 0
    }
];




/*------------------------------
*
*      app logic
*
------------------------------*/

// initMap
function initMap() {

    // instantiate map
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 44.0611, lng: -121.385},
        zoom: 7
    });

    // declare calibrateMap function - which resets values for center and zoom of map instance
    const calibrateMap = (newCoordinates, newZoom) => {
        map.setCenter(newCoordinates);
        map.setZoom(newZoom);
    };

    // declare calibrateInfoWindow function - which resets values for map's infoWindow
    const calibrateInfoWindow = (newCoordinates, newContent) => {
        userInfoWindow.setPosition(newCoordinates);
        userInfoWindow.setContent(newContent);
        userInfoWindow.open(map);
    };

    // renderList - create the list item elements
    const renderList = (currentLocationsArray) => {

        // bring in locations array and ul element
        const locs = currentLocationsArray;
        const list = document.querySelector('.locations-flex');
        
        // clear any existing list items inside ul
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        };
        
        // map through array to render new list items and append them to ul
        locs.map((loc) => {

            // get this locations values, using destructuring syntax
            let { name, distance, id, position } = loc;

            // create the element and add it to the DOM
            let newListItem = document.createElement('div');
            newListItem.classList.add('location');
            newListItem.innerHTML = `<h3>${name}</h3> <p>${distance} mi.</p> <button class="location-button" data-coords="${id}"><i class="fas fa-angle-right"></i></button>`;
            list.appendChild(newListItem);
        
            // add click listener on new item
            newListItem.addEventListener('click', () => {
                calibrateMap(position, 12);

                // calibrate info window
                calibrateInfoWindow(position, name)

                // auto-collapse controls panel
                controlsPanel.classList.toggle('collapsed');
            })
        })
    };

    // render list items in UI, default order
    renderList(locations);

    // calculateDistance - return array of locations with updated 'distance' values relative to user coordinates
    const calculateDistance = (userCoords, locationsArray) => {

        // map through locations to calculate and create new distance value for each
        locationsArray.map((location) => {

            // haversine formula
            const earth = 6371000;
            const lat1 = userCoords.lat * (Math.PI/180);
            const lat2 = (location.position.lat) * (Math.PI/180);
            const latDelta = ((location.position.lat) - userCoords.lat) * (Math.PI/180);
            const lngDelta = ((location.position.lng) - userCoords.lng) * (Math.PI/180);
        
            const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) + 
                    (Math.cos(lat1) * Math.cos(lat2)) *
                    (Math.sin(lngDelta/2) * Math.sin(lngDelta/2));
            const c = 2 * (Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
            const d = earth * c;
            const distance = (d * 0.000621371).toFixed(2);  // conversion to miles
        
            // update distance in location data
            location.distance = distance;
        });

        // then sort array by ascending distance away from user
        locationsArray.sort((a, b) => {
            return a.distance - b.distance;
        });

        // render list based on newly sorted locations array
        renderList(locationsArray);
    };

    // instantiate infoWindow
    const userInfoWindow = new google.maps.InfoWindow();

    // reference locations array to draw markers on map
    const markers = locations.map((location) => {

        // instantiate each marker
        let marker =  new google.maps.Marker({
            position: {
                lat: location.position.lat,
                lng: location.position.lng
            },
            map: map
        });

        // set up each marker's infoWindow
        let markerInfoWindow = new google.maps.InfoWindow({
            content: location.name
        });

        // set up each marker's click listener
        marker.addListener('click', () => {
            calibrateMap(marker.getPosition(), 12);
            markerInfoWindow.open(map, marker);
        });

        return marker;
    });

    // handleError
    const handleError = () => {

        // resets map to default
        calibrateMap(map.getCenter(), map.getZoom());
        calibrateInfoWindow(map.getCenter(), 'error, please try a search');
    };

    // set up form submit listener
    const form = document.getElementById('searchForm');
    const formHandler = (e) => {
        
        e.preventDefault();

        // geocode zip code into coordinates        
        let inputValue = e.target.searchInput.value;
        let geocodeUri = `https://maps.googleapis.com/maps/api/geocode/json?address=${inputValue}&key=${myApiKey}`;
        fetch(geocodeUri)
            .then(res => res.json())
            .then((data) => {

                let searchedPos = {
                    lat: data.results[0].geometry.location.lat,
                    lng: data.results[0].geometry.location.lng
                }

                // use searched coordinates to reset map and infoWindow
                calibrateInfoWindow(searchedPos, 'searched location');
                calibrateMap(searchedPos, 12);

                // // calculate distance
                //     // render updated list
                calculateDistance(searchedPos, locations)
            });

        // auto-collapse controls panel
        controlsPanel.classList.toggle('collapsed');
    };

    // hook up formhandler to fire when form submits
    form.addEventListener('submit', formHandler);


    // check for geolocation
    if (navigator.geolocation) {

        // browser supports geolocation
        navigator.geolocation.getCurrentPosition((position) => {

            // returns user's coordinates
            let userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // use searched coordinates to reset map and infoWindow
            calibrateInfoWindow(userPos, 'current location');
            calibrateMap(userPos, 12);

            // // calculate distance
            //     // render updated list
            calculateDistance(userPos, locations);

        }, () => {

            // user doesn't share their location
            handleError();
        });
    } else {

        // browser doesn't support geolocation
        handleError();
    };
};


