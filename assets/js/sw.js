self.addEventListener('message', function(event) {
    if(event.data.type == "playSound"){
        const sound = event.data.sound;
        let frequency;
           switch (sound) {
                 case 'bell':
                     frequency = 950;
                     break;
                 case 'chime':
                      frequency = 600;
                     break;
                 case 'ding':
                      frequency = 200;
                      break;
                default:
                    frequency = 200
             }
        createBeep(frequency, 1500)
    }
   function createBeep(frequency = 440, duration = 2000, volume = 0.5) {
         const audioContext = new (self.AudioContext || self.webkitAudioContext)();
         const oscillator = audioContext.createOscillator();
         const gainNode = audioContext.createGain();

         oscillator.connect(gainNode);
         gainNode.connect(audioContext.destination);

         oscillator.frequency.value = frequency;
         gainNode.gain.value = volume;

         oscillator.start();
         setTimeout(() => {
             oscillator.stop();
             audioContext.close();
         }, duration);
     }
 });