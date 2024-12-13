// Miller-Rabin primality test function
function isProbablyPrime(n, k = 5) {
    if (n < 2) return false;
    if (n !== 2 && n % 2 === 0) return false;

    let s = 0;
    let d = n - 1;
    while (d % 2 === 0) {
        d >>= 1;
        s += 1;
    }

    const tryComposite = (a) => {
        let x = BigInt(a) ** BigInt(d) % BigInt(n);
        if (x === 1n || x === BigInt(n - 1)) return false;

        for (let r = 1; r < s; r++) {
            x = x * x % BigInt(n);
            if (x === BigInt(n - 1)) return false;
        }
        return true;
    };

    for (let i = 0; i < k; i++) {
        const a = 2 + Math.floor(Math.random() * (n - 3));
        if (tryComposite(a)) return false;
    }
    return true;
}

function generateLargePrime(bitLength) {
    const min = BigInt(1) << BigInt(bitLength - 1);
    const max = (BigInt(1) << BigInt(bitLength)) - BigInt(1);

    let candidate = min + BigInt(Math.floor(Math.random() * Number(max - min)));
    while (!isProbablyPrime(Number(candidate))) {
        candidate = min + BigInt(Math.floor(Math.random() * Number(max - min)));
    }
    return candidate;
}

module.exports = { generateLargePrime };
