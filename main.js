"use strict";

const publicKey = "4e4c4629dc02b846216360561c9aa443";

var PouchDB = require('pouchdb-browser');//Require the db. "Require" on client is possible through browserify "http://browserify.org/"
//Browserify will create a new .js based on another .js to make "require" work on the client side


var db = new PouchDB('my_database');    //Create the database

$(document).ready(function () {
    initLoadingIcons();
    setRandomPokemon();
    setRandomMarvel();
    showWinners();
})



//Removes the loading icon, sets a pokemon picture and name from API
function setRandomPokemon() {
    var randomSection = Math.floor(Math.random() * 20) + 1; //Sets a random value between 1 and 10
    var uri = "https://pokeapi.co/api/v2/pokemon/" + randomSection; //Random section is used because the poke-api is so big I dont want everything
    $.get(uri, function (data, status) { //Using jquery to post
        var pokemon = data.forms[0].name;
        $("#pokemon-holder").empty();
        $("#pokemon-holder").append('<h1 id="pokemon-name"></h1>')
        $("#pokemon-holder").append('<img id="pokemon-image" src="">')
        $("#pokemon-name").text(pokemon.toUpperCase());
        $("#pokemon-image").attr("src", data.sprites.front_default);
        $("#pokemon-image").click(function () {
            addWinner($("#pokemon-name").text(), $("#marvel-name").text()); //Add winner and loser to the database
            loadNewContestents(); 
        })
    });
}


function setRandomMarvel() {
    var uri = "https://gateway.marvel.com/v1/public/characters?orderBy=-modified&limit=30&apikey=" + publicKey;
    $.get(uri, function (data, status) {
        var randomIndex = Math.floor(Math.random() * 30) + 1;
        var name = data.data.results[randomIndex].name
        name = name.split("(");
        name = name[0];
        $("#marvel-holder").empty();
        $("#marvel-holder").append('<h1 id="marvel-name"></h1>')
        $("#marvel-holder").append('<img id="marvel-image" src="">')
        $("#marvel-name").text(name.toUpperCase());
        $("#marvel-image").attr("src", data.data.results[randomIndex].thumbnail.path + "." + data.data.results[randomIndex].thumbnail.extension);
        $("#marvel-image").click(function () {
            addWinner($("#marvel-name").text(), $("#pokemon-name").text());
            loadNewContestents(); 
        })
    });
}

//Clears the list of previous matches, then it gets all the games from the database and presents five of them
function showWinners() {
    $("#winners").empty();
    $("#losers").empty();
    db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
        var loopLength = 5 > doc.rows.length ? doc.rows.length : 5; //Sets the number of matches ti be displayed. 5 or the number in the database if its less than 5
        for (let i = 0; i < loopLength; i++) {
            console.log(doc.rows[i].doc.loser)
            $("#winners").append('<li>' + doc.rows[i].doc.winner + '</li>')
            $("#losers").append('<li>' + doc.rows[i].doc.loser + '</li>')
        }
    });
}

//Creates the loading icons
function initLoadingIcons(){
    var loadingMock = '<div class="loader"><div class="ball-clip-rotate-multiple"><div></div><div></div></div></div>'
    $("#pokemon-holder").empty();
    $("#marvel-holder").empty();
    $("#pokemon-holder").append(loadingMock);
    $("#marvel-holder").append(loadingMock);
}

function loadNewContestents() {
    initLoadingIcons();
    setRandomMarvel();
    setRandomPokemon();
}

function addWinner(winnerName, loserName) {
    //Creating a new match object
    var match = {
        _id: new Date().toISOString(),
        winner: winnerName,
        loser: loserName,
        completed: false
    };
    //Saves the math object to the database and updates the scoreboard if no error occured.
    db.put(match, function callback(err, result) {
        if (!err) {
            showWinners();
        }
        else {
            console.log(err);
        }
    });
}

