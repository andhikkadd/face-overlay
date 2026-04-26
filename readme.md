# 👓 Frame Studio

**Frame Studio** is an interactive web-based application that allows users to try on virtual glasses in real-time using their webcam.

Built with browser-based machine learning, this project detects facial landmarks and dynamically adjusts glasses overlays based on head movement (yaw, pitch, and rotation).

---

## ✨ Features

* 🎥 Real-time face tracking using webcam
* 🧠 FaceMesh-based landmark detection (ML)
* 👓 Dynamic glasses overlay (auto adjust with head movement)
* 🎯 Yaw & Pitch adjustment for more realistic fitting
* 🖼 Multiple frame styles to choose from
* 📸 Capture photo feature

---

## 🛠 Tech Stack

* HTML, CSS, JavaScript
* p5.js
* ml5.js (FaceMesh)

---

## 🚀 Live Demo

Coming soon... (will be deployed on Netlify)

<!-- ---

## 📸 Preview

> Add screenshot here later (recommended for better presentation)

--- -->

## 📂 Project Structure

```
frame-studio/
│
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── glasses.png
│   ├── glasses1.png
│   └── ...
│
├── README.md
```

---

## ▶️ How to Run

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/frame-studio.git
   ```

2. Open `index.html` in your browser

3. Allow camera access when prompted

---

## ⚠️ Notes

* Requires webcam access to function
* Best experienced on desktop browser
* Lighting conditions may affect face detection accuracy

---

## 🧠 How It Works

This project uses FaceMesh from ml5.js to detect key facial landmarks such as:

* Eyes
* Nose
* Cheeks
* Chin

From these points, the system calculates:

* **Center position** of the face
* **Distance between eyes** (for scaling)
* **Rotation (roll)**
* **Yaw (left/right head movement)**
* **Pitch (up/down movement)**

These values are then used to transform and warp the glasses image so it follows the user's face naturally.

---

## 🚧 Current Status

This project is still under development.

Planned improvements:

* Better alignment accuracy
* Improved mobile support
* UI/UX enhancements
* More glasses styles
* Smoother tracking performance

---

## 💡 Future Ideas

* Download captured image
* AR-style filters (not only glasses)
* Face-centered auto adjustment
* Animation & transition effects
* Multi-face detection

---

## 🙌 Author

Made with curiosity and experimentation in computer vision & web ML.