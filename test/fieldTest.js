const { Field } = require('../models/Field');

function fieldTest1() {
  const field = new Field({
    name: 'Alter Standort',
    value: '12345',
  });
  console.log(field.id);
}

fieldTest1();
