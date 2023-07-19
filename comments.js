// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Create object to store comments
const commentsByPostId = {};

// Create endpoint to handle comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create endpoint to handle comments
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    // Get comments from commentsByPostId
    const comments = commentsByPostId[req.params.id] || [];

    // Push new comment to comments
    comments.push({ id: commentId, content });

    // Set commentsByPostId
    commentsByPostId[req.params.id] = comments;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
        },
    });

    res.status(201).send(comments);
});

// Create endpoint to handle events
app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);

    res.send({});
});

// Listen on port 4001
app.listen(4001, () => {
    console.log('Listening on 4001');
});