const { getConnection } = require('../config/database');
const User = require('../entities/User');

class UserRepository {
    async findByUsernameAndPassword(username, password) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query(
                "SELECT people.*, c.username, c.id AS client_id FROM people JOIN clients c ON c.person_id = people.id WHERE username=? AND password=?",
                [username, password]
            );
            if (rows.length > 0) {
                const row = rows[0];
                return new User(row.id, row.username, row.first_name, row.last_name, row.email, row.client_id);
            }
            return null;
        } finally {
            connection.release();
        }
    }

    async create(userData) {
        const connection = await getConnection();
        try {
            const { username, password, firstName, lastName, email } = userData;
            // Check if user exists
            const [existing] = await connection.query("SELECT * FROM clients WHERE username=?", [username]);
            if (existing.length > 0) {
                throw new Error("Username already exists");
            }

            // Get next IDs
            const [personIdResult] = await connection.query("SELECT COALESCE(MAX(id) + 1, 1) AS mx_id FROM people");
            const personId = personIdResult[0].mx_id;

            const [clientIdResult] = await connection.query("SELECT COALESCE(MAX(id) + 1, 1) AS mx_id FROM clients");
            const clientId = clientIdResult[0].mx_id;

            // Insert person
            await connection.query("INSERT INTO people(id, first_name, last_name, email) VALUES(?, ?, ?, ?)", [personId, firstName, lastName, email]);

            // Insert client
            await connection.query("INSERT INTO clients(id, person_id, username, password) VALUES(?, ?, ?, ?)", [clientId, personId, username, password]);

            return new User(personId, username, firstName, lastName, email, clientId);
        } finally {
            connection.release();
        }
    }
}

module.exports = UserRepository;