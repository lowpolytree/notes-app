# Notes App

A simple RESTful Notes API built with Express.js and Node.js. This application allows users to create, read, update, and delete notes stored in a JSON file (`notes.json`). The app also includes logging for tracking actions and errors.

## Features

- Add new notes with a title and content
- Fetch all notes or specific notes by ID or title
- Update notes by ID
- Delete individual notes by ID or delete all notes
- Automatically reassigns IDs after a note is deleted
- Lists notes in a special format: `id -- title`
- Logs all actions and errors in `logs.json`

## API Endpoints

### 1. Get All Notes
`GET /notes`

### 2. Get a Note by ID
`GET /notes/:id`

Example request:
`GET /notes/1`

### 3. Get Notes by Title
`GET /notes/title/:title`

Example request:
`GET /notes/title/MyTitle`

### 4. List All Notes in `id -- title` Format
`GET /notes/list`

Example response:
`[
  "1 -- First Note",
  "2 -- Second Note"
]`

### 5. Add a New Note
`POST /notes`

Request Body (JSON):
`{
  "title": "New Note Title",
  "content": "Content of the new note"
}`

### 6. Update a Note by ID
`PUT /notes/:id`

Request Body (JSON):
`{
  "title": "Updated Title",
  "content": "Updated Content"
}`

### 7. Delete a Note by ID
`DELETE /notes/:id`

Example request:
`DELETE /notes/1`

### 8. Delete All Notes (Reset `notes.json`)
`DELETE /notes`

## License
This project is licensed under the ISC License.
