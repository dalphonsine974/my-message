var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// socket io wiring
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var dbUrl = 'mongodb+srv://dbuser:dbuserpassword@cluster0.caeu1.mongodb.net/learning-node?retryWrites=true&w=majority';

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });

});

app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body);
        var savedMessage = await message.save();
        console.log('saved');

        var censored = await Message.findOne({ message: 'badword' });
        if (censored) {
            await Message.remove({ _id: censored.id });
        } else {
            io.emit('message', req.body);
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.error(error);
    } finally {
        console.log('post method called');
    }
});

io.on('connection', (socket) => {
    console.log('Incoming connection');
});

mongoose.connect(dbUrl, (error) => {
    console.log('DB connected', error);
});

var server = http.listen(3000, () => {
    console.log('server listening on port', server.address().port);
});