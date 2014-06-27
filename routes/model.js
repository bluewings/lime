var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost/sample0');
//http://182.162.196.40/
var attachmentSchema,
    noteSchema,
    userSchema,
    shareSchema;

var Note,
    User,
    Share;

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
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});
/*noteSchema.virtual('title2').get(function(){
    return this.title;
});
noteSchema.virtual('shareId').get(function(){
    return this.shareId;
});*/

userSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userAgents: [String],
    notes: [noteSchema],
    shared: [{
        shareId: {
            type: String
        }
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

shareSchema = new Schema({
    shareId: {
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
    }
});

Note = mongoose.model('Note', noteSchema);
User = mongoose.model('User', userSchema);
Share = mongoose.model('Share', shareSchema);

module.exports = {
    Note: Note,
    User: User,
    Share: Share
};