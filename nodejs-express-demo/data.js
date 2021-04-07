const mongoose = require("mongoose");
const express = require("express");
const chalk = require("chalk");
const config = require("config");

mongoose.connect("mongodb://localhost/store", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }).then(() => console.log(chalk.bgCyan(chalk.white("Database is connected!")) )).catch(err => console.log(chalk.bgRed(chalk.white(`Database is not connected!`)) ));

// Schema Object
const storeSchme = new mongoose.Schema({
    name: String,
    value: Number,
    isAvailable: Boolean
});

const studentSchema = new mongoose.Schema({
    name: String,
    department: String,
    isPassed: Boolean,
    passingYear: Number
});

// Model
const Store = mongoose.model('store', storeSchme);
const Students = mongoose.model('students', studentSchema);

async function updateData(id, name) {
    return new Promise(async (resolve, reject) => {
        const result = await Students.findByIdAndUpdate(id, {
            $set: {
                name
            }
        }, { new: true }, function(e, r) {
            console.log(e, r);
            if ( r ) {
                resolve(r);
            } else reject(e.message);
        }); 
    });
    
    result.then(obj => resolve(obj)).catch(err => reject(err.message));
}

function add_store( name, value, isAvailable ) {
    return new Promise(async (resolve, reject) => {
        if ( ( name === undefined ) || ( value === undefined ) || ( isAvailable === undefined ) ) {
            reject({ message: "All data have to send" });
        } else {
            const data = new Store({
                name,
                value,
                isAvailable
            });
            
            await data.save().then(obj => resolve(obj)).catch(err => reject({ message: err.message }));
        }
    });
}

function add_student( name, department, isPassed, passingYear ) {
    return new Promise(async ( resolve, reject ) => {
        if ( ( name === undefined ) || ( department === undefined ) || ( isPassed === undefined ) || ( passingYear === undefined ) ) {
            reject({ message: "all data isn't send yet" });
        } else {
            const data = new Students({
                name,
                department,
                isPassed,
                passingYear
            });
            
            await data.save().then(obj => resolve(obj)).catch(err => reject({ message: err.message }));
        }
    });
}

function getAllData() {
    return new Promise(async (resolve, reject) => {
        const data = await Store.find();
        resolve(data);
    });
}

async function getIimitData() {
    // const result = await Store.find({ value: { $in: [10, 60, 50] } }).sort({ name: 1 }).then(obj => console.log(obj)).catch(err => console.log(err.message));
    
    const result = await Store.find().and([ { name: 'Lychee' }, { value: 20 } ]).sort({ name: 1 }).countDocuments().then(obj => console.log(obj)).catch(err => console.log(err.message));
}

// Working with server
const app = express();

app.use(express.json());
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', function (req, res) {
    res.render('index', { title: config.get("name"), servies: `The machine is currently running on ${config.get("environment")}`, message: `Password is: ${config.get("email.password")} and mail is: ${config.get("email.mail")}` });
});

app.get('/allData', async function(req, res) {
    const result = await getAllData().then(result => res.send(result)).catch(err => res.status(500).send(err.message));
});

app.post('/furits', async function(req, res) {
    const { name, value, isAvailable } = req.body;
    
    await add_store(name, value, isAvailable).then(result => res.send(result)).catch(err => res.status(500).send(err.message));
});

app.post('/students', async (req, res) => {
    const { name, department, isPassed, passingYear } = req.body;
    
    await add_student( name, department, isPassed, passingYear ).then(obj => res.send(obj)).catch(err => res.status(500).send(err.message));
});

app.post('/change', async (req, res) => {
    const { id, name } = req.body;
    if ( id ) {
        await updateData(id, name).then(obj => res.send(obj)).catch(err => res.status(500).send(err.message));
    } else res.status(500).send("Data ain't properly send");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(chalk.bgRed(chalk.white(`Server is currently running on ${port}`)));
});