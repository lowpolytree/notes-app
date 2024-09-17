const express = require("express");
const fs = require("fs");
const Logger = require('./logger/logger');

const logger = new Logger('logs.json', 1024 * 1024);

function loadNotes(){

}

function updateNotes(){
    
}


// Set up express server
const app = express();
const PORT = 3000;
app.use(express.json());

app.get('notes.json', (req, res) => {
    res.json(notes);
})

//app.get a specific item by filter
//app.post
//app.put
//app.delete

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });