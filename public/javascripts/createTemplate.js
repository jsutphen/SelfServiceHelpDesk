const newFieldButton = document.querySelector('#addFields');
let newFieldsIndex = 0;
newFieldButton.addEventListener('click', () => {
  const newFieldsContainer = document.querySelector('#newFieldsContainer');

  // name field for new additionalField
  const name = document.createElement('input');
  name.name = 'additionalFieldTypesNames';
  name.placeholder = 'Feldname';
  newFieldsContainer.append(name);

  // html type of the additionalField
  const typeSelect = document.createElement('select');
  typeSelect.name = 'additionalFieldTypesTypes';

  const optionText = document.createElement('option');
  optionText.value = 'text';
  optionText.innerHTML = 'Text';
  typeSelect.append(optionText);

  const optionDate = document.createElement('option');
  optionDate.value = 'date';
  optionDate.innerHTML = 'Datum';
  typeSelect.append(optionDate);

  newFieldsContainer.append(typeSelect);

  newFieldsIndex += 1;
});
