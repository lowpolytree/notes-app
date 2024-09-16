const express = require("express");
const fs = require("fs");

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