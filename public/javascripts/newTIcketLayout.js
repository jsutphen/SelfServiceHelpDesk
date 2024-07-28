function handleTicketTypeChange(ticketType) {
  if (ticketType === 'pleaseChoose') {
    pleaseChoose_layout();
  }
  if (ticketType == 'hardwareInstallation') {
    hardwareInstallationLayout();
  }
}


document.addEventListener('DOMContentLoaded', function() {
  initLayout();
});

function initLayout() {
  // layout
  const contactFields = document.querySelector('#contactFields')
  contactFields.style.display = 'none';

  const hardwareInstallationFields = document.querySelector('#hardwareInstallationFields');
  hardwareInstallationFields.style.display = 'none';

  const form_submit = document.querySelector('.ticketForm button');
  form_submit.style.display = 'none';

  const ticketTypeSelector = document.querySelector('#ticketType');
  ticketTypeSelector.value = 'pleaseChoose';
  
  // logic
  ticketTypeSelector.addEventListener('change', () => {
    handleTicketTypeChange(ticketTypeSelector.value);
  });

  handleTicketTypeChange();
}

function pleaseChoose_layout() {
  initLayout();
}

function hardwareInstallationLayout() {
  initLayout();

  const ticketTypeSelector = document.querySelector('#ticketType');
  ticketTypeSelector.value = 'hardwareInstallation';

  const contactFields = document.querySelector('#contactFields')
  contactFields.style.display = 'block';
  
  const hardwareInstallationFields = document.querySelector('#hardwareInstallationFields');
  hardwareInstallationFields.style.display = 'block';

  const form_submit = document.querySelector('form button');
  form_submit.style.display = 'block';
}