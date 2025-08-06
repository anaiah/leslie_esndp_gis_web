	
const gjson =  {

	//******** THIS IS THE MOST IMPORTANT, PART, PUTTING UP MARKERS******//format geojson data c
	mygeojson:async( adata,  lat, lon )=>{
		
		// Clear the previous markers
		markerLayerGroup.clearLayers();

		
		//pin first the  projject
		let pic = `https://asianowapp.com/esndp/${adata[0].project_code}.jpg`

		//console.log(lat,lon)
		let latlng = L.latLng( lat, lon) 
	
		// ORIG  ICON  CODE
		// let mainIcon = L.divIcon({
		// 		className: 'fa-div-icon',
		// 		html:`<span class="fa-stack fa-2x">
		// 		<i class="fa-solid fa-circle fa-stack-2x"></i>
		// 		<i class="fa-solid fa-street-view fa-stack-1x fa-inverse"></i>
		// 		</span>`,
		// 		iconSize: [30, 42],
		// 		iconAnchor: [15, 42],
		// 		popupAnchor:[0,-42]
		// 	});
			
		let mainIcon = L.divIcon({
			className: 'custom-marker', // Changed class name
			html: `
			<div class="marker-glow"></div>  <!-- Glowing circle -->
			<span class="fa-stack fa-2x"> <!-- Font Awesome icons -->
			<i class="fa-solid fa-circle fa-stack-2x"></i>
			<i class="fa-solid fa-street-view fa-stack-1x fa-inverse"></i>
			</span>`,
				iconSize: [30, 42],
				iconAnchor: [15, 42],
				popupAnchor:[0,-42]
		});
	
			
		let zmarker =L.marker(latlng, {icon:mainIcon}).addTo(map)

		let acquisitionLatLon = zmarker.getLatLng()

		console.log('***MAIN MARKER LaTLNG()****',zmarker.getLatLng())

		let markerElement = zmarker._icon;

		setTimeout(()=>{
			markerElement.classList.add('fade-in')
		})

		zmarker.bindPopup(`<b>Project : ${adata[0].name}<br>
								Owner: ${adata[0].owner}<br>
								<img src="${pic}" width="200px">`)

		zmarker.openPopup()
		
		markerLayerGroup.addLayer(zmarker); // Add it to the Layer Group so we can clear altogether


		// 3. Define the circle options (style)
		var circleOptions = {
			color: 'red',         // Border color
			fillColor: 'FFA07A',     // Fill color
			fillOpacity: 0.07,       // Fill opacity (0 to 1)
			weight: 1 // in 1 pixel
		};

		const radius=1400

		// 4. Create the circle object
		var circle = L.circle( latlng , radius, circleOptions);

		// 5. Add the circle to the map
		circle.addTo(map);

		markerLayerGroup.addLayer(circle); // Add it to the Layer Group so we can clear altogether

		map.setView(latlng,13)

		//===for competitors
		let arrayBrand = ['7-Eleven','Jollibee','Angels Burger',
			'Chowking','Minute Burger','Burger Machine',
			'kfc','mcdonald','lawson','ministop','uncle john',
			'7/11','family mart']
		let xcolor, xicon, xbrand

		let newdistance

		//==============ITERATE ARRAY ==============
        adata[0]?.establishments.forEach(est => {
            
			newdistance = parseFloat( est.distanceKm ) * 1000
			
			if(newdistance <= 1000){

				let projname = `${ est.name.toUpperCase()}`,
					projpic = `https://asianowapp.com//html/rcpt/${ adata[0].project_code}.jpg`,
					projaddress = `${ est.vicinity }`,
					projelevation = `${adata[0].elevation}`,
					projdistance = `${ est.distanceKm}`

					//======filter the array as  it iterates========
					const containsWord = arrayBrand.some(element => {
						return element.toLowerCase().includes(est.name.substring(0,5).toLowerCase());
					});

					
					if (containsWord) {

					console.log( '*',est.name.substring(0,7).toLowerCase())

						switch(est.name.substring(0,7).toLowerCase()){
							case "angel's":
								xcolor='red'
								xclass='tabler-red'
								xicon =  'ti-flag-3-filled'
								xbrand=`ANGEL'S BURGER`
							break

							case "burger ":
								xcolor='green'
								xclass='tabler-flag-green'
								xicon =  'ti-flag-3-filled'
								xbrand =`BURGER MACHINE`
							break

							//same market
							case "minute ":
								xcolor='yellow'
								xclass='tabler-bluer'
								xicon="ti-flag-3-filled"
								xbrand="MINUTE BURGER"
								
								let iconLatLon = L.latLng( parseFloat(est.lat), parseFloat(est.lon) ) 
								let _distance = acquisitionLatLon.distanceTo( iconLatLon)
								
								if(_distance <= 1400){

									map.setView( L.latLng( parseFloat(est.lat), parseFloat(est.lon) ) , 20)
								
									util.speak(`POSSIBLE BRAND OVERLAP ${xbrand} WITHIN ${projdistance} Km. !!!`)
									util.Toasted(`POSSIBLE BRAND OVERLAP ${xbrand} WITHIN ${projdistance} Km. !!!`,7000,false)
								}
									
								
							break

							case "7-eleve":
							case "7 eleve":
							case "7/11":
								xcolor='green'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = '7-ELEVEN'
							break

							case "lawson":
								xcolor='#225d98'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'LAWSON'
							
							break
							case "familym":
							case "family ":
								xcolor='#225d98'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'FAMILY MART'
							
							break
							case "uncle j":
								xcolor='#225d98'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = `UNCLE-JOHN'S`
							
							break

							case "ministo":
								xcolor='#225d98'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'MINI-STOP'
							
							break

							case "jollibe":
								xcolor='red'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'JOLLIBEE'
							break

							case "chowkin":
								xcolor='red'
								xclass='tabler-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'CHOWKING'
							break

							case "kfc":
								xcolor='#8B0000'
								xclass='tabler-blood-red'
								xicon =  'ti-map-pin-filled'
								xbrand = 'KFC'
							break

							case "mcdonal":
								xcolor='yellow'
								xclass='tabler-yellow'
								xicon =  'ti-map-pin-filled'
								xbrand = 'MCDO'
							break

						}
					} else {

						//// console.log( est.name.substring(0,7).toLowerCase())

						xcolor='#929c97'
						xclass='null'
						xicon =  'ti-map-pin-filled'
						xbrand = est.name.substring(0,6).toUpperCase()
					}


				// let wowIcon = L.divIcon({
				// 	className: 'tabler-icon',
				// 	html: `<i class="ti ${xicon} ${xclass}"></i>`, // Replace with your desired Tabler Icon class
				// 	iconSize: [42, 42],
				// 	iconAnchor: [15, 42],
				// 	popupAnchor:[0,-42]
				// });

				let wowIcon = L.divIcon({
					className: 'wow-div-icon',
					html: `<div class="icon-container">
				<div class="brand-name">${xbrand}</div>
				<i class="ti ${xicon}" style="color:${xcolor}"></i>`,
					iconSize: [42, 42],
					iconAnchor: [15, 42],
					popupAnchor: [0, -42]
				});

				let xlatlng = L.latLng( parseFloat(est.lat), parseFloat(est.lon) ) 
				
				let marker = L.marker(xlatlng, {icon:wowIcon}).addTo(map)
				.bindPopup(`${est.name}<br>Distance(km): ${est.distanceKm}`)

				markerLayerGroup.addLayer(marker); // Add it to the Layer Group
			}//eif

			        
        })//===============end array iterate=====

		
    // var initialZoom = map.getZoom()
    // map.on('zoomend', function() {
    // var currentZoom = map.getZoom();
    // var scaleFactor = 1 + (currentZoom - initialZoom) * 0.2; // Adjust 0.2 for scale sensitivity

    // // Select all the marker icons and apply the transform
    // var markerz = document.querySelectorAll('.leaflet-marker-icon'); // Adjust selector if needed
    // markerz.forEach(function(markerzz) {
    //     markerzz.style.transform = 'scale(' + scaleFactor + ')';
    //     // Also adjust margin to keep icon centered, as needed
    //     markerzz.style.marginLeft = -markerzz.offsetWidth / 2 * scaleFactor + 'px';
    //     markerzz.style.marginTop = -markerzz.offsetHeight / 2 * scaleFactor + 'px';
    // });
    // });

	},
	
}