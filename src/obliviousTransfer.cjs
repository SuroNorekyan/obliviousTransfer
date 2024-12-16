const { generateLargePrime } = require('./millerRabin.cjs');
const readline = require('readline');

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
function randomBigInt(bitLength) {
  let rand = 0n;
  let bitsGenerated = 0;

  while (bitsGenerated < bitLength) {
    const rnd = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    rand = (rand << 53n) | rnd;
    bitsGenerated += 53;
  }

  const excess = bitsGenerated - bitLength;
  if (excess > 0) {
    rand = rand >> BigInt(excess);
  }
  return rand;
}


// Oblivious Transfer

async function obliviousTransfer(bitLength = 16) {
  // Sender's messages as BigInts
  const messages = [12345n, 67890n]

  // 1. Generate RSA keys
  const { publicKey, privateKey } = generateRSAKeys(bitLength);

  // 2. Print the public key and the message pair
  console.log("Public Key (n, e):", publicKey);
  console.log("Sender's messages: m0 =", messages[0].toString(), ", m1 =", messages[1].toString());

  // 3. Prompt the user for a choice (0 or 1)
  const choice = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter choice (0 or 1): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  // Convert choice to BigInt (assuming valid input of '0' or '1')
  const receiverChoice = BigInt(choice);

  // Generate v
  const r = randomBigInt(bitLength); // Need to use PRNG for security

  const k = rsaEncrypt(r, publicKey);
  const v = (messages[receiverChoice] + k) % publicKey.n;

  // 4. Sender decrypt both messages with blinding
  const c0 = rsaDecrypt(v - messages[0], privateKey);
  const c1 = rsaDecrypt(v - messages[1], privateKey);

  const decryptMessages = [c0 + messages[0], c1 +messages[1]]

  // 5. Receiver decrypts desired message
  const desiredMessage = decryptMessages[receiverChoice] - r;

  // Print or return the result as you see fit
  console.log("\n--- Oblivious Transfer Result ---");
  console.log("Receiver choice:", receiverChoice.toString());
  console.log("Decrypted message:", desiredMessage.toString());
}

obliviousTransfer();