let habits = [];
let currentDate = new Date();
let currentWeekDates = [];

// 1. Seleccionar elementos del DOM
const habitInput = document.querySelector(".habit-input");
const habitButton = document.querySelector(".habit-button");
const habitsList = document.querySelector(".habits-list");


/*Funciones para localStorage*/
function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function loadHabits() {
  const storedHabits = localStorage.getItem("habits");
  if (storedHabits) {
    habits = JSON.parse(storedHabits);
  }
}
/*Función para dibujar hábitos en el DOM*/
function renderHabits() {
  habitsList.innerHTML = "";

  habits.forEach((habit) => {
    if (!habit.history) {
  habit.history = {};
}

    const weekKey = getWeekKey(currentDate);

if (!habit.history[weekKey]) {
  habit.history[weekKey] = Array(7).fill(false);
}

    const habitCard = document.createElement("div");
    habitCard.classList.add("habit-card");
    habitCard.dataset.id = habit.id;

    const habitHeader = document.createElement("div");
    habitHeader.classList.add("habit-header");

    const habitTitle = document.createElement("span");
    habitTitle.classList.add("habit-name");
    habitTitle.textContent = habit.name;

    const habitStreak = document.createElement("span");
    habitStreak.classList.add("habit-streak");
const weekDays = habit.history[weekKey];

const streak = calculateMaxStreak(weekDays);

habitStreak.textContent = `Racha semanal: ${streak} día${streak !== 1 ? "s" : ""}`;

    habitHeader.appendChild(habitTitle);
    habitHeader.appendChild(habitStreak);

    const habitDays = document.createElement("div");
    habitDays.classList.add("habit-days");

habit.history[weekKey].forEach((done, index) => {
      const day = document.createElement("span");
      day.classList.add("check");
      day.dataset.day = index;

      if (done) {
        day.classList.add("done");
        day.textContent = "✔";
      }

      habitDays.appendChild(day);
    });

    habitCard.appendChild(habitHeader);
    habitCard.appendChild(habitDays);
    habitsList.appendChild(habitCard);
  });
}
function getOrderedDays(history) {
  return Object.keys(history)
    .sort() // ordena semanas por fecha
    .flatMap(weekKey => history[weekKey]);
}
function calculateCurrentStreak(history) {
  const allDays = getOrderedDays(history);
  let streak = 0;

  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateMaxStreak(days) {
  let maxStreak = 0;
  let currentStreak = 0;

  days.forEach((day) => {
    if (day) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  });

  return maxStreak;
}


/*crear habitos*/ 
habitButton.addEventListener("click", () => {
  const habitName = habitInput.value.trim();
  if (habitName === "") return;

  const weekKey = getWeekKey();

const newHabit = {
  id: Date.now(),
  name: habitName,
  history: {
    [weekKey]: Array(7).fill(false)
  }
};

  habits.push(newHabit);
  saveHabits();
  renderHabits();

  habitInput.value = "";
  habitInput.focus();
});

/*guardar checks clickeados */
habitsList.addEventListener("click", (event) => {
  const check = event.target;

  // 1️ Si no es un check, no hacemos nada
  if (!check.classList.contains("check")) return;

  // 2️ Buscamos la tarjeta del hábito
  const habitCard = check.closest(".habit-card");
  if (!habitCard) return;

  // 3️ Obtenemos datos clave
  const habitId = Number(habitCard.dataset.id);
  const dayIndex = Number(check.dataset.day);
  const weekKey = getWeekKey();

  // 4️ Buscamos el hábito correcto
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

    const todayIndex = getTodayIndex();
  const currentWeekKey = getWeekKey();

  //  BLOQUEO DE DÍAS FUTUROS
  if (weekKey === currentWeekKey && dayIndex > todayIndex) {
    return;
  }
  // 5️ Protección (por si viene de datos viejos)
  if (!habit.history) {
    habit.history = {};
  }

  if (!habit.history[weekKey]) {
    habit.history[weekKey] = Array(7).fill(false);
  }

  // 6️ Toggle del día clickeado
  habit.history[weekKey][dayIndex] = !habit.history[weekKey][dayIndex];

  // 7️ Guardar y volver a dibujar
  saveHabits();
  renderHabits();
  updateSummary();
});


function getMonday(date = new Date()) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}
function renderWeekDays() {
  const weekContainer = document.querySelector(".week-days");
  weekContainer.innerHTML = "";

  const monday = getMonday(currentDate);


  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const name = currentDay
      .toLocaleDateString("es-ES", { weekday: "short" })
      .toUpperCase();

    const date = currentDay.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit"
    });

    dayDiv.innerHTML = `
      <span class="day-name">${name}</span>
      <span class="day-date">${date}</span>
    `;

    weekContainer.appendChild(dayDiv);
  }
}
function getWeekKey(date = new Date()) {
  const monday = getMonday(date);
  return monday.toISOString().split("T")[0];
}

function getTodayIndex() {
  const jsDay = new Date().getDay(); // 0 = domingo, 1 = lunes...
  return jsDay === 0 ? 6 : jsDay - 1; // 0 = lunes, 6 = domingo
}
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");

prevWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7);
    generateCurrentWeekDates();
  renderWeekDays();
  renderHabits();
  updateSummary();
});

nextWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7);
    generateCurrentWeekDates();
  renderWeekDays();
  renderHabits();
  updateSummary();
});

function getEnabledDaysCount(weekDates) {
  const today = new Date();
  return weekDates.filter(date => new Date(date) <= today).length;
}
function getCompletedChecks(habits) {
  const weekKey = getWeekKey(currentDate);
  const todayIndex = getTodayIndex();
  let completed = 0;

  habits.forEach(habit => {
    const week = habit.history?.[weekKey];
    if (!week) return;

    week.forEach((done, index) => {
      if (index <= todayIndex && done) {
        completed++;
      }
    });
  });

  return completed;
}
function updateSummary() {
  const completedEl = document.querySelector(".completed-summary");
  const bestStreakEl = document.querySelector(".best-streak");
  const perfectDaysEl = document.querySelector(".perfect-days");

  if (!completedEl || !bestStreakEl || !perfectDaysEl) return;

  const todayIndex = getTodayIndex();
  const enabledDays = todayIndex + 1; // lunes → hoy

  // ---------- Hábitos cumplidos ----------
  const totalPossible = habits.length * enabledDays;
  const completed = getCompletedChecks(habits);

  completedEl.textContent = `${completed} / ${totalPossible}`;

  // ---------- Mejor racha ----------
  const best = getBestStreak(habits);
  bestStreakEl.textContent = `${best} día${best !== 1 ? "s" : ""}`;

  // ---------- Días perfectos ----------
  const weekKey = getWeekKey(currentDate);
  const perfectDays = calculatePerfectDays(habits, weekKey, enabledDays);

  perfectDaysEl.textContent = perfectDays;
  
    // ---------- Hábito destacado ----------
  const topHabitEl = document.querySelector(".top-habit");
  if (topHabitEl) {
    const weekKey = getWeekKey(currentDate);
    const topHabit = getTopHabit(habits, weekKey, enabledDays);
    topHabitEl.textContent = topHabit;
  }

}

function calculatePerfectDays(habits, weekKey, enabledDays) {
  let perfectDays = 0;

  for (let dayIndex = 0; dayIndex < enabledDays; dayIndex++) {
    const isPerfect = habits.every(habit => {
      return habit.history?.[weekKey]?.[dayIndex] === true;
    });

    if (isPerfect) {
      perfectDays++;
    }
  }

  return perfectDays;
}

/*mejor racha 7 dias*/
function getAllDaysSorted(habit) {
  return Object.keys(habit.history || {}).sort();
}
function getDayBooleans(habit, weekKeys) {
  let days = [];

  weekKeys.forEach(weekKey => {
    if (habit.history[weekKey]) {
      days = days.concat(habit.history[weekKey]);
    }
  });

  return days;
}

function getBestStreak(habits) {
  let best = 0;

  habits.forEach(habit => {
    const dates = getAllDaysSorted(habit);
    const days = getDayBooleans(habit, dates);
    best = Math.max(best, calculateMaxStreak(days));
  });

  return best;
}
function generateCurrentWeekDates() {
  const monday = getMonday(currentDate);
  currentWeekDates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const iso = date.toISOString().split("T")[0];
    currentWeekDates.push(iso);
  }
}

/*calcular habito destacado*/
function getTopHabit(habits, weekKey, enabledDays) {
  let topHabit = null;
  let maxCompleted = 0;

  habits.forEach(habit => {
    const week = habit.history?.[weekKey];
    if (!week) return;

    let count = 0;

    for (let i = 0; i < enabledDays; i++) {
      if (week[i]) count++;
    }

    if (count > maxCompleted) {
      maxCompleted = count;
      topHabit = habit.name;
    }
  });

  if (!topHabit || maxCompleted === 0) {
    return "—";
  }

  return `${topHabit} (${maxCompleted} día${maxCompleted !== 1 ? "s" : ""})`;
}


/* cargar al iniciar*/
loadHabits();
generateCurrentWeekDates();
renderWeekDays();
renderHabits();
updateSummary();
