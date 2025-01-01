let inputEditor, outputEditor;
const uploadButton = document.getElementById('uploadButton');
const downloadButton = document.getElementById('downloadButton');
const copyButton = document.getElementById('copyButton');
const themeToggleButton = document.getElementById('themeToggle');
const themeSelect = document.getElementById('themeSelect');
const findInputButton = document.getElementById('findInputButton');
const findOutputButton = document.getElementById('findOutputButton');
const replaceInputButton = document.getElementById('replaceInputButton');
const replaceOutputButton = document.getElementById('replaceOutputButton');
const uploadFileInput = document.getElementById('uploadFile');
const validateButton = document.getElementById('validateButton');

function initializeAce() {
  inputEditor = ace.edit('jsonInput');
  inputEditor.setTheme('ace/theme/github'); // Default light theme
  inputEditor.session.setMode('ace/mode/json');
  inputEditor.setOptions({
    showLineNumbers: true,
    printMargin: false,
    wrap: true,
    tabSize: 2,
  });

  outputEditor = ace.edit('jsonOutput');
  outputEditor.setTheme('ace/theme/github'); // Default light theme
  outputEditor.session.setMode('ace/mode/json');
  outputEditor.setOptions({
    showLineNumbers: true,
    printMargin: false,
    wrap: true,
    tabSize: 2,
  });
}

// Set the theme for both page and Ace editors
function setTheme(pageTheme, aceTheme) {
  const isDark = pageTheme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  themeToggleButton.textContent = isDark ? '🌞' : '🌙';
  inputEditor.setTheme(`ace/theme/${aceTheme}`);
  outputEditor.setTheme(`ace/theme/${aceTheme}`);
  themeSelect.value = aceTheme; // Set the value of the dropdown to the selected editor theme
  localStorage.setItem('pageTheme', pageTheme); // Store page theme
  localStorage.setItem('editorTheme', aceTheme); // Store Ace editor theme
}

// Store the input JSON in localStorage
function storeJSON() {
  const inputJSON = inputEditor.getValue();
  localStorage.setItem('jsonInput', inputJSON); // Store input JSON
}

// Check and apply themes and JSON content from localStorage or set defaults
function checkAndApplyThemeAndJSON() {
  const savedPageTheme = localStorage.getItem('pageTheme') || 'light'; // Default to 'light' if no theme saved
  const savedEditorTheme = localStorage.getItem('editorTheme') || 'github'; // Default to 'github' if no editor theme saved
  setTheme(savedPageTheme, savedEditorTheme); // Apply both themes

  const savedJsonInput = localStorage.getItem('jsonInput') || ''; // Default to empty if no input JSON
  if (savedJsonInput.trim()) {
    inputEditor.setValue(savedJsonInput, -1); // Set saved input JSON in the editor
    formatJSON(); // Format the JSON input on initial load
  }
}

// Toggle page and Ace editor theme and store preferences in localStorage
themeToggleButton.addEventListener('click', () => {
  const currentPageTheme = document.body.classList.contains('dark-theme')
    ? 'dark'
    : 'light';
  const newPageTheme = currentPageTheme === 'dark' ? 'light' : 'dark';
  const newEditorTheme = newPageTheme === 'dark' ? 'monokai' : 'github'; // Change editor theme based on page theme
  setTheme(newPageTheme, newEditorTheme); // Set both page and editor themes
});

// Change Ace Editor theme based on selected dropdown and store selection
themeSelect.addEventListener('change', (event) => {
  const selectedTheme = event.target.value;
  inputEditor.setTheme(`ace/theme/${selectedTheme}`);
  outputEditor.setTheme(`ace/theme/${selectedTheme}`);
  localStorage.setItem('editorTheme', selectedTheme);
});

// Store JSON when the user interacts (e.g., before page unload)
window.addEventListener('beforeunload', storeJSON);

// Initialize Ace editor and check for saved themes and JSON on page load
initializeAce();
checkAndApplyThemeAndJSON();

// Handle file upload by clicking the Upload JSON button
uploadButton.addEventListener('click', () => {
  uploadFileInput.click();
});
// Automatically format the JSON when the input changes
inputEditor.session.on('change', function () {
  formatJSON();
});
// Handle file upload (once a file is selected)
uploadFileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === 'application/json') {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      try {
        inputEditor.setValue(content);
        const parsedJSON = JSON.parse(content);
        const formattedJSON = JSON.stringify(parsedJSON, null, 4);
        outputEditor.setValue(formattedJSON);
      } catch (error) {
        outputEditor.setValue('Invalid JSON');
      }
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid JSON file.');
  }
}

// Format JSON (pretty print)
function formatJSON() {
  const input = inputEditor.getValue();
  try {
    const formatted = JSON.stringify(JSON.parse(input), null, 4);
    outputEditor.setValue(formatted);
  } catch (error) {
    outputEditor.setValue('Invalid JSON');
  }
}

// Handle JSON download
downloadButton.addEventListener('click', () => {
  const jsonData = outputEditor.getValue();
  try {
    const jsonObject = JSON.parse(jsonData);
    const blob = new Blob([JSON.stringify(jsonObject, null, 4)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `formatted${Date.now()}.json`;
    link.click();
  } catch (error) {
    alert('Invalid JSON. Please format your JSON before downloading.');
  }
});

// Handle JSON copy to clipboard
copyButton.addEventListener('click', () => {
  const jsonData = outputEditor.getValue();
  navigator.clipboard
    .writeText(jsonData)
    .then(() => {
      copyButton.textContent = 'Copied ✔';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    })
    .catch(() => {
      alert('Failed to copy to clipboard.');
    });
});

// Search functionality for input editor
findInputButton.addEventListener('click', () => {
  inputEditor.execCommand('find');
});

// Search functionality for output editor
findOutputButton.addEventListener('click', () => {
  outputEditor.execCommand('find');
});

// Replace functionality for input editor
replaceInputButton.addEventListener('click', () => {
  inputEditor.execCommand('replace');
});

// Replace functionality for output editor
replaceOutputButton.addEventListener('click', () => {
  outputEditor.execCommand('replace');
});

// Format Input JSON function (to be used for the "Format" button in input editor)
function formatInputJSON() {
  const input = inputEditor.getValue(); // Get input JSON value
  try {
    const formatted = JSON.stringify(JSON.parse(input), null, 4); // Format the input
    inputEditor.setValue(formatted); // Set formatted JSON back in the input editor
  } catch (error) {
    inputEditor.setValue('Invalid JSON'); // If invalid, show error message
  }
}

// Format Output JSON function (to be used for the "Format" button in output editor)
function formatOutputJSON() {
  const output = outputEditor.getValue(); // Get output JSON value
  try {
    const formatted = JSON.stringify(JSON.parse(output), null, 4); // Format the output
    outputEditor.setValue(formatted); // Set formatted JSON back in the output editor
  } catch (error) {
    outputEditor.setValue('Invalid JSON'); // If invalid, show error message
  }
}

// Handle Format for input JSON (from input editor)
document.getElementById('formatInputButton').addEventListener('click', () => {
  formatInputJSON(); // Call format function to format the JSON in input editor
});

// Handle Format for output JSON (from output editor)
document.getElementById('formatOutputButton').addEventListener('click', () => {
  formatOutputJSON(); // Call format function to format the JSON in output editor
});
// Minify Input JSON function (to be used for the "Minify" button in input editor)
function minifyInputJSON() {
  const input = inputEditor.getValue(); // Get input JSON value
  try {
    const minified = JSON.stringify(JSON.parse(input)); // Minify the input (remove spaces)
    inputEditor.setValue(minified); // Set minified JSON back in the input editor
  } catch (error) {
    inputEditor.setValue('Invalid JSON'); // If invalid, show error message
  }
}

// Minify Output JSON function (to be used for the "Minify" button in output editor)
function minifyOutputJSON() {
  const output = outputEditor.getValue(); // Get output JSON value
  try {
    const minified = JSON.stringify(JSON.parse(output)); // Minify the output (remove spaces)
    outputEditor.setValue(minified); // Set minified JSON back in the output editor
  } catch (error) {
    outputEditor.setValue('Invalid JSON'); // If invalid, show error message
  }
}

// Handle Minify for input JSON (from input editor)
document.getElementById('minifyInputButton').addEventListener('click', () => {
  minifyInputJSON(); // Call minify function to minify the JSON in input editor
});

// Handle Minify for output JSON (from output editor)
document.getElementById('minifyOutputButton').addEventListener('click', () => {
  minifyOutputJSON(); // Call minify function to minify the JSON in output editor
});

// Validate JSON from the input editor and display the result in the output editor

validateButton.addEventListener('click', () => {
  const input = inputEditor.getValue();
  try {
    const parsedJSON = JSON.parse(input); // Validate JSON
    const formattedJSON = JSON.stringify(parsedJSON, null, 4); // Optional: Format JSON
    outputEditor.setValue(formattedJSON);
    validateButton.textContent = 'Valid ✔';
    setTimeout(() => {
      validateButton.textContent = 'Validate';
    }, 2000);
  } catch (error) {
    outputEditor.setValue('Invalid JSON');
    validateButton.textContent = 'Invalid ✘';
    setTimeout(() => {
      validateButton.textContent = 'Validate';
    }, 2000);
  }
});

// Set up the "Fold All" button for the Output Editor
document
  .getElementById('foldOutputButton')
  .addEventListener('click', function () {
    outputEditor.session.foldAll(); // Fold all objects/arrays in the output editor
  });
