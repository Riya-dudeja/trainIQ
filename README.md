
# TrainIQ

A Next.js app for AI-powered pose detection, posture analysis, and exercise feedback using MediaPipe Pose and RapidAPI Gym Fit.

## Features
- Real-time pose detection using webcam and MediaPipe Pose
- Joint angle calculation (elbow, knee, etc.)
- Exercise and posture feedback overlay on video
- Integration with Gym Fit API for exercise data
- Modular React client components

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

```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
trainiq/
├── app/
│   ├── pose/         # Pose detection page
│   ├── gym/          # Gym exercise definitions
│   └── utils/        # API utilities
├── public/           # Static assets
├── styles/           # Global styles
├── .env.local        # Environment variables
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
- To add new exercises or feedback logic, edit `app/gym/page.jsx` and `app/utils/gymFitApi.js`.
- For UI changes, update `app/globals.css` and component files.

## Troubleshooting
- **API 404 errors:** Check your `.env.local` for correct RapidAPI host and key.
- **Pose detection issues:** Ensure webcam permissions and CDN scripts are loading.

## License
MIT

## Author
Riya Dudeja

