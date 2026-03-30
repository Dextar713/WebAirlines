class Reservation {
    constructor(id, flightId, clientId, reservationTime, amountDue, status, peopleNum) {
        this.id = id;
        this.flightId = flightId;
        this.clientId = clientId;
        this.reservationTime = reservationTime;
        this.amountDue = amountDue;
        this.status = status;
        this.peopleNum = peopleNum;
    }
}

module.exports = Reservation;