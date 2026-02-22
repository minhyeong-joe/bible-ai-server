import express from "express";
import {
	getVersions,
	getBooks,
	getChapters,
	getVerses,
} from "../controllers/bible.js";

const router = express.Router();

router.get("/", getVersions);
router.get("/:version", getBooks);
router.get("/:version/:bookId", getChapters);
router.get("/:version/:bookId/:chapter", getVerses);

export default router;
