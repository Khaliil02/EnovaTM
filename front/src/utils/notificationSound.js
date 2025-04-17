// Audio instance for notification sounds
let notificationSound = null;

// Initialize the audio on first call (after user interaction)
export const playNotificationSound = () => {
  // Create audio instance if it doesn't exist
  if (!notificationSound) {
    notificationSound = new Audio('/notification.mp3');
  }
  
  // Check if sound is enabled in user preferences
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const soundEnabled = user?.preferences?.sound_enabled !== false;
  
  if (soundEnabled) {
    // Set volume to 50%
    notificationSound.volume = 0.5;
    
    // Play sound - browsers only allow this after user interaction
    const playPromise = notificationSound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Could not play notification sound:', err);
        // Reset the audio for next attempt
        notificationSound = new Audio('/notification.mp3');
      });
    }
  }
};