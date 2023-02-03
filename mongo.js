const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://lucas:${password}@cluster0.b9b0h7y.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

console.log(process.argv)

if(process.argv[3] && process.argv[4]){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })
    person.save().then(res=>{
        console.log(
            `added ${person.name} number ${person.number} to phonebook`
            )
        mongoose.connection.close()
        })     
} 
else {
    Person.find({}).then(res =>{
        res.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}
