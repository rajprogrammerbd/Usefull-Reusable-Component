// importing modules
const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

// Importing Middlewares Modules
const auth = require("./middlewares/auth");

if ( !config.get("jsonPrivateKey") ) {
    console.error("FATAL ERROR: jsonPrivateKey isn't define");
    process.exit(1);
}

// Creating an application using express module
const app = express();

// state management of the web server
const state_management = {
    name: { min: 2, max: 255, required: true },
    department: { min: 2, max: 255, required: true },
    email: { min: 2, max: 255, required: true },
    password: { min: 2, max: 1024, required: true}
}

// Connection to the database
mongoose.connect('mongodb://localhost/user', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }).then(() => console.log('Succed to connect to database')).catch(() => console.log('Failed to connect with database'));

// Database Schema Design
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: state_management.name.required,
        minlength: state_management.name.min,
        maxlength: state_management.name.max
    },
    department: {
        type: String,
        trim: true,
        minlength: state_management.department.min,
        maxlength: state_management.department.max,
        required: state_management.department.required
    },
    passingYear: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        minlength: state_management.email.min,
        maxlength: state_management.email.max,
        required: state_management.email.required
    },
    password: {
        type: String,
        minlength: state_management.password.min,
        maxlength: state_management.password.max,
        required: state_management.password.required
    }
});

userSchema.methods.generateUserToken = function() {
    const token = jwt.sign({ _id: this._id, name: this.name, department: this.department, passingYear: this.passingYear }, config.get('jsonPrivateKey'));

    return token;
}

// Database Model Design
const User = mongoose.model('User', userSchema);


// Functions for addeding data
function addUser(name, department, passingYear, email, password) {
    return new Promise((resolve, reject) => {
        const user = new User({
            name, 
            department, 
            passingYear, 
            email, 
            password
        });

        async function hash() {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(user.password, salt);
            user.password = hashed;
            return user;
        }
        
        hash().then(obj => {
            obj.save().then(obj => resolve(obj)).catch(err => reject(err));
        }).catch(err => reject(err.message));
    });
}

// connect middlewares
app.use(express.json());
app.use(express.static("public"));
app.use(helmet());

// REST APIs
app.get('/', (req, res) => {
    res.send("Wellcome to REST APIs Users Page");
});

// Login a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if ( ( email === undefined ) || ( password === undefined ) ) {
        res.status(500).send("All prerequist data hasn't send it yet");
    } else {
        const schema = Joi.object({
            email: Joi.string().min(state_management.email.min).max(state_management.email.max).required().email(),
            password: Joi.string().min(state_management.password.min).max(state_management.password.max).required()
        });

        try {
            const result = await schema.validateAsync({ email, password });
            const find = await User.find({ email: result.email });
            
            if ( find.length === 1 ) {
                const r = await bcrypt.compare(result.password, find[0].password);
                if ( r ) {
                    // This code will run whenever the user successed to login.

                    const token = find[0].generateUserToken();
                    res.header('x-auth-token', token).send('Login Successfully');
                } else res.status(500).send("Password ain't same");
            } else if ( find.length > 1 ) {
                res.status(500).send('added more user than one, problem is in registration');
            } else res.status(500).send('user not found');
        } catch(err) {
            res.status(500).send(err.details[0].message);
        }
    }
});

// Register a user
app.post('/user', auth, async (req, res) => {
    const { name, department, passingYear, email, password } = req.body;
    if ( name === undefined || department === undefined || passingYear === undefined || email === undefined|| password === undefined ) {
        res.status(404).send("All Data isn't send currently");
    } else {
        const schema = Joi.object({
            name: Joi.string().min(state_management.name.min).max(state_management.name.max).required(),
            department: Joi.string().min(state_management.department.min).max(state_management.department.max).required(),
            passingYear: Joi.number().min(2017).max(new Date().getFullYear()).required(),
            email: Joi.string().min(state_management.email.min).max(state_management.email.max).required().email(),
            password: Joi.string().required().min(state_management.password.min).max(state_management.password.max)
        });

        try {
            const result = await schema.validateAsync({ name, department, passingYear, email, password });
            const answer = await User.find({ email: result.email });
            if ( answer.length === 0 ) {
                addUser(result.name, result.department, result.passingYear, result.email, result.password).then(obj => {
                    // Send Conformation of User Object...
                    const token = obj.generateUserToken();
                    res.header('x-auth-token', token).send(obj);
                }).catch(err => res.status(500).send(err.message));
            } else {
                res.status(500).send('User is already added!');
            }
            
        } catch ( err ) {
            res.status(500).send(err.details[0].message);
        }
    }
});

app.get('/get', async (req, res) => {
    res.send(await User.find());
});


// Starting the web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Connected web server at ${PORT}`));