// The Current Songs folder link, encrypted with the shared password.
// Regenerate with tools/encrypt-link.ps1 when the password or folder changes.
const ENCRYPTED_LINK = 'mmNMKXlEYEenClHdP02VgZzTlhRd9LP9WMjDeFyK67r4hcSfwYkospeZWFYvEofgR1GV+MvNTu2jZ86n6/rxTRavOCf8B3+qlNb/IkOOsYowneE5RPTn2KZiXhSH73viqSCwyBM8pvvTQIy8Ug15Y5+sU2dncUEhLkO3+WtBe99rNnk=';
const ITERATIONS = 600000;

const form = document.getElementById('unlock');
const input = document.getElementById('password');
const button = form.querySelector('button');
const message = document.getElementById('message');
const library = document.getElementById('library');
const currentSongs = document.getElementById('current-songs');

async function decryptLink(password) {
  const bytes = Uint8Array.from(atob(ENCRYPTED_LINK), (c) => c.charCodeAt(0));
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const data = bytes.slice(28);

  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  // Phones capitalise the first letter; the password is matched lower-case.
  const password = input.value.trim().toLowerCase();
  if (password === '') return;

  button.disabled = true;
  message.className = '';
  message.textContent = 'Checking…';
  try {
    const link = await decryptLink(password);
    currentSongs.href = link;
    form.hidden = true;
    message.textContent = '';
    library.hidden = false;
    currentSongs.focus();
  } catch {
    // A wrong password fails the GCM tag check.
    message.className = 'error';
    message.textContent = 'That password is not right. Check it and try again.';
    input.select();
  } finally {
    button.disabled = false;
  }
});
