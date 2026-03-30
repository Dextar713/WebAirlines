const { getConnection } = require('../config/database');
const Reservation = require('../entities/Reservation');

class ReservationRepository {
    async create(flightId, clientId, peopleNum, price) {
        const connection = await getConnection();
        try {
            const [idResult] = await connection.query("SELECT COALESCE(MAX(id) + 1, 1) AS mx_id FROM reservations");
            const id = idResult[0].mx_id;
            const amountDue = peopleNum * price;
            await connection.query(
                "INSERT INTO reservations(id, flight_id, client_id, reservation_time, amount_due, status, people_num) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?, 'unpaid', ?)",
                [id, flightId, clientId, amountDue, peopleNum]
            );
            return new Reservation(id, flightId, clientId, new Date(), amountDue, 'unpaid', peopleNum);
        } finally {
            connection.release();
        }
    }

    async getByClientId(clientId) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT all_flights.*, r.status, r.amount_due, r.id AS booking_id
                 FROM all_flights
                 JOIN reservations r ON all_flights.id = r.flight_id
                 WHERE r.client_id = ?`,
                [clientId]
            );
            return rows.map(row => ({
                ...row,
                status: row.status,
                amountDue: row.amount_due,
                bookingId: row.booking_id
            }));
        } finally {
            connection.release();
        }
    }

    async delete(id) {
        const connection = await getConnection();
        try {
            await connection.query("DELETE FROM reservations WHERE id=?", [id]);
        } finally {
            connection.release();
        }
    }

    async getStats(clientId) {
        const connection = await getConnection();
        try {
            const [totalFlights] = await connection.query("SELECT COUNT(flight_id) AS total_flights FROM reservations WHERE client_id = ?", [clientId]);
            const [totalHours] = await connection.query("SELECT total_hours FROM total_hours WHERE client_id = ?", [clientId]);
            const [topDest] = await connection.query("SELECT country_name, city_name FROM top_destinations WHERE client_id = ? LIMIT 1", [clientId]);

            return {
                totalFlights: totalFlights[0]?.total_flights || 0,
                totalHours: totalHours[0]?.total_hours || 0,
                topDest: topDest[0] || { country_name: 'No flights yet', city_name: '' }
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = ReservationRepository;