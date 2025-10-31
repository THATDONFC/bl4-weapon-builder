import React, { useState } from 'react';
import { Download, Copy, Check, Plus, Trash2 } from 'lucide-react';

const WEAPON_DATA = {
  "Daedalus": {
    "Assault Rifle": [
      {
        "ID": "1",
        "Part Type": "Body",
        "String": "DAD_AR.part_body"
      }
    ]
  }
};

const PART_LIMITS = {
  "Body": 4,
  "Barrel Accessory": 4,
  "Scope Accessory": 4
};

export default function WeaponBuilder() {
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedWeaponType, setSelectedWeaponType] = useState('');
  const [selectedParts, setSelectedParts] = useState({});
  const [outputMode, setOutputMode] = useState('strings');
  const [copied, setCopied] = useState(false);

  const getManufacturers = () => {
    return Object.keys(WEAPON_DATA);
  };

  const getWeaponTypes = () => {
    if (!selectedManufacturer || !WEAPON_DATA[selectedManufacturer]) return [];
    return Object.keys(WEAPON_DATA[selectedManufacturer]);
  };

  const getParts = () => {
    if (!selectedManufacturer || !selectedWeaponType) return [];
    return WEAPON_DATA[selectedManufacturer][selectedWeaponType] || [];
  };

  const getPartsByType = () => {
    const parts = getParts();
    const grouped = {};
    
    parts.forEach(part => {
      const type = part['Part Type'];
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(part);
    });
    
    return grouped;
  };

  const getPartLimit = (partType) => {
    return PART_LIMITS[partType] || 1;
  };

  const addPartSlot = (partType) => {
    const currentParts = selectedParts[partType] || [];
    const limit = getPartLimit(partType);
    
    if (currentParts.length < limit) {
      setSelectedParts(prev => ({
        ...prev,
        [partType]: [...currentParts, null]
      }));
    }
  };

  const removePartSlot = (partType, index) => {
    const currentParts = selectedParts[partType] || [];
    const newParts = currentParts.filter((_, i) => i !== index);
    
    if (newParts.length === 0) {
      const newSelectedParts = { ...selectedParts };
      delete newSelectedParts[partType];
      setSelectedParts(newSelectedParts);
    } else {
      setSelectedParts(prev => ({
        ...prev,
        [partType]: newParts
      }));
    }
  };

  const updatePartSlot = (partType, index, part) => {
    const currentParts = selectedParts[partType] || [];
    const newParts = [...currentParts];
    newParts[index] = part;
    
    setSelectedParts(prev => ({
      ...prev,
      [partType]: newParts
    }));
  };

  const generateOutput = () => {
    const output = [];
    
    Object.entries(selectedParts).forEach(([partType, parts]) => {
      parts.forEach(part => {
        if (part) {
          if (outputMode === 'strings') {
            output.push(part.String);
          } else {
            output.push(part.ID);
          }
        }
      });
    });
    
    return output;
  };

  const copyToClipboard = () => {
    const output = generateOutput();
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const output = generateOutput();
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weapon-config.json';
    a.click();
  };

  const resetBuilder = () => {
    setSelectedManufacturer('');
    setSelectedWeaponType('');
    setSelectedParts({});
  };

  const partsByType = getPartsByType();
  const hasSelectedParts = Object.values(selectedParts).some(parts => 
    parts && parts.length > 0 && parts.some(p => p !== null)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-orange-400 mb-2" style={{ textShadow: '0 0 20px rgba(251, 146, 60, 0.5)' }}>
            BORDERLANDS 4
          </h1>
          <h2 className="text-2xl text-gray-300">Weapon Builder</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-orange-400 font-bold mb-2">Manufacturer</label>
                <select
                  value={selectedManufacturer}
                  onChange={(e) => {
                    setSelectedManufacturer(e.target.value);
                    setSelectedWeaponType('');
                    setSelectedParts({});
                  }}
                  className="w-full bg-gray-900 border-2 border-orange-500 text-gray-300 rounded p-3 focus:outline-none focus:border-orange-400"
                >
                  <option value="">Select Manufacturer</option>
                  {getManufacturers().map(mfg => (
                    <option key={mfg} value={mfg}>{mfg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-orange-400 font-bold mb-2">Weapon Type</label>
                <select
                  value={selectedWeaponType}
                  onChange={(e) => {
                    setSelectedWeaponType(e.target.value);
                    setSelectedParts({});
                  }}
                  disabled={!selectedManufacturer}
                  className="w-full bg-gray-900 border-2 border-orange-500 text-gray-300 rounded p-3 focus:outline-none focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Weapon Type</option>
                  {getWeaponTypes().map(wt => (
                    <option key={wt} value={wt}>{wt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedWeaponType && Object.keys(partsByType).length > 0 && (
            <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-6">
              <h3 className="text-xl text-orange-400 font-bold mb-4">Select Parts</h3>
              <div className="space-y-6">
                {Object.entries(partsByType).map(([partType, parts]) => {
                  const currentParts = selectedParts[partType] || [];
                  const limit = getPartLimit(partType);
                  const canAddMore = currentParts.length < limit;

                  return (
                    <div key={partType} className="border border-orange-500 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-orange-300 font-semibold">
                          {partType} {limit > 1 && `(Max: ${limit})`}
                        </label>
                        {canAddMore && (
                          <button
                            onClick={() => addPartSlot(partType)}
                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-1 px-3 rounded transition"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {currentParts.map((selectedPart, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <select
                                value={selectedPart?.ID || ''}
                                onChange={(e) => {
                                  const part = parts.find(p => p.ID === e.target.value);
                                  updatePartSlot(partType, index, part || null);
                                }}
                                className="w-full bg-gray-900 border border-orange-500 text-gray-300 rounded p-2 text-sm focus:outline-none focus:border-orange-400"
                              >
                                <option value="">None</option>
                                {parts.map(part => (
                                  <option key={part.ID} value={part.ID}>
                                    {part.String.split('.').pop()}
                                  </option>
                                ))}
                              </select>
                              {selectedPart && (
                                <div className="mt-1 text-xs text-gray-400 truncate" title={selectedPart.String}>
                                  {selectedPart.String}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removePartSlot(partType, index)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition mt-0.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {currentParts.length === 0 && (
                          <div className="text-gray-500 text-sm italic">
                            Click "Add" to add a {partType}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasSelectedParts && (
            <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-orange-400 font-bold">Output</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutputMode('strings')}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      outputMode === 'strings'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Strings
                  </button>
                  <button
                    onClick={() => setOutputMode('ids')}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      outputMode === 'ids'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    IDs
                  </button>
                </div>
              </div>
              
              <pre className="bg-gray-900 border border-orange-500 rounded p-4 text-gray-300 overflow-x-auto mb-4">
                {JSON.stringify(generateOutput(), null, 2)}
              </pre>

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadOutput}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={resetBuilder}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}