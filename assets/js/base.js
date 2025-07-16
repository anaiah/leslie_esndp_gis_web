    const mainContainer = document.getElementById('main');
    const sidebar = document.getElementById('sidebar');
    
    let sidebarOpen = false;

    const basemap = {

        toggleSidebar : () => {
            if (sidebarOpen) {
                // Collapse sidebar
                sidebar.style.left = '-250px';
                mainContainer.classList.remove('sidebar-open');
                sidebarOpen = false;
            } else {
                // Open sidebar
                sidebar.style.left = '0';
                mainContainer.classList.add('sidebar-open');
                sidebarOpen = true;
            }
        },

        //===new project posting
        //new site posting 
        newsitePost:async function(frm,modal,url="",xdata={}){
            
            await fetch(url,{
                method:'POST',
                body: xdata
            })
            .then((response) => {  //promise... then 
                return response.json();
            })
            .then((data) => {
                if(data.success){

                    util.speak(data.voice);
                    basemap.projectModal.hide()

                    
                }else{
                    util.speak(data.voice)
                    //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                    return false
                }//eif
                
                
            })
            .catch((error) => {
            // util.Toast(`Error:, ${error.message}`,1000)
            console.error('Error:', error)
            })
        
        },
        
        //INCLUDE LISTENER
        listeners:()=>{
            document.getElementById('menuBtn').onclick = basemap.toggleSidebar;

            // Add event listeners to links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.onclick = () => {
                // Collapse sidebar when link clicked
                basemap.toggleSidebar();

                // Optionally, you can add actions for navigation here
                };
            });

        },

        getElevationAsync: (lat, lng)=> {
            const elevator = new google.maps.ElevationService();
            return new Promise((resolve, reject) => {
            elevator.getElevationForLocations(
                { locations: [{ lat: lat, lng: lng }] },
                (results, status) => {
                if (status === 'OK') {
                    if (results.length > 0) {
                    resolve(results[0].elevation);
                    } else {
                    reject('No elevation results');
                    }
                } else {
                    reject('Elevation API error: ' + status);
                }
                }
            );
            });
        },

        configObj:null,
        projectModal:null,

        myIp : "https://esndp-gis-jku4q.ondigitalocean.app",
        // Example usage after the maps API loads
        // getElevation(14.4594, 121.0431);
        //INIT 
        init : () =>{
            // Initialize Leaflet map
            const map = L.map('map').setView([ 14.4594 , 121.0431 ], 18); //18 zoom in
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            let db = localStorage
            const owner =  JSON.parse(db.getItem('profile'))

            util.Toasted(`Welcome ${owner.full_name}`,3000,false)

            let authz = []
            authz.push( owner.grp_id )
            authz.push( owner.full_name)
            
            //console.log(authz[1])

            //==HANDSHAKE FIRST WITH SOCKET.IO
            const userName = { token : authz[1] , mode: owner.grp_id}//full name token

            basemap.socket = io.connect(`${basemap.myIp}`, {
                //withCredentials: true,
                transports: ['websocket', 'polling'], // Same as server
                upgrade: true, // Ensure WebSocket upgrade is attempted
                rememberTransport: false, //Don't keep transport after refresh
                query:`userName=${JSON.stringify(userName)}`
                // extraHeaders: {
                //   "osndp-header": "osndp"
                // }
            });//========================initiate socket handshake ================

            basemap.socket.on('loadPin', (data) => {
                console.log('MAP PIN DATA', data)
                util.Toasted('INCOMING MAP!!!',4000,false)
            })  

            basemap.socket.on('connect', () => {
                console.log('Connected to Socket.IO server using:', basemap.socket.io.engine.transport.name); // Check the transport
            });

            basemap.socket.on('disconnect', () => {
                console.log('Disconnected from Socket.IO server');
            });
           //==============================================END  SOCKET ==========================//
           

            //console.log(owner)
            
            // // Log latitude and longitude on map click
            // map.on('click', async (e) => {
            //     const lat = e.latlng.lat.toFixed(6);
            //     const lng = e.latlng.lng.toFixed(6);

            //     try {
            //         const elev = await basemap.getElevationAsync(e.latlng.lat, e.latlng.lng);
            //         document.getElementById('elevationField').value = `${elev.toFixed(2)} meters`
            //     } catch (err) {
            //         console.error(err);
            //     }
            //     // // Reverse geocode with Nominatim
            //     //fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            //     fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD2KmdjMR6loRYvAAxAs84ioWrpYlPgzco`)
            //         .then(response => response.json())
            //          .then(data => {
            //             if (data.status === "OK" && data.results.length > 0) {
            //             const firstResult = data.results[0];    

            //             // Full address
            //             const address = firstResult.formatted_address;
                        
            //             // Extract specific components like city, country, etc.
            //             const addressComponents = firstResult.address_components;

            //             let city = '';
            //             let country = '';
            //             let state = '';

            //             addressComponents.forEach(component => {
            //                 if (component.types.includes('locality')) {
            //                 city = component.long_name;
            //                 }
            //                 if (component.types.includes('administrative_area_level_1')) {
            //                 state = component.long_name;
            //                 }
            //                 if (component.types.includes('country')) {
            //                 country = component.long_name;
            //                 }
            //             });

            //             console.log('Address:', address);
            //             console.log('City:', city);
            //             console.log('State:', state);
            //             console.log('Country:', country);

            //             // Example: fill the form fields
            //             document.getElementById('addressField').value = address; // suppose you have such an input
            //             document.getElementById('cityField').value = city;
            //             // similarly for state, country
            //             } else {
            //             console.error('No results found or error:', data.status);
            //             }
            //         })
            //         .catch(error => console.error('Error:', error));

            //     //GET CODE
            //     document.getElementById('projectCode').value = util.Codes()


            //     //const coordsDisplay = document.getElementById('coordsDisplay');
            //     basemap.configObj = { keyboard: false, backdrop:'static' }
            //     basemap.projectModal = new bootstrap.Modal(document.getElementById('projectModal'),basemap.configObj);

            //     // Show modal
            //     basemap.projectModal.show();

            //     // Optional: focus on project name input
            //     document.getElementById('projectName').focus();
                
            //     document.getElementById('latField').value = lat 
            //     document.getElementById('lonField').value = lng 
            //     document.getElementById('projectOwner').value  = owner[0].full_name 
                                
            //     console.log( `Latitude: ${lat}, Longitude: ${lng}`)
                
            // // coordsDisplay.textContent = `Latitude: ${lat}, Longitude: ${lng}`;
            // });
        }//end init()


    }//===end obj

    
document.addEventListener('DOMContentLoaded', function() {
    console.log('=======DOM CONTENT LOADED=====')
    basemap.init()
    basemap.listeners()
})
   
   
    
    