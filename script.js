function openStep(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  centerModal(modal);

  // Show the overlay
  document.querySelector('.modal-overlay').style.display = 'block';
}

function closeStep(modalId) {
  document.getElementById(modalId).style.display = "none";

  // Hide the overlay
  document.querySelector('.modal-overlay').style.display = 'none';
}

// Function to center modal
function centerModal(modal) {
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
}

// Store selections in local storage
function storeSelection(stepId, selectionData) {
  localStorage.setItem(stepId, JSON.stringify(selectionData));
}

// Load selections from local storage (if available)
function loadSelections() {
  const step1Data = JSON.parse(localStorage.getItem('step1')) || {};
  const step2Data = JSON.parse(localStorage.getItem('step2')) || {};
  const step3Data = JSON.parse(localStorage.getItem('step3')) || {};

  // If data exists, populate fields and selections for Step 1
  if (step1Data.choice) selectChoice(step1Data.choice);
  if (step1Data.balance) setBalance('step1', step1Data.balance);
  if (step1Data.flavour) setFlavour('step1', step1Data.flavour);
  if (step1Data.feedback) document.getElementById('personal-feedback-step1').value = step1Data.feedback;

  // Step 2
  if (step2Data.balance) setBalance('step2', step2Data.balance);
  if (step2Data.flavour) setFlavour('step2', step2Data.flavour);
  if (step2Data.preparation) document.getElementById('preparation-input').value = step2Data.preparation;

  // Step 3
  if (step3Data.balance) setBalance('step3', step3Data.balance);
  if (step3Data.flavour) setFlavour('step3', step3Data.flavour);
  if (step3Data.delivery) document.getElementById('delivery-input').value = step3Data.delivery;
}

// Variables to track selections
let selectedChoice = "";
let selectedBalance = 3;
let selectedFlavour = "";

// Function to handle governance area selection for Step 1
function selectChoice(choice) {
  selectedChoice = choice;

  checkStepCompletion('step1');
}

// Function to set balance value from storage
function setBalance(stepId, value) {
  document.getElementById(`balance-slider-${stepId}`).value = value;
  document.getElementById(`balance-value-${stepId}`).innerText = value;
  selectedBalance = value;
}

// Function to set flavour from storage
function setFlavour(stepId, flavour) {
  document.getElementById(`flavours-${stepId}`).value = flavour;
  selectedFlavour = flavour;
}

// Function to handle Balance Scale input changes for each step
function handleBalanceChange(stepId, value) {
  document.getElementById(`balance-value-${stepId}`).innerText = value;
  selectedBalance = value;
  checkStepCompletion(stepId);
}

// Function to handle Flavours Compass selection changes for each step
function handleFlavoursChange(stepId, flavour) {
  selectedFlavour = flavour;
  checkStepCompletion(stepId);
}

// Check if all selections have been made for the step and enable Generate Prompt button
function checkStepCompletion(stepId) {
  const generatePromptButton = document.querySelector(`#${stepId} .generate-prompt`);

  if (stepId === "step1" && selectedChoice && selectedBalance && selectedFlavour) {
    generatePromptButton.disabled = false;
  } else if (stepId === "step2" && selectedBalance && selectedFlavour) {
    generatePromptButton.disabled = false;
  } else if (stepId === "step3" && selectedBalance && selectedFlavour) {
    generatePromptButton.disabled = false;
  } else {
    generatePromptButton.disabled = true;
  }
}

// Generate the AI-ready prompt based on the current selections
function generatePrompt(stepId) {
  let promptOutput = document.getElementById(`prompt-output-${stepId}`);
  let aiPrompt = "";

  if (stepId === "step1") {
    const personalFeedback = document.getElementById('personal-feedback-step1').value;
    const inputState = document.getElementById('input-state-step1').value;
    aiPrompt = `Pls provide self-governance advice focusing on "${personalFeedback}". I choose to emphasize the topic of "${inputState}". The principle I wish to focus on is "${selectedFlavour}" and its current balance rate is ${selectedBalance} (on a scale of 5, with 3 being optimal).`;
  } else if (stepId === "step2") {
    const preparationInput = document.getElementById('preparation-input').value;
    aiPrompt = `Pls reflect on the governance preparation process. The balance rating is ${selectedBalance} (3 is optimal), and the focus should be on ${selectedFlavour}. Consider the following strategies: "${preparationInput}".`;
  } else if (stepId === "step3") {
    const deliveryInput = document.getElementById('delivery-input').value;
    aiPrompt = `Pls refine the governance outcomes, considering a balance rating of ${selectedBalance} (with 3 being the goal), with a focus on ${selectedFlavour}. Here's the current delivery plan: "${deliveryInput}".`;
  }

  // Display the AI-ready prompt in the UI
  promptOutput.innerText = aiPrompt;

  // Save selection in localStorage
  storeSelection(stepId, {
    choice: selectedChoice,
    balance: selectedBalance,
    flavour: selectedFlavour,
    feedback: stepId === 'step1' ? document.getElementById('personal-feedback-step1').value : null,
    preparation: stepId === 'step2' ? document.getElementById('preparation-input').value : null,
    delivery: stepId === 'step3' ? document.getElementById('delivery-input').value : null
  });
}

// Move to the next step and save progress
function nextStep(nextModalId) {
  // Close current modal and open next modal
  const currentModal = document.querySelector('.modal[style*="block"]');
  if (currentModal) closeStep(currentModal.id);
  openStep(nextModalId);

  // Auto-save progress
  const stepId = currentModal ? currentModal.id.replace('-modal', '') : '';
  if (stepId) {
    generatePrompt(stepId);
  }
}

// Return to the main page after final step and auto-save
function returnToMain() {
  const currentModal = document.querySelector('.modal[style*="block"]');
  if (currentModal) closeStep(currentModal.id);

  // Auto-save the final step
  generatePrompt('step3');

  // Redirect to main page where save/download process can happen
  location.href = "#";
}

// Save the entire process (all steps) to a file
function downloadProcess() {
  const step1Prompt = document.getElementById('prompt-output-step1').innerText || "No prompt for Step 1";
  const step2Prompt = document.getElementById('prompt-output-step2').innerText || "No prompt for Step 2";
  const step3Prompt = document.getElementById('prompt-output-step3').innerText || "No prompt for Step 3";
  
  const preparation = document.getElementById('preparation-input').value || "No preparation provided";
  const delivery = document.getElementById('delivery-input').value || "No delivery input";
  
  const data = `
    Step 1: Choices
    ${step1Prompt}

    Step 2: Preparation
    Preparation Input: ${preparation}
    ${step2Prompt}

    Step 3: Delivery
    Delivery Input: ${delivery}
    ${step3Prompt}
  `;

  const blob = new Blob([data], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'process.txt';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

// Add event listeners for Balance Scale and Flavours Compass
document.getElementById('balance-slider-step1').oninput = function() {
  handleBalanceChange('step1', this.value);
}

document.getElementById('balance-slider-step2').oninput = function() {
  handleBalanceChange('step2', this.value);
}

document.getElementById('balance-slider-step3').oninput = function() {
  handleBalanceChange('step3', this.value);
}

document.getElementById('flavours-step1').onchange = function() {
  handleFlavoursChange('step1', this.value);
}

document.getElementById('flavours-step2').onchange = function() {
  handleFlavoursChange('step2', this.value);
}

document.getElementById('flavours-step3').onchange = function() {
  handleFlavoursChange('step3', this.value);
}

// Load saved data on page load
window.onload = loadSelections;

function copyPrompt(promptId) {
  const promptText = document.getElementById(promptId).innerText;
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = promptText;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextarea);

  // Show copy success message
  const copySuccess = document.getElementById(`copy-success-${promptId.split('-')[2]}`);
  copySuccess.style.display = 'inline';
  setTimeout(() => {
    copySuccess.style.display = 'none';
  }, 2000); // Hide after 2 seconds
}
