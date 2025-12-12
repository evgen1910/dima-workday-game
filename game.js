/* Мини-игра: “Дима переживает рабочий день”
   Управление:
   - ПРОБЕЛ / КЛИК по канвасу = прыжок (там где нужно)
   - Кнопки в панели = действия по сценарию
*/

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  hint: document.getElementById("hint"),
  counter: document.getElementById("counter"),
  panel: document.getElementById("panel"),
  title: document.getElementById("title"),
  text: document.getElementById("text"),
  buttons: document.getElementById("buttons"),
};

const S = {
  INTRO: "INTRO",
  BUS_STOP: "BUS_STOP",
  CONSTRUCTION: "CONSTRUCTION",
  COFFEE: "COFFEE",
  CROWD: "CROWD",
  BLACK: "BLACK",
  WIN: "WIN",
};

let state = S.INTRO;

// “Герой”
const dima = {
  x: 160,
  y: 0,
  w: 46,
  h: 70,
  vx: 0,
  vy: 0,
  onGround: true,
  face: "🙂",
};

// Мир/физика
const world = {
  groundY: 420,
  gravity: 0.9,
  jumpV: -16,
  scrollX: 0,
};

// Прогресс сцен
const prog = {
  s1_jumps: 0,
  s1_need: 10,
  s2_done: 0,
  s2_need: 3,
  confetti: [],
  flash: 0,
  black: 0,
};

function resetHero() {
  dima.x = 160;
  dima.y = world.groundY - dima.h;
  dima.vx = 0;
  dima.vy = 0;
  dima.onGround = true;
  dima.face = "🙂";
}

function setPanel({ title, text, hint = "", counter = "", buttons = [] }) {
  ui.title.textContent = title;
  ui.text.textContent = text;
  ui.hint.textContent = hint;
  ui.counter.textContent = counter;

  ui.buttons.innerHTML = "";
  for (const b of buttons) {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.className = b.className || "primary";
    btn.onclick = b.onClick;
    ui.buttons.appendChild(btn);
  }
}

function canJumpHere() {
  return state === S.BUS_STOP || state === S.CONSTRUCTION;
}

function tryJump() {
  if (!canJumpHere()) return;
  if (!dima.onGround) return;

  dima.vy = world.jumpV;
  dima.onGround = false;

  // Сцена 1: 10 прыжков = 10 глотков
  if (state === S.BUS_STOP) {
    prog.s1_jumps++;
    if (prog.s1_jumps >= prog.s1_need) {
      // маленькая пауза + переход
      prog.flash = 18;
      setTimeout(() => goConstruction(), 450);
    } else {
      refreshUI();
    }
  }

  // Сцена 2: перепрыгнуть 3 толпы
  if (state === S.CONSTRUCTION) {
    // “успех” засчитываем в момент прыжка, но ограничим “по толпам”
    if (prog.s2_done < prog.s2_need) {
      prog.s2_done++;
      if (prog.s2_done >= prog.s2_need) {
        prog.flash = 18;
        setTimeout(() => goCoffee(), 450);
      } else {
        refreshUI();
      }
    }
  }
}

canvas.addEventListener("mousedown", () => tryJump());
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    tryJump();
  }
});

function goIntro() {
  state = S.INTRO;
  resetHero();
  prog.s1_jumps = 0;
  prog.s2_done = 0;
  prog.confetti = [];
  prog.black = 0;

  setPanel({
    title: "Это Дима. И сегодня ему нужен герой.",
    text: "Помоги Диме пережить рабочий день.",
    hint: "Нажми «Начать»",
    buttons: [
      { label: "▶️ Начать", className: "primary", onClick: () => goBusStop() },
    ],
  });
}

function goBusStop() {
  state = S.BUS_STOP;
  resetHero();
  refreshUI();
}

function goConstruction() {
  state = S.CONSTRUCTION;
  resetHero();
  refreshUI();
}

function goCoffee() {
  state = S.COFFEE;
  resetHero();
  refreshUI();
}

function goCrowd() {
  state = S.CROWD;
  resetHero();
  refreshUI();
}

function goBlack() {
  state = S.BLACK;
  prog.black = 255;
  refreshUI();
}

function goWin() {
  state = S.WIN;
  refreshUI();
}

function refreshUI() {
  if (state === S.BUS_STOP) {
    setPanel({
      title: "Остановка у моря",
      text:
        "Автобус опаздывает. Помоги водителю быстрее допить чай.\n" +
        "1 прыжок = 1 глоток.",
      hint: "Пробел / клик = прыжок",
      counter: `Глотков: ${prog.s1_jumps} / ${prog.s1_need}`,
      buttons: [{ label: "⏭️ Пропустить (для теста)", className: "ghost", onClick: () => goConstruction() }],
    });
  }

  if (state === S.CONSTRUCTION) {
    setPanel({
      title: "Стройплощадка",
      text: "Перепрыгни работяг, чтобы попасть на АККУЮ.",
      hint: "Пробел / клик = прыжок",
      counter: `Перепрыгнуто: ${prog.s2_done} / ${prog.s2_need}`,
      buttons: [{ label: "⏭️ Пропустить (для теста)", className: "ghost", onClick: () => goCoffee() }],
    });
  }

  if (state === S.COFFEE) {
    setPanel({
      title: "Кофемашина",
      text: "Чтобы выпить кофе — пни Андропова в жопу.",
      hint: "Нужно одно точное действие",
      buttons: [
        {
          label: "🦵 Пнуть Андропова в жопу",
          className: "danger",
          onClick: () => goCrowd(),
        },
      ],
    });
  }

  if (state === S.CROWD) {
    setPanel({
      title: "Рабочий ад приближается",
      text: "Чтобы пережить этот день — заряжай писькомёт.",
      hint: "Дима надеется на тебя",
      buttons: [
        {
          label: "⚡ Зарядить писькомёт",
          className: "primary",
          onClick: () => {
            goBlack();
            // появляется кнопка “ПЛИ!”
            setTimeout(() => {
              setPanel({
                title: "",
                text: "",
                hint: "",
                buttons: [
                  {
                    label: "💥 ПЛИ!",
                    className: "danger",
                    onClick: () => {
                      shootConfetti();
                      setTimeout(() => goWin(), 900);
                    },
                  },
                ],
              });
            }, 300);
          },
        },
      ],
    });
  }

  if (state === S.BLACK) {
    setPanel({
      title: "",
      text: "",
      hint: "",
      buttons: [],
    });
  }

  if (state === S.WIN) {
    setPanel({
      title: "Финал",
      text: "Поздравляю! Ты победил этот рабочий день!",
      hint: "Можно пройти ещё раз",
      buttons: [
        { label: "🔁 Пройти ещё раз", className: "primary", onClick: () => goIntro() },
      ],
    });
  }
}

function shootConfetti() {
  // набросаем конфетти
  prog.confetti = [];
  for (let i = 0; i < 260; i++) {
    prog.confetti.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 300,
      vx: (-2 + Math.random() * 4),
      vy: 3 + Math.random() * 6,
      r: 2 + Math.random() * 4,
      a: Math.random() * Math.PI * 2,
      va: (-0.2 + Math.random() * 0.4),
    });
  }
}

// РЕНДЕР

function drawScene() {
  // фон по сценам
  if (state === S.BUS_STOP) drawSeaBackground();
  else if (state === S.CONSTRUCTION) drawConstructionBackground();
  else if (state === S.COFFEE || state === S.CROWD) drawOfficeBackground();
  else drawNeutralBackground();

  // земля
  ctx.fillStyle = "rgba(10, 15, 25, 0.55)";
  ctx.fillRect(0, world.groundY, canvas.width, canvas.height - world.groundY);

  // декорации/объекты
  if (state === S.BUS_STOP) drawBusStopProps();
  if (state === S.CONSTRUCTION) drawWorkersProps();
  if (state === S.COFFEE) drawCoffeeProps();
  if (state === S.CROWD) drawCrowdProps();

  // Дима
  drawDima();

  // вспышка
  if (prog.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${prog.flash / 30})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // черный экран (после “зарядить”)
  if (state === S.BLACK) {
    ctx.fillStyle = "rgba(0,0,0,0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // конфетти
  if (prog.confetti.length) drawConfetti();
}

function drawNeutralBackground() {
  // ничего — канвас уже с градиентом через CSS, тут оставим воздух
}

function drawSeaBackground() {
  // море полосами
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(0, 120, 200, 0.55)";
  ctx.fillRect(0, 290, canvas.width, 120);
  ctx.fillStyle = "rgba(0, 90, 170, 0.55)";
  ctx.fillRect(0, 330, canvas.width, 90);
  ctx.fillStyle = "rgba(240, 220, 160, 0.9)";
  ctx.fillRect(0, world.groundY - 40, canvas.width, 40);
  ctx.restore();
}

function drawConstructionBackground() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(255, 210, 120, 0.55)";
  ctx.fillRect(0, 260, canvas.width, 140);
  // башенные “краны”
  ctx.strokeStyle = "rgba(20,20,20,0.45)";
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i++) {
    const x = 160 + i * 280;
    ctx.beginPath();
    ctx.moveTo(x, world.groundY);
    ctx.lineTo(x, 180);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, 190);
    ctx.lineTo(x + 140, 190);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOfficeBackground() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(230, 240, 255, 0.55)";
  ctx.fillRect(0, 80, canvas.width, 280);
  // “окна”
  ctx.fillStyle = "rgba(120, 180, 255, 0.35)";
  for (let i = 0; i < 5; i++) ctx.fillRect(90 + i * 170, 120, 120, 90);
  ctx.restore();
}

function drawBusStopProps() {
  // остановка
  ctx.save();
  ctx.fillStyle = "rgba(20,20,20,0.45)";
  ctx.fillRect(640, 250, 220, 16);
  ctx.fillRect(650, 250, 10, 160);
  ctx.fillRect(840, 250, 10, 160);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(660, 270, 180, 110);
  ctx.fillStyle = "rgba(20,20,20,0.75)";
  ctx.font = "700 16px system-ui";
  ctx.fillText("ОСТАНОВКА", 690, 295);

  // “водитель пьёт чай” (иконка)
  ctx.font = "700 32px system-ui";
  ctx.fillText("🫖", 780, 360);

  // автобус (появляется когда 10/10)
  if (prog.s1_jumps >= prog.s1_need) {
    drawBus(120 + (Math.sin(Date.now() / 120) * 2), world.groundY - 70);
  } else {
    // автобус далеко
    drawBus(980 - (prog.s1_jumps * 20), world.groundY - 70);
  }
  ctx.restore();
}

function drawBus(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(30,30,30,0.85)";
  ctx.fillRect(0, 0, 220, 60);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 5; i++) ctx.fillRect(18 + i * 40, 10, 30, 18);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.beginPath(); ctx.arc(40, 60, 12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(180, 60, 12, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawWorkersProps() {
  // три “толпы” как препятствия
  const baseX = 460;
  for (let i = 0; i < 3; i++) {
    const x = baseX + i * 170;
    drawCrowdBlob(x, world.groundY - 50, i < prog.s2_done ? 0.25 : 0.85);
  }
  // вывеска “АККУЮ”
  ctx.save();
  ctx.fillStyle = "rgba(20,20,20,0.75)";
  ctx.fillRect(740, 80, 180, 46);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "900 24px system-ui";
  ctx.fillText("АККУЮ", 782, 112);
  ctx.restore();
}

function drawCrowdBlob(x, y, alpha=0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(30,30,30,0.85)";
  ctx.beginPath();
  ctx.ellipse(x, y, 56, 24, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.font = "900 22px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("👷‍♂️👷‍♂️👷‍♂️", x - 62, y + 8);
  ctx.restore();
}

function drawCoffeeProps() {
  // кофемашина + “Андропов”
  ctx.save();
  ctx.fillStyle = "rgba(20,20,20,0.75)";
  ctx.fillRect(650, world.groundY - 140, 170, 140);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(675, world.groundY - 115, 120, 50);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(700, world.groundY - 55, 70, 10);
  ctx.font = "900 28px system-ui";
  ctx.fillText("☕", 720, world.groundY - 70);
  ctx.font = "900 28px system-ui";
  ctx.fillText("🧍‍♂️", 600, world.groundY - 85);
  ctx.font = "700 14px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("Андропов", 575, world.groundY - 40);
  ctx.restore();
}

function drawCrowdProps() {
  // “злая толпа”
  ctx.save();
  ctx.font = "900 38px system-ui";
  ctx.fillText("😡😡😡📧📧😡😡", 360, world.groundY - 120);
  ctx.restore();
}

function drawDima() {
  ctx.save();
  // тело
  ctx.fillStyle = "rgba(25,25,25,0.8)";
  ctx.fillRect(dima.x, dima.y, dima.w, dima.h);
  // голова
  ctx.font = "900 34px system-ui";
  ctx.fillText("🧔", dima.x - 2, dima.y - 6); // пока “условная голова”, потом заменим на спрайт
  // эмоция
  ctx.font = "700 16px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(dima.face, dima.x + 6, dima.y + dima.h + 18);
  ctx.restore();
}

function drawConfetti() {
  ctx.save();
  for (const p of prog.confetti) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.fillStyle = `hsl(${(p.x + p.y) % 360}, 90%, 60%)`;
    ctx.fillRect(-p.r, -p.r, p.r*2.2, p.r*1.4);
    ctx.restore();
  }
  ctx.restore();
}

// ОБНОВЛЕНИЕ

function step() {
  // физика героя
  dima.vy += world.gravity;
  dima.y += dima.vy;

  if (dima.y >= world.groundY - dima.h) {
    dima.y = world.groundY - dima.h;
    dima.vy = 0;
    dima.onGround = true;
  }

  // эффекты
  if (prog.flash > 0) prog.flash--;

  // конфетти движение
  if (prog.confetti.length) {
    for (const p of prog.confetti) {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      p.vy += 0.08;
      if (p.y > canvas.height + 40) p.y = -40;
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
    }
  }

  // авто-улыбка на победе
  if (state === S.WIN) dima.face = "😁";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScene();

  requestAnimationFrame(step);
}

// старт
goIntro();
step();