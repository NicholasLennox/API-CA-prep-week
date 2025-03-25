// ADAPTED FROM API LESSON 5.2 (Authentication section)

const crypto = require('crypto') // Built-in Node.js module for cryptography

/**
 * Hashes a plain text password securely using PBKDF2 algorithm.
 * 
 * How it works:
 * 1. Generates a random salt (randomBytes).
 * 2. Uses PBKDF2 (Password-Based Key Derivation Function 2) to hash the password + salt.
 * 3. Returns the salt and hashed password as Buffers (binary format), ready to be stored in the DB.
 * 
 * Why use salt?  
 * Salt ensures that even if two users have the same password, their hashed results will be different.
 * 
 * @param {string} plainPassword - The password entered by the user.
 * @returns {Promise<{ salt: Buffer, encryptedPassword: Buffer }>} - Salt and hashed password.
 */
function hashPassword(plainPassword) {
  return new Promise((resolve, reject) => {
    // 16 random bytes = 128-bit salt, strong enough for most uses.
    const salt = crypto.randomBytes(16)

    // PBKDF2 Parameters:
    // - password
    // - salt
    // - iterations: 310,000 (higher = more secure but slower)
    // - key length: 32 bytes (256 bits)
    // - algorithm: sha256 (good modern choice)
    crypto.pbkdf2(plainPassword, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) return reject(err)

      // Return salt + hashed password (both as Buffers)
      resolve({
        salt,
        encryptedPassword: hashedPassword
      })
    })
  })
}

/**
 * Compares a plain text password with an encrypted password.
 * 
 * How it works:
 * 1. Re-hashes the provided plain password with the same salt.
 * 2. Compares the result with the stored hashed password using a timing-safe comparison.
 * 
 * Why timingSafeEqual?
 * Prevents timing attacks that could reveal information based on how long the comparison takes.
 * 
 * @param {string} plainPassword - The password entered by the user.
 * @param {Buffer} encryptedPasswordBuffer - Stored hashed password (from database).
 * @param {Buffer} saltBuffer - Stored salt (from database).
 * @returns {Promise<boolean>} - True if password matches, false otherwise.
 */
function comparePassword(plainPassword, encryptedPasswordBuffer, saltBuffer) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, saltBuffer, 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) return reject(err)

      // Securely compare hashed passwords
      resolve(crypto.timingSafeEqual(hashedPassword, encryptedPasswordBuffer))
    })
  })
}

module.exports = {
  hashPassword,
  comparePassword
}
