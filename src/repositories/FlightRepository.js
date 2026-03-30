const { getConnection } = require('../config/database');
const Flight = require('../entities/Flight');

class FlightRepository {
    async getUpcomingFlights() {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT loc1.city_name AS c1, loc2.city_name AS c2, f.departure_time, f.price, f.id, fi.duration
                 FROM flights f
                 JOIN flight_info fi ON fi.id = f.info_id
                 JOIN airports a1 ON a1.code = fi.departure_airport
                 JOIN airports a2 ON a2.code = fi.destination_airport
                 JOIN locations loc1 ON loc1.id = a1.location_id
                 JOIN locations loc2 ON loc2.id = a2.location_id
                 WHERE f.departure_time >= ?`,
                [new Date()]
            );
            return rows.map(row => {
                console.log('Raw departure_time from DB:', row.departure_time, typeof row.departure_time);
                const parsedDate = new Date(row.departure_time);
                console.log('Parsed date:', parsedDate, 'Is valid:', !isNaN(parsedDate.getTime()));
                return new Flight(row.id, row.c1, row.c2, row.departure_time, row.price, row.duration, null);
            });
        } finally {
            connection.release();
        }
    }

    async getFlightById(id) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT loc1.city_name AS c1, loc2.city_name AS c2, f.departure_time, f.price, f.id, fi.duration,
                        seat_count - COALESCE((SELECT SUM(COALESCE(people_num, 0)) FROM reservations WHERE flight_id = f.id), 0) AS rem_seats
                 FROM flights f
                 JOIN flight_info fi ON fi.id = f.info_id
                 JOIN airports a1 ON a1.code = fi.departure_airport
                 JOIN airports a2 ON a2.code = fi.destination_airport
                 JOIN locations loc1 ON loc1.id = a1.location_id
                 JOIN locations loc2 ON loc2.id = a2.location_id
                 JOIN passenger_airplanes p ON p.id = f.airplane_id
                 WHERE f.id = ?`,
                [id]
            );
            if (rows.length > 0) {
                const row = rows[0];
                return new Flight(row.id, row.c1, row.c2, row.departure_time, row.price, row.duration, row.rem_seats);
            }
            return null;
        } finally {
            connection.release();
        }
    }

    async searchFlights(from, to, startDate, priceLimit) {
        const connection = await getConnection();
        try {
            const query = `SELECT loc1.city_name AS dep_city, loc2.city_name AS target_city, fi.duration, f.departure_time, f.id, f.price,
                                  p.seat_count - COALESCE((SELECT SUM(COALESCE(people_num, 0)) FROM reservations WHERE flight_id = f.id), 0) AS rem_seats
                           FROM flights f
                           JOIN flight_info fi ON fi.id = f.info_id
                           JOIN airports a1 ON a1.code = fi.departure_airport
                           JOIN airports a2 ON a2.code = fi.destination_airport
                           JOIN locations loc1 ON a1.location_id = loc1.id
                           JOIN locations loc2 ON a2.location_id = loc2.id
                           JOIN passenger_airplanes p ON p.id = f.airplane_id
                           WHERE f.price <= ? AND loc1.city_name = ? AND loc2.city_name = ?
                           AND CAST(f.departure_time AS DATE) >= STR_TO_DATE(?, '%Y-%m-%d')`;
            const [rows] = await connection.query(query, [priceLimit, from, to, startDate || '2000-01-01']);
            return rows.map(row => new Flight(row.id, row.dep_city, row.target_city, row.departure_time, row.price, row.duration, row.rem_seats));
        } finally {
            connection.release();
        }
    }

    async deleteFlight(id) {
        const connection = await getConnection();
        try {
            await connection.query("DELETE FROM flights WHERE id=?", [id]);
        } finally {
            connection.release();
        }
    }

    async delayFlight(id, minutes) {
        const connection = await getConnection();
        try {
            await connection.query("UPDATE flights SET departure_time = DATE_ADD(departure_time, INTERVAL ? MINUTE) WHERE id = ?", [minutes, id]);
        } finally {
            connection.release();
        }
    }

    async addFlight(flightData) {
        const connection = await getConnection();
        try {
            const { startCity, endCity, duration, startDate, planeId, price } = flightData;

            // Check if flight_info exists
            let [fiRows] = await connection.query("SELECT id FROM flight_info WHERE departure_airport = ? AND destination_airport = ?", [startCity, endCity]);
            if (fiRows.length === 0) {
                const [nidResult] = await connection.query("SELECT COALESCE(MAX(id) + 1, 1) AS mx_id FROM flight_info");
                const nid = nidResult[0].mx_id;
                await connection.query("INSERT INTO flight_info VALUES(?, ?, ?, ?)", [nid, duration, startCity, endCity]);
            }

            const [nextIdResult] = await connection.query("SELECT COALESCE(MAX(id) + 1, 1) AS mx_id FROM flights");
            const nextId = nextIdResult[0].mx_id;

            await connection.query(
                `INSERT INTO flights VALUES (?, (SELECT id FROM flight_info WHERE departure_airport = ? AND destination_airport = ?), ?, ?, ?)`,
                [nextId, startCity, endCity, startDate, planeId, price]
            );
        } finally {
            connection.release();
        }
    }
}

module.exports = FlightRepository;