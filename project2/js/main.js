
  "use strict";
    let term = ""; // we declared `term` out here because we will need it later
	window.onload = init;
	
	function init(){

		document.querySelector("#search").onclick = getData;
        if(localStorage.getItem("iah7731-gumsasearch") != null)
        {
            term = localStorage.getItem("iah7731-gumsasearch");
            document.querySelector("#searchterm").value = term;
        }
	}

	function getData(){
		// 1 - main entry point to web service
		const SERVICE_URL = "https://api.jikan.moe/v4/anime";
		
		// No API Key required!
		
		// 2 - build up our URL string
		let url = SERVICE_URL;
		
		// 3 - parse the user entered term we wish to search

        if(document.querySelector("#searchterm").value != null) //if there is a search term...
        {
            term = document.querySelector("#searchterm").value; //save it for later
            localStorage.setItem("iah7731-gumsasearch",term);
        }
		
        let orderradio = null;

        if(document.querySelector('input[name="order"]:checked') != null) //if there is a order term...
        {
            orderradio = document.querySelector('input[name="order"]:checked').value; //save it for later
        }

        
        let ratingradio = null;
        if(document.querySelector('input[name="rating"]:checked') != null) //if there is a rating term...
        {
            ratingradio = document.querySelector('input[name="rating"]:checked').value; //save it for later
        }

        let airstatusradio = null;
        if(document.querySelector('input[name="air"]:checked') != null) //if there is a air status term...
        {
            airstatusradio = document.querySelector('input[name="air"]:checked').value; //save it for later
        }

        let genreselect = document.querySelectorAll('input[name="genre"]');
        const genres = [];
        let numberOfCheckedItems = 0;  

        for(let i = 0; i < genreselect.length; i++)  
        {  
            if(genreselect[i].checked){
                genres[numberOfCheckedItems] = genreselect[i].value;  
                numberOfCheckedItems++; 
            }     
        }  
		
		// get rid of any leading and trailing spaces
		term = term.trim();
		// encode spaces and special characters
		term = encodeURIComponent(term);
		
		// if there's a search term, add it to the url
		if(term.length >= 1){
            url += "?q=" + term;
		}
		

        // add the order to the url

        if(orderradio != null && url == SERVICE_URL)
        {
            url += "?order_by=" + orderradio;
        }
        else if(orderradio != null)
        {
            url += "&order_by=" + orderradio;
        }

        // add the rating to the url

        if(ratingradio != null && url == SERVICE_URL)
        {
            url += "?rating=" + ratingradio;
        }
        else if(ratingradio != null)
        {
            url += "&rating=" + ratingradio;
        }

        // add the air status to the url

        if(airstatusradio != null && url == SERVICE_URL)
        {
            url += "?status=" + airstatusradio;
        }
        else if(airstatusradio != null)
        {
            url += "&status=" + airstatusradio;
        }
        

        // add the genres to the url

        if(genres.length > 0) // if there are genres to add...
        {
            if(url == SERVICE_URL)
            {
                url += "?genres="; // add it to the url
            }
            else
            {
                url += "&genres=";
            }

            for(let i = 0; i < genres.length; i++)  
            {  
                if(i == genres.length - 1)
                {
                    url += genres[i];
                }
                else
                {
                    url += genres[i] + ","; // add the id number and a comma to continue adding genres
                }
            } 
        }

        
        // make sure the results are SFW im not tryna lose points

        if(url == SERVICE_URL) //if no changes were made...
        {
            url += "?sfw"; //put sfw without an &
        }
        else
        {
            url += "&?sfw"; // otherwise do
        }
        

		
		// 4 - update the UI
		document.querySelector("#debug").innerHTML = `<b>Searching...</b>`;
        console.log("Querying web service with:"+url);
		
		// 5 - create a new XHR object
		let xhr = new XMLHttpRequest();

		// 6 - set the onload handler
		xhr.onload = dataLoaded;
	
		// 7 - set the onerror handler
		xhr.onerror = dataError;

		// 8 - open connection and send the request
		xhr.open("GET",url);
		xhr.send();
	}
	
	function dataError(e){
		console.log("An error occurred");
	}
	
	function dataLoaded(e){

		// 1 - e.target is the xhr object
		let xhr = e.target;
	
		// 2 - xhr.responseText is the JSON file we just downloaded
		console.log(xhr.responseText);

        // Update the user
        document.querySelector("#debug").innerHTML = `<b>Got the JSON from the API! Formatting...</b>`;

		// 3 - turn the text into a parsable JavaScript object
		let obj = JSON.parse(xhr.responseText);
		
		// 4 - if there are no results, print a message and return
		if(obj.error){
			let msg = obj.error;
			document.querySelector("#content").innerHTML = `<p><i>Problem! <b>${msg}</b></i></p>`;
			return; // Bail out
		}
		
		// 5 - if there is an array of results, loop through them
		// this is a weird API, the name of the key is the day of the week you asked for
		let results = obj.data;
		if(!results){
			document.querySelector("#content").innerHTML = `<p><i>Problem! <b>No results for "${term}"</b></i></p>`;
			return;
		}
		
		// 6 - put together HTML
		
        document.querySelector("#resultnumber").innerHTML = `<p><h3>Showing <b>${results.length}</b> results!</h3></p>`;
        let bigString = "";
		
		for (let i=0;i<results.length;i++){
			let result = results[i];
			let url = result.url;
			let title = result.title;
            let description = result.synopsis;
            let status = result.status;
            let rating = result.rating;
            let type = result.type;
            let episodecount = result.episodes;
            let image = result.images.jpg.image_url;
            let year = result.year;
			let line = 
            `<div class='result'>
            <h2>${title}</h2><br>
            <img src='${image}' alt=''>
            <br>
            <ul>
                <li>Status - ${status}</li>
                <li>Rating - ${rating}</li>
                <li>Type - ${type}</li>
                <li>Episode Count - ${episodecount}</li>
                <li>Year - ${year}</li>
            </ul>
            <p>${description}</p><br>
            <a href='${url}'>See more on MyAnineList</a>
            </div>
            <br>`;
			bigString += line;
		}
		
        document.querySelector("#debug").innerHTML = `<b>Done!</b>`;

		// 7 - display final results to user
		document.querySelector("#content").innerHTML = bigString;
	}	