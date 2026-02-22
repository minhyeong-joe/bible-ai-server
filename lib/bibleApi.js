import { BibleChapter } from "../models/Bible.js";
import { KO_VERSION_IDS, KO_TRANSLATIONS, KO_BOOKS } from "../config/koreanBible.js";
import { scrapeKoreanChapter } from "./koreanScraper.js";

const EXTERNAL_API = "https://bible-api.com/data";

// bad ones no longer supported by this external API?
const BAD_VERSIONS = ["ylt", "oeb-cw", "oeb-us", "synodal"];
const SUPPORTED_LANG_CODE = ["eng", "zh-tw", "zh-cn", "ko"];

const apiFetch = async (url) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`External Bible API error: ${response.status} ${response.statusText} (${url})`,
		);
	}
	return response.json();
};

export const fetchVersions = async () => {
	let translations = await apiFetch(EXTERNAL_API);
	translations.translations.push(...KO_TRANSLATIONS);
	// filter out unsupported versions
	translations.translations = translations.translations.filter(
		(t) =>
			!BAD_VERSIONS.includes(t.identifier.toLowerCase()) &&
			SUPPORTED_LANG_CODE.includes(t.language_code.toLowerCase()),
	);

	return translations;
};

export const fetchBooks = async (version) => {
	if (KO_VERSION_IDS.has(version.toLowerCase())) {
		const koTranslation = KO_TRANSLATIONS.find(
			(t) => t.identifier === version.toLowerCase(),
		);
		return {
			translation: koTranslation,
			books: KO_BOOKS,
		};
	}
	return apiFetch(`${EXTERNAL_API}/${version}`);
};

export const fetchChapters = async (version, bookId) => {
	// Korean translations share the same chapter structure as KJV
	const proxyVersion = KO_VERSION_IDS.has(version.toLowerCase())
		? "kjv"
		: version;
	return apiFetch(`${EXTERNAL_API}/${proxyVersion}/${bookId}`);
};

export const fetchVerses = async (version, bookId, chapter) => {
	const versionKey = version.toLowerCase();
	const bookKey = bookId.toUpperCase();
	const chapterNum = Number(chapter);

	// check DB
	const cached = await BibleChapter.findOne({
		version: versionKey,
		bookId: bookKey,
		chapter: chapterNum,
	});

	if (cached) {
		console.log(`[BibleCache] found  ${versionKey}/${bookKey}/${chapterNum}`);
		return {
			translation: cached.translation,
			verses: cached.verses,
		};
	}

	console.log(
		`[BibleCache] not found ${versionKey}/${bookKey}/${chapterNum} — fetching from API`,
	);

	if (KO_VERSION_IDS.has(versionKey)) {
		const data = await scrapeKoreanChapter(versionKey, bookKey, chapterNum);
		await BibleChapter.findOneAndUpdate(
			{ version: versionKey, bookId: bookKey, chapter: chapterNum },
			{ translation: data.translation, verses: data.verses },
			{ upsert: true, returnDocument: "after" },
		);
		return data;
	}

	const data = await apiFetch(
		`${EXTERNAL_API}/${versionKey}/${bookKey}/${chapterNum}`,
	);

	await BibleChapter.findOneAndUpdate(
		{ version: versionKey, bookId: bookKey, chapter: chapterNum },
		{
			translation: data.translation,
			verses: data.verses,
		},
		{ upsert: true, returnDocument: "after" },
	);

	return data;
};
