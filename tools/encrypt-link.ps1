# Encrypts the music folder link with the shared password and prints the
# value to paste into app.js as ENCRYPTED_LINK.
#
#   pwsh tools/encrypt-link.ps1 -Password '<shared password>' -Link '<Drive folder URL>'
#
# Neither the password nor the plain link is ever committed: the repository is
# public. Format (base64): 16-byte salt | 12-byte IV | AES-256-GCM ciphertext | 16-byte tag.
# Key: PBKDF2-SHA256 over the password, trimmed and lower-cased as app.js does.
# Needs PowerShell 7 (.NET 6+).

param(
    [Parameter(Mandatory)] [string] $Password,
    [Parameter(Mandatory)] [string] $Link,
    [int] $Iterations = 600000
)

$ErrorActionPreference = 'Stop'

$pw   = [Text.Encoding]::UTF8.GetBytes($Password.Trim().ToLowerInvariant())
$salt = [Security.Cryptography.RandomNumberGenerator]::GetBytes(16)
$iv   = [Security.Cryptography.RandomNumberGenerator]::GetBytes(12)
$key  = [Security.Cryptography.Rfc2898DeriveBytes]::Pbkdf2(
    $pw, $salt, $Iterations, [Security.Cryptography.HashAlgorithmName]::SHA256, 32)

$plain  = [Text.Encoding]::UTF8.GetBytes($Link)
$cipher = [byte[]]::new($plain.Length)
$tag    = [byte[]]::new(16)
$aes    = [Security.Cryptography.AesGcm]::new($key, 16)
$aes.Encrypt($iv, $plain, $cipher, $tag)

# Web Crypto expects the tag appended to the ciphertext.
[Convert]::ToBase64String([byte[]]($salt + $iv + $cipher + $tag))
