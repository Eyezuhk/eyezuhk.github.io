class PomodoroTimer {
    constructor(container) {
      this.container = document.querySelector(container);
      this.timerDuration = 25 * 60;
      this.timeLeft = this.timerDuration;
      this.isRunning = false;
      this.interval = null;
      
      this.init();
    }
  
    init() {
      this.setupDOM();
      this.setupEventListeners();
      this.updateDisplay();
    }
  
    setupDOM() {
      this.timeDisplay = this.container.querySelector('#timeDisplay');
      this.startBtn = this.container.querySelector('#startBtn');
      this.progressCircle = this.container.querySelector('.progress-ring__circle');
      this.circumference = 2 * Math.PI * 140;
      
      this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    }
  
    setupEventListeners() {
      this.startBtn.addEventListener('click', () => this.toggleTimer());
      this.container.querySelector('#resetBtn').addEventListener('click', () => this.resetTimer());
    }
  
    toggleTimer() {
      this.isRunning = !this.isRunning;
      this.startBtn.textContent = this.isRunning ? 'Pause' : 'Start';
      
      if(this.isRunning) {
        this.startTime = Date.now() - (this.timerDuration - this.timeLeft) * 1000;
        this.interval = setInterval(() => this.updateTimer(), 1000);
      } else {
        clearInterval(this.interval);
      }
    }
  
    updateTimer() {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.timeLeft = Math.max(0, this.timerDuration - elapsed);
      
      if(this.timeLeft <= 0) {
        this.handleTimerEnd();
        return;
      }
      
      this.updateDisplay();
    }
  
    updateDisplay() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      const progress = ((this.timerDuration - this.timeLeft) / this.timerDuration) * 100;
      const offset = this.circumference - (progress / 100) * this.circumference;
      this.progressCircle.style.strokeDashoffset = offset;
    }
  
    resetTimer() {
      clearInterval(this.interval);
      this.isRunning = false;
      this.timeLeft = this.timerDuration;
      this.startBtn.textContent = 'Start';
      this.updateDisplay();
    }
  
    handleTimerEnd() {
      clearInterval(this.interval);
      this.isRunning = false;
      this.startBtn.textContent = 'Start';
      this.playNotification();
      this.showNotification('Tempo esgotado!');
    }
  
    playNotification() {
      const audio = new Audio('data:audio/mpeg;base64,SUQzBAAAAAA...');
      audio.play();
    }
  
    showNotification(message) {
      if('Notification' in window && Notification.permission === 'granted') {
        new Notification(message);
      }
    }
  }