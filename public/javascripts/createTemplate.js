const newFieldButton = document.querySelector('#addFields');
newFieldButton.addEventListener('click', () => {
  const newFieldsContainer = document.querySelector('#newFieldsContainer');
  const name = document.createElement('input');
  name.placeholder = 'Feldname';
  const select = document.createElement('select');
  select.name = 'additionalFieldTypes';
  if (!Array.isArray(fieldTypes)) {
    fieldTypes = [fieldTypes];
  }
  fieldTypes.forEach(fieldType => {
    const option = document.createElement('option');
    option.innerHTML = `${fieldType.name}, ${fieldType.type}`;
    select.append(option);
    option.value = fieldType._id;
  });
  newFieldsContainer.append(select);
});
