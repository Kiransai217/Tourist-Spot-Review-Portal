const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) menuToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
document.querySelectorAll('.flash-close').forEach(button => button.addEventListener('click', () => button.closest('.flash')?.remove()));
// Give forms a small loading state to prevent accidental double submissions.
document.querySelectorAll('form').forEach(form => form.addEventListener('submit', () => {
  const button = form.querySelector('button[type="submit"]');
  if (button && !form.hasAttribute('data-confirm-pending')) {
    button.dataset.originalText = button.textContent;
    if (!form.getAttribute('onsubmit') || !form.getAttribute('onsubmit').includes('confirm(')) {
      button.disabled = true;
      button.textContent = 'Please wait…';
    }
  }
}));
