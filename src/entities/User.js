class User {
    constructor(id, username, firstName, lastName, email, clientId) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.clientId = clientId;
    }
}

module.exports = User;