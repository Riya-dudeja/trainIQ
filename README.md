
# TrainIQ

A Next.js app for AI-powered pose detection, posture analysis, and exercise feedback using MediaPipe Pose and RapidAPI Gym Fit.

## Features
- **Real-time pose detection** using webcam and MediaPipe Pose
- **Advanced exercise analysis** with form scoring and rep counting
- **Exercise-specific feedback** for squats, bicep curls, bench press, and more
- **Real-time metrics** including movement tempo, bilateral symmetry, and range of motion
- **Voice feedback** with priority-based coaching cues
- **Session tracking** with progress analytics and performance metrics
- **Integration with Gym Fit API** for comprehensive exercise database
- **Enhanced UI** with progress rings, real-time metrics, and detailed instructions



# trainIQ: Fitness Trainer

## Overview
trainIQ is a web-based fitness coaching platform built with Next.js and React. It uses MediaPipe Pose for real-time body tracking and feedback, helping users improve their exercise form and track progress. The app works directly in the browser—no extra hardware required.

## What Makes trainIQ Unique
- **Real-Time Coaching:** Analyzes movement and form using pose estimation.
- **Rep Counting:** Tracks squats, pushups, and jumping jacks with persistent state.
- **Yoga Pose Support:** Hold timer system for yoga and static poses.
- **Dynamic Feedback:** Transparent overlays and audio cues for guidance.
- **Mobile-First Design:** Responsive UI for all devices.
- **Consistent Branding:** Clean interface with clear navigation.

## Tech Stack
- Next.js, React, Tailwind CSS
- MediaPipe Pose (33-point body tracking)
- Web Speech API for audio feedback
- Python backend (optional for advanced features)

## Key Features
- Real-time coaching in the browser
- Accurate rep counting and pose analysis
- Yoga timer system for static holds
- Audio and visual feedback
- Mobile-optimized UI
- Scalable architecture for future expansion

## Quick Start
1. Clone the repo:
	```bash
	git clone https://github.com/Riya-dudeja/trainIQ.git
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Run the app:
	```bash
	npm run dev
	```
4. Open in browser: [http://localhost:3000](http://localhost:3000)

## Project Structure
- `app/gym-api/page.jsx` — Main trainer logic (pose analysis, rep counting, feedback)
- `app/gym/page.jsx` — Quick Start trainer (minimal UI, instant feedback)
- `app/page.js` — Homepage and navigation
- `backend/` — Python pose server and environment setup

## Recruiter Highlights
- Full-stack React, Next.js, and Python integration
- Real-world computer vision for fitness
- Modern, mobile-optimized interface
- Clean architecture ready for new features
- Helps users train smarter, anywhere

## Contact
For more information or collaboration, connect via [GitHub](https://github.com/Riya-dudeja/trainIQ) or email.
```

## Technologies Used
- Next.js (App Router)
- React
- MediaPipe Pose (via CDN)
- RapidAPI Gym Fit
- react-webcam

## Customization
- To add new exercises or feedback logic, edit `app/gym-api/page.jsx` and `app/utils/gymFitApi.js`.
- For UI changes, update `app/globals.css` and component files.
- Add new exercise types by extending the `exerciseAnalyzers` object in `gym-api/page.jsx`.

## Troubleshooting
- **API 404 errors:** Check your `.env.local` for correct RapidAPI host and key.
- **Pose detection issues:** Ensure webcam permissions and CDN scripts are loading.
- **`[object Event]` errors:** These have been fixed with enhanced error handling in the latest version.
- **MediaPipe loading issues:** Check browser console for CDN connectivity issues.
- **Performance issues:** Reduce `modelComplexity` in MediaPipe configuration if needed.

## License
MIT

## Author
Riya Dudeja
