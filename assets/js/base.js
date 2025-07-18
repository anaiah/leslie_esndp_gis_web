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

        getmtdPerformance: async()=>{
            util.speak('Loading chart...!')
            await fetch(`${basemap.myIp}/mtdperformance`,{
                cache:'reload'
            })
            .then( (res) => res.json() )

            .then( (results)  => {

                console.log('mtd data ',results )

                basemap.loadChart( results )//load dta results to map

                const series = [
                    { name: "For Approval", data: [] },
                    { name: "Approved", data: [] },
                    { name: "Opened", data: [] }
                ];

                
                results.forEach(item => {
                    series[0].data.push(parseInt(item.approval));
                    series[1].data.push(parseInt(item.approved));
                    series[2].data.push(parseInt(item.opened));
                });


                basemap.chart1.updateSeries(series);

                let xcat = []
            
                results.forEach(item => {
                    if (!xcat.includes(item.owner_name.trim())) {
                        xcat.push(item.owner_name.trim());
                    }
                });

                console.log(xcat)
                basemap.chart1.updateOptions({ 
                    xaxis: { categories: xcat }
                });


            })	
            .catch((error) => {
                //util.Toast(`Error:, ${error}`,1000)
                console.error('Error:', error)
            })    
        
        },

        chart1:null,

        //load chart
        loadChart: ()=>{
            console.log('loading from  controller  chart.....')
            // Initialize series
           


            //let colors = ['#0277bd', '#00838f', '#00695c', '#2e7d32','#558b2f','#9e9d24','#ff8f00','#d84315'];
            let colors = [ '#0277bd','#d84315',  '#2e7d32']
                    
            // Fisher-Yates shuffle
            // for (let i = colors.length - 1; i > 0; i--) {
            //     const j = Math.floor(Math.random() * (i + 1));
            //     [colors[i], colors[j]] = [colors[j], colors[i]]; // swap elements
            // }//endfor   

            // Map data
           

           // console.log('categories',categories)


            var options = {
                series:[], 
                colors:colors,
                chart: {
                    type: 'bar',
                    height: 350,
                    width: 400,
                    redrawOnParentResize: false,
                    redrawOnWindowResize: false,
                            
                },

                
                plotOptions: {
                    bar: {
                        dataLabels: {
                            position: 'top',
                            //orientation:'vertical'
                        }
                    }
                },
                
                dataLabels: {
                    enabled: true,
                    dropShadow: {
                        enabled: true,
                        left: 1,
                        top: 1,
                        opacity: 0.5
                    },
                    formatter: function (val) {
                        if (val >= 1000000) {
                            return (val / 1000000).toFixed(1) + 'M';
                        } else if (val >= 1000) {
                            return (val / 1000).toFixed(1) + 'K';
                        }
                        
                        return val;
                    },
                    offsetY:-20,
                    style: {
                        fontSize: "12px",
                        colors: ["#d84315","#00695c"]
                    },
                
                },
                
                stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
                },
                xaxis: {
                    categories: [],

                    title: {
                        text: 'Store Status',
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            color: '#6699ff' // set your desired color
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: '',
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            color: '#6699ff' // set your desired color
                        }
                    }    
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val 
                        }
                }
                }
    
            } //end options
        
            basemap.chart1 = new ApexCharts(document.querySelector("#myChart"), options);
            basemap.chart1.render();

            
            // Later, update your chart
            

            
        },//====== end chart

        configObj:null,
        projectModal:null,

        myIp : "http://10.202.213.221:10000",
        //myIp: "https://esndp-gis-jku4q.ondigitalocean.app",
        // Example usage after the maps API loads
        // getElevation(14.4594, 121.0431);
        //INIT 
        init : () =>{


            //get initial performance of Lease people
            basemap.getmtdPerformance()

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

            //=====SOCKET.IO=============
            basemap.socket.on('loadPin', (data) => {
                console.log('MAP PIN DATA', data)

                let xdata = data.info[0]

                util.Toasted('INCOMING MAP!!!',4000,false)

                let lat = parseFloat(xdata.lat)
                let lon = parseFloat(xdata.lon)

                let pic = `https://asianowapp.com//html/rcpt/${xdata.pic}`

                //console.log(lat,lon)
                let latlng = L.latLng( lat, lon) 
                let marker = L.marker(latlng).addTo(map)

                let markerElement = marker._icon;

                setTimeout(()=>{
                    markerElement.classList.add('fade-in')
                })

                marker.bindPopup(`<b>Project : ${xdata.project}<br>
                                     Owner: ${xdata.proj_owner}<br>
                                     <img src="${pic}" width="200px">`)

                marker.openPopup()

                map.setView(latlng,14)

                basemap.getmtdPerformance() //===== get data  again for the Team performance


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

            //===load profile pic
            document.getElementById('profile_pic').src = `./assets/images/profile/${owner.pic}`

        }//end init()

        
    }//===end obj

    
document.addEventListener('DOMContentLoaded', function() {
    console.log('=======DOM CONTENT LOADED=====')
    basemap.init()
    basemap.listeners()
})
   
   
    
    