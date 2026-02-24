import * as cheerio from "cheerio";
import { KO_BOOKS, KO_TRANSLATIONS } from "../config/koreanBible.js";

const SCRAPE_BASE = "https://www.bskorea.or.kr/bible/korbibReadpage.php";

/**
 * Scrape a single chapter from bskorea.or.kr and return it in the same shape
 * as a BibleChapter document (translation + verses[]).
 *
 * @param {string} version  - "gae" | "han" | "sae"
 * @param {string} bookId   - uppercase book ID e.g. "GEN"
 * @param {number} chapter  - chapter number
 */
export const scrapeKoreanChapter = async (version, bookId, chapter) => {
	const url = new URL(SCRAPE_BASE);
	url.searchParams.set("version", version.toUpperCase());
	url.searchParams.set("book", bookId.toLowerCase());
	url.searchParams.set("chap", String(chapter));

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(
			`Korean Bible scrape failed: ${response.status} ${response.statusText} (${url})`,
		);
	}

	// Log content-type to determine actual encoding served by the site
	const contentType = response.headers.get("content-type") ?? "";

	// Use EUC-KR only if the server explicitly says so; otherwise let fetch decode as UTF-8
	let html;
	if (contentType.toLowerCase().includes("euc-kr")) {
		const buffer = await response.arrayBuffer();
		html = new TextDecoder("euc-kr").decode(buffer);
	} else {
		html = await response.text();
	}

	console.log(
		`[KoreanScraper] decoded HTML snippet (version=${version}, bookId=${bookId}, chapter=${chapter})`,
	);

	// decodeEntities:false prevents cheerio from re-interpreting the charset
	// meta tag and double-decoding the already-decoded UTF-8 string
	const $ = cheerio.load(html, { decodeEntities: false });
	const container = $("#tdBible1");

	if (!container.length) {
		throw new Error(
			`Korean Bible scrape: #tdBible1 not found for ${version}/${bookId}/${chapter}`,
		);
	}

	const koBook = KO_BOOKS.find((b) => b.id === bookId.toUpperCase());
	const koTranslation = KO_TRANSLATIONS.find(
		(t) => t.identifier === version.toLowerCase(),
	);

	const verses = [];
	let verseIndex = 1;

	// Each direct child <span> of #tdBible1 is one verse
	container.children("span").each((_, el) => {
		const $el = $(el);

		// Extract verse number from span.number (strip &nbsp; and whitespace)
		const numberText = $el
			.find("span.number")
			.text()
			.replace(/\s+/g, "")
			.trim();
		const verseNum = parseInt(numberText, 10) || verseIndex;

		// Clone, remove the number span, footnote anchors, and note divs
		const $clone = $el.clone();
		$clone.find("span.number").remove();
		$clone.find("a.comment").remove(); // inline footnote markers e.g. "1)"
		$clone.find("div.D2").remove(); // hidden note content divs
		const text = $clone.text().replace(/\s+/g, " ").trim();

		if (text) {
			verses.push({
				book_id: bookId.toUpperCase(),
				book: koBook?.name ?? bookId,
				chapter: Number(chapter),
				verse: verseNum,
				text,
			});
		}

		verseIndex++;
	});

	if (verses.length === 0) {
		throw new Error(
			`Korean Bible scrape: no verses parsed for ${version}/${bookId}/${chapter}`,
		);
	}

	return {
		translation: koTranslation,
		verses,
	};
};
