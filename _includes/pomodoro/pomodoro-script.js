class PomodoroApp {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.modes = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes[this.currentMode];
        this.isRunning = false;
        this.interval = null;
        this.tasks = [];
        this.selectedTaskIndex = null;
        this.autoStartBreaks = true;
        this.pomodoroCount = 0;
        this.pomodorosBeforeLongBreak = 4;
        this.notificationSounds = { pomodoro: 'chime', shortBreak: 'bell', longBreak: 'ding' };
        this.muteSounds = false;
        this.statistics = { totalPomodoros: 0, totalFocusTime: 0, dailyStreak: 0, lastCompleted: null };
        this.youtubePlayer = null;
		 this.startTimestamp = null; // Add startTimestamp variable


        this.init();
    }

    init() {
        this.setupDOM();
        this.loadSettings();
        this.updateDisplay();
        this.updateColor(this.currentMode);
		this.initYouTube();
        this.setupEventListeners();
    }
    initYouTube() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            this.youtubePlayer = new YT.Player('youtubePlayer', {
                height: '360',
                width: '640',
                videoId: localStorage.getItem('youtubeVideoId') || this.getVideoId("https://www.youtube.com/watch?v=jfKfPfyJRdk"),
                playerVars: { 'playsinline': 1 },
            });
        };
    }
    getVideoId(url) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=| Shorts\/))([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
    setupDOM() {
        this.timeDisplay = this.container.querySelector('#timeDisplay');
        this.totalPomodoros = this.container.querySelector('#totalPomodoros');
        this.startBtn = this.container.querySelector('#startBtn');
        this.progressCircle = this.container.querySelector('.progress-ring__circle');
        this.progressCircleBg = this.container.querySelector('.progress-ring__circle-bg');
        this.keyboardShortcutsDiv = this.container.querySelector('#keyboardShortcuts');
        this.circumference = 2 * Math.PI * 140;

        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircleBg.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    }

	setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'SELECT' && event.target.tagName !== 'TEXTAREA') {
                switch (event.code) {
                    case 'Space':
                        this.startTimer();
                        event.preventDefault();
                        break;
                    case 'KeyR':
                        this.resetTimer();
                        break;
                    case 'Digit1':
                        this.setMode('pomodoro');
                        break;
                    case 'Digit2':
                        this.setMode('shortBreak');
                        break;
                    case 'Digit3':
                        this.setMode('longBreak');
                        break;
                }
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.interval) {
               this.recalculateTime();
            }
        });
    }

    recalculateTime(){
       const elapsed = Math.floor((Date.now() - this.startTimestamp) / 1000);
       this.timeLeft = Math.max(0, this.modes[this.currentMode] - elapsed);
       this.updateDisplay();
     }


    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
        this.modes = settings.times || { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        this.tasks = settings.tasks || [];
        this.statistics = settings.statistics || { totalPomodoros: 0, totalFocusTime: 0, dailyStreak: 0, lastCompleted: null };
		this.autoStartBreaks = settings.autoStartBreaks !== undefined ? settings.autoStartBreaks : true;
        this.pomodorosBeforeLongBreak = settings.pomodorosBeforeLongBreak !== undefined ? settings.pomodorosBeforeLongBreak : 4;
        this.notificationSounds = settings.notificationSounds || { pomodoro: 'chime', shortBreak: 'bell', longBreak: 'ding' };
        this.muteSounds = settings.muteSounds !== undefined ? settings.muteSounds : false;
        this.selectedTaskIndex = settings.selectedTaskIndex ?? null;
        const bg = settings.background;
        if (bg) document.body.style.backgroundImage = `url('${bg}')`;
        this.container.querySelector('#pomodoroTime').value = this.modes.pomodoro / 60;
        this.container.querySelector('#shortBreakTime').value = this.modes.shortBreak / 60;
        this.container.querySelector('#longBreakTime').value = this.modes.longBreak / 60;
        this.container.querySelector('#pomodorosBeforeLongBreak').value = this.pomodorosBeforeLongBreak;
        this.container.querySelector('#autoStartBreaks').checked = this.autoStartBreaks;
        this.container.querySelector('#pomodoroSound').value = this.notificationSounds.pomodoro;
        this.container.querySelector('#shortBreakSound').value = this.notificationSounds.shortBreak;
        this.container.querySelector('#longBreakSound').value = this.notificationSounds.longBreak;
        this.container.querySelector('#muteSounds').checked = this.muteSounds;

         this.container.querySelector('#youtubeUrl').value = localStorage.getItem('youtubeVideoId') ? `https://www.youtube.com/watch?v=${localStorage.getItem('youtubeVideoId')}` : "https://www.youtube.com/watch?v=jfKfPfyJRdk";
        this.updateTaskList();
        this.updateTaskSelect();
         this.updateStatistics();

    }

    saveSettings() {
        const settings = {
            times: this.modes,
            tasks: this.tasks,
            statistics: this.statistics,
            autoStartBreaks: this.autoStartBreaks,
            pomodorosBeforeLongBreak: this.pomodorosBeforeLongBreak,
            notificationSounds: this.notificationSounds,
            muteSounds: this.muteSounds,
            selectedTaskIndex: this.selectedTaskIndex,
            background: document.body.style.backgroundImage.slice(5, -2)
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    formatTime(seconds) {
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }
    }
    setProgress(percent) {
        const offset = this.circumference - (percent / 100) * this.circumference;
        this.progressCircle.style.strokeDashoffset = offset;
    }
    updateDisplay() {
		 if (this.interval) {
           this.recalculateTime();
		 }

        const formattedTime = this.formatTime(Math.max(0, this.timeLeft));
        this.timeDisplay.querySelector('span').textContent = formattedTime;
        this.setProgress((this.modes[this.currentMode] - this.timeLeft) / this.modes[this.currentMode] * 100);
         this.totalPomodoros.textContent = this.statistics.totalPomodoros > 0 ? this.statistics.totalPomodoros : '';

    }
    updateColor(mode) {
        const color = {
            pomodoro: '#ff6b6b',
            shortBreak: '#4dabf7',
            longBreak: '#40c057'
        }[mode];
		
		this.progressCircle.style.stroke = color;
		this.progressCircleBg.style.stroke = color;
		this.progressCircleBg.style.opacity = '0.2';

        this.container.querySelectorAll('.controls button').forEach(btn => {
            btn.style.backgroundColor = color;
        });
        this.container.querySelectorAll('.mode-buttons button').forEach(btn => {
            btn.style.backgroundColor = color;
        });
    }
    setMode(mode) {
        this.container.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
        this.container.querySelector(`button[data-mode="${mode}"]`).classList.add('active');
        this.currentMode = mode;
        this.timeLeft = this.modes[mode];
        this.updateColor(mode);
        this.resetTimer();
        this.updateDisplay();
    }
    startTimer() {
		if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
			this.youtubePlayer?.pauseVideo();
        } else {
            this.startTimestamp = Date.now() - ((this.modes[this.currentMode] - this.timeLeft) * 1000);
           this.interval = setInterval(() => this.updateDisplay(), 1000);
            this.startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
			this.youtubePlayer?.playVideo();
        }
    }

    resetTimer() {
        clearInterval(this.interval);
        this.interval = null;
        this.timeLeft = this.modes[this.currentMode];
        this.updateDisplay();
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
		this.youtubePlayer?.pauseVideo();
    }
    handleTimerEnd() {
         let nextMode;
        if (this.currentMode === 'pomodoro') {
            this.statistics.totalPomodoros++;
            this.statistics.totalFocusTime += this.modes.pomodoro;
            if (this.selectedTaskIndex !== null) this.tasks[this.selectedTaskIndex].pomodoros++;
            this.updateStatistics();
            this.playNotificationSound('pomodoro');
            this.showNotification('Pomodoro Complete!');
            this.sendNotification('Pomodoro Complete!', 'Time to take a break!');
            this.pomodoroCount++;
            nextMode = (this.statistics.totalPomodoros % this.pomodorosBeforeLongBreak === 0) ? 'longBreak' : 'shortBreak';
            if (nextMode === 'longBreak') this.pomodoroCount = 0;
        } else {
            this.playNotificationSound(this.currentMode);
            this.showNotification('Break Complete!');
             this.sendNotification('Break Complete!', 'Time to get back to work!');
            nextMode = 'pomodoro';
        }
        this.setMode(nextMode);
        if (this.autoStartBreaks) this.startTimer();
         else{
           this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        }
         this.saveSettings();
    }
     handleTaskInput(event) {
        if (event.key === 'Enter') this.addTask();
    }
    addTask() {
        const taskInput = this.container.querySelector('#taskInput');
        const taskText = taskInput.value.trim();
        if (taskText) {
            this.tasks.push({ text: this.escapeHtml(taskText), completed: false, pomodoros: 0 });
            taskInput.value = '';
            this.updateTaskList();
            this.updateTaskSelect();
            this.saveSettings();
        }
    }

    editTask(index) {
        const newText = prompt('Enter new task name:', this.tasks[index].text);
        if (newText !== null && newText.trim() !== '') {
            this.tasks[index].text = this.escapeHtml(newText.trim());
            this.updateTaskList();
            this.updateTaskSelect();
            this.saveSettings();
        }
    }

     removeTask(index) {
        this.tasks.splice(index, 1);
        if (this.selectedTaskIndex >= this.tasks.length) this.selectedTaskIndex = null;
        this.updateTaskList();
        this.updateTaskSelect();
        this.saveSettings();
    }

    toggleTask(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.updateTaskList();
        this.saveSettings();
    }
    updateTaskList() {
        const taskListDiv = this.container.querySelector('#taskList');
        taskListDiv.innerHTML = '';
        this.tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.draggable = true;
            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="pomodoroApp.toggleTask(${index})">
                <span>${task.text}</span>
				<span class="pomodoro-count">
				<i class="fas fa-clock"></i> ${task.pomodoros}
				</span>
                 <div class="task-actions">
                    <button class="pomodoro" onclick="pomodoroApp.editTask(${index})"><i class="fas fa-pen"></i></button>
                    <button class="pomodoro" onclick="pomodoroApp.removeTask(${index})"><i class="fas fa-trash"></i></button>
                </div>`;
            taskItem.addEventListener('dragstart', (e) => {
                taskItem.classList.add('dragging');
                this.dragStartIndex = index;
                  e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index);

            });
            taskItem.addEventListener('dragover', e =>{
                 e.preventDefault();

            });
            taskItem.addEventListener('drop', e =>{
                 e.preventDefault();
                 const dragEndIndex = index
                 if(this.dragStartIndex !== dragEndIndex){
                     this.reorderTasks(this.dragStartIndex, dragEndIndex)
                 }

                 taskItem.classList.remove('dragging');
            })
           taskItem.addEventListener('dragend', (e) => {
                taskItem.classList.remove('dragging');
              this.saveSettings();
            });
            taskListDiv.appendChild(taskItem);
        });
    }
     reorderTasks(startIndex, endIndex) {
         const [removed] = this.tasks.splice(startIndex, 1);
         this.tasks.splice(endIndex, 0, removed);
        this.updateTaskList();
         this.saveSettings();
    }
    updateTaskSelect() {
        const taskSelect = this.container.querySelector('#taskSelect');
        taskSelect.innerHTML = '<option value="">Select a task</option>';
        this.tasks.forEach((task, index) => {
            taskSelect.innerHTML += `<option value="${index}">${task.text}</option>`;
        });
        taskSelect.value = this.selectedTaskIndex === null ? '' : this.selectedTaskIndex;
    }
    selectTask(value) {
        this.selectedTaskIndex = value === '' ? null : parseInt(value);
        this.saveSettings();
    }
     toggleSettings() {
        const settingsPanel = this.container.querySelector('#settingsPanel');
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        if (settingsPanel.style.display === 'block') settingsPanel.scrollIntoView({ behavior: 'smooth' });
    }
     updateTimeFromInput(id, value) {
        const mode = id.replace('Time', '');
        this.modes[mode] = parseInt(value, 10) * 60;
        if (this.currentMode === mode) {
            this.timeLeft = this.modes[this.currentMode];
            this.updateDisplay();
        }
         this.saveSettings();
    }
    updateBackground(type) {
        if (type === 'url') {
            const url = this.container.querySelector('#bgUrl').value.trim();
            document.body.style.backgroundImage = url ? `url('${url}')` : '';
        } else if (type === 'file') {
            const file = this.container.querySelector('#bgFile').files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    document.body.style.backgroundImage = `url('${reader.result}')`;
                     this.saveSettings();
                };
                reader.readAsDataURL(file);
            }
        }
         this.saveSettings();
    }
    removeBackground() {
        document.body.style.backgroundImage = '';
        this.container.querySelector('#bgUrl').value = '';
        this.container.querySelector('#bgFile').value = '';
         localStorage.setItem('backgroundImage', '');
         this.saveSettings();
    }
     updateYouTubeVideo() {
        const url = this.container.querySelector('#youtubeUrl').value;
        const videoId = this.getVideoId(url);
        if (videoId && this.youtubePlayer && this.youtubePlayer.loadVideoById) {
             this.youtubePlayer.loadVideoById(videoId);
            localStorage.setItem('youtubeVideoId', videoId);
        }
        this.saveSettings();
    }
     resetAllSettings() {
        this.modes = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
        this.notificationSounds = { pomodoro: 'chime', shortBreak: 'bell', longBreak: 'ding' };
        this.autoStartBreaks = true;
        this.pomodorosBeforeLongBreak = 4;
        this.statistics = { totalPomodoros: 0, totalFocusTime: 0, dailyStreak: 0, lastCompleted: null };
        this.tasks = [];
        this.selectedTaskIndex = null;
        document.body.style.backgroundImage = '';
        this.container.querySelector('#pomodoroTime').value = this.modes.pomodoro / 60;
        this.container.querySelector('#shortBreakTime').value = this.modes.shortBreak / 60;
        this.container.querySelector('#longBreakTime').value = this.modes.longBreak / 60;
        this.container.querySelector('#pomodorosBeforeLongBreak').value = this.pomodorosBeforeLongBreak;
        this.container.querySelector('#autoStartBreaks').checked = this.autoStartBreaks;
        this.container.querySelector('#pomodoroSound').value = this.notificationSounds.pomodoro;
        this.container.querySelector('#shortBreakSound').value = this.notificationSounds.shortBreak;
        this.container.querySelector('#longBreakSound').value = this.notificationSounds.longBreak;
        this.container.querySelector('#muteSounds').checked = this.muteSounds;

        this.container.querySelector('#bgUrl').value = '';
        this.container.querySelector('#bgFile').value = '';
         this.container.querySelector('#youtubeUrl').value = "https://www.youtube.com/watch?v=jfKfPfyJRdk";
		  localStorage.removeItem('youtubeVideoId');
        this.resetTimer();
        this.updateTaskList();
        this.updateTaskSelect();
         this.updateStatistics();
        this.saveSettings();
    }
      updateStatistics() {
         this.container.querySelector('#totalPomodorosStat').textContent = this.statistics.totalPomodoros;
        this.container.querySelector('#totalTime').textContent = this.formatTime(this.statistics.totalFocusTime);

        const today = new Date();
        const lastCompleted = this.statistics.lastCompleted ? new Date(this.statistics.lastCompleted) : null;

        if (lastCompleted) {
            const timeDiff = today - lastCompleted; // DiferenÃ§a em milissegundos
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // DiferenÃ§a em dias

            if (daysDiff === 0) {
                // O Ãºltimo Pomodoro foi hoje: nÃ£o faz nada
            } else if (daysDiff === 1) {
                // O Ãºltimo Pomodoro foi ontem: incrementa o streak
                this.statistics.dailyStreak++;
            } else if (daysDiff >= 2) {
                // O Ãºltimo Pomodoro foi hÃ¡ dois ou mais dias: reinicia o streak
                this.statistics.dailyStreak = 1;
            }
        } else if (this.statistics.totalPomodoros > 0) {
            // Primeiro Pomodoro: inicia o streak
            this.statistics.dailyStreak = 1;
        }

        this.container.querySelector('#dailyStreak').textContent = this.statistics.dailyStreak;
        this.statistics.lastCompleted = new Date();
        this.saveSettings();
    }
       playNotificationSound(mode) {
        if (!this.muteSounds) {
            switch (this.notificationSounds[mode]) {
                case 'bell':
                    this.createBeep(950, 1500);
                    break;
                case 'chime':
                    this.createBeep(600, 1500);
                    break;
                case 'ding':
                    this.createBeep(200, 1500);
                    break;
            }
        }
    }
     sendNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: body });
                }
            });
        }
    }
    updatePomodorosBeforeLongBreak(value) {
         this.pomodorosBeforeLongBreak = parseInt(value, 10);
         this.saveSettings();
    }
    toggleAutoStartBreaks() {
        this.autoStartBreaks =  this.container.querySelector('#autoStartBreaks').checked;
         this.saveSettings();
    }
     updateNotificationSound(mode, value) {
        this.notificationSounds[mode] = value;
        this.saveSettings();
    }
      toggleMuteSounds() {
        this.muteSounds = this.container.querySelector('#muteSounds').checked;
        this.saveSettings();
    }
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = this.container.querySelector('.theme-toggle i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
		localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
    toggleKeyboardShortcuts() {
        this.keyboardShortcutsDiv.classList.toggle('hide');
    }
      createBeep(frequency = 440, duration = 2000, volume = 0.5) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
     showNotification(message) {
        const notification = this.container.querySelector('#notification');
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }
     escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

}
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp('pomodoroApp');
	const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                const icon = document.querySelector('.theme-toggle i');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
	    if ('Notification' in window) {
             Notification.requestPermission();
           }
		 window.addEventListener('storage', (event) => {
            if (event.key === 'pomodoroSettings') window.pomodoroApp.loadSettings();
        });
});