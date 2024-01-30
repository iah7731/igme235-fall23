// 1
window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
	
// 2
let displayTerm = "";

// 3
    function searchButtonClicked() {
        console.log("searchButtonClicked () called");
        const GIPHY_URL= "https://api.giphy.com/v1/gifs/search?";

        let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

        let url = GIPHY_URL;
        url += "api_key=" + GIPHY_KEY;
        
        let term = document.querySelector("#searchterm") .value;
        displayTerm= term;

        term = term.trim();

        term = encodeURIComponent (term);

        if(term. length < 1) return;

        url += "&q=" + term;

        let limit = document.querySelector ("#limit").value;
        url += "&limit=" + limit;

        document.querySelector ("#status").innerHTML = "<b>Searching for '"+ displayTerm + "'</b>";

        console.log(url);

        getData(url);
    }

    function getData(url){
    // 1 create a new XHR object 
    let xhr = new XMLHttpRequest();

    // 2 set the onload handler
    xhr.onload = dataLoaded;

    // 3 set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request 
    xhr.open("GET", url);
    xhr.send();
    }

    // Callback Functions
    function dataLoaded (e){
    // 5 event.target is the xhr object
    let xhr = e.target;
    console.log(xhr.responseText);
    // 7 - turn the text into a parsable JavaScript object 
    let obj = JSON.parse(xhr.responseText);

    // 8 if there are no results, print a message and return
    if(!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out
    } 

    // 9 Start building an HTML string we will display to the user
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "";
    // 10 loop through the array of results
    for (let i=0;i<results.length;i++){
    let result = results[i];
    // 11 get the URL to the GIF
    let smallURL = result.images.fixed_width.url; if (!smallURL) smallURL = "images/no-image-found.png";
    // 12 
    let url = result.url;
    // 13 Build a <div> to hold each result
    // ES6 String Templating
    let line = `<div class='result'><img src='${smallURL}' title= '${result.id}' />`; 
    line += `<span>Rating= '${result.rating.toUpperCase()}' <a target='_blank' href='${url}'>View on Giphy</a></span></div>`;

    bigString += line;
    }
    // 16
    document.querySelector("#content").innerHTML = bigString;
    // 17 update the status
    document.querySelector("#status").innerHTML = "<b>Success! </b><p><i>Here are " + results.length +" results for '" + displayTerm + "'</i></p>";	
    }
    // 6 xhr.responseText is the JSON file we just downloaded 
    function dataError(e){
        console.log("An error occurred");
    }