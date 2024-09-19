
const express = require("express");
const fs = require("fs");
const Logger = require("./logger/logger");

const logger = new Logger("logs.json", 1024 * 1024);

// Function to read the notes.json file
function readNotesFile() {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", "utf8", (err, data) => {
      if (err) {
        reject("Error reading notes file");
      } else {
        resolve(JSON.parse(data)); // Parse and return the notes as an object
      }
    });
  });
}

// Function to write the notes back to notes.json
function writeNotesFile(notes) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      "notes.json",
      JSON.stringify(notes, null, 2),
      "utf8",
      (err) => {
        if (err) {
          reject("Error writing to notes file");
        } else {
          resolve();
        }
      }
    );
  });
}

// Function to ensure notes.json exists and is valid
function ensureNotesFile(filePath) {
  if (!fs.existsSync(filePath)) {
    // If the file doesn't exist, create it with an empty array
    fs.writeFileSync(filePath, "[]", "utf8");
    logger.info(`Created ${filePath} with an empty array.`);
  } else {
    // If the file exists but is empty or invalid, reset it to an empty array
    const fileContent = fs.readFileSync(filePath, "utf8");
    if (!fileContent || fileContent.trim() === "") {
      fs.writeFileSync(filePath, "[]", "utf8");
      logger.info(`Reset ${filePath} to an empty array.`);
    }
  }
}

// Set up express server
const app = express();
const PORT = 3000;
app.use(express.json());

ensureNotesFile("notes.json");

// Route to fetch all notes
app.get("/notes", (req, res) => {
  readNotesFile()
    .then((notes) => {
      logger.info("Fetched all notes successfully");
      res.json(notes);
    })
    .catch((error) => {
      logger.error(`Error fetching notes: ${error}`);
      res.status(500).send(error);
    });
});

// Route to fetch and list all notes in the format: id -- title
app.get("/notes/list", (req, res) => {
  readNotesFile()
    .then((notes) => {
      // Map over the notes and format them as "id -- title"
      const formattedNotes = notes.map((note) => `${note.id} -- ${note.title}`);

      logger.info("Formatted notes list fetched successfully");
      res.json(formattedNotes); // Send the formatted list as the response
    })
    .catch((error) => {
      logger.error(`Error fetching formatted notes list: ${error}`);
      res.status(500).send(error);
    });
});

// Route to fetch a note by its ID
app.get("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id, 10); // Get the ID from the route parameter

  readNotesFile()
    .then((notes) => {
      const note = notes.find((n) => n.id === noteId); // Find the note with the matching ID

      if (!note) {
        logger.warn(`Note with ID ${noteId} not found`);
        return res.status(404).send("Note not found");
      }

      logger.info(`Fetched note with ID ${noteId}`);
      res.json(note);
    })
    .catch((error) => {
      logger.error(`Error fetching note with ID ${noteId}: ${error}`);
      res.status(500).send(error);
    });
});

// Route to fetch notes by title
app.get("/notes/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase(); // Get the title from the route parameter

  readNotesFile()
    .then((notes) => {
      const matchingNotes = notes.filter(
        (note) => note.title.toLowerCase() === title
      ); // Find all notes with the matching title

      if (matchingNotes.length === 0) {
        logger.warn(`No notes found with title "${req.params.title}"`);
        return res
          .status(404)
          .send(`No notes found with title "${req.params.title}"`);
      }

      logger.info(`Fetched notes with title "${req.params.title}"`);
      res.json(matchingNotes); // Return all matching notes
    })
    .catch((error) => {
      logger.error(
        `Error fetching notes with title "${req.params.title}": ${error}`
      );
      res.status(500).send(error);
    });
});

// Route to add a note
app.post("/notes", (req, res) => {
  readNotesFile()
    .then((notes) => {
      const newNote = {
        id: notes.length + 1,
        title: req.body.title,
        content: req.body.content,
      };
      notes.push(newNote);

      writeNotesFile(notes)
        .then(() => {
          logger.info(`New note added: ${newNote.title}`);
          res.status(201).json(newNote);
        })
        .catch((error) => {
          logger.error(`Error writing new note: ${error}`);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      logger.error(`Error reading notes for adding: ${error}`);
      res.status(500).send(error);
    });
});

// Route to update a note by ID
app.put("/notes/:id", (req, res) => {
  readNotesFile()
    .then((notes) => {
      const noteId = parseInt(req.params.id, 10);
      const note = notes.find((note) => note.id === noteId);

      if (!note) {
        logger.warn(`Note with ID ${noteId} not found`);
        return res.status(404).send("Note not found");
      }

      note.title = req.body.title || note.title;
      note.content = req.body.content || note.content;

      writeNotesFile(notes)
        .then(() => {
          logger.info(`Note with ID ${noteId} updated`);
          res.json(note);
        })
        .catch((error) => {
          logger.error(`Error updating note: ${error}`);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      logger.error(`Error reading notes for update: ${error}`);
      res.status(500).send(error);
    });
});

function reassignNoteIDs(notes) {
  return notes.map((note, index) => {
    return {
      ...note,
      id: index + 1, // Reassign IDs starting from 1
    };
  });
}

// Route to delete all notes
// Route to delete all notes (reset notes.json to [])
app.delete('/notes', (req, res) => {
    // Write an empty array to notes.json
    writeNotesFile([])
      .then(() => {
        logger.info('All notes deleted, notes.json reset to an empty array');
        res.sendStatus(204); // No content
      })
      .catch((error) => {
        logger.error(`Error resetting notes: ${error}`);
        res.status(500).send("Error resetting notes");
      });
  });

// Route to delete a note by ID
app.delete("/notes/:id", (req, res) => {
  readNotesFile()
    .then((notes) => {
      const noteId = parseInt(req.params.id, 10);
      const filteredNotes = notes.filter((note) => note.id !== noteId);

      if (notes.length === filteredNotes.length) {
        logger.warn(`Note with ID ${noteId} not found for deletion`);
        return res.status(404).send("Note not found");
      }

      const filteredNotesWithNewID = reassignNoteIDs(filteredNotes);

      writeNotesFile(filteredNotesWithNewID)
        .then(() => {
          logger.info(`Note with ID ${noteId} deleted and IDs reassigned`);
          res.sendStatus(204); // No content
        })
        .catch((error) => {
          logger.error(`Error deleting note: ${error}`);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      logger.error(`Error reading notes for deletion: ${error}`);
      res.status(500).send(error);
    });
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
