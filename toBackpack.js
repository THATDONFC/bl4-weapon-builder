let serials = [];
let backpack = '';

// DOM Elements
const storeSerialBtn = document.getElementById('store-serial-btn');
const showBackpackBtn = document.getElementById('show-backpack-btn');
const clearSerialsBtn = document.getElementById('clear-serials-btn');

const backpackContainer = document.getElementById('backpack-container');
const backpackCreateToggle = document.getElementById('enable-backpack-toggle');
const backpackStatusDisplay = document.getElementById('backpack-status');

// TODO: Add functionality to download the backpack in a backpack.txt file using the existing download button

// Store current serial in serials array
function storeSerial(serial) {
  // if (serial[0] != '@') return;
  try {
    if (serial[0] != '@') {
      throw new Error("Invalid serial format.");
    }
    serials.push(serial);
    backpackStatusDisplay.textContent = `Serial stored`;
    setTimeout(() => {
      backpackStatusDisplay.textContent = `Total stored serials: ${serials.length}`;
    }, 500);
  } catch (err) {
    console.error("Error storing serial:", err);
  }
}

// Clear all serials from serials array
function clearSerials() {
  serials = [];
  backpackStatusDisplay.textContent = `All stored serials cleared.`;
}

// Create backpack file content from stored serials
function createBackpack(serials) {
  if (backpack) clearBackpack();
  let output = '';

  for (let i = 0; i < serials.length; i++) {
    let serial = serials[i];
    if (serial.length === 0) continue;

    let slotCounter = i;

    output += "        slot_" + slotCounter + ":\n";
    output += "          serial: '" + serial + "'\n";
  }
  backpack = output;
  if (!backpack) {
    backpackStatusDisplay.textContent = `No serials to create backpack.`;
  } else {
    backpackStatusDisplay.textContent = `Backpack created with ${serials.length} serial(s).`;
  }
  
}

// Clear backpack content
function clearBackpack() {
  backpack = '';
}

// Show backpack content in new window
function showBackpack() {
  // if (!backpack) {
  //   if (serials.length > 0) {
  //     createBackpack(serials); 
  //     return;
  //   }
  //   backpackStatusDisplay.textContent = `No serials to create backpack.`;
  //   return;
  // }
  openBackpackInNewTab();
}

// Check if the body of the page is empty
function isBodyEmpty(page) {
  return page.document.body.textContent.trim() === '';
}

// Open backpack content in a new tab
function openBackpackInNewTab() {
  const backpackWindow = window.open("", "Backpack", "width=600,height=600,scrollbars=yes");

  if (!isBodyEmpty(backpackWindow)) {
    backpackWindow.document.body.innerHTML = '';
  }

  const newPre = backpackWindow.document.createElement('pre');
  const newBackpackContent = backpackWindow.document.createTextNode(backpack);

  newPre.appendChild(newBackpackContent);
  backpackWindow.document.body.appendChild(newPre);
  if (!backpack) backpackWindow.close();
  console.log(backpack);
}

// Toggle backpack creator visibility
backpackCreateToggle && backpackCreateToggle.addEventListener('change', (event) => {
  const isEnabled = event.target.checked;
  if (isEnabled) {
    backpackContainer.classList.remove('hidden');
  } else {
    backpackContainer.classList.add('hidden');
  }
});

// Event listeners for backpack buttons
storeSerialBtn && storeSerialBtn.addEventListener("click", () => {
  const serial = (document.getElementById('serialized-output').textContent || "").trim();
  storeSerial(serial);
});

clearSerialsBtn && clearSerialsBtn.addEventListener("click", () => {
  clearSerials();
});

showBackpackBtn && showBackpackBtn.addEventListener("click", () => {
  createBackpack(serials);
  showBackpack();
});