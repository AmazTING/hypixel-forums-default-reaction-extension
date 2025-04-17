// Helper function to get data from storage
async function getData(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (items) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				reject(chrome.runtime.lastError.message);
			} else {
				resolve(items[key]);
			}
		});
	});
}

// Function to set the selected option in the dropdown
function setSelectedOption(selectElement, value) {
	if (selectElement) {
		selectElement.value = value || "";
	}
}

// Initialize dropdown and sync with storage
async function initializeDefaultReaction() {
	try {
		const defaultReaction = await getData("defaultreact");

		// Ensure the dropdown is updated to reflect the stored value
		const selectElement = document.querySelector(".field_default_react");
		setSelectedOption(selectElement, defaultReaction);

		// Attach change event listener to update storage
		selectElement.addEventListener("change", function () {
			const newValue = this.value;
			chrome.storage.local.set({ defaultreact: newValue }, () => {
				if (chrome.runtime.lastError) {
					console.error("Error setting storage:", chrome.runtime.lastError);
				} else {
					console.log("Default reaction updated to:", newValue);
				}
			});
		});
	} catch (error) {
		console.error("Error initializing default reaction:", error);
	}
}

// Inject dropdown dynamically
function injectDropdown() {
	const contentOptions = document.querySelector("form.block");
	if (!contentOptions) return;

	const container = contentOptions
		.querySelector(".block-container")
		?.querySelector(".block-body");
	const beforeOption = container?.querySelectorAll(".formRow")[3];

	if (beforeOption) {
		beforeOption.insertAdjacentHTML(
			"afterend",
			`
      <dl class="formRow formRow--customField formRow--input"> 
        <dt> 
          <div class="formRow-labelWrapper"> 
            <label class="formRow-label" htmlFor="_xfUid-5-1734002796">Default Reaction</label>
          </div> 
        </dt> 
        <dd> 
          <select name="custom_fields[default_react]" class="field_default_react input" id="_xfUid-5-1733997860"> 
            <option value="">&nbsp;</option>
            <option value="1">Like</option> 
            <option value="7">Agree</option> 
            <option value="27">Love</option> 
            <option value="3">Funny</option> 
            <option value="9">Useful</option> 
            <option value="4">Creative</option> 
            <option value="11">Hype Train</option>
												<option value="17">MVP++ Gold</option>
            <option value="5">Dislike</option> 
            <option value="8">Disagree</option> 
          </select> 
          <div class="formRow-explain">This will allow you to choose the default reaction.</div> 
        </dd> 
      </dl>`
		);
	}
}

// Update reaction buttons on the page
async function updateReactionButtons() {
	const defaultReaction = await getData("defaultreact"); // Fetch the default reaction from storage

	// Fallback to a default value if `defaultReaction` is null or undefined
	const reactionValue = defaultReaction || "27";
	const reactionTitleMap = {
		"1": "Like",
		"7": "Agree",
		"27": "Love",
		"3": "Funny",
		"9": "Useful",
		"4": "Creative",
		"11": "Hype Train",
		"17": "MVP++ Gold",
		"5": "Dislike",
		"8": "Disagree",
	};

	const title = reactionTitleMap[reactionValue] || "Love"; // Default title fallback

	const reactButtons = document.querySelectorAll(
		"a.actionBar-action.actionBar-action--sv-rate"
	);
	const iconsHolders = document.querySelectorAll("div.sv-rating-type__icon");
	let icons = []
	for (i = 0; i < iconsHolders.length; i++) {
		icons.push(iconsHolders[i].querySelector("img"))
	}

	// Update buttons and icons dynamically
	reactButtons.forEach((button) => {
		let parts = button.href.split("=");
		parts[parts.length - 1] = reactionValue;
		button.href = parts.join("=");
	});

	icons.forEach((icon) => {
		// Remove old reaction classes
		icon.className = icon.className
			.replace(/sv-rating-type-icon--sprite\d+/g, "")
			.replace(/sv-rating-type-icon\d+/g, "")
			.trim();

		// Add new reaction classes based on the selected reaction
		icon.classList.add(
			`sv-rating-type-icon--sprite${reactionValue}`,
			`sv-rating-type-icon${reactionValue}`
		);

		icon.alt = title;
		icon.title = title;
	});
}

/*
const observer = new MutationObserver((mutationsList, observer) => {
  updateReactionButtons()
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
});
*/
// Main logic
(async function main() {
	// Run only on the preferences page
	if (window.location.href === "https://hypixel.net/account/preferences") {
		injectDropdown();
		await initializeDefaultReaction();
	}

	// Update reaction buttons globally
	updateReactionButtons();
})();
