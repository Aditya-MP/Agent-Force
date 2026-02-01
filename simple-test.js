// Simple test to verify hash detection
const question = "why this transaction failed - f3db1c5c95caBd13dDe16144b2a1919c2c55c841314e44ef815e3 9204a9a0dff";

console.log('Testing hash detection...');
console.log('Question:', question);

// Method 1: Remove all spaces and find 64-char hex
const cleanQuestion = question.replace(/\s+/g, '');
console.log('Cleaned:', cleanQuestion);

const txHashRegex = /[a-fA-F0-9]{64}/g;
const directMatches = cleanQuestion.match(txHashRegex);

if (directMatches) {
  console.log('✅ Found matches:', directMatches);
} else {
  console.log('❌ No matches found');
  
  // Try longer matches
  const longHashRegex = /[a-fA-F0-9]{60,70}/g;
  const longMatches = cleanQuestion.match(longHashRegex);
  
  if (longMatches) {
    console.log('✅ Found long matches:', longMatches);
    console.log('Trimmed to 64:', longMatches[0].substring(0, 64));
  }
}