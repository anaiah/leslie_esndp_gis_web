    const mainContainer = document.getElementById('main');
    const sidebar = document.getElementById('sidebar');
    
    let sidebarOpen = false;

    const  xmap = {

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

                    util.speak(data.voice); //speak about success

                    const btn = document.getElementById('save-btn')
                    btn.innerHTML = 'Save';
                    btn.disabled = false;

                    //reset  form
                    // Select the form element
                    const form = document.querySelector('#projectForm'); // or use class selector

                    // Reset the form
                    form.reset();

                    xmap.projectModal.hide() //hide data entry

                    console.log(data)

                    xmap.socket.emit('sendToMgr', data)
                    console.log( '===EMIT sendToMgr===')

                }else{
                    util.speak(data.voice)
                    
                    return
                }//eif
                
            })
            .catch((error) => {
            // util.Toast(`Error:, ${error.message}`,1000)
            console.error('Error:', error)
            })
        
        },
        
        //INCLUDE LISTENER
        listeners:()=>{
            document.getElementById('menuBtn').onclick = xmap.toggleSidebar;

            // Add event listeners to links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.onclick = () => {
                // Collapse sidebar when link clicked
                xmap.toggleSidebar();

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

        socket:null,

        getLocationData:async(lat, lon)=>{ //get reverse geocoding, elevation
            const response = await fetch(`${myIp}/geocode/${lat}/${lon}`)
            const data = await response.json()
            
            //console.log(`====competitors====`,  data.establishments )

            document.getElementById('elevationField').value = `${data.elevation.toFixed(2)}`
            document.getElementById('addressField').value = data.address; // suppose you have such an input
            document.getElementById('cityField').value = data.city;
            
            document.getElementById('latField').value = lat 
            document.getElementById('lonField').value = lon 
            
            document.getElementById('projectName').focus();
        
        },

        //INIT 
        init : () =>{
            // Initialize Leaflet map
            const map = L.map('map').setView([ 14.4594 , 121.0431 ], 18); //18 zoom in
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            let db = localStorage  //get localstoreage

            const owner =  JSON.parse(db.getItem('profile'))  //get profile

            util.Toasted(`Welcome ${owner.full_name}`,3000,false) //Welcome Message

            document.getElementById('profile_pic').src = `./assets/images/profile/${owner.pic}`

            let authz = []
            authz.push( owner.grp_id )
            authz.push( owner.full_name)
            
            //console.log(authz[1])

            //==HANDSHAKE FIRST WITH SOCKET.IO
            const userName = { token : authz[1] , mode: owner.grp_id}//full name token

            xmap.socket = io.connect(`${myIp}`, {
                //withCredentials: true,
                transports: ['websocket', 'polling'], // Same as server
                upgrade: true, // Ensure WebSocket upgrade is attempted
                rememberTransport: false, //Don't keep transport after refresh
                query:`userName=${JSON.stringify(userName)}`
                // extraHeaders: {
                //   "osndp-header": "osndp"
                // }
            });//========================initiate socket handshake ================

            xmap.socket.on('connect', () => {
                console.log('Connected to Socket.IO server using:', xmap.socket.io.engine.transport.name); // Check the transport
            });

            xmap.socket.on('disconnect', () => {
                console.log('Disconnected from Socket.IO server');
            });
           //==============================================END  SOCKET ==========================//
            
            //=============================================== leaflet map listners Log latitude and longitude on map click
            map.on('click', async (e) => {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                xmap.getLocationData( lat, lng) //get reverse geocode

                //GET CODE
                document.getElementById('projectCode').value = util.Codes()
                
                xmap.configObj = { keyboard: false, backdrop:'static' }
                xmap.projectModal = new bootstrap.Modal(document.getElementById('projectModal'),xmap.configObj);

                // Show modal
                xmap.projectModal.show();
                
                document.getElementById('projectOwner').value  = owner.full_name 
                                
                console.log( `Latitude: ${lat}, Longitude: ${lng}`)
                
            });
        }


    }//===end obj

    
document.addEventListener('DOMContentLoaded', function() {
    console.log('=======DOM CONTENT LOADED=====')
    xmap.init()
    xmap.listeners()
})
   
   
    
    