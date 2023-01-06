const INPUTDATA = "data/data.json";

let pages = [];

function getPageDetails(pageID) {
	for (let i = 0; i < forms.length; i += 1) {
		if (forms[i]['page_id'] === pageID) {
			return forms[i];
		}
	}
	return false;
}

function showNextButton(nextPageID, nextPageType) {
	// Grab next button element
	const nextBtn = document.getElementById("nextFormBtn");
	if (nextPageType === "question" || nextPageType === "info") {
		nextBtn.innerHTML = "Next <i class='bi-arrow-right-circle'></i>";
		nextBtn.classList.remove("btn-success");
		nextBtn.classList.add("btn-info");
	} else {
		nextBtn.innerHTML = "Finish <i class='bi-arrow-right-circle'></i>";
		nextBtn.classList.remove("btn-info");
		nextBtn.classList.add("btn-success");
	}
	if (nextPageType === "question" || nextPageType === "info") {
		nextBtn.setAttribute("onclick", "loadPage('" + nextPageID + "')");
	} else if (nextPageType === "final") {
		nextBtn.setAttribute("onclick", "loadPage('" + nextPageID + "')");
	}
	nextBtn.removeAttribute("disabled");
}

function disableNextButton() {
	// Grab next button element
	const nextBtn = document.getElementById("nextFormBtn");
	nextBtn.innerHTML = "Next <i class='bi-arrow-right-circle'></i>";
	nextBtn.classList.remove("btn-success");
	nextBtn.classList.add("btn-info");
	nextBtn.classList.remove("d-none");
	nextBtn.setAttribute("disabled", "");
}

function hideNextButton() {
	// Grab next button element
	const nextBtn = document.getElementById("nextFormBtn");
	nextBtn.classList.add("d-none");
}

function showBackButton(previousPageID) {
	const backBtn = document.getElementById("backBtn");
	backBtn.setAttribute("onclick", `handleBackButtonClick('${previousPageID}')`);
	backBtn.classList.remove("d-none");
}

function hideBackButton() {
	const backBtn = document.getElementById("backBtn");
	backBtn.removeAttribute("onclick");
	backBtn.classList.add("d-none");
}

function handleBackButtonClick(previousPageID) {
	// Remove previous pages from pages history
	pages.splice(pages.length - 2, 2);
	// Run Page
	loadPage(previousPageID);
}

function showResetButton() {
	const resetBtn = document.getElementById("resetBtn");
	resetBtn.innerHTML = 'Reset <i class="bi-arrow-repeat"></i>';
	resetBtn.classList.remove("d-none");
}

function hideResetButton() {
	const backBtn = document.getElementById("resetBtn");
	backBtn.classList.add("d-none");
}

function setAnswers(answers) {
	let html = [];
	answers.forEach(function(answer) {
		let answerHTML = [
			'<div class="form-check mb-3">',
			'<input class="form-check-input" type="radio"',
			'name="purposeRadio"',
			'id="' + answer["answer_id"] + '"',
			`onclick="showNextButton('${answer["next-page-id"]}', '${answer["next-page-type"]}')"`,
			'value="' + answer["answer_id"] + '"',
			"/>",
			'<label class="form-check-label" for="' + answer["answer_id"] + '">',
			'&nbsp' + answer["answer_text"],
			"</label>",
			"</div>",
		].join("\n");
		html += answerHTML;
	});

	return html;
}

function loadPage(pageID) {
	// Scroll to the top of the page
	window.scrollTo(0, 0);

	// Add page ID to list of pages visited in sessionStorage (for back button purposes)
	pages.push(pageID);
	sessionStorage.pages = JSON.stringify(pages);

	// Disable the next button, and hide the back and reset buttons
	hideBackButton();
	hideResetButton();
	disableNextButton();

	const page = getPageDetails(pageID);
	populatePageContents(page);
}

function populatePageContents(page) {
	// Get html page elements
	const mainBodyTitle = document.getElementById("main-body-title");
	const mainBodyText = document.getElementById("main-body-text");
	const mainBodyAnswers = document.getElementById("main-body-answers");

	// Populate main body title
	mainBodyTitle.innerText = page["page-title"];

	// Populate main body text
	if (page["page-body"]) {
		mainBodyText.innerHTML = `<zero-md src="markdowns/${page["page-body"]}"></zero-md>`;
	} else {
		mainBodyText.innerHTML = '';
	}

	// Populate main body answers (for question page type)
	if (page["page_type"] === 'question') {
		let answers = setAnswers(page["answers"]);
		mainBodyAnswers.innerHTML = answers;
	} else {
		mainBodyAnswers.innerHTML = '';
	}

	// Show the main body section
	const mainBody = document.getElementById("main-body");
	mainBody.style.display = "block";

	// Show relevant buttons
	if (page["page_type"] === 'final') {
		hideNextButton();
		showResetButton();
	}
	if (page["page_type"] === 'info') {
		showNextButton(page["next-page-id"], page["next-page-type"]);
	}
	if (pages.length > 1) {
		// get previous page ID
		let previousPageID = pages.slice(-2)[0];
		showBackButton(previousPageID);
	}
}

// Begin by reading in the json data
fetch(INPUTDATA)
	.then((response) => {
		return response.json();
	})
	.then((data) => {
		forms = data;

		// Start app using the first entry in the returned json
		loadPage(forms[0]['page_id']);
	})
	.catch(() => {
		const mainBody = document.getElementById("main-body");
		mainBody.innerHTML = "<p>No JSON file has been provided.</p>";
		mainBody.style.display = "block";
	});