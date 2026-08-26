# Documentation Cryptographique — Outil Décodeur MS-PHARM

Ce document conserve l'ensemble des informations secrètes, des clés de chiffrement et des algorithmes utilisés pour la page [`decode.html`](file:///e:/ms-pharm-master/decode.html).

---

## 1. Code d'accès Administrateur

- **Mot de passe en clair :** `msi` (insensible à la casse : `msi`, `MSI`, `Msi`)
- **Empreinte SHA-256 (stockée dans la page) :**
  ```text
  7f1d49243ee662770bbdff7da2cec54eb382cd9d76dfa7b049a620ec457db57b
  ```

---

## 2. Fonction de Calcul MS-PHARM

### A. Code source en clair de la fonction
```javascript
function decodeMSPharm(b) {
  if (!b || b.length < 8) return null;
  let d = b.charAt(2);
  let e = b.charAt(5);
  let f = parseInt(b.charAt(4) + b.charAt(3), 10);
  let g = parseInt(b.charAt(7) + b.charAt(6), 10);

  if (isNaN(f) || isNaN(g)) {
    return null;
  }

  if (d.toUpperCase().charCodeAt(0) < 76) {
    f += 12;
  } else {
    f += 92;
  }

  if (e.toUpperCase().charCodeAt(0) < 76) {
    g += 12;
  } else {
    g += 92;
  }

  return String(f) + String(g);
}
```

### B. Payload chiffrée (stockée dans `decode.html`)
- **Sel cryptographique :** `ms-pharm-sec-2026`
- **Chaîne chiffrée Base64 :**
  ```text
  D99eTW+aarIRdWHZpcMXEcJPhf8wvmNHpV76tXsjnVHaisxV7CsRlieTHS2I1Jg9+FtmYe8nn2YoRDNlFAB4cGc3t8E0NRygxpIqCdmrjkYnRkiC7lvgPmmQ09JEIghN9g4zkWpd2yjxBwyIrGTPhKAMHQSzKGwTu8xvAFjr4NVAiG49OgFadhzb1WJnnof6xeUZkS94jl/2+Na8Lh3J7yCd6gOx28abXKWxZD9327oTPmaq6cL4liwCEMmhIcmexpFWQfkiNN9mB1iPX3/HnW9ZOpL+91W1FgBQEcXGuBoRnf29oS2psPnD48MeKO+d+N21XTlodFaaF0urZC9H4UMaHuLQ+IE8z9Gy1dnwdyGZZPZKUb/NCkSbDZ+eIQyEph+USnmUsS2SAwPGRHnlK8sXt6qqE0xQEYxOvxuuAQ==
  ```

---

## 3. Script pour régénérer ou modifier le chiffrement

Si vous souhaitez modifier le mot de passe ou mettre à jour la formule de calcul à l'avenir, exécutez ce script dans Node.js :

```javascript
// ============================================================================
// Script de génération du chiffrement pour MS-PHARM Décodeur
// ============================================================================
const crypto = require('crypto');

const PASSWORD = 'msi'; // Le mot de passe choisi
const SALT = 'ms-pharm-sec-2026';

// 1. Calcul du hash SHA-256 du mot de passe
const authHash = crypto.createHash('sha256').update(PASSWORD).digest('hex');
console.log('AUTH_HASH :', authHash);

// 2. Corps de la fonction en clair à chiffrer
const funcBody = `if(!b||b.length<8)return null;let d=b.charAt(2);let e=b.charAt(5);let f=parseInt(b.charAt(4)+b.charAt(3),10);let g=parseInt(b.charAt(7)+b.charAt(6),10);if(isNaN(f)||isNaN(g))return null;if(d.toUpperCase().charCodeAt(0)<76)f+=12;else f+=92;if(e.toUpperCase().charCodeAt(0)<76)g+=12;else g+=92;return String(f)+String(g);`;

// 3. Chiffrement par flux (compatible navigateur 100% sans WebCrypto)
function sha256Pure(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function encrypt(dataStr, keyPass) {
  const dataBytes = Array.from(unescape(encodeURIComponent(dataStr)), c => c.charCodeAt(0));
  const outBytes = [];
  let block = [];
  let blockIdx = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    if (i % 32 === 0) {
      block = hexToBytes(sha256Pure(keyPass + SALT + blockIdx));
      blockIdx++;
    }
    outBytes.push(dataBytes[i] ^ block[i % 32]);
  }
  return Buffer.from(outBytes).toString('base64');
}

const encryptedDecoder = encrypt(funcBody, PASSWORD);
console.log('ENCRYPTED_DECODER :', encryptedDecoder);
```
