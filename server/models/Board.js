const mongoose = require('mongoose');

const ElementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // pencil, eraser, line, arrow, rectangle, circle, text, sticky, image
  points: [{ x: Number, y: Number }], // for pencil/eraser/multi-point line
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  strokeColor: { type: String, default: '#000000' },
  fillColor: { type: String, default: 'transparent' },
  strokeWidth: { type: Number, default: 3 },
  strokePattern: { type: String, default: 'solid' }, // solid, dashed, dotted
  opacity: { type: Number, default: 1 },
  text: { type: String, default: '' },
  fontSize: { type: Number, default: 18 },
  fontFamily: { type: String, default: 'Inter' },
  imageSrc: { type: String, default: '' },
  zIndex: { type: Number, default: 0 },
  createdBy: { type: String, default: 'Anonymous' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const BoardSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Whiteboard'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  ownerName: {
    type: String,
    default: 'Guest'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  passcode: {
    type: String,
    default: ''
  },
  elements: [ElementSchema],
  chatMessages: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  undoStack: {
    type: Array,
    default: []
  },
  redoStack: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Board', BoardSchema);
