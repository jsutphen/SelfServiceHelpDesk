const mongoose = require('mongoose');

const FieldTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // type: the html form type of this field
  type: { type: String, required: true, default: 'text' },
});

FieldTypeSchema.virtual('shortName').get(function () {
  return `${this.name.replace(' ', '_')}`;
});

const FieldType = mongoose.model('FieldType', FieldTypeSchema);

module.exports = { FieldType };
