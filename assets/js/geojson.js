	
const gjson =  {

	//******** THIS IS THE MOST IMPORTANT, PART, PUTTING UP MARKERS******//format geojson data c
	mygeojson:async( adata,  lat, lon )=>{
		
		// Clear the previous markers
		markerLayerGroup.clearLayers();

		
		//pin first the  projject
		let pic = `https://asianowapp.com//html/rcpt/${adata[0].project_code}.jpg`

		//console.log(lat,lon)
		let latlng = L.latLng( lat, lon) 
		
		let mainIcon = L.divIcon({
				className: 'fa-div-icon',
				html:`<span class="fa-stack fa-2x">
				<i class="fa-solid fa-circle fa-stack-2x"></i>
				<i class="fa-solid fa-street-view fa-stack-1x fa-inverse"></i>
				</span>`,
				iconSize: [30, 42],
				iconAnchor: [15, 42],
				popupAnchor:[0,-42]
			});
			
// 		html: `<i class="fa fa-circle fa-stack-2x"></i>
//   <i class="fa fa-street-view fa-stack-1x fa-inverse"></i>`,
	
		
		let zmarker =L.marker(latlng, {icon:mainIcon}).addTo(map)

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
			fillColor: 'red',     // Fill color
			fillOpacity: 0.2       // Fill opacity (0 to 1)
		};

		const radius=1000

		// 4. Create the circle object
		var circle = L.circle( latlng , radius, circleOptions);

		// 5. Add the circle to the map
		circle.addTo(map);

		markerLayerGroup.addLayer(circle); // Add it to the Layer Group so we can clear altogether

		map.setView(latlng,13)

		//===for competitors
		let arrayBrand = ['7-Eleven','Jollibee','Angels Burger','Minute Burger','Burger Machine','kfc','mcdonald','lawson']
		let xcolor, xclass

		//==============ITERATE ARRAY ==============
        adata[0]?.establishments.forEach(est => {
            
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
					switch(est.name.substring(0,5).toLowerCase()){
						case "angel":
							xcolor='red'
							xclass='tabler-red'
							xicon =  'ti-flag-3-filled'
						break

						case "burge":
							xcolor='green'
							xclass='tabler-flag-green'
							xicon =  'ti-flag-3-filled'
						break

						//same market
						case "minut":
							xcolor='yellow'
							xclass='tabler-bluer'
							xicon="ti-flag-3-filled"
							
						break

						case "jolli":
							xcolor='red'
							xclass='tabler-red'
							xicon='ti-burger'
						break

						case "kfc":
							xcolor='green'
							xclass='tabler-blood-red'
							xicon =  'ti-flag-3-filled'
						break

						case "mcdon":
							xcolor='green'
							xclass='tabler-yellow'
							xicon =  'ti-brand-mcdonalds'
						break

						default:
							xcolor='blue'
							xclass='tabler-blue'
							xicon =  'ti-map-pin-filled'
						break

					}
				} else {
					xcolor='blue'
					xclass='null'
					xicon =  'ti-map-pin-filled'
				}

			let wowIcon = L.divIcon({
				className: 'tabler-icon',
				html: `<i class="ti ${xicon} ${xclass}"></i>`, // Replace with your desired Tabler Icon class
        		iconSize: [42, 42],
				iconAnchor: [15, 42],
				popupAnchor:[0,-42]
			});

			let xlatlng = L.latLng( parseFloat(est.lat), parseFloat(est.lon) ) 
			
			let marker = L.marker(xlatlng, {icon:wowIcon}).addTo(map)
			.bindPopup(`${est.name}<br>Distance(km): ${est.distanceKm}`)

			markerLayerGroup.addLayer(marker); // Add it to the Layer Group
			        
        })//===============end array iterate=====

	},
	
}