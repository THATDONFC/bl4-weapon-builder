
const API_URL = "https://borderlands4-deserializer.nicnl.com/api/v1/reserialize";
const copySerialBtn = document.getElementById('copy-serial-btn');
const convertBtn = document.getElementById('convert-serial-btn');
// const outputDisplay = document.getElementById('output-display');
const serializedOutput = document.getElementById('serialized-output');

function outputCode() {
  const el = document.getElementById('output-display');
  return (el && el.textContent ? el.textContent : "").trim();
}

function normalizeDeserialized(s) {
  if (!s)
    return "";
  return s.endsWith("|") ? s : (s + "|");
}

async function callSerialize() {
  const raw = outputCode();
  const deserialized = normalizeDeserialized(raw);

  serializedOutput.textContent = "";

  if (!deserialized) {
    serializedOutput.textContent = "No deserialized string available.";
    return;
  }

  convertBtn && (convertBtn.disabled = true,
  convertBtn.textContent = "Working…");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deserialized
      })
    });
    if (!res.ok) {
      const t = await res.text().catch( () => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}${t ? " — " + t : ""}`);
    }
    const data = await res.json();
    serializedOutput.textContent = data.serial_b85 || "";
  } catch (err) {
    serializedOutput.textContent = "Error: " + (err && err.message ? err.message : err);
  } finally {
    if (convertBtn) {
      convertBtn.disabled = false;
      convertBtn.textContent = "Convert Serial";
    }
  }
}
function copy(text) {
  if (!text)
    return;
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {}

  copySerialBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    Copied!
    `;
  
  setTimeout(() => {
    copySerialBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
    Copy Serial
    `;
  }, 2000);
}

convertBtn && convertBtn.addEventListener("click", callSerialize);
copySerialBtn && copySerialBtn.addEventListener("click", () => copy((serializedOutput.textContent || "").trim()));

function debounce(fn, delay) {
  let timeoutID;
  return function(...args) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function observeOutputDisplay() {
  const codeEl = document.getElementById('output-display');
  if (!codeEl) return;
  const run = debounce( () => callSerialize(), 600);
  const observer = new MutationObserver(run);
  observer.observe(codeEl, { childList: true, characterData: true, subtree: true });
  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    observeOutputDisplay();
  });
} else {
  observeOutputDisplay();
}