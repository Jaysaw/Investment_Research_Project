"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('Testing connection with DATABASE_URL:', process.env.DATABASE_URL);
const pool = new pg_1.default.Pool({
    connectionString: process.env.DATABASE_URL,
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database query failed:', err.message);
        if (err.stack)
            console.error(err.stack);
    }
    else {
        console.log('Database query succeeded! Time on server:', res.rows[0]);
    }
    pool.end();
});
