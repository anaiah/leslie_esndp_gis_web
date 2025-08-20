    const mainContainer = document.getElementById('main');
    const sidebar = document.getElementById('sidebar');
    
    let sidebarOpen = false;

    let map; 
    const competitorMarkers = []; // Keep track of Markers globally or within scope
    let markerLayerGroup  // Add to the map initially
    let owner

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

                    console.log('data saved....',data.info)

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

        clearMap:()=>{
             map.eachLayer(function (layer) {
                if (layer instanceof L.TileLayer) {
                    // Do nothing - Tile layer needs to stay
                }else{
                map.removeLayer(layer);
                }
            });
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

            //========for searchbox  google api places=========//
            const searchBox = document.getElementById('searchBox');

            searchBox.addEventListener('keypress', async (event) => {
                if (event.key === 'Enter') {
                    
                    xmap.waitingIndicator.style.display = 'block';
                    xmap.clearMap() // RESET  MAP

                    const address = searchBox.value;
                    // ... rest of your geocoding code
                    // Send a request to your *own* server
                    const response = await fetch(`${myIp}/getaddress/${encodeURIComponent(address)}`);
                    const data = await response.json();

                    if (data.status === 'OK') {
                        console.log('uyyyy')
                        const latitude = data.results[0].geometry.location.lat;
                        const longitude = data.results[0].geometry.location.lng;

                        // Update the map (center and add a marker)
                        // map.setView([latitude, longitude], 17);
                        // L.marker([latitude, longitude]).addTo(map);
                        xmap.getLocationData( latitude, longitude)


                    } else {
                        alert(`Geocoding failed:, ${data.status}`)
                        console.error('Geocoding failed:', data.status);
                        // Handle the error
                    }
                
                }
            });

        },

        formatDate: (ts) =>{
            const date = new Date(ts);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const day = ("0" + date.getDate()).slice(-2);
            const year = date.getFullYear();
            return `${month}-${day}-${year}`;
        },

        //====== GET PROJECT ======//
        getProjects: async () => {
            const response = await fetch(`${myIp}/getallmyprojects/${owner.full_name}`)
            const data = await response.json()
            console.log('projects====',data)

           let statusMap = [
            { label: "Site Sourcing", color: "warning" },
            { label: "Site Negotiation", color: "success", },
            { label: "Site Secured", color: "success" },
            { label: "Opened", color: "primary" },
            ];

            const tbody = document.getElementById('projectTableBody');
            tbody.innerHTML = ''; // clear existing content

            data.forEach(xdata => {
                const tr = document.createElement("tr");

                // Create the select element
                const select = document.createElement('select');
                select.classList.add('form-select'); // Add Bootstrap class for styling
                select.dataset.projectId = xdata.id; // Store project ID for later use

                // Populate the select options
                statusMap.forEach((status, index) => {
                    const option = document.createElement('option');
                    option.value = index + 1; // Store the index + 1 as the value (matching your database)
                    option.text = status.label;
                    if (xdata.status === index + 1) {
                        option.selected = true; // Select the option matching the current status
                    }
                    select.appendChild(option);
                });

                // Event listener for select change (you'll need to implement updateStatus)
                select.addEventListener('change', function() {
                    const projectId = this.dataset.projectId;
                    const newStatus = this.value;

                    const selectoption = this.options[this.selectedIndex]
                    const selectedText = selectoption.text;

                    console.log(projectId,newStatus,selectedText)

                    //***************** CALL UPDATE STATUS */
                    xmap.updateStatus(projectId, newStatus, selectedText); // Call your updateStatus function
                });


                // <a href="javascript:xmap.getCompetitors('${xdata.id}','${xdata.latitude}','${xdata.longitude}')" class="show-on-map-link">Show on Map</a>
                
                // Create the table cells
                tr.innerHTML = `
                <td width="200px">${xdata.name} <br>
                    <span class="proj-class">${xdata.project_code}</span><br>
                </td>
                <td width="300px">${xdata.address}</td>
                <td>${xdata.owner}</td>
                <td>${xmap.formatDate(xdata.created_at)}</td>
                `;

                // Create the select cell
                const selectTd = document.createElement('td');
                selectTd.appendChild(select);
                tr.appendChild(selectTd);

                tbody.appendChild(tr);
            });

            xmap.configObj = { keyboard: false, backdrop:'static' }
            xmap.projectlistModal = new bootstrap.Modal(document.getElementById('projectlistModal'),xmap.configObj);

            // Show modal
            xmap.projectlistModal.show();

        }, //====END GETPROJECTS
        
        //======UPDATE STATUS =====//
        updateStatus : (projectId, newStatus, retStatus) => {
            // Send an API request to update the status
            fetch(`${myIp}/updatemyprojects/${projectId}/${newStatus}`,{ // Replace with your API endpoint
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })
             .then((response) => {  //promise... then 
                return response.json();
            })
            .then(data => {
                if (data.status) {
                    console.log(`Project ${projectId} status updated to ${newStatus}`);
                    // Optionally, update the UI to reflect the new status
                    util.speak(`Project successfully updated to ${retStatus}`)
                } else {
                    console.error(`Failed to update project ${projectId} status:`, response.status);
                    // Display an error message to the user
                }
            })
            .catch(error => {
                console.error('Error updating project status:', error);
                // Display an error message to the user
            });
        },

        
        //====GLOBAL VARS====//
        configObj:null,
        projectModal:null,

        projectlistModal : null,
        
        socket:null,
        nuProjData: [],  //===global array to hold new  site info

        waitingIndicator : document.getElementById('waiting-indicator'),

        //=========WHEN  USER  CCLICKS ON MAP=====//
        getLocationData:async(lat, lon)=>{ //get reverse geocoding, elevation
            const response = await fetch(`${myIp}/geocode/${lat}/${lon}`)
            const data = await response.json()
            
            xmap.nuProjData = data
            util.newMapData = data.xdata

            console.log( 'data ko ',data )

            //***************** */ Pin competitors first
            gjson.mygeojson( xmap.nuProjData,lat,lon)
            //********************** */

            //console.log(`====competitors====`,  data.xdata)


            //=========TAKE OUT MUN CARLO PERO IBALIK MO  ITO FOR PROJECT MODAL
            // document.getElementById('elevationField').value = `${data.elevation.toFixed(2)}`
            // document.getElementById('addressField').value = data.address; // suppose you have such an input
            // document.getElementById('cityField').value = data.city;
            
            // document.getElementById('latField').value = lat 
            // document.getElementById('lonField').value = lon 
            
            // document.getElementById('projectName').focus();
        
        },

        ///show postiion of rider
      showPosition: (position) => { 
        
        console.log('GETTING POSITION ',position.coords.latitude, position.coords.longitude )
        
        let obj={}
          obj.lat = position.coords.latitude
          obj.lon = position.coords.longitude

          //===================================
            xmap.waitingIndicator.style.display = 'block'
            xmap.getLocationData( obj.lat, obj.lon)
          //===================================

      },

      getHubLocation:()=>{

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( xmap.showPosition );
        }else{
          alert('PLEASE TURN-ON YOUR PHONE LOCATION OR GPS')
          return false
        }
      },


        //INIT 
        init : () =>{
            // Initialize Leaflet map
            map = L.map('map').setView([ 14.4594 , 121.0431 ], 18); //18 zoom in
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            markerLayerGroup = L.layerGroup().addTo(map); // Add to the map initially

            //console.log("1. Immediately after creation: typeof markerLayerGroup =", typeof markerLayerGroup, ", markerLayerGroup =", markerLayerGroup);


            let db = localStorage  //get localstoreage

            owner =  JSON.parse(db.getItem('profile'))  //get profile

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
            map.on('dblclick', async (e) => {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                xmap.waitingIndicator.style.display = 'block';

                xmap.getLocationData( lat, lng) //get reverse geocode


                /// CARLO IBALIK  MO ITO PROJECT MODAL SHOW
                // //GET CODE
               
                                
                console.log( `Latitude: ${lat}, Longitude: ${lng}`)
                
            });
        }


    }//===end obj

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});    
   
document.addEventListener('DOMContentLoaded', function() {
    console.log('=======DOM CONTENT LOADED=====')
    xmap.init()
    xmap.listeners()


     ///disable  rightclck
    document.onkeydown = function(e) {
    if(e.keyCode == 123) {  // F12
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 73) {  // Ctrl+Shift+I
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 74) {  // Ctrl+Shift+J
        return false;
    }
    if(e.ctrlKey && e.keyCode == 85) { // Ctrl+U
        return false;
    }
    }
})
   
   
    
    