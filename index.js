require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const person = require("./models/person");

const app = express();

const apiDesription = (tokens, req, res) => {
  result = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ];
  if (Object.keys(req.body).length) {
    result.push(JSON.stringify(req.body));
  }
  return result.join(" ");
};

app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(morgan(apiDesription));

app.get("/api/persons/", (request, response) => {
  Person.find({}).then((res) => {
    response.json(res);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => {
      console.log(err);
      response.status(400).send({ error: "malformed id" });
    });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (body.name === undefined && body.number === undefined) {
    return response.status(400).json({ error: "content missing" });
  }
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });
  newPerson
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch(err => next(err)) ;
});

app.put("/api/persons/:id", (request, response, next) => {
  if (request.body.id === undefined || request.body.number === undefined) {
    response.status(400).json({ error: "Missing fields in request" });
  } else {
    const person = {
      number: request.body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .then((updatedPerson) => {
        response.json(updatedPerson.toJSON());
      })
      .catch((error) => next(error));
  }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((res) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

app.get("/info/", (request, response) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(`
  <div>
      <p>Phonebook has info for ${count} people</p>
  </div>
  <div>
      <p>${Date()}</p>
  </div>`);
    })
    .catch((err) => next(err));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`server running at port \n ${PORT}`);
