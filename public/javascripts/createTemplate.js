const newFieldButton = document.querySelector('#addFields');
newFieldButton.addEventListener('click', () => {
  const newFieldsContainer = document.querySelector('#newFieldsContainer');
  const additionalFieldGroup = document.createElement('div');
  additionalFieldGroup.className = 'additionalFieldGroup';

  // name field for new additionalField
  const name = document.createElement('input');
  name.name = 'additionalFieldTypesNames';
  name.placeholder = 'Feldname';
  additionalFieldGroup.append(name);

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

  additionalFieldGroup.append(typeSelect);

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Entfernen';
  deleteButton.type = 'button';
  additionalFieldGroup.append(deleteButton);
  deleteButton.addEventListener('click', () => {
    deleteButton.parentElement.parentElement.removeChild(deleteButton.parentElement);
  });

  newFieldsContainer.append(additionalFieldGroup);
});

const deleteField = document.querySelectorAll('.additionalFieldGroup > button');
deleteField.forEach((element) => {
  element.addEventListener('click', () => {
    element.parentElement.parentElement.removeChild(element.parentElement);
  });
});
