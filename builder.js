let WEAPON_DATA = {};
let RARITY_DATA = {};
let ELEMENT_DATA = {};

Promise.all([
  fetch('./weaponData.json').then(response => response.json()),
  fetch('./rarity.json').then(response => response.json()),
  fetch('./elementData.json').then(response => response.json())
])
  .then(([weaponData, rarityData, elementData]) => {
    WEAPON_DATA = weaponData;
    RARITY_DATA = rarityData;
    ELEMENT_DATA = elementData;
    init();
  })
  .catch(error => console.error('Error loading data:', error));

// State
let selectedManufacturer = '';
let selectedWeaponType = '';
let selectedParts = {};
let selectedRarity = null;
let selectedElements = [];
let baseValue = '';
let outputMode = 'ids';

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
  selectedRarity = null;
  
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
  selectedRarity = null;
  selectedElements = [];
  
  if (selectedWeaponType) {
    populateParts();
    populateRarity();
    populateElements();
    partsContainer.classList.remove('hidden');
  } else {
    partsContainer.classList.add('hidden');
    outputContainer.classList.add('hidden');
  }
}

// Populate rarity selection
function populateRarity() {
  const rarityData = RARITY_DATA[selectedManufacturer]?.[selectedWeaponType];
  if (!rarityData) return;
  
  const rarities = rarityData.Rarity;
  
  // Remove existing rarity section if it exists
  const existingRaritySection = document.getElementById('rarity-section');
  if (existingRaritySection) {
    existingRaritySection.remove();
  }
  
  // Create rarity section
  const raritySection = document.createElement('div');
  raritySection.className = 'col-span-full bg-gray-900 border-2 border-orange-400 rounded p-4 mb-4';
  raritySection.id = 'rarity-section';
  
  // Commented out to remove 'Weapon Rarity' title
  // const rarityTitle = document.createElement('h4');
  // rarityTitle.className = 'text-orange-400 font-bold mb-3';
  // rarityTitle.textContent = 'Weapon Rarity';
  // raritySection.appendChild(rarityTitle);
  
  const rarityGrid = document.createElement('div');
  rarityGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  
  // Rarity dropdown
  const rarityDiv = document.createElement('div');
  const rarityLabel = document.createElement('label');
  rarityLabel.className = 'block text-orange-300 font-semibold mb-2';
  rarityLabel.textContent = 'Weapon Rarity';
  
  const raritySelect = document.createElement('select');
  raritySelect.id = 'rarity-select';
  raritySelect.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
  
  const defaultRarityOption = document.createElement('option');
  defaultRarityOption.value = '';
  defaultRarityOption.textContent = 'Select Rarity';
  raritySelect.appendChild(defaultRarityOption);
  
  // Group rarities by type
  const regularRarities = [];
  const legendaryRarities = [];
  
  rarities.forEach(rarity => {
    if (rarity.Legendary) {
      legendaryRarities.push(rarity);
    } else {
      regularRarities.push(rarity);
    }
  });
  
  // Add regular rarities
  regularRarities.forEach(rarity => {
    const option = document.createElement('option');
    option.value = rarity.ID;
    option.dataset.string = rarity.String;
    option.dataset.id = rarity.ID;
    option.dataset.isLegendary = 'false';
    
    const rarityName = getRarityName(rarity.String);
    option.textContent = rarityName;
    raritySelect.appendChild(option);
  });
  
  // Add legendary option
  if (legendaryRarities.length > 0) {
    const legendaryOption = document.createElement('option');
    legendaryOption.value = 'legendary';
    legendaryOption.dataset.isLegendary = 'true';
    legendaryOption.textContent = 'Legendary';
    raritySelect.appendChild(legendaryOption);
  }
  
  raritySelect.addEventListener('change', handleRarityChange);
  
  rarityDiv.appendChild(rarityLabel);
  rarityDiv.appendChild(raritySelect);
  rarityGrid.appendChild(rarityDiv);
  
  // Legendary dropdown
  const legendaryDiv = document.createElement('div');
  legendaryDiv.id = 'legendary-container';
  legendaryDiv.className = 'hidden';
  
  const legendaryLabel = document.createElement('label');
  legendaryLabel.className = 'block text-orange-300 font-semibold mb-2';
  legendaryLabel.textContent = 'Legendary Type';
  
  const legendarySelect = document.createElement('select');
  legendarySelect.id = 'legendary-select';
  legendarySelect.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
  
  const defaultLegendaryOption = document.createElement('option');
  defaultLegendaryOption.value = '';
  defaultLegendaryOption.textContent = 'Select Legendary';
  legendarySelect.appendChild(defaultLegendaryOption);
  
  legendaryRarities.forEach(legendary => {
    const option = document.createElement('option');
    option.value = legendary.ID;
    option.dataset.string = legendary.String;
    option.dataset.id = legendary.ID;
    option.textContent = legendary.Legendary;
    legendarySelect.appendChild(option);
  });
  
  legendarySelect.addEventListener('change', handleLegendaryChange);
  
  legendaryDiv.appendChild(legendaryLabel);
  legendaryDiv.appendChild(legendarySelect);
  rarityGrid.appendChild(legendaryDiv);
  
  raritySection.appendChild(rarityGrid);
  partsGrid.prepend(raritySection);
}

// Populate element selection
function populateElements() {
  // Remove existing element section if it exists
  const existingElementSection = document.getElementById('element-section');
  if (existingElementSection) {
    existingElementSection.remove();
  }
  
  // Create element section
  const elementSection = document.createElement('div');
  elementSection.className = 'col-span-full bg-gray-900 border-2 border-orange-400 rounded p-4 mb-4';
  elementSection.id = 'element-section';
  
  const elementGrid = document.createElement('div');
  elementGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  
  // First element dropdown
  const element1Div = document.createElement('div');
  const element1Label = document.createElement('label');
  element1Label.className = 'block text-orange-300 font-semibold mb-2';
  element1Label.textContent = 'Element 1';
  
  const element1Select = document.createElement('select');
  element1Select.id = 'element1-select';
  element1Select.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
  
  const defaultElement1Option = document.createElement('option');
  defaultElement1Option.value = '';
  defaultElement1Option.textContent = 'None';
  element1Select.appendChild(defaultElement1Option);
  
  // Add single elements only
  const singleElements = ['Corrosive', 'Cryo', 'Fire', 'Radiation', 'Shock'];
  singleElements.forEach(elementName => {
    const elementData = ELEMENT_DATA['Weapon Elements'][elementName];
    const option = document.createElement('option');
    option.value = elementName;
    option.dataset.string = elementData.String;
    option.dataset.id = elementData.ID;
    option.textContent = elementName;
    element1Select.appendChild(option);
  });
  
  element1Select.addEventListener('change', handleElement1Change);
  
  element1Div.appendChild(element1Label);
  element1Div.appendChild(element1Select);
  elementGrid.appendChild(element1Div);
  
  // Second element dropdown (initially hidden)
  const element2Div = document.createElement('div');
  element2Div.id = 'element2-container';
  element2Div.className = 'hidden';
  
  const element2Label = document.createElement('label');
  element2Label.className = 'block text-orange-300 font-semibold mb-2';
  element2Label.textContent = 'Element 2';
  
  const element2Select = document.createElement('select');
  element2Select.id = 'element2-select';
  element2Select.className = 'w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400';
  
  element2Select.addEventListener('change', handleElement2Change);
  
  element2Div.appendChild(element2Label);
  element2Div.appendChild(element2Select);
  elementGrid.appendChild(element2Div);
  
  elementSection.appendChild(elementGrid);
  
  // Insert after rarity section
  const raritySection = document.getElementById('rarity-section');
  if (raritySection) {
    raritySection.parentNode.insertBefore(elementSection, raritySection.nextSibling);
  } else {
    partsGrid.prepend(elementSection);
  }
}

// Handle element 1 change
function handleElement1Change(e) {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const element2Container = document.getElementById('element2-container');
  const element2Select = document.getElementById('element2-select');
  
  if (selectedOption.value) {
    // Store first element
    selectedElements = [{
      name: selectedOption.value,
      ID: selectedOption.dataset.id,
      String: selectedOption.dataset.string
    }];
    
    // Show second element dropdown and populate it
    element2Container.classList.remove('hidden');
    element2Select.innerHTML = '<option value="">None</option>';
    
    const firstElement = selectedOption.value;
    const singleElements = ['Corrosive', 'Cryo', 'Fire', 'Radiation', 'Shock'];
    
    singleElements.forEach(elementName => {
      if (elementName !== firstElement) {
        const option = document.createElement('option');
        option.value = elementName;
        option.textContent = elementName;
        element2Select.appendChild(option);
      }
    });
  } else {
    // No first element selected
    selectedElements = [];
    element2Container.classList.add('hidden');
  }
  
  updateOutput();
}

// Handle element 2 change
function handleElement2Change(e) {
  const selectedOption = e.target.options[e.target.selectedIndex];
  
  if (selectedOption.value && selectedElements.length > 0) {
    const firstElement = selectedElements[0].name;
    const secondElement = selectedOption.value;
    console.log(firstElement);
    console.log(secondElement);
    const combinedKey = `${firstElement} - ${secondElement}`;
    console.log(combinedKey);
    
    // Determine if MFR is Maliwan
    const isMaliwan = selectedManufacturer === 'Maliwan';
    const elementList = isMaliwan ? ELEMENT_DATA['Maliwan Elements'] : ELEMENT_DATA['Weapon Elements'];
    
    const combinedData = elementList[combinedKey];
    
    if (combinedData) {
      // Add the second element if one is selected
      selectedElements.push({
        name: combinedKey,
        ID: combinedData.ID,
        String: combinedData.String
      });
      // Replace the first element with the combined element
      // selectedElements = [{
      //   name: combinedKey,
      //   ID: combinedData.ID,
      //   String: combinedData.String
      // }];
    }
    console.log(selectedElements);
  } else if (selectedElements.length > 0) {
    // Reset to just first element
    const element1Select = document.getElementById('element1-select');
    const selectedOption1 = element1Select.options[element1Select.selectedIndex];
    selectedElements = [{
      name: selectedOption1.value,
      ID: selectedOption1.dataset.id,
      String: selectedOption1.dataset.string
    }];
  }
  
  updateOutput();
}

// Get rarity name from string
function getRarityName(rarityString) {
  const parts = rarityString.split('_');
  const rarityNames = {
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'epic': 'Epic'
  };
  
  for (let part of parts) {
    if (rarityNames[part]) {
      return rarityNames[part];
    }
  }
  return 'Unknown';
}

// Handle rarity change
function handleRarityChange(e) {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const isLegendary = selectedOption.dataset.isLegendary === 'true';
  
  const legendaryContainer = document.getElementById('legendary-container');
  const legendarySelect = document.getElementById('legendary-select');
  
  if (isLegendary) {
    // Show legendary dropdown
    legendaryContainer.classList.remove('hidden');
    selectedRarity = null;
    legendarySelect.value = '';
  } else if (selectedOption.value) {
    // Regular rarity selected
    selectedRarity = {
      ID: selectedOption.dataset.id,
      String: selectedOption.dataset.string
    };
    legendaryContainer.classList.add('hidden');
  } else {
    // No rarity selected
    selectedRarity = null;
    legendaryContainer.classList.add('hidden');
  }
  generateBase();
  updateOutput();
}

// Handle legendary change
function handleLegendaryChange(e) {
  const selectedOption = e.target.options[e.target.selectedIndex];
  
  if (selectedOption.value) {
    selectedRarity = {
      ID: selectedOption.dataset.id,
      String: selectedOption.dataset.string
    };
  } else {
    selectedRarity = null;
  }
  
  generateBase();
  updateOutput();
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
  console.log(partsByType);
  
  // Clear parts grid
  partsGrid.innerHTML = '';
  
  // Part types that allow multiple selections
  const multiSelectTypes = ['Body Accessory', 'Barrel Accessory', 'Scope Accessory'];
  const maxSelections = 4;
  
  // Define the desired order for part types
  const partTypeOrder = [
    'Body',
    'Body Accessory',
    'Barrel',
    'Barrel Accessory',
    'Magazine',
    'Stat Modifier',
    'Grip',
    'Foregrip',
    'Manufacturer Part',
    'Scope',
    'Scope Accessory',
    'Underbarrel',
    'Underbarrel Accessory'
  ];
  
  // Create dropdowns for each part type in the specified order
  partTypeOrder.forEach(partType => {
    const partsList = partsByType[partType];
    if (!partsList) return; // Skip if this weapon doesn't have this part type
    
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
      // Single selection dropdown
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
  
  // generateBase();
  updateOutput();
}

// Update output display
function updateOutput() {
  if (Object.keys(selectedParts).length > 0 || selectedRarity) {
    outputContainer.classList.remove('hidden');
    const output = generateOutput();
    outputDisplay.textContent = formatOutput(output) + "|";
  } else {
    outputContainer.classList.add('hidden');
  }
}

// Get Type ID from rarity data
function getTypeID() {
  const rarityData = RARITY_DATA[selectedManufacturer]?.[selectedWeaponType];
  return rarityData?.['Type ID'] || null;
}

// Generate random int for base
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

// Generate base which includes level and other mandatory values
function generateBase() {
  const base = "0, 1, 50| 2, " + getRandomInt(1,9999) + "||";
  baseValue = base;
}

// Generate output array
function generateOutput() {
  const output = [];
  const multiSelectTypes = ['Body Accessory', 'Barrel Accessory', 'Scope Accessory'];
  
  // Add Type ID first
  const typeID = getTypeID();
  if (typeID) {
    output.push({ type: 'typeId', value: typeID });    
  }
  
  // Add base
  output.push({ type: 'base', value: baseValue });

  // Add rarity
  if (selectedRarity) {
    if (outputMode === 'strings') {
      output.push({ type: 'rarity', value: selectedRarity.String });
    } else {
      output.push({ type: 'rarity', value: selectedRarity.ID });
    }
  }
  
  // Add elements
  selectedElements.forEach(element => {
    if (outputMode === 'strings') {
      output.push({ type: 'element', value: element.String });
    } else {
      output.push({ type: 'element', value: element.ID });
    }
  });
  
  // Add parts
  Object.entries(selectedParts).forEach(([partType, partData]) => {
    if (multiSelectTypes.includes(partType)) {
      // Handle multi-select parts (arrays)
      partData.forEach(part => {
        if (part) {
          if (outputMode === 'strings') {
            output.push({ type: 'part', value: part.String });
          } else {
            output.push({ type: 'part', value: part.ID });
          }
        }
      });
    } else {
      // Handle single-select parts (objects)
      if (outputMode === 'strings') {
        output.push({ type: 'part', value: partData.String });
      } else {
        output.push({ type: 'part', value: partData.ID });
      }
    }
  });
  
  return output;
}

// Format output based on mode
function formatOutput(output) {
  if (outputMode === 'strings') {
    return output.map(item => {
      if (item.type === 'typeId') {
        return `${item.value}` + ',';
      } else if (item.type === 'base') {
        return `${item.value}`;
      } else if (item.type === 'rarity' || item.type === 'element') {
        return `"${item.value}"`;
      } else {
        return `"${item.value}"`;
      }
    }).join(' ');
  } else {
    return output.map(item => {
      if (item.type === 'typeId') {
        return `${item.value}` + ',';
      } else if (item.type === 'base') {
        return `${item.value}`;
      } else {
        return `{${item.value}}`;
      }
    }).join(' ');
  }
}

// Set output mode
function setOutputMode(mode) {
  outputMode = mode;
  
  if (mode === 'ids') {
    idsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-orange-500 text-white';
    stringsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-gray-700 text-gray-300 hover:bg-gray-600';
  } else {
    stringsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-orange-500 text-white';
    idsBtn.className = 'px-4 py-2 rounded font-semibold transition bg-gray-700 text-gray-300 hover:bg-gray-600';
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
  selectedRarity = null;
  selectedElements = []; // Add this
  
  manufacturerSelect.value = '';
  weaponTypeSelect.value = '';
  weaponTypeSelect.disabled = true;
  weaponTypeSelect.innerHTML = '<option value="">Select Weapon Type</option>';
  
  partsContainer.classList.add('hidden');
  outputContainer.classList.add('hidden');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);