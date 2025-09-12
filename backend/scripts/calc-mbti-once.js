const fs = require('fs');
const path = require('path');

// Load mapping
const mappingPath = path.resolve(__dirname, '../../assets/data/mbti-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')).questions;

// Answers from user: A=>0, B=>1
// Index i corresponds to question i+1
const A = 0, B = 1;
const answers = [
  A, B, A, B, B, B, B, B, A, A,
  B, A, A, B, B, B, B, A, B, A,
  B, A, B, B, B, A, A, A, B, B,
  A, A, B, B, A, A, B, B, A, A,
  B, A, A, B, B, A, A, A, A, B,
  B, A, A, A, B, B, A, A, A, A,
  A, B, B, B, B, A, B, A, A, A,
  B, A, A, B, A, B, B, A, B, B,
  A, A, B, B, A, A, B, B, A, A,
  B, A, A
];

if (answers.length !== 93) {
  console.error('Answers length is', answers.length, 'expected 93');
  process.exit(1);
}

const scores = { E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0 };
answers.forEach((ans, idx) => {
  const m = mapping[idx];
  const trait = ans === 0 ? m.sideA : m.sideB;
  scores[trait] += 1;
});

// Current rule (ties go to second letter I/N/F/P): use >
const codeCurrent = `${scores.E > scores.I ? 'E' : 'I'}${scores.S > scores.N ? 'S' : 'N'}${scores.T > scores.F ? 'T' : 'F'}${scores.J > scores.P ? 'J' : 'P'}`;

// Alternative rule (ties go to first letter E/S/T/J): use >= (for reference)
const codeAlt = `${scores.E >= scores.I ? 'E' : 'I'}${scores.S >= scores.N ? 'S' : 'N'}${scores.T >= scores.F ? 'T' : 'F'}${scores.J >= scores.P ? 'J' : 'P'}`;

console.log({ scores, codeCurrent, codeAlt });


