const { generateLargePrime } = require('./millerRabin.cjs');

// Helper Functions
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modInverse(a, m) {
  let [m0, x0, x1] = [m, 0n, 1n];
  while (a > 1n) {
    let q = a / m;
    [m, a] = [a % m, m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0n ? x1 + m0 : x1;
}

// Modular Exponentiation
function modExp(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp >> 1n; // Divide exp by 2
    base = (base * base) % mod;
  }
  return result;
}

// RSA Key Generation
function generateRSAKeys(bitLength) {
  const p = generateLargePrime(bitLength);
  const q = generateLargePrime(bitLength);
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e = 65537n; // Common choice for e
  while (gcd(e, phi) !== 1n) {
    e += 2n;
  }

  const d = modInverse(e, phi);

  return { publicKey: { e, n }, privateKey: { d, n } };
}

// RSA Encryption/Decryption
function rsaEncrypt(message, publicKey) {
  const { e, n } = publicKey;
  return modExp(BigInt(message), e, n);
}

function rsaDecrypt(ciphertext, privateKey) {
  const { d, n } = privateKey;
  return modExp(ciphertext, d, n);
}

// Oblivious Transfer
function obliviousTransfer(bitLength) {
  // Sender's messages
  const m0 = 12345n; // Ensure messages are BigInt
  const m1 = 67890n;

  // Generate RSA keys
  const { publicKey, privateKey } = generateRSAKeys(bitLength);

  // Receiver's choice and random blinding factor
  const choice = 0n; // Receiver's choice (0 or 1 as BigInt)
  const r = 123n; // Random BigInt for blinding

  // Encrypt both messages
  const c0 = rsaEncrypt(m0 + r, publicKey); // Add blinding to m0
  const c1 = rsaEncrypt(m1 + r, publicKey); // Add blinding to m1

  // Sender sends both encrypted messages
  const receivedCiphertext = choice === 0n ? c0 : c1; // Receiver selects one ciphertext

  // Receiver decrypts and removes the blinding factor
  const decryptedMessage = rsaDecrypt(receivedCiphertext, privateKey) - r;

  return {
    senderMessages: { m0, m1 },
    receiverChoice: choice,
    receivedMessage: decryptedMessage,
  };
}

// Run Oblivious Transfer
const result = obliviousTransfer(16);
console.log('Oblivious Transfer Result:', result);
