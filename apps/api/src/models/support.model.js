const { Schema, model } = require('mongoose');
const ticketSchema = new Schema({
  type: { type: String, enum: ['SUPPORT', 'ENQUIRY'], default: 'SUPPORT' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  name: String,
  mobile: String,
  email: String,
  subject: String,
  message: String,
  status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN', index: true },
}, { timestamps: true });
module.exports = { Ticket: model('Ticket', ticketSchema) };
