// Модуль хранения данных и бизнес-логики (LocalStorage + хелперы дат)

const STORAGE_KEY = 'baby_teeth_brush_tracker_v1';

class AppStorage {
  constructor() {
    this.data = this.load();
  }

  getDefaultData() {
    return {
      profile: {
        babyName: 'Малыш',
        birthDate: '',
        timerDuration: 60, // секунды (60 или 120)
        soundEnabled: true
      },
      teeth: {
        // id зубика -> { status: 'none'|'erupting'|'erupted', date: 'YYYY-MM-DD', notes: '', symptoms: [] }
      },
      brushings: [
        // { id, timestamp, type: 'morning'|'evening'|'extra', duration, note }
      ]
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          profile: { ...this.getDefaultData().profile, ...(parsed.profile || {}) },
          teeth: parsed.teeth || {},
          brushings: Array.isArray(parsed.brushings) ? parsed.brushings : []
        };
      }
    } catch (e) {
      console.error('Ошибка загрузки данных из LocalStorage', e);
    }
    return this.getDefaultData();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Ошибка сохранения данных', e);
    }
  }

  // --- Методы профиля ---
  updateProfile(profile) {
    this.data.profile = { ...this.data.profile, ...profile };
    this.save();
  }

  // --- Методы зубок ---
  getTooth(id) {
    return this.data.teeth[id] || {
      status: 'none',
      date: '',
      notes: '',
      symptoms: []
    };
  }

  setTooth(id, toothData) {
    if (toothData.status === 'none') {
      delete this.data.teeth[id];
    } else {
      this.data.teeth[id] = {
        status: toothData.status,
        date: toothData.date || new Date().toISOString().split('T')[0],
        notes: toothData.notes || '',
        symptoms: toothData.symptoms || [],
        updatedAt: Date.now()
      };
    }
    this.save();
  }

  getTeethStats() {
    let erupted = 0;
    let erupting = 0;
    Object.values(this.data.teeth).forEach(t => {
      if (t.status === 'erupted') erupted++;
      else if (t.status === 'erupting') erupting++;
    });
    return {
      erupted,
      erupting,
      none: 20 - erupted - erupting,
      total: 20,
      percent: Math.round((erupted / 20) * 100)
    };
  }

  // Список всех зубок с их статусами, отсортированных по дате появления
  getEruptedHistory() {
    const list = [];
    Object.keys(this.data.teeth).forEach(id => {
      const t = this.data.teeth[id];
      if (t.status === 'erupted' || t.status === 'erupting') {
        const info = (typeof BABY_TEETH !== 'undefined') 
          ? BABY_TEETH.find(item => item.id === id) 
          : null;
        list.push({
          id,
          ...t,
          info
        });
      }
    });

    // Сортировка: сначала самые новые даты
    list.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    return list;
  }

  // --- Методы чистки зубок ---
  addBrushing(type = null, duration = null, note = '') {
    const now = new Date();
    // Если тип не указан, определяем по текущему времени:
    // до 14:00 - morning, после 17:00 - evening, иначе extra
    if (!type) {
      const hour = now.getHours();
      if (hour < 14) type = 'morning';
      else if (hour >= 17) type = 'evening';
      else type = 'extra';
    }

    const item = {
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: now.toISOString(),
      type,
      duration: duration || null,
      note: note.trim()
    };

    this.data.brushings.unshift(item);
    // Храним последние 500 записей
    if (this.data.brushings.length > 500) {
      this.data.brushings = this.data.brushings.slice(0, 500);
    }
    this.save();
    return item;
  }

  deleteBrushing(id) {
    this.data.brushings = this.data.brushings.filter(b => b.id !== id);
    this.save();
  }

  getLastBrushing() {
    if (!this.data.brushings || this.data.brushings.length === 0) return null;
    return this.data.brushings[0];
  }

  // Проверка чисток на сегодня
  getTodayBrushings() {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.data.brushings.filter(b => b.timestamp.startsWith(todayStr));
  }

  // Расчет серии дней (streak)
  getStreakDays() {
    if (!this.data.brushings || this.data.brushings.length === 0) return 0;
    
    // Множество уникальных дат с чистками (YYYY-MM-DD)
    const dates = new Set(this.data.brushings.map(b => b.timestamp.split('T')[0]));
    
    let streak = 0;
    const checkDate = new Date();
    
    // Проверяем: если сегодня еще не чистили, проверяем со вчерашнего дня
    const todayKey = checkDate.toISOString().split('T')[0];
    if (!dates.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = checkDate.toISOString().split('T')[0];
      if (dates.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // Форматирование относительного времени («3 часа назад», «Сегодня в 08:30»)
  formatRelativeTime(isoString) {
    if (!isoString) return 'Еще не чистили';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 2) return 'Только что';
    if (diffMin < 60) return `${diffMin} ${this.declension(diffMin, ['минуту', 'минуты', 'минут'])} назад`;
    
    // Если сегодня
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return `Сегодня в ${timeStr} (${diffHours} ${this.declension(diffHours, ['час', 'часа', 'часов'])} назад)`;
    }

    // Если вчера
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return `Вчера в ${timeStr}`;
    }

    // Раньше
    const dateFormatted = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return `${dateFormatted} в ${timeStr}`;
  }

  // Склонение русских слов (минута, минуты, минут)
  declension(n, forms) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  // Форматирование возраста ребенка на дату
  formatAgeAtDate(birthDateStr, targetDateStr) {
    if (!birthDateStr || !targetDateStr) return '';
    const birth = new Date(birthDateStr);
    const target = new Date(targetDateStr);
    if (target < birth) return '';

    let months = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
    if (target.getDate() < birth.getDate()) {
      months--;
    }
    if (months < 1) {
      const days = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
      return `в ${days} ${this.declension(days, ['день', 'дня', 'дней'])}`;
    }
    if (months < 12) {
      return `в ${months} ${this.declension(months, ['месяц', 'месяца', 'месяцев'])}`;
    }
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) {
      return `в ${years} ${this.declension(years, ['год', 'года', 'лет'])}`;
    }
    return `в ${years} г. ${remMonths} мес.`;
  }

  // --- Резервное копирование и экспорт ---
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.data = {
          profile: { ...this.getDefaultData().profile, ...(parsed.profile || {}) },
          teeth: parsed.teeth || {},
          brushings: Array.isArray(parsed.brushings) ? parsed.brushings : []
        };
        this.save();
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
    return { success: false, error: 'Неверный формат данных' };
  }

  // Демо-данные для наглядности (если пользователь захочет посмотреть пример)
  loadDemoData() {
    const today = new Date();
    const dStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    this.data.profile = {
      babyName: 'Малыш',
      birthDate: dStr(270), // ~9 месяцев
      timerDuration: 60,
      soundEnabled: true
    };

    // Пара вылезших резцов и один режется
    this.data.teeth = {
      '81': { status: 'erupted', date: dStr(60), notes: 'Первый зубик! Увидели ложечкой', symptoms: ['drool', 'chewing'] },
      '71': { status: 'erupted', date: dStr(45), notes: 'Рядом вылез второй нижний', symptoms: ['drool'] },
      '51': { status: 'erupted', date: dStr(15), notes: 'Верхний правый резец показался', symptoms: ['fever', 'whiny', 'gel'] },
      '61': { status: 'erupting', date: dStr(2), notes: 'Десна очень набухла, вот-вот выйдет', symptoms: ['whiny', 'drool', 'gel'] }
    };

    // Несколько чисток
    this.data.brushings = [
      { id: 'b_1', timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), type: 'morning', duration: 60, note: '' },
      { id: 'b_2', timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), type: 'evening', duration: 60, note: '' },
      { id: 'b_3', timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), type: 'morning', duration: 60, note: '' }
    ];
    this.save();
  }
}

const appStorage = new AppStorage();
