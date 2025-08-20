    const mainContainer = document.getElementById('main');
    const sidebar = document.getElementById('sidebar');
    
    let sidebarOpen = false; 
    let map; 
    const competitorMarkers = []; // Keep track of Markers globally or within scope
    let markerLayerGroup  // Add to the map initially

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

            //====== if PERFORMANCE MODAL IS LOADED==========//
            const myModal = document.getElementById('performanceModal')
            myModal.addEventListener('shown.bs.modal', () => {
               
                basemap.loadPerformanceChart('chartnz')

                setTimeout(function() {
                    basemap.loadPerformanceChart('chartmup')
                }, 500); //

                setTimeout(function() {
                    basemap.loadPerformanceChart('regionnz')
                }, 500); //

                setTimeout(function() {
                    basemap.loadPerformanceChart('regionmup')
                }, 500); //

            }) //end modal listener
        },

        loadPerformanceChart: (divid )=>{
    
            // Extract categories (owner names)
            let data, labels, ctx, sourcedData, negoData, securedData, openedData

            switch(divid){
                case "chartnz":
                    data = basemap.sdo_data
                    labels = data.map(item => item.owner_name);
                
                    sourcedData = data.map(item => parseInt(item["nz sourced"]));
                    negoData = data.map(item => parseInt(item["nz nego"]));
                    securedData = data.map(item => parseInt(item["nz secured"]));
                    openedData = data.map(item => parseInt(item["nz opened"]));
    
                    ctx = document.getElementById('chartNZ').getContext('2d');
                break
                
                case "chartmup":
                    data = basemap.sdo_data
                    labels = data.map(item => item.owner_name);
                
                    sourcedData = data.map(item => parseInt(item["mup sourced"]));
                    negoData = data.map(item => parseInt(item["mup nego"]));
                    securedData = data.map(item => parseInt(item["mup secured"]));
                    openedData = data.map(item => parseInt(item["mup opened"]));
    
                    ctx = document.getElementById('chartMUP').getContext('2d');
                
                break

                case "regionnz":
                    data = basemap.region_data
                    labels = data.map(item => item.region_name);
                
                    sourcedData = data.map(item => parseInt(item["nz sourced"]));
                    negoData = data.map(item => parseInt(item["nz nego"]));
                    securedData = data.map(item => parseInt(item["nz secured"]));
                    openedData = data.map(item => parseInt(item["nz opened"]));
    
                    ctx = document.getElementById('regionNZ').getContext('2d');
                
                break;

                case "regionmup":
                    data = basemap.region_data
                    labels = data.map(item => item.region_name);
                
                    sourcedData = data.map(item => parseInt(item["mup sourced"]));
                    negoData = data.map(item => parseInt(item["mup nego"]));
                    securedData = data.map(item => parseInt(item["mup secured"]));
                    openedData = data.map(item => parseInt(item["mup opened"]));
    
                    ctx = document.getElementById('regionMUP').getContext('2d');
                
                break;

            }//end sw
            

            // Check if a chart instance exists and destroy it
            const existingChart = Chart.getChart(divid);
            if (existingChart) {
                existingChart.destroy();
            }
            

            Chart.register(ChartDataLabels);
            
            let delayed

            const myChart = new Chart(ctx, {
                type: 'bar',
                height:300,
                width:350,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Sourced',
                        data: sourcedData,
                        backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue
                        borderColor: 'rgba(26, 86, 127, 0.8)', // Blue
                        borderWidth: 1
                    }, {
                        label: 'Nego',
                        data: negoData,
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',   // Red
                        borderColor : 'rgba(238, 18, 65, 0.8)',   // Red
                        borderWidth: 1
                    }, {
                        label: 'Secured',
                        data: securedData,
                        backgroundColor: 'rgba(8, 244, 24, 0.82)',  // Green
                        borderColor: 'rgba(4, 137, 13, 0.82)',   // Red
                        borderWidth: 1
                    }, {
                        label: 'Opened',
                        data: openedData,
                        backgroundColor: 'rgba(255, 159, 64, 0.8)',    // Orange
                        borderColor: 'rgba(208, 111, 15, 0.8)',    // Orange
                        borderWidth: 1
                        
                    }]
                },
                options: {
                    animation: {
                        onComplete: () => {
                            delayed = true;
                        },
                        delay: (context) => {
                            let delay = 0;
                            if (context.type === 'data' && context.mode === 'default' && !delayed) {
                                delay = context.dataIndex * 300 + context.datasetIndex * 100;
                            }
                        
                            return delay;
                        },
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Owner'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            //text: 'NZ Performance Data',
                            padding: 10,
                            font: {
                                size: 18
                            }
                        },
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';

                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('en-US', { style: 'decimal' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        },
                        datalabels: {   // Add datalabels plugin options here
                            anchor: 'end',
                            align: 'top',
                            formatter: Math.round,
                            font: {
                                weight: 'bold',
                                size: 12
                            }
                        }
                    }, //====end plugin
                    responsive: false,
                    maintainAspectRatio: false
                }
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

        //=== for main performance dashboard
        sdo_data:null,
        region_data:null,

        getMainPerformance: async() =>{
            await fetch(`${myIp}/sdoperformance`,{
                cache:'reload'
            })
            .then( (res) => res.json() )

            .then( (results)  => {
                console.log('sdo', results.data_sdo, 'region', results.data_region)


                basemap.sdo_data = results.data_sdo
                basemap.region_data = results.data_region
                
                //console.log('PERFORMANCE  DATA-->', basemap.performance_data )
            })	
            .catch((error) => {
                //util.Toast(`Error:, ${error}`,1000)
                console.error('Error:', error)
            })    
                        
            basemap.configObj = { keyboard: false, backdrop:'static' }
            basemap.performanceModal = new bootstrap.Modal(document.getElementById('performanceModal'),basemap.configObj);

            // Show modal
            basemap.performanceModal.show();

            
        },

        
        
        //===for monthly chart
        getmtdPerformance: async()=>{
            util.speak('Loading chart...!')
            await fetch(`${myIp}/mtdperformance`,{
                cache:'reload'
            })
            .then( (res) => res.json() )

            .then( (results)  => {

                console.log('mtd data ',results )

                basemap.loadChart( results )//load dta results to map

                const series = [
                    { name: "Sourced", data: [] },
                    { name: "Nego", data: [] },
                    { name: "Secured", data: [] },
                    { name: "Opened", data: [] }
                ];
                
                results.forEach(item => {
                    series[0].data.push(parseInt(item.sourced));
                    series[1].data.push(parseInt(item.nego));
                    series[2].data.push(parseInt(item.secured));
                    series[3].data.push(parseInt(item.opened));
                });

                basemap.chart1.updateSeries(series);

                let xcat = []
            
                //PUSH THE SDO'S NAME JOM,SHE,LOUIE
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
           
            //let colors = ['#0277bd', '#00838f', '#00695c', '#2e7d32','#558b2f','#9e9d24','#ff8f00','#d84315'];
            let colors = [ '#0277bd','#d84315',  '#2e7d32','#ff8f00']
                    
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

        },//====== end loadChart()

        formatDate: (ts) =>{
            const date = new Date(ts);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const day = ("0" + date.getDate()).slice(-2);
            const year = date.getFullYear();
            return `${month}-${day}-${year}`;
        },

        //====== GET PROJECT ======//
        getProjects: async () => {
            const response = await fetch(`${myIp}/getallprojects`)
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
                tr.innerHTML = `
                <td width="200px" >${xdata.name} <br> 
                    <span class="proj-class">${xdata.project_code}</span><br>
                    <a href="javascript:basemap.getCompetitors('${xdata.id}','${xdata.latitude}','${xdata.longitude}')" class="show-on-map-link">Show on Map</a></td>
                <td width="300px">${xdata.address}</td>
                <td>${xdata.owner}</td>
                <td>${basemap.formatDate(xdata.created_at)}</td>
                <td><span class="badge bg-${statusMap[xdata.status-1].color}">${statusMap[xdata.status-1].label}</span></td>
                `;
                tbody.appendChild(tr);
            });

            basemap.configObj = { keyboard: false, backdrop:'static' }
            basemap.projectlistModal = new bootstrap.Modal(document.getElementById('projectlistModal'),basemap.configObj);

            // Show modal
            basemap.projectlistModal.show();

            basemap.hideChart()

        }, //====END GETPROJECTS

        //========GET ALL COMPETITORS
        getCompetitors: async(projid,lat,lon)=>{
            const response = await fetch(`${myIp}/getallcompetitors/${projid}/${lat}/${lon}`)
            const data = await response.json()

            console.log(data)

            const iconSize = Math.max(20, map.getZoom() * 4); // or your preferred size formula
            
            //***************** */ Pin competitors first
            gjson.mygeojson(data,lat,lon)
            //********************** */

            basemap.projectlistModal.hide()
            
        },
       
        chartHide:false,

        hideChart:()=>{
            basemap.chartHide = true
            basemap.chartCard.classList.add('chart-hide');
        },

        showChart:()=>{
            basemap.chartHide = false
            basemap.chartCard.classList.remove('chart-hide');
        },
        configObj : null,
        projectlistModal : null,
        projectModal:null,
        performanceModal: null,

        chartCard : document.querySelector('.chart-card'),

        // Example usage after the maps API loads
        // getElevation(14.4594, 121.0431);
        //INIT 
        init : () =>{

            //get initial performance of Lease people
            basemap.getmtdPerformance()

             // Initialize Leaflet map
            map = L.map('map').setView([ 14.4594 , 121.0431 ], 18); //18 zoom in
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            markerLayerGroup = L.layerGroup().addTo(map); // Add to the map initially

           
            let db = localStorage
            const owner =  JSON.parse(db.getItem('profile'))

            util.Toasted(`Welcome ${owner.full_name}`,3000,false)

            let authz = []
            authz.push( owner.grp_id )
            authz.push( owner.full_name)
            
            //console.log(authz[1])

            //==HANDSHAKE FIRST WITH SOCKET.IO
            const userName = { token : authz[1] , mode: owner.grp_id}//full name token

            basemap.socket = io.connect(`${myIp}`, {
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
           
            //===load profile pic
            document.getElementById('profile_pic').src = `./assets/images/profile/${owner.pic}`

        }//============end init()

    }//===end obj

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('=======DOM CONTENT LOADED=====')
    basemap.init()
    basemap.listeners()

    //fire listener
    const toggleLink = document.getElementById('toggleChartControl');
    const chartDiv = document.getElementById('chart-card');
    const iclass = document.getElementById('xclass');

    toggleLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (chartDiv.classList.contains('chart-hide')) {
            chartDiv.classList.remove('chart-hide');
            this.textContent = 'Hide Chart';
            iclass.classList.add('ti-graph-off')
        } else {
            chartDiv.classList.add('chart-hide');
            this.textContent = 'Show Chart';
            iclass.classList.remove('ti-graph-off')
            iclass.classList.add('ti-graph')
        }
    });
  
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
   
   
    
    