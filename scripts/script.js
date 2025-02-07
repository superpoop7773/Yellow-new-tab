/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */


// TODO: Seperate stuffs to theme.js, search.js, search-suggestions.js (with proxy)
// TODO: Seperate stuffs to shortcuts.js, menu.js
// TODO: `clock.js` - might be divided in two: `clock-analog.js` and `clock-digital.js`
// TODO: `search.js` - might be divided in two: `search-default.js` and `search-dropdown.js`
// TODO: Move all the CSS in a file called `theme/theme.css` (theme is the folder name) ??
// TODO: Move all the SVG icons in files called `svgs/icon-name.svg` (svgs is the folder name, it already exists) ??


let proxyurl;
document.addEventListener("DOMContentLoaded", () => {
    const userProxyInput = document.getElementById("userproxy");
    const saveProxyButton = document.getElementById("saveproxy");
    const savedProxy = localStorage.getItem("proxy");

    const defaultProxyURL = "https://mynt-proxy.rhythmcorehq.com"; //Default proxy url
    if (savedProxy && savedProxy !== defaultProxyURL) {
        userProxyInput.value = savedProxy;
    }

    userProxyInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveproxy"));

    // Save the proxy to localStorage
    saveProxyButton.addEventListener("click", () => {
        proxyurl = userProxyInput.value.trim();

        // If the input is empty, use the default proxy.
        if (proxyurl === "") {
            proxyurl = defaultProxyURL;
        } else {
            // Validate if input starts with "http://" or "https://"
            if (!(proxyurl.startsWith("http://") || proxyurl.startsWith("https://"))) {
                // Automatically correct input by adding "http:/"" if not present
                proxyurl = "http://" + proxyurl;
            }

            // Remove trailing slash if exists
            if (proxyurl.endsWith("/")) {
                proxyurl = proxyurl.slice(0, -1);  // Remove the last character ("/")
            }
        }
        // Set the proxy in localStorage, clear the input, and reload the page
        localStorage.setItem("proxy", proxyurl);
        userProxyInput.value = "";
        location.reload();
    });

    // Determine which proxy URL to use
    proxyurl = savedProxy || defaultProxyURL;
});

// --------------------------- Search Bar ------------------------------------

// Showing border or outline when you click on the searchbar
const searchbar = document.getElementById("searchbar");
searchbar.addEventListener("click", function (event) {
    event.stopPropagation(); // Stop the click event from propagating to the document
    searchbar.classList.add("active");
});

document.addEventListener("click", function (event) {
    // Check if the clicked element is not the searchbar
    if (!searchbar.contains(event.target)) {
        searchbar.classList.remove("active");
    }
});

// Search function
document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".dropdown-content");

    dropdown.addEventListener("click", (event) => {
        if (dropdown.style.display === "block") {
            event.stopPropagation();
            dropdown.style.display = "none";
            searchInput.focus();
        }
    })

    document.addEventListener("click", (event) => {
        if (dropdown.style.display === "block") {
            event.stopPropagation();
            dropdown.style.display = "none";
        }
    })

    document.querySelector(".dropdown-btn").addEventListener("click", function (event) {
        const resultBox = document.getElementById("resultBox");
        if (resultBox.classList.toString().includes("show")) return;

        // Clear selected state and reset index when dropdown opens
        dropdownItems.forEach(item => item.classList.remove("selected"));
        selectedIndex = -1;

        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    const enterBTN = document.getElementById("enterBtn");
    const searchInput = document.getElementById("searchQ");
    const searchEngineRadio = document.getElementsByName("search-engine");
    const searchDropdowns = document.querySelectorAll('[id$="-dropdown"]:not(*[data-default])');
    const defaultEngine = document.querySelector('#default-dropdown-item div[id$="-dropdown"]');

    const sortDropdown = () => {
        // Change the elements to the array
        const elements = Array.from(searchDropdowns);

        // Sort the dropdown
        const sortedDropdowns = elements.sort((a, b) => {
            const engineA = parseInt(a.getAttribute("data-engine"), 10);
            const engineB = parseInt(b.getAttribute("data-engine"), 10);

            return engineA - engineB;
        })

        // get the parent
        const parent = sortedDropdowns[0]?.parentNode;

        // Append the items if parent exists.
        if (parent) {
            sortedDropdowns.forEach(item => parent.appendChild(item));
        }
    }

    // This will add event listener for click in the search bar
    searchDropdowns.forEach(element => {
        element.addEventListener("click", () => {
            const engine = element.getAttribute("data-engine");
            const radioButton = document.querySelector(`input[type="radio"][value="engine${engine}"]`);
            const selector = `*[data-engine-name=${element.getAttribute("data-engine-name")}]`;

            radioButton.checked = true;

            // Swap the dropdown and sort them
            swapDropdown(selector);
            sortDropdown()

            localStorage.setItem("selectedSearchEngine", radioButton.value);
        });
    });

    // Make entire search-engine div clickable
    document.querySelectorAll(".search-engine").forEach((engineDiv) => {
        engineDiv.addEventListener("click", (event) => {
            event.stopPropagation();
            const radioButton = engineDiv.querySelector('input[type="radio"]');

            radioButton.checked = true;

            const radioButtonValue = radioButton.value.charAt(radioButton.value.length - 1);

            const selector = `[data-engine="${radioButtonValue}"]`;

            // Swap the dropdown
            swapDropdown(selector);
            sortDropdown();

            localStorage.setItem("selectedSearchEngine", radioButton.value);

            const searchBar = document.querySelector(".searchbar");
            searchInput.focus();
            searchBar.classList.add("active");
        });
    });

    /**
     * Swap attributes and contents between the default engine and a selected element.
     * @param {HTMLElement} defaultEngine - The current default engine element.
     * @param {HTMLElement} selectedElement - The clicked or selected element.
     */
    function swapDropdown(selectedElement) {
        // Swap innerHTML
        const element = document.querySelector(selectedElement);
        const tempHTML = defaultEngine.innerHTML;
        defaultEngine.innerHTML = element.innerHTML;
        element.innerHTML = tempHTML;

        // Swap attributes
        ["data-engine", "data-engine-name", "id"].forEach(attr => {
            const tempAttr = defaultEngine.getAttribute(attr);
            defaultEngine.setAttribute(attr, element.getAttribute(attr));
            element.setAttribute(attr, tempAttr);
        });
    }

    // Function to perform search
    function performSearch() {
        var selectedOption = document.querySelector('input[name="search-engine"]:checked').value;
        var searchTerm = searchInput.value;
        var searchEngines = {
            engine1: "https://www.google.com/search?q=",
            engine2: "https://duckduckgo.com/?q=",
            engine3: "https://bing.com/?q=",
            engine4: "https://search.brave.com/search?q=",
            engine5: "https://www.youtube.com/results?search_query="
        };

        if (searchTerm !== "") {
            var searchUrl = searchEngines[selectedOption] + encodeURIComponent(searchTerm);
            window.location.href = searchUrl;
        }
    }

    // Event listeners
    enterBTN.addEventListener("click", performSearch);

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    // Set selected search engine from local storage
    const storedSearchEngine = localStorage.getItem("selectedSearchEngine");

    if (storedSearchEngine) {
        // Find Serial Number - SN with the help of charAt.
        const storedSearchEngineSN = storedSearchEngine.charAt(storedSearchEngine.length - 1);
        const defaultDropdownSN = document.querySelector("*[data-default]").getAttribute("data-engine");

        // check if the default selected search engine is same as the stored one.
        if (storedSearchEngineSN !== defaultDropdownSN) {
            // The following line will find out the appropriate dropdown for the selected search engine.
            const selector = `*[data-engine="${storedSearchEngineSN}"]`;

            swapDropdown(selector);
            sortDropdown();
        }

        const selectedRadioButton = document.querySelector(`input[name="search-engine"][value="${storedSearchEngine}"]`);
        if (selectedRadioButton) {
            selectedRadioButton.checked = true;
        }
    }

    const dropdownItems = document.querySelectorAll(".dropdown-item:not(*[data-default])");
    let selectedIndex = -1;

    // Function to update the selected item
    function updateSelection() {
        // let hasSelected = [];
        dropdownItems.forEach((item, index) => {

            item.addEventListener("mouseenter", () => {
                item.classList.add("selected");
            })
            item.addEventListener("mouseleave", () => {
                item.classList.remove("selected");
            })

            if (index === selectedIndex) {
                item.focus()
                item.classList.add("selected");
            } else {
                item.focus()
                item.classList.remove("selected");
            }
        });
    }

    // Event listener for keydown events to navigate up/down
    document.querySelector(".dropdown").addEventListener("keydown", function (event) {
        if (dropdown.style.display === "block") {
            if (event.key === "ArrowDown") {
                event.preventDefault();  // Prevent the page from scrolling
                selectedIndex = (selectedIndex + 1) % dropdownItems.length; // Move down, loop around
            } else if (event.key === "ArrowUp") {
                event.preventDefault();  // Prevent the page from scrolling
                selectedIndex = (selectedIndex - 1 + dropdownItems.length) % dropdownItems.length; // Move up, loop around
            } else if (event.key === "Enter") {
                const selectedItem = document.querySelector(".dropdown-content .selected");
                const engine = selectedItem.getAttribute("data-engine");
                const radioButton = document.querySelector(`input[type="radio"][value="engine${engine}"]`);

                radioButton.checked = true;

                // Swap the dropdown and sort them
                swapDropdown(`*[data-engine="${engine}"]`);
                sortDropdown();

                localStorage.setItem("selectedSearchEngine", radioButton.value);

                // Close the dropdown after selection
                dropdown.style.display = "none";
                searchInput.focus();
            }
            updateSelection();
        }
    });

    // Initial setup for highlighting
    updateSelection();

    // Event listener for search engine radio buttons
    searchEngineRadio.forEach((radio) => {
        radio.addEventListener("change", () => {
            const selectedOption = document.querySelector('input[name="search-engine"]:checked').value;
            localStorage.setItem("selectedSearchEngine", selectedOption);
        });
    });


    // -----Theme stay changed even if user reload the page---
    //  🔴🟠🟡🟢🔵🟣⚫️⚪️🟤
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme) {
        applySelectedTheme(storedTheme);
        const selectedRadioButton = document.querySelector(`.colorPlate[value="${storedTheme}"]`);
        if (selectedRadioButton) {
            selectedRadioButton.checked = true;
        }
    }

    // Remove Loading Screen When the DOM and the Theme has Loaded
    document.getElementById("LoadingScreen").style.display = "none";
    // it is necessary for some elements not to blink when the page is reloaded
    setTimeout(() => {
        document.documentElement.classList.add("theme-transition");
    }, 25);
});


// Function to apply the selected theme
const radioButtons = document.querySelectorAll(".colorPlate");
const themeStorageKey = "selectedTheme";
const storedTheme = localStorage.getItem(themeStorageKey);
const customThemeStorageKey = "customThemeColor"; // For color picker
const storedCustomColor = localStorage.getItem(customThemeStorageKey);

const resetDarkTheme = () => {
    // Remove the dark theme class
    document.documentElement.classList.remove("dark-theme");

    // Reset inline styles that were applied specifically for dark mode
    const resetElements = [
        "searchQ",
        "searchIconDark",
        "darkFeelsLikeIcon",
        "menuButton",
        "menuCloseButton",
        "closeBtnX"
    ];

    resetElements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.removeAttribute("style");
        }
    });

    // Reset fill color for elements with the class "accentColor"
    const accentElements = document.querySelectorAll(".accentColor");
    accentElements.forEach((element) => {
        element.style.fill = ""; // Reset fill color
    });
};

const applySelectedTheme = (colorValue) => {
    if (colorValue !== "dark") {
        resetDarkTheme();

        if (colorValue === "blue") {
            document.documentElement.style.setProperty("--bg-color-blue", "#BBD6FD");
            document.documentElement.style.setProperty("--accentLightTint-blue", "#E2EEFF");
            document.documentElement.style.setProperty("--darkerColor-blue", "#3569b2");
            document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
            document.documentElement.style.setProperty("--textColorDark-blue", "#1b3041");
            document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
        } else {
            document.documentElement.style.setProperty("--bg-color-blue", `var(--bg-color-${colorValue})`);
            document.documentElement.style.setProperty("--accentLightTint-blue", `var(--accentLightTint-${colorValue})`);
            document.documentElement.style.setProperty("--darkerColor-blue", `var(--darkerColor-${colorValue})`);
            document.documentElement.style.setProperty("--darkColor-blue", `var(--darkColor-${colorValue})`);
            document.documentElement.style.setProperty("--textColorDark-blue", `var(--textColorDark-${colorValue})`);
            document.documentElement.style.setProperty("--whitishColor-blue", `var(--whitishColor-${colorValue})`);
        }
    }

    // If the selected theme is dark
    else if (colorValue === "dark") {
        document.documentElement.style.setProperty("--bg-color-blue", `var(--bg-color-${colorValue})`);
        document.documentElement.style.setProperty("--accentLightTint-blue", `var(--accentLightTint-${colorValue})`);
        document.documentElement.style.setProperty("--darkerColor-blue", `var(--darkerColor-${colorValue})`);
        document.documentElement.style.setProperty("--darkColor-blue", `var(--darkColor-${colorValue})`);
        document.documentElement.style.setProperty("--textColorDark-blue", `var(--textColorDark-${colorValue})`);

        // Apply dark theme class
        document.documentElement.classList.add("dark-theme");

        // Change fill color for elements with the class "accentColor"
        const accentElements = document.querySelectorAll(".accentColor");
        accentElements.forEach((element) => {
            element.style.fill = "#212121";
        });
    }

    changeFaviconColor();
    ApplyLoadingColor();
};

function changeFaviconColor() {
    // Fetch colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const darkColor = rootStyles.getPropertyValue("--darkColor-blue");
    //const bgColor = rootStyles.getPropertyValue("--bg-color-blue");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="${darkColor}" style="transform: scale(1.2); transform-origin: center;"
            d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1" />
    </svg>
    `;
    const encodedSvg = 'data:image/svg+xml,' + encodeURIComponent(svg);
    const favicon = document.getElementById("favicon");
    favicon.href = encodedSvg;
    favicon.setAttribute('type', 'image/svg+xml');
}

// Set default color on first page load
if (!localStorage.getItem('newFavicon')) {
    changeFaviconColor();
    localStorage.setItem('newFavicon', 'true');
}


// ----Color Picker || ColorPicker----
function adjustHexColor(hex, factor, isLighten = true) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    if (isLighten) {
        r = Math.floor(r + (255 - r) * factor);
        g = Math.floor(g + (255 - g) * factor);
        b = Math.floor(b + (255 - b) * factor);
    } else {
        r = Math.floor(r * (1 - factor));
        g = Math.floor(g * (1 - factor));
        b = Math.floor(b * (1 - factor));
    }
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

function isNearWhite(hex, threshold = 240) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return r > threshold && g > threshold && b > threshold;
}

const applyCustomTheme = (color) => {
    let adjustedColor = isNearWhite(color) ? "#696969" : color;

    const lighterColorHex = adjustHexColor(adjustedColor, 0.7);
    const lightTin = adjustHexColor(adjustedColor, 0.9);
    const darkerColorHex = adjustHexColor(adjustedColor, 0.3, false);
    const darkTextColor = adjustHexColor(adjustedColor, 0.8, false);

    document.documentElement.style.setProperty("--bg-color-blue", lighterColorHex);
    document.documentElement.style.setProperty("--accentLightTint-blue", lightTin);
    document.documentElement.style.setProperty("--darkerColor-blue", darkerColorHex);
    document.documentElement.style.setProperty("--darkColor-blue", adjustedColor);
    document.documentElement.style.setProperty("--textColorDark-blue", darkTextColor);
    document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
    document.getElementById("rangColor").style.borderColor = color;
    document.getElementById("dfChecked").checked = false;

    changeFaviconColor();
    ApplyLoadingColor();
};

// Load theme on page reload
window.addEventListener("load", function () {
    if (storedTheme) {
        applySelectedTheme(storedTheme);
    } else if (storedCustomColor) {
        applyCustomTheme(storedCustomColor);
    }
});

// Handle radio button changes
const handleThemeChange = function () {
    if (this.checked) {
        const colorValue = this.value;
        localStorage.setItem(themeStorageKey, colorValue);
        localStorage.removeItem(customThemeStorageKey); // Clear custom theme
        applySelectedTheme(colorValue);
    }
};

// Remove any previously attached listeners and add only one
radioButtons.forEach(radioButton => {
    radioButton.removeEventListener("change", handleThemeChange); // Remove if already attached
    radioButton.addEventListener("change", handleThemeChange);    // Add fresh listener
});

// Handle color picker changes
const handleColorPickerChange = function (event) {
    const selectedColor = event.target.value;
    resetDarkTheme(); // Clear dark theme if active
    localStorage.setItem(customThemeStorageKey, selectedColor); // Save custom color
    localStorage.removeItem(themeStorageKey); // Clear predefined theme
    applyCustomTheme(selectedColor);

    // Uncheck all radio buttons
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
};

// Add listeners for color picker
colorPicker.removeEventListener("input", handleColorPickerChange); // Ensure no duplicate listeners
colorPicker.addEventListener("input", handleColorPickerChange);

// End of Function to apply the selected theme


// ------------Search Suggestions---------------

// Show the result box
function showResultBox() {
    resultBox.classList.add("show");
    resultBox.style.display = "block";
}

// Hide the result box
function hideResultBox() {
    resultBox.classList.remove("show");
    //resultBox.style.display = "none";
}

showResultBox();
hideResultBox();

document.getElementById("searchQ").addEventListener("input", async function () {
    const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
    if (searchsuggestionscheckbox.checked) {
        var selectedOption = document.querySelector("input[name='search-engine']:checked").value;
        var searchEngines = {
            engine1: "https://www.google.com/search?q=",
            engine2: "https://duckduckgo.com/?q=",
            engine3: "https://bing.com/?q=",
            engine4: "https://search.brave.com/search?q=",
            engine5: "https://www.youtube.com/results?search_query="
        };
        const query = this.value;
        const resultBox = document.getElementById("resultBox");

        if (query.length > 0) {
            try {
                // Fetch autocomplete suggestions
                const suggestions = await getAutocompleteSuggestions(query);

                if (suggestions === "") {
                    hideResultBox();
                } else {
                    // Clear the result box
                    resultBox.innerHTML = "";

                    // Add suggestions to the result box
                    suggestions.forEach((suggestion, index) => {
                        const resultItem = document.createElement("div");
                        resultItem.classList.add("resultItem");
                        resultItem.textContent = suggestion;
                        resultItem.setAttribute("data-index", index);
                        resultItem.onclick = () => {
                            var resultlink = searchEngines[selectedOption] + encodeURIComponent(suggestion);
                            window.location.href = resultlink;
                        };
                        resultBox.appendChild(resultItem);
                    });

                    // Check if the dropdown of search shortcut is open
                    const dropdown = document.querySelector(".dropdown-content");

                    if (dropdown.style.display === "block") {
                        dropdown.style.display = "none";
                    }
                    showResultBox();
                }
            } catch (error) {
                // Handle the error (if needed)
            }
        } else {
            hideResultBox();
        }
    }
});

let isMouseOverResultBox = false;
// Track mouse entry and exit within the resultBox
resultBox.addEventListener("mouseenter", () => {
    isMouseOverResultBox = true;
    // Remove keyboard highlight
    const activeItem = resultBox.querySelector(".active");
    if (activeItem) {
        activeItem.classList.remove("active");
    }
});

resultBox.addEventListener("mouseleave", () => {
    isMouseOverResultBox = false;
});

document.getElementById("searchQ").addEventListener("keydown", function (e) {
    if (isMouseOverResultBox) {
        return; // Ignore keyboard events if the mouse is in the resultBox
    }
    const activeItem = resultBox.querySelector(".active");
    let currentIndex = activeItem ? parseInt(activeItem.getAttribute("data-index")) : -1;

    if (resultBox.children.length > 0) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove("active");
            }
            currentIndex = (currentIndex + 1) % resultBox.children.length;
            resultBox.children[currentIndex].classList.add("active");

            // Ensure the active item is visible within the result box
            const activeElement = resultBox.children[currentIndex];
            activeElement.scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove("active");
            }
            currentIndex = (currentIndex - 1 + resultBox.children.length) % resultBox.children.length;
            resultBox.children[currentIndex].classList.add("active");

            // Ensure the active item is visible within the result box
            const activeElement = resultBox.children[currentIndex];
            activeElement.scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && activeItem) {
            e.preventDefault();
            activeItem.click();
        }
    }
});

// Check for different browsers and return the corresponding client parameter
function getClientParam() {
    if (isFirefox) return "firefox";
    if (isOpera) return "opera";
    if (isChromiumBased) return "chrome";
    if (isSafari) return "safari";
    return "firefox"; // Default to Firefox if the browser is not recognized
}

async function getAutocompleteSuggestions(query) {
    const clientParam = getClientParam(); // Get the browser client parameter dynamically
    var selectedOption = document.querySelector('input[name="search-engine"]:checked').value;
    var searchEnginesapi = {
        engine1: `https://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(query)}`,
        engine2: `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
        engine3: `https://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(query)}`,
        engine4: `https://search.brave.com/api/suggest?q=${encodeURIComponent(query)}&rich=true&source=web`,
        engine5: `https://www.google.com/complete/search?client=${clientParam}&ds=yt&q=${encodeURIComponent(query)}`
    };
    const useproxyCheckbox = document.getElementById("useproxyCheckbox");
    let apiUrl = searchEnginesapi[selectedOption];
    if (useproxyCheckbox.checked) {
        apiUrl = `${proxyurl}/proxy?url=${encodeURIComponent(apiUrl)}`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (selectedOption === "engine4") {
            const suggestions = data[1].map(item => {
                if (item.is_entity) {
                    return `${item.q} - ${item.name} (${item.category ? item.category : "No category"})`;
                } else {
                    return item.q;
                }
            });
            return suggestions;
        } else {

            return data[1];
        }
    } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        return [];
    }
}

// Hide results when clicking outside
document.addEventListener("click", function (event) {
    const searchbar = document.getElementById("searchbar");
    // const resultBox = document.getElementById("resultBox");

    if (!searchbar.contains(event.target)) {
        hideResultBox();
    }
});
// ------------End of Search Suggestions---------------

// ------------Showing & Hiding Menu-bar ---------------
const menuButton = document.getElementById("menuButton");
const menuBar = document.getElementById("menuBar");
const menuCont = document.getElementById("menuCont");
const optCont = document.getElementById("optCont");
const overviewPage = document.getElementById("overviewPage");
const shortcutEditPage = document.getElementById("shortcutEditPage");

function pageReset() {
    optCont.scrollTop = 0;
    overviewPage.style.transform = "translateX(0)";
    overviewPage.style.opacity = "1";
    overviewPage.style.display = "block";
    shortcutEditPage.style.transform = "translateX(120%)";
    shortcutEditPage.style.opacity = "0";
    shortcutEditPage.style.display = "none";
}

const closeMenuBar = () => {
    requestAnimationFrame(() => {
        optCont.style.opacity = "0"
        optCont.style.transform = "translateX(100%)"
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "0"
            menuCont.style.transform = "translateX(100%)"
        });
    }, 14);
    setTimeout(() => {
        menuBar.style.display = "none";
    }, 555);
}

const openMenuBar = () => {
    setTimeout(() => {
        menuBar.style.display = "block";
        pageReset();
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "1"
            menuCont.style.transform = "translateX(0px)"
        });
    }, 7);
    setTimeout(() => {
        requestAnimationFrame(() => {
            optCont.style.opacity = "1"
            optCont.style.transform = "translateX(0px)"
        });
    }, 11);
}

menuButton.addEventListener("click", () => {
    if (menuBar.style.display === "none" || menuBar.style.display === "") {
        openMenuBar();
    } else {
        closeMenuBar();
    }
});

//   ----------Hiding Menu Bar--------
menuBar.addEventListener("click", (event) => {
    if (event.target === menuBar) {
        closeMenuBar()
    }
});

// Hiding Menu Bar when user click on close button --------
document.getElementById("menuCloseButton").onclick = () => {
    closeMenuBar()
}

// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {


    /* ------ Constants ------ */

    // maximum number of shortcuts allowed
    const MAX_SHORTCUTS_ALLOWED = 50;

    // minimum number of  shorcutDarkColor allowed
    const MIN_SHORTCUTS_ALLOWED = 1;

    // The new shortcut placeholder info
    const PLACEHOLDER_SHORTCUT_NAME = "New shortcut";
    const PLACEHOLDER_SHORTCUT_URL = "";

    // The placeholder for an empty shortcut
    const SHORTCUT_NAME_PLACEHOLDER = "Shortcut Name";
    const SHORTCUT_URL_PLACEHOLDER = "Shortcut URL";

    const SHORTCUT_PRESET_NAMES = ["Youtube", "Gmail", "Telegram", "WhatsApp", "Instagram", "Twitter"];
    const SHORTCUT_PRESET_URLS_AND_LOGOS = Object.freeze(new Map([["youtube.com", `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M11.6698 9.82604L9.33021 8.73437C9.12604 8.63958 8.95833 8.74583 8.95833 8.97187V11.0281C8.95833 11.2542 9.12604 11.3604 9.33021 11.2656L11.6688 10.174C11.874 10.0781 11.874 9.92188 11.6698 9.82604ZM10 0C4.47708 0 0 4.47708 0 10C0 15.5229 4.47708 20 10 20C15.5229 20 20 15.5229 20 10C20 4.47708 15.5229 0 10 0ZM10 14.0625C4.88125 14.0625 4.79167 13.601 4.79167 10C4.79167 6.39896 4.88125 5.9375 10 5.9375C15.1187 5.9375 15.2083 6.39896 15.2083 10C15.2083 13.601 15.1187 14.0625 10 14.0625Z"
                    fill="#617859"/>
            </svg>`], ["mail.google.com", `
            <svg fill="none" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	            <circle cx="12" cy="12" r="12" class="accentColor shorcutDarkColor"/>
                <g transform="translate(12, 12) scale(0.7) translate(-10, -10)">
	            <path class="bgLightTint" id="darkLightTint" fill-rule="evenodd"
                    d="m7.172 11.334l2.83 1.935l2.728-1.882l6.115 6.033q-.242.079-.512.08H1.667c-.22 0-.43-.043-.623-.12zM20 6.376v9.457c0 .247-.054.481-.15.692l-5.994-5.914zM0 6.429l6.042 4.132l-5.936 5.858A1.7 1.7 0 0 1 0 15.833zM18.333 2.5c.92 0 1.667.746 1.667 1.667v.586L9.998 11.648L0 4.81v-.643C0 3.247.746 2.5 1.667 2.5z" />
                </g>
            </svg>
            `], ["web.telegram.org", `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.64 6.8C14.49 8.38 13.84 12.22 13.51 13.99C13.37 14.74 13.09 14.99 12.83 15.02C12.25 15.07 11.81 14.64 11.25 14.27C10.37 13.69 9.87 13.33 9.02 12.77C8.03 12.12 8.67 11.76 9.24 11.18C9.39 11.03 11.95 8.7 12 8.49C12.0069 8.45819 12.006 8.42517 11.9973 8.3938C11.9886 8.36244 11.9724 8.33367 11.95 8.31C11.89 8.26 11.81 8.28 11.74 8.29C11.65 8.31 10.25 9.24 7.52 11.08C7.12 11.35 6.76 11.49 6.44 11.48C6.08 11.47 5.4 11.28 4.89 11.11C4.26 10.91 3.77 10.8 3.81 10.45C3.83 10.27 4.08 10.09 4.55 9.9C7.47 8.63 9.41 7.79 10.38 7.39C13.16 6.23 13.73 6.03 14.11 6.03C14.19 6.03 14.38 6.05 14.5 6.15C14.6 6.23 14.63 6.34 14.64 6.42C14.63 6.48 14.65 6.66 14.64 6.8Z"
                    fill="#617859"/>
            </svg>
            `], ["web.whatsapp.com", `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C8.23279 20.0029 6.49667 19.5352 4.97001 18.645L0.00401407 20L1.35601 15.032C0.465107 13.5049 -0.00293838 11.768 1.38802e-05 10C1.38802e-05 4.477 4.47701 0 10 0ZM6.59201 5.3L6.39201 5.308C6.26254 5.31589 6.13599 5.3499 6.02001 5.408C5.91153 5.46943 5.81251 5.54622 5.72601 5.636C5.60601 5.749 5.53801 5.847 5.46501 5.942C5.09514 6.4229 4.89599 7.01331 4.89901 7.62C4.90101 8.11 5.02901 8.587 5.22901 9.033C5.63801 9.935 6.31101 10.89 7.19901 11.775C7.41301 11.988 7.62301 12.202 7.84901 12.401C8.9524 13.3725 10.2673 14.073 11.689 14.447L12.257 14.534C12.442 14.544 12.627 14.53 12.813 14.521C13.1043 14.506 13.3886 14.4271 13.646 14.29C13.777 14.2225 13.9048 14.1491 14.029 14.07C14.029 14.07 14.072 14.042 14.154 13.98C14.289 13.88 14.372 13.809 14.484 13.692C14.567 13.606 14.639 13.505 14.694 13.39C14.772 13.227 14.85 12.916 14.882 12.657C14.906 12.459 14.899 12.351 14.896 12.284C14.892 12.177 14.803 12.066 14.706 12.019L14.124 11.758C14.124 11.758 13.254 11.379 12.722 11.137C12.6663 11.1127 12.6067 11.0988 12.546 11.096C12.4776 11.089 12.4085 11.0967 12.3433 11.1186C12.2781 11.1405 12.2183 11.1761 12.168 11.223C12.163 11.221 12.096 11.278 11.373 12.154C11.3315 12.2098 11.2744 12.2519 11.2088 12.2751C11.1433 12.2982 11.0723 12.3013 11.005 12.284C10.9399 12.2665 10.876 12.2445 10.814 12.218C10.69 12.166 10.647 12.146 10.562 12.11C9.98808 11.8595 9.4567 11.5211 8.98701 11.107C8.86101 10.997 8.74401 10.877 8.62401 10.761C8.2306 10.3842 7.88774 9.95801 7.60401 9.493L7.54501 9.398C7.50264 9.33416 7.46837 9.2653 7.44301 9.193C7.40501 9.046 7.50401 8.928 7.50401 8.928C7.50401 8.928 7.74701 8.662 7.86001 8.518C7.97001 8.378 8.06301 8.242 8.12301 8.145C8.24101 7.955 8.27801 7.76 8.21601 7.609C7.93601 6.925 7.64601 6.244 7.34801 5.568C7.28901 5.434 7.11401 5.338 6.95501 5.319C6.90101 5.313 6.84701 5.307 6.79301 5.303C6.65872 5.29633 6.52415 5.29766 6.39001 5.307L6.59101 5.299L6.59201 5.3Z"
                    fill="#617859"/>
            </svg>
            `], ["instagram.com", `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8.44" class="strokecolor" stroke-width="3" fill="none" />
                <g transform="translate(10, 10) scale(0.85) translate(-10, -10)">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C4.44444 0 0 4.44444 0 10C0 15.5556 4.44444 20 10 20C15.5556 20 20 15.5556 20 10C20 4.44444 15.5556 0 10 0ZM10 7.77778C11.2222 7.77778 12.2222 8.77778 12.2222 10C12.2222 11.2222 11.2222 12.2222 10 12.2222C8.77778 12.2222 7.77778 11.2222 7.77778 10C7.77778 8.77778 8.77778 7.77778 10 7.77778ZM13.1111 5.55556C13.1111 4.77778 13.7778 4.22222 14.4444 4.22222C15.1111 4.22222 15.7778 4.88889 15.7778 5.55556C15.7778 6.22222 15.2222 6.88889 14.4444 6.88889C13.6667 6.88889 13.1111 6.33333 13.1111 5.55556ZM10 17.7778C5.66667 17.7778 2.22222 14.3333 2.22222 10H5.55556C5.55556 12.4444 7.55556 14.4444 10 14.4444C12.4444 14.4444 14.4444 12.4444 14.4444 10H17.7778C17.7778 14.3333 14.3333 17.7778 10 17.7778Z" fill="#617859"/>
                </g>
            </svg>
            `], ["x.com", `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C15.5286 0 20 4.47143 20 10C20 15.5286 15.5286 20 10 20C4.47143 20 0 15.5286 0 10C0 4.47143 4.47143 0 10 0ZM8.17143 15.2714C12.6 15.2714 15.0286 11.6 15.0286 8.41429V8.1C15.5 7.75714 15.9143 7.32857 16.2286 6.84286C15.8 7.02857 15.3286 7.15714 14.8429 7.22857C15.3429 6.92857 15.7286 6.45714 15.9 5.9C15.4286 6.17143 14.9143 6.37143 14.3714 6.48571C13.9286 6.01429 13.3 5.72857 12.6143 5.72857C11.2857 5.72857 10.2 6.81429 10.2 8.14286C10.2 8.32857 10.2143 8.51429 10.2714 8.68571C8.27143 8.58571 6.48571 7.62857 5.3 6.17143C5.1 6.52857 4.97143 6.94286 4.97143 7.38571C4.97143 8.21429 5.4 8.95714 6.04286 9.38571C5.64286 9.38571 5.27143 9.27143 4.95714 9.08571V9.11429C4.95714 10.2857 5.78571 11.2571 6.88571 11.4857C6.68571 11.5429 6.47143 11.5714 6.25714 11.5714C6.1 11.5714 5.95714 11.5571 5.8 11.5286C6.1 12.4857 7 13.1857 8.04286 13.2C7.21429 13.8429 6.17143 14.2286 5.04286 14.2286C4.84286 14.2286 4.65714 14.2286 4.47143 14.2C5.52857 14.8857 6.8 15.2857 8.15714 15.2857"
                    fill="#617859"/>
            </svg>
            `]]));

    const SHORTCUT_DELETE_BUTTON_HTML = Object.freeze(`
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                    <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-12q-15.3 0-25.65-10.29Q192-716.58 192-731.79t10.35-25.71Q212.7-768 228-768h156v-12q0-15.3 10.35-25.65Q404.7-816 420-816h120q15.3 0 25.65 10.35Q576-795.3 576-780v12h156q15.3 0 25.65 10.29Q768-747.42 768-732.21t-10.35 25.71Q747.3-696 732-696h-12v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM419.79-288q15.21 0 25.71-10.35T456-324v-264q0-15.3-10.29-25.65Q435.42-624 420.21-624t-25.71 10.35Q384-603.3 384-588v264q0 15.3 10.29 25.65Q404.58-288 419.79-288Zm120 0q15.21 0 25.71-10.35T576-324v-264q0-15.3-10.29-25.65Q555.42-624 540.21-624t-25.71 10.35Q504-603.3 504-588v264q0 15.3 10.29 25.65Q524.58-288 539.79-288ZM312-696v480-480Z"/>
                </svg>
            </button>
            `);

    // const FAVICON_CANDIDATES = (hostname) => [
    //     `https://${hostname}/apple-touch-icon-180x180.png`,
    //     `https://${hostname}/apple-touch-icon-120x120.png`,
    //     `https://${hostname}/apple-touch-icon.png`
    // ];

    const GOOGLE_FAVICON_API_FALLBACK = (hostname) =>
        `https://s2.googleusercontent.com/s2/favicons?domain_url=https://${hostname}&sz=256`;

    // const FAVICON_REQUEST_TIMEOUT = 5000;

    const ADAPTIVE_ICON_CSS = `.shortcutsContainer .shortcuts .shortcutLogoContainer img {
                height: calc(100% / sqrt(2)) !important;
                width: calc(100% / sqrt(2)) !important;
                filter: grayscale(1);
                mix-blend-mode: screen;
                }`;


    /* ------ Element selectors ------ */

    const shortcuts = document.getElementById("shortcuts-section");
    const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");
    const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
    const shortcutEditField = document.getElementById("shortcutEditField");
    const adaptiveIconField = document.getElementById("adaptiveIconField");
    const adaptiveIconToggle = document.getElementById("adaptiveIconToggle");
    const shortcutEditButton = document.getElementById("shortcutEditButton");
    const backButton = document.getElementById("backButton");
    const shortcutSettingsContainer = document.getElementById("shortcutList"); // shortcuts in settings
    const shortcutsContainer = document.getElementById("shortcutsContainer"); // shortcuts in page
    const newShortcutButton = document.getElementById("newShortcutButton");
    const resetShortcutsButton = document.getElementById("resetButton");
    const iconStyle = document.getElementById("iconStyle");
    const enableDarkModeCheckbox = document.getElementById("enableDarkModeCheckbox");

    const proxybypassField = document.getElementById("proxybypassField");
    const proxyinputField = document.getElementById("proxyField");
    const useproxyCheckbox = document.getElementById("useproxyCheckbox");

    // const flexMonitor = document.getElementById("flexMonitor"); // monitors whether shortcuts have flex-wrap flexed
    // const defaultHeight = document.getElementById("defaultMonitor").clientHeight; // used to compare to previous element


    /* ------ Loading shortcuts ------ */

    /**
     * Function to load and apply all shortcut names and URLs from localStorage
     *
     * Iterates through the stored shortcuts and replaces the settings entry for the preset shortcuts with the
     * stored ones.
     * It then calls apply for all the shortcuts, to synchronize the changes settings entries with the actual shortcut
     * container.
     */

    function loadShortcuts() {
        let amount = localStorage.getItem("shortcutAmount");

        const presetAmount = SHORTCUT_PRESET_NAMES.length;

        if (amount === null) { // first time opening
            amount = presetAmount;
            localStorage.setItem("shortcutAmount", amount.toString());
        } else {
            amount = parseInt(amount);
        }

        // If we are not allowed to add more shortcuts.
        if (amount >= MAX_SHORTCUTS_ALLOWED) newShortcutButton.className = "inactive";

        // If we are not allowed to delete anymore, all delete buttons should be deactivated.
        const deleteInactive = amount <= MIN_SHORTCUTS_ALLOWED;

        for (let i = 0; i < amount; i++) {

            const name = localStorage.getItem("shortcutName" + i.toString()) || SHORTCUT_PRESET_NAMES[i];
            const url = localStorage.getItem("shortcutURL" + i.toString()) ||
                [...SHORTCUT_PRESET_URLS_AND_LOGOS.keys()][i];

            const newSettingsEntry = createShortcutSettingsEntry(name, url, deleteInactive, i);

            // Save the index for the future
            newSettingsEntry._index = i;

            shortcutSettingsContainer.appendChild(newSettingsEntry);

            applyShortcut(newSettingsEntry);
        }
    }


    /* ------ Creating shortcut elements ------ */

    /**
     * Function that creates a div to be used in the shortcut edit panel of the settings.
     *
     * @param name The name of the shortcut
     * @param url The URL of the shortcut
     * @param deleteInactive Whether the delete button should be active
     * @param i The index of the shortcut
     * @returns {HTMLDivElement} The div to be used in the settings
     */
    function createShortcutSettingsEntry(name, url, deleteInactive, i) {
        const deleteButtonContainer = document.createElement("div");
        deleteButtonContainer.className = "delete";
        deleteButtonContainer.innerHTML = SHORTCUT_DELETE_BUTTON_HTML;

        const deleteButton = deleteButtonContainer.children[0];
        if (deleteInactive) deleteButton.className = "inactive";
        deleteButton.addEventListener(
            "click",
            (e) => deleteShortcut(e.target.closest(".shortcutSettingsEntry"))
        );

        const shortcutName = document.createElement("input");
        shortcutName.className = "shortcutName";
        shortcutName.placeholder = SHORTCUT_NAME_PLACEHOLDER;
        shortcutName.value = name;
        const shortcutUrl = document.createElement("input");
        shortcutUrl.className = "URL";
        shortcutUrl.placeholder = SHORTCUT_URL_PLACEHOLDER;
        shortcutUrl.value = url;

        attachEventListenersToInputs([shortcutName, shortcutUrl]);

        const textDiv = document.createElement("div");
        textDiv.append(shortcutName, shortcutUrl);

        const entryDiv = document.createElement("div");
        entryDiv.className = "shortcutSettingsEntry";
        entryDiv.append(textDiv, deleteButtonContainer);

        entryDiv._index = i;

        return entryDiv;
    }

    /**
     * This function creates a shortcut to be used for the shortcut container on the main page.
     *
     * @param shortcutName The name of the shortcut
     * @param shortcutUrl The url of the shortcut
     * @param i The index of the shortcut
     */
    function createShortcutElement(shortcutName, shortcutUrl, i) {
        const shortcut = document.createElement("a");
        shortcut.href = shortcutUrl;

        const name = document.createElement("span");
        name.className = "shortcut-name"
        name.textContent = shortcutName;

        let icon = getCustomLogo(shortcutUrl);

        if (!icon) { // if we had to pick the fallback, attempt to get a better image in the background.
            icon = getFallbackFavicon(shortcutUrl);
            // getBestIconUrl(shortcutUrl).then((iconUrl) => icon.src = iconUrl).catch();
        }

        const iconContainer = document.createElement("div");
        iconContainer.className = "shortcutLogoContainer";
        iconContainer.appendChild(icon);

        shortcut.append(iconContainer, name);

        const shortcutContainer = document.createElement("div");
        shortcutContainer.className = "shortcuts";
        shortcutContainer.appendChild(shortcut);
        shortcutContainer._index = i;

        return shortcutContainer;
    }


    /* ------ Attaching event listeners to shortcut settings ------ */

    /**
     * Function to attach all required event listeners to the shortcut edit inputs in the settings.
     *
     * It adds three event listeners to each of the two inputs:
     * 1. Blur, to save changes to the shortcut automatically.
     * 2. Focus, to select all text in the input field when it is selected.
     * 3. Keydown, which moves the focus to the URL field when the user presses "Enter" in the name field,
     * and removes all focus to save the changes when the user presses "Enter" in the URL field.
     *
     * @param inputs a list of the two inputs these listeners should be applied to.
     */
    function attachEventListenersToInputs(inputs) {
        inputs.forEach(input => {
            // save and apply when done
            input.addEventListener("blur", (e) => {
                const shortcut = e.target.closest(".shortcutSettingsEntry");
                saveShortcut(shortcut);
                applyShortcut(shortcut);
            });
            // select all content on click:
            input.addEventListener("focus", (e) => e.target.select());
        });
        inputs[0].addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                inputs[1].focus();  // Move focus to the URL
            }
        });
        inputs[1].addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.target.blur();  // Blur the input field
            }
        });
    }


    /* ------ Saving and applying changes to shortcuts ------ */

    /**
     * This function stores a shortcut by saving its values in the settings panel to the local storage.
     *
     * @param shortcut The shortcut to be saved
     */
    function saveShortcut(shortcut) {
        const name = shortcut.querySelector("input.shortcutName").value;
        const url = shortcut.querySelector("input.URL").value;

        localStorage.setItem("shortcutName" + shortcut._index, name);
        localStorage.setItem("shortcutURL" + shortcut._index, url);
    }

    /**
     * This function applies a change that has been made in the settings panel to the real shortcut in the container
     *
     * @param shortcut The shortcut to be applied.
     */
    function applyShortcut(shortcut) {
        const shortcutName = shortcut.querySelector("input.shortcutName").value;
        let url = shortcut.querySelector("input.URL").value.trim();

        // URL validation function
        function isValidUrl(url) {
            const pattern = /^(https:\/\/|http:\/\/)?(([a-zA-Z\d-]+\.)+[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})(\/[^\s]*)?$/i;
            return pattern.test(url);
        }

        // Validate URL before normalizing
        if (!isValidUrl(url)) {
            // alert("Invalid URL. Please enter a valid URL with http or https protocol.");
            url = "https://xengshi.github.io/materialYouNewTab/docs/PageNotFound.html";
        }

        // Normalize URL if valid
        const normalizedUrl = url.startsWith('https://') || url.startsWith('http://') ? url : 'https://' + url;

        const i = shortcut._index;

        const shortcutElement = createShortcutElement(shortcutName, normalizedUrl, i);

        if (i < shortcutsContainer.children.length) {
            shortcutsContainer.replaceChild(shortcutElement, shortcutsContainer.children[i]);
        } else {
            shortcutsContainer.appendChild(shortcutElement);
        }
    }

    /* ------ Adding, deleting, and resetting shortcuts ------ */

    /**
     * This function creates a new shortcut in the settings panel, then saves and applies it.
     */
    function newShortcut() {
        const currentAmount = parseInt(localStorage.getItem("shortcutAmount"));
        const newAmount = currentAmount + 1;

        if (newAmount > MAX_SHORTCUTS_ALLOWED) return;

        // If the delete buttons were deactivated, reactivate them.
        if (currentAmount === MIN_SHORTCUTS_ALLOWED) {
            shortcutSettingsContainer.querySelectorAll(".delete button.inactive")
                .forEach(b => b.classList.remove("inactive"));
        }

        // If we have reached the max, deactivate the add button.
        if (newAmount === MAX_SHORTCUTS_ALLOWED) newShortcutButton.className = "inactive"

        // Save the new amount
        localStorage.setItem("shortcutAmount", newAmount.toString());

        // create placeholder div
        const shortcut = createShortcutSettingsEntry(
            PLACEHOLDER_SHORTCUT_NAME, PLACEHOLDER_SHORTCUT_URL, false, currentAmount
        );

        shortcutSettingsContainer.appendChild(shortcut);

        saveShortcut(shortcut);
        applyShortcut(shortcut);
    }

    /**
     * This function deletes a shortcut and shifts all indices of the following shortcuts back by one.
     *
     * @param shortcut The shortcut to be deleted.
     */
    function deleteShortcut(shortcut) {
        const newAmount = (localStorage.getItem("shortcutAmount") || 0) - 1;
        if (newAmount < MIN_SHORTCUTS_ALLOWED) return;

        const i = shortcut._index;

        // If we had previously deactivated it, reactivate the add button
        newShortcutButton.classList.remove("inactive");

        // Remove the shortcut from the DOM
        shortcut.remove();
        shortcutsContainer.removeChild(shortcutsContainer.children[i]);

        // Update localStorage by shifting all the shortcuts after the deleted one and update the index
        for (let j = i; j < newAmount; j++) {
            const shortcutEntry = shortcutSettingsContainer.children[j];
            shortcutEntry._index--;
            saveShortcut(shortcutEntry);
        }

        // Remove the last shortcut from storage, as it has now moved up
        localStorage.removeItem("shortcutName" + (newAmount));
        localStorage.removeItem("shortcutURL" + (newAmount));

        // Disable delete buttons if minimum number reached
        if (newAmount === MIN_SHORTCUTS_ALLOWED) {
            shortcutSettingsContainer.querySelectorAll(".delete button")
                .forEach(button => button.className = "inactive");
        }

        // Update the shortcutAmount in localStorage
        localStorage.setItem("shortcutAmount", (newAmount).toString());
    }

    /**
     * This function resets shortcuts to their original state, namely the presets.
     *
     * It does this by deleting all shortcut-related data, then reloading the shortcuts.
     */
    function resetShortcuts() {
        for (let i = 0; i < (localStorage.getItem("shortcutAmount") || 0); i++) {
            localStorage.removeItem("shortcutName" + i);
            localStorage.removeItem("shortcutURL" + i);
        }
        shortcutSettingsContainer.innerHTML = "";
        shortcutsContainer.innerHTML = "";
        localStorage.removeItem("shortcutAmount");
        loadShortcuts();
    }


    /* ------ Shortcut favicon handling ------ */

    /**
     * This function verifies whether a URL for a favicon is valid.
     *
     * It does this by creating an image and setting the URL as the src, as fetch would be blocked by CORS.
     *
     * @param urls the array of potential URLs of favicons
     * @returns {Promise<unknown>}
     */
    // function filterFavicon(urls) {
    //     return new Promise((resolve, reject) => {
    //         let found = false;

    //         for (const url of urls) {
    //             const img = new Image();
    //             img.referrerPolicy = "no-referrer"; // Don't send referrer data
    //             img.src = url;

    //             img.onload = () => {
    //                 if (!found) { // Make sure to resolve only once
    //                     found = true;
    //                     resolve(url);
    //                 }
    //             };
    //         }

    //         // If none of the URLs worked after all have been tried
    //         setTimeout(() => {
    //             if (!found) {
    //                 reject();
    //             }
    //         }, FAVICON_REQUEST_TIMEOUT);
    //     });
    // }

    /**
     * This function returns the url to the favicon of a website, given a URL.
     *
     * @param urlString The url of the website for which the favicon is requested
     * @return {Promise<String>} Potentially the favicon url
     */
    // async function getBestIconUrl(urlString) {
    //     const hostname = new URL(urlString).hostname;
    //     try {
    //         // Wait for filterFavicon to resolve with a valid URL
    //         return await filterFavicon(FAVICON_CANDIDATES(hostname));
    //     } catch (error) {
    //         return Promise.reject();
    //     }
    // }

    /**
     * This function uses Google's API to immediately get a favicon,
     * to be used while loading the real one and as a fallback.
     *
     * @param urlString the url of the website for which the favicon is requested
     * @returns {HTMLImageElement} The img element representing the favicon
     */
    function getFallbackFavicon(urlString) {
        const logo = document.createElement("img");
        const hostname = new URL(urlString).hostname;

        if (hostname === "github.com") {
            logo.src = "./svgs/shortcuts_icons/github-shortcut.svg";
        } else if (urlString === "https://xengshi.github.io/materialYouNewTab/docs/PageNotFound.html") {
            // Special case for invalid URLs
            logo.src = "./svgs/shortcuts_icons/invalid-url.svg";
        } else {
            logo.src = GOOGLE_FAVICON_API_FALLBACK(hostname);

            // Handle image loading error on offline scenario
            logo.onerror = () => {
                logo.src = "./svgs/shortcuts_icons/offline.svg";
            };
        }

        return logo;
    }

    /**
     * This function returns the custom logo for the url associated with a preset shortcut.
     *
     * @param url The url of the shortcut.
     * @returns {Element|null} The logo if it was found, otherwise null.
     */
    function getCustomLogo(url) {
        const html = SHORTCUT_PRESET_URLS_AND_LOGOS.get(url.replace("https://", ""));
        if (!html) return null;

        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    /* ------ Proxy ------ */

    /**
     * This function shows the proxy disclaimer.
     */
    function showProxyDisclaimer() {
        const message = translations[currentLanguage]?.ProxyDisclaimer || translations["en"].ProxyDisclaimer;

        return confirm(message);
    }

    /* ------ Event Listeners ------ */
    const searchIconContainer = document.querySelectorAll(".searchIcon");

    const showEngineContainer = () => {
        searchIconContainer[1].style.display = "none";
        searchIconContainer[0].style.display = "block";
        document.getElementById("search-with-container").style.visibility = "visible";
    }

    const hideEngineContainer = () => {
        searchIconContainer[0].style.display = "none";
        searchIconContainer[1].style.display = "block";
        document.getElementById("search-with-container").style.visibility = "hidden";
    }

    const initShortCutSwitch = (element) => {
        if (element.checked) {
            hideEngineContainer();
            localStorage.setItem("showShortcutSwitch", true)
        } else {
            showEngineContainer();
            localStorage.setItem("showShortcutSwitch", false)
        }
    }

    // ---------- Code for Hiding Search Icon And Search With Options for Search switch shortcut --------
    const element = document.getElementById("shortcut_switchcheckbox");
    element.addEventListener("change", (e) => {
        initShortCutSwitch(e.target);
    })

    // Intialize shortcut switch
    if (localStorage.getItem("showShortcutSwitch")) {
        const isShortCutSwitchEnabled = localStorage.getItem("showShortcutSwitch").toString() === "true";
        document.getElementById("shortcut_switchcheckbox").checked = isShortCutSwitchEnabled;

        if (isShortCutSwitchEnabled) {
            hideEngineContainer();
        } else if (!isShortCutSwitchEnabled) {
            showEngineContainer()
        }
    } else {
        localStorage.setItem("showShortcutSwitch", false);
    }

    initShortCutSwitch(element);

    // Add change event listeners for the checkboxes
    shortcutsCheckbox.addEventListener("change", function () {
        saveCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
        if (shortcutsCheckbox.checked) {
            shortcuts.style.display = "flex";
            saveDisplayStatus("shortcutsDisplayStatus", "flex");
            shortcutEditField.classList.remove("inactive");
            saveActiveStatus("shortcutEditField", "active");
            adaptiveIconField.classList.remove("inactive");
            saveActiveStatus("adaptiveIconField", "active");
        } else {
            shortcuts.style.display = "none";
            saveDisplayStatus("shortcutsDisplayStatus", "none");
            shortcutEditField.classList.add("inactive");
            saveActiveStatus("shortcutEditField", "inactive");
            adaptiveIconField.classList.add("inactive");
            saveActiveStatus("adaptiveIconField", "inactive");
        }
    });

    searchsuggestionscheckbox.addEventListener("change", function () {
        saveCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);
        if (searchsuggestionscheckbox.checked) {
            proxybypassField.classList.remove("inactive");
            saveActiveStatus("proxybypassField", "active");
        } else {
            proxybypassField.classList.add("inactive");
            saveActiveStatus("proxybypassField", "inactive");
            useproxyCheckbox.checked = false;
            saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
            proxyinputField.classList.add("inactive");
            saveActiveStatus("proxyinputField", "inactive");
        }
    });

    useproxyCheckbox.addEventListener("change", function () {
        if (useproxyCheckbox.checked) {
            // Show the disclaimer and check the user's choice
            const userConfirmed = showProxyDisclaimer();
            if (userConfirmed) {
                // Only enable the proxy if the user confirmed
                saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
                proxyinputField.classList.remove("inactive");
                saveActiveStatus("proxyinputField", "active");
            } else {
                // Revert the checkbox state if the user did not confirm
                useproxyCheckbox.checked = false;
            }
        } else {
            // If the checkbox is unchecked, disable the proxy
            saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
            proxyinputField.classList.add("inactive");
            saveActiveStatus("proxyinputField", "inactive");
        }
    });

    // Load checkbox state
    loadCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
    // Apply CSS based on initial state
    document.head.appendChild(iconStyle);
    iconStyle.textContent = adaptiveIconToggle.checked ? ADAPTIVE_ICON_CSS : "";

    // Add event listener for checkbox
    adaptiveIconToggle.addEventListener("change", function () {
        saveCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
        if (adaptiveIconToggle.checked) {
            iconStyle.textContent = ADAPTIVE_ICON_CSS;
        } else {
            iconStyle.textContent = "";
        }
    });

    enableDarkModeCheckbox.addEventListener("change", function () {
        saveCheckboxState("enableDarkModeCheckboxState", enableDarkModeCheckbox);
    });

    newShortcutButton.addEventListener("click", () => newShortcut());

    resetShortcutsButton.addEventListener("click", () => resetShortcuts());


    /* ------ Page Transitions & Animations ------ */

    // When clicked, open new page by sliding it in from the right.
    shortcutEditButton.onclick = () => {
        setTimeout(() => {
            shortcutEditPage.style.display = "block"
        });
        requestAnimationFrame(() => {
            overviewPage.style.transform = "translateX(-120%)"
            overviewPage.style.opacity = "0"
        });
        setTimeout(() => {
            requestAnimationFrame(() => {
                shortcutEditPage.style.transform = "translateX(0)"
                shortcutEditPage.style.opacity = "1"
            });
        }, 50);
        setTimeout(() => {
            overviewPage.style.display = "none";
        }, 650);
    }

    // Close page by sliding it away to the right.
    backButton.onclick = () => {
        setTimeout(() => {
            overviewPage.style.display = "block"
        });
        requestAnimationFrame(() => {
            shortcutEditPage.style.transform = "translateX(120%)";
            shortcutEditPage.style.opacity = "0";
        });
        setTimeout(() => {
            requestAnimationFrame(() => {
                overviewPage.style.transform = "translateX(0)";
                overviewPage.style.opacity = "1";
            });
        }, 50);
        setTimeout(() => {
            shortcutEditPage.style.display = "none";
        }, 650);
    }

    // Rotate reset button when clicked
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", () => {
        resetButton.querySelector("svg").classList.toggle("rotateResetButton");
    });

    /* ------ Loading ------ */

    // Load and apply the saved checkbox states and display statuses
    loadCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
    loadActiveStatus("shortcutEditField", shortcutEditField);
    loadActiveStatus("adaptiveIconField", adaptiveIconField);
    loadCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);
    loadCheckboxState("useproxyCheckboxState", useproxyCheckbox);
    loadActiveStatus("proxyinputField", proxyinputField);
    loadActiveStatus("proxybypassField", proxybypassField);
    loadDisplayStatus("shortcutsDisplayStatus", shortcuts);
    loadCheckboxState("enableDarkModeCheckboxState", enableDarkModeCheckbox);
    loadShortcuts();
});

document.addEventListener("keydown", function (event) {
    const searchInput = document.getElementById("searchQ");
    const searchBar = document.querySelector(".searchbar");
    if (event.key === "/" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA" && event.target.isContentEditable !== true) {
        event.preventDefault();
        searchInput.focus();
        searchBar.classList.add("active");
    }
});

//------------------------- LoadingScreen -----------------------//

function ApplyLoadingColor() {
    let LoadingScreenColor = getComputedStyle(document.body).getPropertyValue("background-color");
    localStorage.setItem("LoadingScreenColor", LoadingScreenColor);
}
