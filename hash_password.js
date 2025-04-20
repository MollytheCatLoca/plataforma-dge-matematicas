// hash_password.js (ejecutar con node hash_password.js)
const bcrypt = require('bcrypt');
const password = 'password123'; // La contraseña que quieres hashear
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed Password:', hash);
    // Copia este hash y pégalo en la columna hashedPassword de tu DB
  }
});