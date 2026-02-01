// Masumi Audit Trail Storage
// In-memory storage for demo purposes

let auditEntries = [];
let entryCounter = 0;

function storeMasumiEntry(hash, metadata, response) {
  const entry = {
    id: `masumi_${++entryCounter}`,
    hash,
    metadata,
    response,
    timestamp: new Date().toISOString(),
    verified: true
  };
  
  auditEntries.push(entry);
  
  // Keep only last 100 entries
  if (auditEntries.length > 100) {
    auditEntries = auditEntries.slice(-100);
  }
  
  return entry;
}

function getAllMasumiEntries() {
  return auditEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getMasumiEntry(hash) {
  return auditEntries.find(entry => entry.hash === hash);
}

function getMasumiStats() {
  return {
    totalEntries: auditEntries.length,
    verifiedEntries: auditEntries.filter(e => e.verified).length,
    lastEntry: auditEntries.length > 0 ? auditEntries[auditEntries.length - 1].timestamp : null
  };
}

module.exports = {
  storeMasumiEntry,
  getAllMasumiEntries,
  getMasumiEntry,
  getMasumiStats
};