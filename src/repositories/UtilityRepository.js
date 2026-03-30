const { getConnection } = require('../config/database');

class UtilityRepository {
    async getCities() {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query("SELECT loc.city_name, a.code FROM locations loc JOIN airports a ON a.location_id = loc.id");
            return rows;
        } finally {
            connection.release();
        }
    }

    async getPlanes() {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query("SELECT air.id, air.model FROM airplanes air");
            return rows;
        } finally {
            connection.release();
        }
    }
}

module.exports = UtilityRepository;