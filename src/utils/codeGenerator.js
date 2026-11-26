// Генерація випадкового короткого коду.

const crypto = require('crypto');

// 62 символи: великі й малі латинські літери та цифри
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_LENGTH = 6; // 62^6 ≈ 56,8 млрд варіантів

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    // crypto.randomInt дає криптографічно стійке випадкове число,
    // тому коди не можна вгадати, перебираючи їх по порядку
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

module.exports = { generateCode };