/*

author : Carlo O. Dominguez
*/
const login = {
	
	/*
	socket:io(),
	*/
		
	//main func

        
    getMsg:()=>{
        
        ajax.socket.on('logged', (msg) => {
			
           // util.Toast(msg,3000)
            util.clearBox()
            /*
            var item = document.getElementById("xmsg")
            item.textContent = msg
            */
          })
    },
    
	
	get Bubbles(){
		const placeholder = document.querySelector('.particle-bg')
		let xpan = "<span></span>"
		
		for (var i = 1; i < 11; i++) {
			xpan+= "<span></span>"
		}
		
      
        placeholder.append(xpan)
	},
	
	testvar:'hey, testvar works',
		
	get test(){
		console.log(`get func works! ${this.testvar}`)
		
	},
	
	triggerEvent: (el, type) => {
		// IE9+ and other modern browsers
		if ('createEvent' in document) {
			var e = document.createEvent('HTMLEvents');
			e.initEvent(type, false, true);
			el.dispatchEvent(e);
		} else {
			// IE8
			var e = document.createEventObject();
			e.eventType = type;
			el.fireEvent('on' + e.eventType, e);
		}
	},	
	
	nodeSay: (cVoice) => {
		const result = fetch(`/xapi/speak/${cVoice}`)
        //console.log(result)
	},

	//==,= main run
	init : async () => {

		var Cookies = document.cookie.split(';');
 
		// set 1 Jan, 1970 expiry for every cookies
		for (var i = 0; i < Cookies.length; i++)
		document.cookie = Cookies[i] + "=;expires=" + new Date(0).toUTCString();

		console.log('== util.setGroupCookie(null) resetting cookie')
		
		//util.setGroupCookie(null, null, null, null, null)/*unset group of cookies*/

		console.log( 'login.init() login.js, *loading #loginForm*')
		util.loadFormValidation('#loginForm')
	}//END MAIN
	
} //======================= end ajax obj==========//
//ajax.Bubbl
window.scrollTo(0,0);
login.init()
