---
layout: post
title: FnStegoCrypt - Encrypted Data in Images
date: 2024-06-25 12:00:00
description: A program that encrypts data using AES-GCM and embeds it into images with LSB.
tags: FnStegoCrypt
categories: Tools
thumbnail: https://raw.githubusercontent.com/Eyezuhk/FnStegoCrypt/refs/heads/main/Resources/FnStegoCrypt.jpg
giscus_comments: true
related_posts: true
featured: false
toc:
  sidebar: left
---

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign repo = "eyezuhk/FnStegoCrypt" %}
  {% include repository/repo.liquid repository=repo %}
</div>

---

## Main Features

The program offers the following key capabilities:

1. **Salt Generation and Key Derivation**:
   - Combines PBKDF2-HMAC with SHA-256 to derive a secure key from a provided password.
   - Generates a random *salt* to enhance key derivation security.

2. **AES-GCM Encryption**:
   - Encrypts data using the AES-GCM algorithm, providing both confidentiality and integrated data authentication.

3. **Data Hiding in Images**:
   - Uses the least significant bits (LSBs) of pixels to store information without compromising the visible quality of the image.

4. **Integrity Verification**:
   - Generates a SHA-256 hash of the original data and embeds it along with the encrypted data, allowing verification of data integrity.

5. **Support for Multiple Image Formats**:
   - Supports common formats such as PNG and JPEG, as well as HEIF and HEIC images.

6. **Batch Processing**:
   - Allows efficient processing of multiple images in a directory using threads.

---

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="assets/videos/FnStegoCrypt/FnStegoCrypt.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Example video of FnStegoCrypt.
</div>

## Program Structure

### `ImprovedSteganography` Class

This class is the core of the program, containing methods for all steganography and encryption operations:

- **`generate_salt`**: Generates a random *salt*.
- **`_derive_key`**: Derives a secure key from a password using PBKDF2.
- **`encrypt_data` and `decrypt_data`**: Encrypt and decrypt data using AES-GCM.
- **`hash_data`**: Calculates the SHA-256 hash of data to ensure integrity.
- **`check_image_capacity`**: Checks if the image has sufficient capacity to store the data.
- **`hide_data_in_image`**: Embeds encrypted data into the image.
- **`extract_data_from_image`**: Extracts hidden data from the image.

### Program Workflow

1. **Write Mode (Hiding Data)**:
   - The user selects an image file or directory.
   - Reads data from a text file and encrypts it.
   - Embeds the encrypted data into the image and saves a new version of the image.

2. **Read Mode (Extracting Data)**:
   - The user provides an image with hidden data and the corresponding password.
   - The program extracts and verifies the encrypted data, decrypts it, and returns it to the user.

---

## Key Technologies Used

- **`cryptography` Library**:
  - Used for encryption and key derivation.
- **`Pillow` Library**:
  - Used for image manipulation.
- **`NumPy`**:
  - Provides efficient operations for handling pixel arrays.
- **`concurrent.futures`**:
  - Enables parallel processing for batch operations.

---

## Usage Examples

### Hiding Data in an Image

1. The program prompts for a password, an image path, and a text file path.
2. Encrypts the text file content with the provided password.
3. Hides the encrypted data in the image and saves the resulting image to an output directory.

### Extracting Data from an Image

1. The user provides the steganographed image and the password.
2. The program verifies the integrity of the data and decrypts it.
3. Returns the data to the user, who can choose to view or save it to a file.

---

## Final Considerations

**FnStegoCrypt** is a powerful tool for applications requiring discretion and security in data transmission. Its use of cutting-edge algorithms like AES-GCM and SHA-256, combined with the ability to work with multiple image formats, makes it ideal for scenarios where data protection is critical.

If you're interested in contributing to improvements, feel free to explore the code and adapt it to your needs.
