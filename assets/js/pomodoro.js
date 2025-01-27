document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('pomodoroApp')) {
      new PomodoroTimer('#pomodoroApp');
    }
  });