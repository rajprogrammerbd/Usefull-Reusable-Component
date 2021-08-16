const express = require("express");
const app = express();
const err = require("./middlewares/err");
const multer = require("multer");
require("express-async-errors");

app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images');
    },
    filename: function (req, file, cb) {

      const last = file.originalname.lastIndexOf(".");
      let extension = file.originalname.slice(last, file.originalname.length);


      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });
  
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 1 } });

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/', upload.single('img'), (req, res) => {
    res.send('successfully uploaded picture');
});

app.use(err);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Application currently running on ${PORT}`));