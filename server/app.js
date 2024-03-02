import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import pizzas from "./routers/pizzas.js";
import orders from "./routers/orders.js";
import customers from "./routers/customers.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4040;

mongoose.connect(process.env.MONGODB, {
  // Configuration options to remove deprecation warnings, just include them to remove clutter
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once(
  "open",
  console.log.bind(console, "Successfully opened connection to Mongo!")
);

// Logging Middleware Declaration
const logging = (request, response, next) => {
  console.log(`${request.method} ${request.url} ${Date.now()}`);
  next();
};

// CORS Middleware Declaration
const cors = (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

// Use the defined Middleware
app.use(cors);
app.use(express.json());




// Define a status route
app.get("/status", (request, response) => {
  response.send(JSON.stringify({ message: "Service running ok" }));
});

// Moving the logging middleware to this location so that the logs on render.com are not filled up with status checks
app.use(logging);

app.get("/weather/:city", (request, response) => {
  // Express adds a "params" Object to requests that has an matches parameter created using the colon syntax
  const city = request.params.city;

  // Set defaults values for the query string parameters
  let cloudy = "clear";
  let rainy = false;
  let lowTemp = 32;
  // check if the request.query.cloudy attribute exists
  if ("cloudy" in request.query) {
    // If so update the variable with the query string value
    cloudy = request.query.cloudy;
  }
  if ("rainy" in request.query && request.query.rainy === "true") {
    rainy = request.query.rainy;
  }
  if ("lowtemp" in request.query) {
    lowTemp = Number(request.query.lowtemp);
  }
  // Generate a random number to use as the temperature
  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
  const min = 70;
  const max = 90;
  const temp = Math.floor(Math.random() * (max - min + 1) + min);
  // handle GET request for weather with an route parameter of "city"
  response.json({
    text: `The weather in ${city} is ${temp} degrees today.`,
    cloudy: cloudy,
    // When the key and value variable are named the same you can omit the value variable
    rainy,
    temp: {
      current: temp,
      low: lowTemp
    },
    city
  });
});

// Use the routers
app.use("/pizzas", pizzas);
app.use("/orders", orders);
app.use("/customers", customers);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

export default app;
