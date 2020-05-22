// ============================
//  Port BY Default
// ============================
process.env.PORT = process.env.PORT || 3002;

// ============================
//  Enviroment
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// ============================
//  Tokens Expires
// ============================
process.env.TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || 60*60*20*20*30;

// ============================
//  TOken seed
// ============================
process.env.TOKEN_SEED = process.env.TOKEN_SEED || "secret-development";

// ============================
//  Database
// ============================
let urlDB;