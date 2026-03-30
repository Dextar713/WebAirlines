class Flight {
    constructor(id, departureCity, destinationCity, departureTime, price, duration, remainingSeats) {
        this.id = id;
        this.departureCity = departureCity;
        this.destinationCity = destinationCity;
        this.departure_time = new Date(departureTime); // Use snake_case to match template
        this.price = price;
        this.duration = duration;
        this.remainingSeats = remainingSeats;
    }
}

module.exports = Flight;