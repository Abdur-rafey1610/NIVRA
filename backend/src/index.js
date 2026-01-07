const express = require('express');
const bodyParser = require('body-parser');
const iotRouter = require('./routes/iot');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/iot', iotRouter);

app.get('/', (req, res) => res.send('Nivra Backend OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nivra backend listening on ${PORT}`));
