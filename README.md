
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

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
	```bash
	git clone https://github.com/Riya-dudeja/trainIQ.git
	cd trainIQ
	```
2. Install dependencies:
	```bash
	npm install
	# or
	yarn install
	```
3. Set up environment variables:
	- Copy `.env.local.example` to `.env.local` (or create `.env.local`)
	- Add your RapidAPI key and host:
	  ```env
	  NEXT_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key
	  NEXT_PUBLIC_RAPIDAPI_HOST=gym-fit.p.rapidapi.com
	  ```

### Running the App
```bash
npm run dev
# or
yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Pages
- **`/pose`** - Basic pose detection demo with angle visualization
- **`/gym-api`** - Full AI trainer experience with exercise selection and real-time feedback

## Project Structure
```
trainiq/
├── app/
│   ├── pose/         # Basic pose detection demo page
│   ├── gym-api/      # Enhanced AI trainer with real-time feedback
│   └── utils/        # API utilities and pose analysis functions
├── public/           # Static assets
├── .env.local        # Environment variables (create from .env.local.example)
├── package.json      # Project metadata
└── README.md         # Project documentation
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
