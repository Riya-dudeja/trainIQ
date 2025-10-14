// Backend Connection Demo Script
// Quick fallback for demo without backend complexity

const DEMO_MODE_SCRIPT = `
  // Simple demo mode without backend dependency
  useEffect(() => {
    setIsLoaded(true);
    setApiStatus("connected");
    setFeedback(['Demo Mode: AI Trainer Ready!', 'Simulating pose detection for demo']);
    
    // Simulate pose detection results for demo
    const demoInterval = setInterval(() => {
      if (selectedExercise) {
        const randomScore = 75 + Math.random() * 20; // 75-95% score range
        setPoseScore(Math.round(randomScore));
        
        const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
        if (exerciseType === 'squat') {
          setFeedback(['Great squat form!', 'Keep chest up', 'Good depth']);
        } else if (exerciseType.includes('push')) {
          setFeedback(['Nice push-up!', 'Keep body straight', 'Full range of motion']);
        } else {
          setFeedback(['Excellent form!', 'Keep it up!', 'Perfect technique']);
        }
      }
    }, 1000);
    
    return () => clearInterval(demoInterval);
  }, [selectedExercise]);
`;

console.log("Demo mode script ready for quick replacement if backend fails");