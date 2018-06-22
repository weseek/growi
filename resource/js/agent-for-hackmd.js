/* eslint-disable no-console  */
console.log('Loading GROWI agent for HackMD...');

const allowedOrigin = '{{origin}}';

/**
 * Validate origin
 * @param {object} event
 */
function validateOrigin(event) {
  if (event.origin !== allowedOrigin) {
    console.error('Rejected');
    return;
  }
}

window.addEventListener('message', (event) => {
  validateOrigin(event);
  console.log('getValue called');
});

console.log('GROWI agent for HackMD has successfully loaded.');
