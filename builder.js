// Import your weapon data
// import WEAPON_DATA from './weaponData.json';

let WEAPON_DATA = {};

fetch('./weaponData.json')
  .then(response => response.json())
  .then(data => {
    WEAPON_DATA = data;
    init();
  })
  .catch(error => console.error('Error loading weapon data:', error));

// State
let selectedManufacturer = '';
let selectedWeaponType = '';
let selectedParts = {};
let outputMode = 'strings';

// DOM Elements
const manufacturerSelect = document.getElementById('manufacturer-select');
const weaponTypeSelect = document.getElementById('weapon-type-select');
const partsContainer = document.getElementById('parts-container');
const partsGrid = document.getElementById('parts-grid');
const outputContainer = document.getElementById('output-container');
const outputDisplay = document.getElementById('output-display');
const stringsBtn = document.getElementById('strings-btn');
const idsBtn = document.getElementById('ids-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');

// Initialize
function init() {
  populateManufacturers();
  attachEventListeners();
}

// Populate manufacturers dropdown
function populateManufacturers() {
  const manufacturers = Object.keys(WEAPON_DATA);
  manufacturers.forEach(mfg => {
    const option = document.createElement('option');
    option.value = mfg;
    option.textContent = mfg;
    manufacturerSelect.appendChild(option);
  });
}

// Attach event listeners
function attachEventListeners() {
  manufacturerSelect.addEventListener('change', handleManufacturerChange);
  weaponTypeSelect.addEventListener('change', handleWeaponTypeChange);
  stringsBtn.addEventListener('click', () => setOutputMode('strings'));
  idsBtn.addEventListener('click', () => setOutputMode('ids'));
  copyBtn.addEventListener('click', copyToClipboard);
  downloadBtn.addEventListener('click', downloadOutput);
  resetBtn.addEventListener('click', resetBuilder);
}

// Handle manufacturer selection
function handleManufacturerChange(e) {
  selectedManufacturer = e.target.value;
  selectedWeaponType = '';
  selectedParts = {};
  
  weaponTypeSelect.innerHTML = '<option value="">Select Weapon Type</option>';
  weaponTypeSelect.disabled = !selectedManufacturer;
  
  if (selectedManufacturer) {
    populateWeaponTypes();
  }
  
  partsContainer.classList.add('hidden');
  outputContainer.classList.add('hidden');
}

// Populate weapon types dropdown
function populateWeaponTypes() {
  const weaponTypes = Object.keys(WEAPON_DATA[selectedManufacturer]);
  weaponTypes.forEach(wt => {
    const option = document.createElement('option');
    option.value = wt;
    option.textContent = wt;
    weaponTypeSelect.appendChild(option);
  });
}

// Handle weapon type selection
function handleWeaponTypeChange(e) {
  selectedWeaponType = e.target.value;
  selectedParts = {};
  
  if (selectedWeaponType) {
    populateParts();
    partsContainer.classList.remove('hidden');
  } else {
    partsContainer.classList.add('hidden');
    outputContainer.classList.add('hidden');
  }
}

// Populate parts
function populateParts() {
  const parts = WEAPON_DATA[selectedManufacturer][selectedWeaponType];
  const partsByType = {};
  
  // Group parts by type
  parts.forEach(part => {
    const type = part['Part Type'];
    if (!partsByType[type]) {
      partsByType[type] = [];
    }
    partsByType[type].push(part);
  });
  
  // Clear parts grid
  partsGrid.innerHTML = '';
  
  // Part types that allow multiple selections
  const multiSelectTypes = ['Body Accessory', 'Barrel Accessory', 'Scope Accessory'];
  const maxSelections = 4;
  
  // Create dropdowns for each part type
  Object.entries(partsByType).forEach(([partType, partsList]) => {
    const partDiv = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'block text-orange-300 font-semibold mb-2';
    label.textContent = partType;
    
    // Check if this part type allows multiple selections
    const isMultiSelect = multiSelectTypes.includes(partType);
    
    if (isMultiSelect) {
      // Create container for multiple dropdowns
      const selectsContainer = document.createElement('div');
      selectsContainer.className = 'space-y-2';
      
      for (let i = 0; i < maxSelections; i++) {
        const selectWrapper = document.createElement('div');
        
        const select = document.createElement('select');
        select.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
        select.dataset.partType = partType;
        select.dataset.index = i;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Slot ${i + 1} - None`;
        select.appendChild(defaultOption);
        
        partsList.forEach(part => {
          const option = document.createElement('option');
          option.value = part.ID;
          option.textContent = part.String.split('.').pop();
          option.dataset.string = part.String;
          select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => handlePartSelection(e, partType, partsList, i));
        
        selectWrapper.appendChild(select);
        selectsContainer.appendChild(selectWrapper);
      }
      
      partDiv.appendChild(label);
      partDiv.appendChild(selectsContainer);
    } else {
      // Single selection dropdown (original behavior)
      const select = document.createElement('select');
      select.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
      select.dataset.partType = partType;
      
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'None';
      select.appendChild(defaultOption);
      
      partsList.forEach(part => {
        const option = document.createElement('option');
        option.value = part.ID;
        option.textContent = part.String.split('.').pop();
        option.dataset.string = part.String;
        select.appendChild(option);
      });
      
      select.addEventListener('change', (e) => handlePartSelection(e, partType, partsList));
      
      const stringDisplay = document.createElement('div');
      stringDisplay.className = 'mt-1 text-xs text-gray-400 truncate hidden';
      stringDisplay.dataset.partType = partType;
      
      partDiv.appendChild(label);
      partDiv.appendChild(select);
      partDiv.appendChild(stringDisplay);
    }
    
    partsGrid.appendChild(partDiv);
  });
}

// Handle part selection
function handlePartSelection(e, partType, partsList, index = null) {
  const selectedId = e.target.value;
  const multiSelectTypes = ['Body Accessory', 'Barrel Accessory', 'Scope Accessory'];
  const isMultiSelect = multiSelectTypes.includes(partType);
  
  if (isMultiSelect && index !== null) {
    // Handle multi-select part type
    if (!selectedParts[partType]) {
      selectedParts[partType] = [];
    }
    
    if (selectedId) {
      const part = partsList.find(p => p.ID === selectedId);
      selectedParts[partType][index] = part;
    } else {
      selectedParts[partType][index] = null;
    }
    
    // Clean up array - remove trailing nulls but keep nulls in between
    while (selectedParts[partType].length > 0 && 
           selectedParts[partType][selectedParts[partType].length - 1] === null) {
      selectedParts[partType].pop();
    }
    
    // If array is empty, delete the key
    if (selectedParts[partType].length === 0) {
      delete selectedParts[partType];
    }
  } else {
    // Handle single-select part type
    const stringDisplay = partsGrid.querySelector(`div[data-part-type="${partType}"]`);
    
    if (selectedId) {
      const part = partsList.find(p => p.ID === selectedId);
      selectedParts[partType] = part;
      if (stringDisplay) {
        stringDisplay.textContent = part.String;
        stringDisplay.title = part.String;
        stringDisplay.classList.remove('hidden');
      }
    } else {
      delete selectedParts[partType];
      if (stringDisplay) {
        stringDisplay.classList.add('hidden');
      }
    }
  }
  
  updateOutput();
}

// Update output display
function updateOutput() {
  if (Object.keys(selectedParts).length > 0) {
    outputContainer.classList.remove('hidden');
    const output = generateOutput();
    outputDisplay.textContent = formatOutput(output);
  } else {
    outputContainer.classList.add('hidden');
  }
}

// Generate output array
function generateOutput() {
  const output = [];
  const multiSelectTypes = ['Body Accessory', 'Barrel Accessory', 'Scope Accessory'];
  
  Object.entries(selectedParts).forEach(([partType, partData]) => {
    if (multiSelectTypes.includes(partType)) {
      // Handle multi-select parts (arrays)
      partData.forEach(part => {
        if (part) {
          if (outputMode === 'strings') {
            output.push(part.String);
          } else {
            output.push(part.ID);
          }
        }
      });
    } else {
      // Handle single-select parts (objects)
      if (outputMode === 'strings') {
        output.push(partData.String);
      } else {
        output.push(partData.ID);
      }
    }
  });
  return output;
}

// Format output based on mode
function formatOutput(output) {
  if (outputMode === 'strings') {
    return output.map(str => `"${str}"`).join(' ');
  } else {
    return output.map(id => `{${id}}`).join(' ');
  }
}

// Set output mode
function setOutputMode(mode) {
  outputMode = mode;
  
  if (mode === 'strings') {
    stringsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-orange-500 text-white';
    idsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-gray-700 text-gray-300 hover:bg-gray-600';
  } else {
    idsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-orange-500 text-white';
    stringsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-gray-700 text-gray-300 hover:bg-gray-600';
  }
  
  updateOutput();
}

// Copy to clipboard
function copyToClipboard() {
  const output = generateOutput();
  const formattedOutput = formatOutput(output);
  navigator.clipboard.writeText(formattedOutput);
  
  copyBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    Copied!
  `;
  
  setTimeout(() => {
    copyBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      Copy
    `;
  }, 2000);
}

// Download output
function downloadOutput() {
  const output = generateOutput();
  const formattedOutput = formatOutput(output);
  const blob = new Blob([formattedOutput], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outputMode === 'strings' ? 'weapon-strings.txt' : 'weapon-ids.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Reset builder
function resetBuilder() {
  selectedManufacturer = '';
  selectedWeaponType = '';
  selectedParts = {};
  
  manufacturerSelect.value = '';
  weaponTypeSelect.value = '';
  weaponTypeSelect.disabled = true;
  weaponTypeSelect.innerHTML = '<option value="">Select Weapon Type</option>';
  
  partsContainer.classList.add('hidden');
  outputContainer.classList.add('hidden');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);