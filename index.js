const { response } = require("express");
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')

const app = express();

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
app.use(cors());
app.use(morgan(function (tokens, req, res) {
  console.log(req.body)
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}));

app.get("/api/persons/", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
  const name = request.body.name;
  const number = request.body.number;
  if (!name && !number) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  if (persons.find((p) => p.name === name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  const newPerson = {
    id: Math.floor(Math.random() * 100),
    name: name,
    number: number,
  };
  persons = persons.concat(newPerson);
  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

app.get("/info/", (request, response) => {
  const currentDate = new Date().toLocaleString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  response.send(`
  <div>
      <p>Phonebook has info for ${persons.length} people</p>
  </div>
  <div>
      <p>${currentDate} (${timeZone})</p>
  </div>`);
});

const PORT = 3001;
app.listen(PORT);
console.log(`server running at port \n ${PORT}`);
