const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  time: { type: Date, required: true, default: Date.now() }
})