const express = require('express');
var bodyParser = require('body-parser')
var urlParser = bodyParser.urlencoded({extended: true});
var jsonParser = bodyParser.json();
require('dotenv').config();
const path = require('path');
const app = express();
const session = require('express-session');
const { getJson } = require("serpapi");
//const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
var mysql = require('mysql2/promise');


// const client = new MongoClient(uri, {
//     serverApi: {
//       version: ServerApiVersion.v1,
//       strict: true,
//       deprecationErrors: true,
//     }
//   });

// var db;
// var coll;
var con;
 
/*
async function connect_mongo() {
    try {
        await client.connect();
    } catch(err) {
        console.log(err);
    }
    db = client.db("DexAir");
    coll = db.collection("users");
}
*/

async function sqlCon() {
    con = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT, 
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB
      });
      
      con.getConnection(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
}

// async function sqlCon() {
//     con = mysql.createConnection({
//         host: "localhost",
//         port:3306, 
//         user: "root",
//         password: "abcd7777",
//         database: "airlines"
//       });
      
//       con.connect(function(err) {
//         if (err) throw err;
//         console.log("Connected!");
//       });
// }

app.use(express.static('static'));
app.set('view engine', 'html');
ejs = require('ejs');
app.engine('.html', ejs.renderFile);
app.set('views', 'templates');

app.use(express.static('static/style'));
app.use(express.static('static/img/'));
app.use(express.static('static/js'));
app.use(express.static(path.join(__dirname, 'static/style')));
//app.use(express.static(path.join(__dirname, 'static/img')));

app.use(session({
    secret: 'abcdefg', // folosit pentru criptarea session ID-ului
    resave: true, //sa nu stearga sesiunile idle
    saveUninitialized: false, //nu salveaza obiectul sesiune daca nu am setat un camp
    cookie: {
        maxAge: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    }
   }));
   
   
process.on('uncaughtException', function (err) {
    console.log(err);
}); 

function logger(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        next();
        //res.redirect("/airline/login");
    }
}

function admin_log(req, res, next) {
    if(req.session.user.username === 'dextar') {
        next();
    } else {
        backURL=req.header('Referer') || '/';
        res.redirect(backURL);
    }
}

app.get('/', (req, res) => {
    // res.render('profile.html');
    res.redirect('/airline');
})

app.get('/airline', async (req, res) => {
    if(!req.session.all_flights) {
        req.session.all_flights = await getUpcomingFlights();
    }
    res.render('home.html', {user: req.session.user, all_flights: req.session.all_flights});
})

app.get('/airline/book_flight', logger, async (req, res) => {
    if(!req.session.cities) {
        req.session.cities = await getCities();
    }
    res.render('book.html', {user: req.session.user, cities: req.session['cities']});
})

app.post('/airline/book_flight', [urlParser, logger], async (req, res) => {
    //console.log(req.body);
    var start_date = req.body.start_date;
    if(!start_date) {
        start_date = '2000-01-01';
    }
    var from = req.body.start_city;
    var to = req.body.end_city;
    var cnt = req.body.cnt_people;
    var price_limit = req.body.price;

    const query_txt = "select loc1.city_name as dep_city,loc2.city_name as target_city,fi.duration,f.departure_time,f.id,f.price, \
    p.seat_count - coalesce((select sum(coalesce(people_num, 0)) from reservations where flight_id = f.id),0) as rem_seats \
    from flights f join flight_info fi on fi.id = f.info_id \
    join airports a1 on a1.code = fi.departure_airport \
    join airports a2 on a2.code = fi.destination_airport join locations loc1 on a1.location_id = loc1.id \
    join locations loc2 on loc2.id = a2.location_id join passenger_airplanes p on p.id = f.airplane_id\
    where f.price<= ? and loc1.city_name= ? and loc2.city_name= ? \
    and cast(f.departure_time as date) >= str_to_date(?, '%Y-%m-%d')";
    const params = [parseInt(price_limit), from, to, start_date];
    
    var r = await con.query(query_txt, params);
    
    req.session["flights"] = r[0];
    //console.log(req.session["flights"]);
    res.redirect('/airline/target_flights');
})

app.get('/airline/target_flights', logger, (req, res) => {
    res.render('flights.html', {user: req.session.user, flights: req.session["flights"]});
})

app.get('/airline/hotels', (req, res) => {
    res.render('hotels.html', {user: req.session.user, hotels: req.session.hotels});
})

app.post('/airline/hotels', urlParser, (req, res) => {
    req.session.hotels = null;
    var hotel_str = req.body.hotel;
    if(!hotel_str) {
        res.redirect('/airline/hotels');
        return;
    }
    getJson({
        engine: "google_hotels",
        q: hotel_str,
        check_in_date: "2024-06-08",
        check_out_date: "2024-06-09",
        adults: "2",
        currency: "USD",
        gl: "us",
        hl: "en",
        api_key: "301c9493828fdbe814daa72775aa318abd192ece5acd68a297a3443d7a646382"
      }, (json) => {
            req.session.hotels = json.properties.slice(0, 5);
            
            res.redirect('/airline/hotels');
      });
})

app.get('/airline/login', (req, res) => {
    if(req.session.user) {
        res.redirect('/airline');
    } else {
        res.render('login.html', {user: req.session.user});
    }
})


app.post('/airline/login', jsonParser, async (req, res) => {
    if(req.session.user) {
        res.redirect('/airline');
    } else {
        //console.log(req.body);
        var user = req.body.username;
        var pass = req.body.password;
        /*
        var auth_success = await checkCredentials(user, pass).catch(console.dir);
        if(auth_success.localeCompare("ok")===0) {
            req.session.username = user;
            res.json({"url": "/airline"});
        } else {
            res.json({"error":auth_success});
        }
        */
       var user_exists = await con.query("select people.*, c.username, c.id as client_id from people \
                                join clients c on c.person_id = people.id where username=? and password=?", [user, pass]);
       if(user_exists[0].length > 0) {
          req.session.user = user_exists[0][0];
          res.json({"url": "/airline"});
       } else {
            res.json({"error":"Invalid credentials"});
       }
    }
})

app.get('/airline/register', (req, res) => {
    if(req.session.user) {
        res.redirect('/airline');
    } else {
        res.render('register.html', {user: req.session.user});
    }
})

app.post('/airline/register', jsonParser, async (req, res) => {
    if(req.session.user) {
        res.render('/home.html');
    } else {
        //console.log(req.body);
        var user = req.body.username;
        var pass = req.body.password;
        var first_name = req.body.first_name
        var last_name = req.body.last_name 
        var email = req.body.email 
        /*
        var add_success = await addUserToDb(user, pass);
        if(add_success.localeCompare("ok")===0) {
            req.session.username = user;
            res.json({"url": "/airline"});
        } else {
           
            res.json({"error": add_success});
            
        }
        */
        var mx_id1 = await getNextId('clients');
        const q1 = "insert into clients(id, person_id, username, password) values(?, ?, ?, ?);"
        var mx_id = await getNextId('people')
        const q = "insert into people(id, first_name, last_name, email) values(?, ?, ?, ?);"
        var add_success;
        try {
            var user_exists = await con.query("select * from clients where username=?", [user])
            console.log(user_exists)
            if(user_exists[0].length>0) {
                throw -1;
            }
            add_success2 = await con.query(q, [mx_id, first_name, last_name, email])
            add_success = await con.query(q1, [mx_id1, mx_id, user, pass])
            
            user_obj = {
                "username": user,
                "first_name": first_name,
                "last_name": last_name,
                "email": email, 
                "client_id": mx_id1
            }
            req.session.usern = user_obj;
            res.json({"url": '/airline'})
        } catch(err) {
            console.log(err)
            res.json({"error": err.sqlMessage});
            //res.json({"error": "Such username is already taken"});
        }
    }
})

app.get("/airline/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/airline');
});

app.get("/airline/admin", (req, res) => {
    res.render('admin.html', {user: req.session.user})
})

app.get("/airline/flight/:id", async (req, res) => {
    //console.log(req.params.id)
    //console.log(77)
    var flight_id = parseInt(req.params.id);
    console.log(flight_id)
    var f = await getFlightById(flight_id);
    console.log(f);
    //res.redirect('/airline');
    res.render('flight.html', {user: req.session.user, flight: f})
})

app.post("/airline/flight/:id/cancel", async (req, res) => {
    //console.log(req.params)
    var flight_id = parseInt(req.params.id);
    await deleteFlight(flight_id);
    req.session.all_flights = await getUpcomingFlights();
    res.redirect('/airline/admin')
})

app.post("/airline/flight/:id/delay", urlParser, async (req, res) => {
    //console.log(req.params)
    var flight_id = parseInt(req.params.id);
    var mins = parseInt(req.body.delay)
    await delayFlight(flight_id, mins);
    req.session.all_flights = await getUpcomingFlights();
    res.redirect('/airline/flight/'+flight_id)
})

app.post("/airline/flight/:id/book", jsonParser, async (req, res) => {
    console.log(req.params)
    var flight_id = parseInt(req.params.id);
    var people_num = parseInt(req.body.cnt_people)
    //var rem_seats = await getRemSeats(flight_id);
    var f = await getFlightById(flight_id);
    if(people_num>f.rem_seats) {
        //console.log("Impossible no places left")
        res.json({"error": "Not enough seats left"})
    } else {
        await reserve(flight_id, req.session.user.client_id, people_num, f.price);
        req.session.flights = await getUpcomingFlights();

        // add reservation, decrease number of seats
        res.json({"url": '/airline/flight/'+flight_id})
    }
})

app.get("/airline/flight/:id", async (req, res) => {
    //console.log(req.params)
    var flight_id = parseInt(req.params.id);
    var f = await getFlightById(flight_id);
    res.render('flight.html', {user: req.session.user, flight: f})
})

app.get("/airline/flight_add", async (req, res) => {
    if(!req.session.cities) {
        req.session.cities = await getCities();
    }
    if(!req.session.planes) {
        req.session.planes = await getPlanes();
    }
    
    res.render('flight_add.html', {user: req.session.user, cities: req.session.cities, planes: req.session.planes})
})

app.post("/airline/flight_add", urlParser, async (req, res) => {
    //console.log(req.body);
    const q1 = "select id from flight_info fi where fi.departure_airport = ? and fi.destination_airport = ?";
    var params = [req.body.start_city, req.body.end_city];
    var fi = await con.query(q1, params);
    if(fi[0].length===0) {
        var nid = await con.query("select max(id)+1 as mx_id from flight_info");
        nid = nid[0][0].mx_id;
        if(!nid) nid = 1;
        const q2 = "insert into flight_info values(?, ?, ?, ?)";
        const pars = [nid, parseInt(req.body.dur), req.body.start_city, req.body.end_city];
        var msg = await con.query(q2, pars);
    }
    var next_id = await con.query("select max(id)+1 as mx_id from flights");
    next_id = next_id[0][0].mx_id;
    const q3 = "insert into flights values \
    ( ?, \
    (select id from flight_info fi where fi.departure_airport = ? and fi.destination_airport = ?), \
    ?, ?, ?)"
    params = [next_id, req.body.start_city, req.body.end_city, req.body.start_date, parseInt(req.body.plane), parseInt(req.body.price)];
    var r = await con.query(q3, params);
    req.session.all_flights = await getUpcomingFlights();
    res.redirect('/airline/admin')
})

app.get("/airline/profile", async (req, res) => {
    const q = "select all_flights.*, r.status, r.amount_due, r.id as booking_id from all_flights \
    join reservations r on all_flights.id = r.flight_id where r.client_id = ?"
    var f = await con.query(q, [req.session.user.client_id]); 
    const q2 = "select count(flight_id) as total_flights from reservations where client_id = ?"
    var cnt_fl = await con.query(q2, [req.session.user.client_id]);
    const q3 = "select total_hours from total_hours where client_id = ?"
    var hours = await con.query(q3, [req.session.user.client_id]) 
    const q4 = "select country_name, city_name from top_destinations where client_id = ? limit 1;"
    var top_dest = await con.query(q4, [req.session.user.client_id]);
    //console.log(top_dest)
    var total_hours = 0, total_flights = 0, top_d = 'No flights yet';
    if(cnt_fl[0][0]) {
        total_flights = cnt_fl[0][0].total_flights;
    }
    if(hours[0][0]) {
        total_hours = hours[0][0].total_hours;
    }
    if(top_dest[0][0]) {
        top_d = top_dest[0][0];
    }
    res.render('dashboard.html', {user: req.session.user, bookings: f[0], stats: {
        "total_hours": total_hours,
        "total_flights": total_flights,
        "top_dest": top_d  
    }})
})

app.post("/airline/cancel_reservation/:id", async (req, res) => {
    const q = "delete from reservations where id=?";
    await con.query(q, [parseInt(req.params.id)]);
    res.redirect('/airline/profile'); 
})


app.all('*', (req, res) => {
    res.status(404).send('<h1>Page not found</h1>')
})

app.listen(5000, () => {
    console.log('Listening on port 5000...');
    connect();
})

async function connect() {
    //await connect_mongo();
    await sqlCon();
}

// async function addUserToDb(user, pass) {
//     var prev_user = await coll.findOne({"username": user});
//     if(prev_user) {
//         return "Such user already exists";
//     } 
//     coll.insertOne({"username": user, "password": pass});
//     return "ok";
// }

// async function checkCredentials(user, pass) {
//     var cur_user = await coll.findOne({"username": user});    
//     if(!cur_user) {
//         return "Such user does not exist";
//     } 
//     if(cur_user.password!=pass) {
//         return "Incorrect password";
//     }
//     return "ok";
// }

async function getFlights() {
    const q = "select loc1.city_name as c1, loc2.city_name as c2, \
    f.departure_time, f.price, f.id, fi.duration from flights f join flight_info fi on fi.id = f.info_id join airports a1 \
    on a1.code = fi.departure_airport join airports a2 on a2.code = fi.destination_airport join locations loc1 \
    on loc1.id = a1.location_id join locations loc2 on loc2.id = a2.location_id";
    let res = await con.query(q);
    
    return res[0];
}

async function getUpcomingFlights() {
    const q = "select loc1.city_name as c1, loc2.city_name as c2, \
    f.departure_time, f.price, f.id, fi.duration from flights f join flight_info fi on fi.id = f.info_id join airports a1 \
    on a1.code = fi.departure_airport join airports a2 on a2.code = fi.destination_airport join locations loc1 \
    on loc1.id = a1.location_id join locations loc2 on loc2.id = a2.location_id where f.departure_time >= ?";
    let res = await con.query(q, [new Date()]);
    //console.log(res);
    return res[0];
}

async function getFlightById(flight_id) {
    const q = "select loc1.city_name as c1, loc2.city_name as c2, \
    f.departure_time, f.price, f.id, fi.duration, \
    seat_count - coalesce((select sum(coalesce(people_num, 0)) from reservations where flight_id = f.id),0) as rem_seats \
    from flights f join flight_info fi on fi.id = f.info_id join airports a1 \
    on a1.code = fi.departure_airport join airports a2 on a2.code = fi.destination_airport join locations loc1 \
    on loc1.id = a1.location_id join locations loc2 on loc2.id = a2.location_id \
    join passenger_airplanes p on p.id = f.airplane_id where f.id = ?";
    const res = await con.query(q, [flight_id]);
    //console.log(res[0][0]);
    return res[0][0];
}

async function getRemSeats(flight_id) {
    const q = "select seat_count - (select sum(people_num) from reservations where flight_id = f.id) as rem_seats \
    from passenger_airplanes p join flights f on f.airplane_id = p.id where f.id = ?";
    const res = await con.query(q, [flight_id]);
    console.log(res[0][0]);
    return res[0][0];
}

async function deleteFlight(flight_id) {
    const q = "delete from flights where id=?";
    const res = await con.query(q, [flight_id]);
    //console.log(res);
}

async function delayFlight(flight_id, mins) {
    const q1 = "select f.departure_time from flights f where f.id = ?"
    var r = await con.query(q1, [flight_id])
    
    const q = "update flights set departure_time = date_add(departure_time, interval ? minute) where id = ?";
    const res = await con.query(q, [mins, flight_id]);
    //console.log(res);
}

async function reserve(flight_id, client_id, people_num, flight_price) {
    const q = "insert into reservations(id, flight_id, client_id, reservation_time, amount_due, status, people_num) values \
    (?, ?, ?, (select current_timestamp()), ?, 'unpaid', ?);"
    var mx_id = await getNextId('reservations');
    var amount_due = people_num * flight_price;
    var success = await con.query(q, [mx_id, flight_id, client_id, amount_due, people_num]);
    console.log(success[0]);
}

async function getCities() {
    const q = "select loc.city_name, a.code from locations loc join airports a on a.location_id = loc.id";
    let res = await con.query(q);
    return res[0];
}

async function getPlanes() {
    const q = "select air.id, air.model from airplanes air";
    let res = await con.query(q);
    return res[0];
}

async function getNextId(table) {
    const q = "select coalesce(max(id) + 1, 1) as mx_id from " + table;
    var mx_id = await con.query(q)
    //console.log(mx_id)
    return mx_id[0][0].mx_id; 
}

