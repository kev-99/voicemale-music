# VoiceMale music library (temporary)

A single page that takes the choir's shared password and opens the Current Songs
folder on Google Drive. It stands in while voicemale.com.au is offline, and comes
down once the main site is back.

The folder link is stored encrypted with the password (PBKDF2-SHA256, AES-256-GCM)
and decrypted in the browser. The password and the plain link are not in this
repository. To change either, run `tools/encrypt-link.ps1` and paste its output
into `ENCRYPTED_LINK` in `app.js`.
