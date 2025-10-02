const express = require("express");
const router = express.Router();
const Notes = require("../models/notes.js"); // Import Notes model
const {isLoggedIn} = require("../middleware.js");


router.get("/", async (req, res) => {
  let allNotes = [];
  let loggedIn = false;

  if (req.isAuthenticated()) {
    loggedIn = true;
    allNotes = await Notes.find({ user: req.user._id }); // Only user's notes
  }

  res.render("notes/index.ejs", { allNotes, loggedIn });
});

// GET: Form to create a new note
router.get("/new",isLoggedIn, (req, res) => {
  res.render("notes/new.ejs");
});

// DELETE: Delete a note
router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  let deletedNote = await Notes.findByIdAndDelete(id);
  req.flash("success", "Note deleted!");
  console.log(deletedNote); // Log deleted note for debugging
  res.redirect("/Notes"); // Redirect back to all notes
});

// GET: Show details of a single note
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const Note = await Notes.findById(id).populate("user");
  if (!Note) {
    req.flash("error", "Note you are searching for does not Exits.");
    res.redirect("/Notes");
  }
  res.render("notes/show.ejs", { Note });
});

// POST: Create a new note and save to DB
router.post("/",isLoggedIn, async (req, res) => {
  const newNote = new Notes(req.body.Note); // req.body.Note matches input name in form
  newNote.user = req.user._id;
  await newNote.save();
  req.flash("success", "New Note Created!");
  res.redirect("/Notes"); // Redirect to all notes after saving
});

// GET: Form to edit an existing note
router.get("/:id/edit",isLoggedIn, async (req, res) => {
  let { id } = req.params;
  const Note = await Notes.findById(id);
  if (!Note) {
    req.flash("error", "Note you are searching for does not Exits.");
    res.redirect("/Notes");
  }
  res.render("notes/edit.ejs", { Note });
});

// PUT: Update an existing note
router.put("/:id", async (req, res) => {
  let { id } = req.params;
  await Notes.findByIdAndUpdate(id, req.body.Note); // Update with new data
  req.flash("success", "Changes saved successfully.");
  res.redirect(`/Notes/${id}`); // Redirect to updated note
});

module.exports = router;