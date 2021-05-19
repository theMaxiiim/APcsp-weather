// Set online data stream variables
const API_KEY = "3c27d59f278715d15978e729625aa575";
const DATA_STREAM = "http://api.openweathermap.org/data/2.5/weather";

// utilities

//date and time constants

const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const month = ["january","february","march","april","may","june","july",
"august","september","october","november","december"];

//function to convert from kelvin to fahrenheit

function kelvinToF(kelvin){
    return Math.round((( (kelvin-273.15) * 9)/5) + 32);
}

    //iterating to find the most searched zip code

    function mostVisitedZip(zipArray, length){
        // sorting the array using a built-in function
        zipArray.sort();
           
        // find the maximum frequency by visiting each array element once
        let maxCount = 1, result = zipArray[0];
        let actualCount = 1;
           
        for (let i = 1; i < length; i++){
            if (zipArray[i] == zipArray[i - 1])
                actualCount++;
            else {
                if (actualCount > maxCount){
                    maxCount = actualCount;
                    result = zipArray[i - 1];
            }
                actualCount = 1;
            }
        }
       
        // in case the last array element were the most frequent
        if (actualCount > maxCount){
            maxCount = actualCount;
            result = zipArray[length - 1];
        }

        return result;
    }


//instancing the local storage


let zipCodes = new Array();
    if(localStorage['zipCodes'] == undefined){
        localStorage['zipCodes']=JSON.stringify(zipCodes);

        //setting the time prior to initial search
        let actualDate = new Date(); 
        let formattedDate = week[actualDate.getDay()] + ", "
                    + month[actualDate.getMonth()] + " "
                    + actualDate.getDate() + ", "
                    + actualDate.getFullYear() + " @ "  
    
        let formattedTime = actualDate.getHours() + ":"  
                    + actualDate.getMinutes()
    
        document.getElementById('dNT').innerHTML = `${formattedDate}<strong>${formattedTime}</strong>`;
    }
    else{
        zipCodes = JSON.parse(localStorage['zipCodes']);   

        //setting the number of cities searched and the most searched cities prior to search
        document.getElementById('cityCounter').innerHTML = `cities searched: <strong>${zipCodes.length + 1}</strong>`
        document.getElementById('mostSearched').innerHTML = `most searched zip code: <strong>${mostVisitedZip(zipCodes, zipCodes.length)}</strong>`;

        //setting the time prior to search
        let actualDate = new Date(); 
        let formattedDate = week[actualDate.getDay()] + ", "
                    + month[actualDate.getMonth()] + " "
                    + actualDate.getDate() + ", "
                    + actualDate.getFullYear() + " @ "  
    
        let formattedTime = actualDate.getHours() + ":"  
                    + actualDate.getMinutes()
    
        document.getElementById('dNT').innerHTML = `${formattedDate}<strong>${formattedTime}</strong>`;
    }


// !Fetch weather information from online data stream (openweathermap) on 'enter' 

//obtain form user input
const zipCodeForm = document.getElementById("zipCodeForm");
const zipCodeField = document.getElementById("zipCodeField");
let zipCode;

//will run everytime a zip code is inputted
zipCodeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    zipCode = zipCodeField.value;

    //assemble AJAX request -- implement error pop-up for when zip code not found
    fetch("https://cors-anywhere.herokuapp.com/" + DATA_STREAM + `?zip=${zipCode}&appid=${API_KEY}`)
    
    .then( (res) =>{
        return res.json();
}).then(function(weatherData) {
    // weatherData is the parsed version of the JSON returned from the above endpoint
    
    // !basic weather data
    // only reading the data at this point and replacing the placeholder values via the DOM
    document.getElementById('city').innerHTML = weatherData.name;

    // we receive the temperature from the online data stream in kelvin
    // at this point we must convert from kelvin to fahrenheit, and round to the nearest integer

    let tempKelvin = weatherData.main.temp;

    let cityTemp = kelvinToF(tempKelvin);

    //replacing placeholder value to actual city temp

    document.getElementById('temp').innerHTML = `${cityTemp}&#176;`

    // !conditionals
    
    //cloudy conditional:
    //verifying if the current city qualifies as being "cloudy" right now
    // must reach a certain threshold (>40% cloudy) to be considered "cloudy"

    if(weatherData.clouds.all >= 40) {
        document.getElementById('clouds').innerHTML = 'is it cloudy? : <strong>YES</strong>'
    }
    else {
        document.getElementById('clouds').innerHTML = 'is it cloudy? : <strong>NO</strong>'
    }

    //humidity conditional:
    //for our purposes, we'll consider humidity % over 50 to be humid

    if(weatherData.main.humidity > 50) {
        document.getElementById('humid').innerHTML = 'is it humid? : <strong>YES</strong>'
    }
    else {
        document.getElementById('humid').innerHTML = 'is it humid? : <strong>NO</strong>'
    }

    //wind conditional:
    //for our purposes, we'll consider a wind speed of over 9.5m/s to be "windy"

    if(weatherData.wind.speed >= 9.5) {
        document.getElementById('wind').innerHTML = 'is it windy? : <strong>YES</strong>'
    }
    else {
        document.getElementById('wind').innerHTML = 'is it windy? : <strong>NO</strong>'
    }

    // !STATS
    //humidity %
    document.getElementById('humidPercent').innerHTML = `humidity: <strong>${weatherData.main.humidity}%</strong>`

    //wind direction
    //we receive the wind direction in degrees from the online data stream
    //for better usability, the app converts this to cardinal points, which is then displayed to the user

    //instacing our array (list), which includes our cardinal points
    cardinal = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];

    //function which does the conversion from degrees to cardinal points
    function degreesToCardinal(degrees){
        let indexPoint = Math.round((degrees % 360)/45);
        return cardinal[indexPoint];
    }

    document.getElementById('windDirection').innerHTML = `wind direction: <strong>${degreesToCardinal(weatherData.wind.deg)}</strong>`;

    //show current date and time

    let actualDate = new Date(); 
    let formattedDate = week[actualDate.getDay()] + ", "
                + month[actualDate.getMonth()] + " "
                + actualDate.getDate() + ", "
                + actualDate.getFullYear() + " @ "  

    let formattedTime = actualDate.getHours() + ":"  
                + actualDate.getMinutes()

    document.getElementById('dNT').innerHTML = `${formattedDate}<strong>${formattedTime}</strong>`;

    //writing to local storage in order to store zip code lookup history

    zipCodes.push(zipCode);
    localStorage['zipCodes'] = JSON.stringify(zipCodes);

    //modifying the cities searched counter
    document.getElementById('cityCounter').innerHTML = `cities searched: <strong>${zipCodes.length + 1}</strong>`

    //using the iterative function to locate the most searched city from the array saved to local storage
    document.getElementById('mostSearched').innerHTML = `most searched zip code: <strong>${mostVisitedZip(zipCodes, zipCodes.length)}</strong>`;

    

}).catch( (err) => {
        console.warn('an error has occured: ', err);
        document.getElementById('city').innerHTML = "city not found"; 
    })

});