/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost/lime');

var attachmentSchema,
    noteSchema,
    userSchema,
    boardSchema;

var Note,
    User,
    Board;

attachmentSchema = new Schema({
    mimetype: String,
    path: String,
    width: Number,
    height: Number,
    size: Number,
    created: {
        type: Date,
        default: Date.now
    }
});

noteSchema = new Schema({
    title: String,
    note: String,
    url: String,
    attachment: [attachmentSchema],
    createdBy: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

userSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userAgents: [String],
    boards: [{
        boardId: {
            type: String
        }
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

boardSchema = new Schema({
    boardId: {
        type: String,
        required: true,
        unique: true
    },
    title: String,
    note: String,
    backgroundImage: String,
    notes: [noteSchema],
    createdBy: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }    
});

Note = mongoose.model('Note', noteSchema);
User = mongoose.model('User', userSchema);
Board = mongoose.model('Board', boardSchema);

module.exports = {
    Note: Note,
    User: User,
    Board: Board,
};