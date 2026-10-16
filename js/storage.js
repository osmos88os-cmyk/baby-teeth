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
        soundEnabled: true,
        showToothNumbers: false, // По умолчанию чистый вид без номеров
        notificationsEnabled: true,
        reminderIntervalHours: 8 // Напоминать о чистке, если прошло более 8 часов
      },
      teeth: {
        // id зубика -> { status: 'none'|'erupting'|'erupted'|'erupted_earlier', date: 'YYYY-MM-DD'|'', dateUnknown: boolean, notes: '', symptoms: [] }
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
      dateUnknown: false,
      notes: '',
      symptoms: []
    };
  }

  setTooth(id, toothData) {
    if (!toothData || toothData.status === 'none') {
      delete this.data.teeth[id];
    } else {
      const isEarlier = toothData.status === 'erupted_earlier' || toothData.dateUnknown;
      this.data.teeth[id] = {
        status: isEarlier ? 'erupted_earlier' : toothData.status,
        date: isEarlier ? '' : (toothData.date || new Date().toISOString().split('T')[0]),
        dateUnknown: !!isEarlier,
        notes: toothData.notes || '',
        symptoms: toothData.symptoms || [],
        updatedAt: Date.now()
      };
    }
    this.save();
  }

  // Пакетная отметка зубок как «Вылезли ранее»
  batchSetEruptedEarlier(toothIds) {
    if (!Array.isArray(toothIds)) return;
    toothIds.forEach(id => {
      this.data.teeth[id] = {
        status: 'erupted_earlier',
        date: '',
        dateUnknown: true,
        notes: this.data.teeth[id]?.notes || '',
        symptoms: this.data.teeth[id]?.symptoms || [],
        updatedAt: Date.now()
      };
    });
    this.save();
  }

  getTeethStats() {
    let erupted = 0;
    let erupting = 0;
    Object.values(this.data.teeth).forEach(t => {
      if (t.status === 'erupted' || t.status === 'erupted_earlier') {
        erupted++;
      } else if (t.status === 'erupting') {
        erupting++;
      }
    });
    return {
      erupted,
      erupting,
      none: Math.max(0, 20 - erupted - erupting),
      total: 20,
      percent: Math.min(100, Math.round((erupted / 20) * 100))
    };
  }

  // Список всех зубок для хронологии
  getEruptedHistory() {
    const list = [];
    Object.keys(this.data.teeth).forEach(id => {
      const t = this.data.teeth[id];
      if (t.status === 'erupted' || t.status === 'erupted_earlier' || t.status === 'erupting') {
        const info = (typeof BABY_TEETH !== 'undefined') 
          ? BABY_TEETH.find(item => item.id === id) 
          : null;
        list.push({
          id,
          ...t,
          info,
          isEarlier: t.status === 'erupted_earlier' || t.dateUnknown
        });
      }
    });

    // Сортировка: сначала свежие с датами, затем «вылезшие ранее» (по анатомическому порядку)
    list.sort((a, b) => {
      if (a.isEarlier && !b.isEarlier) return 1;
      if (!a.isEarlier && b.isEarlier) return -1;
      if (a.isEarlier && b.isEarlier) {
        return (a.info?.order || 0) - (b.info?.order || 0);
      }
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

  getTodayBrushings() {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.data.brushings.filter(b => b.timestamp.startsWith(todayStr));
  }

  getStreakDays() {
    if (!this.data.brushings || this.data.brushings.length === 0) return 0;
    const dates = new Set(this.data.brushings.map(b => b.timestamp.split('T')[0]));
    let streak = 0;
    const checkDate = new Date();
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

  formatRelativeTime(isoString) {
    if (!isoString) return 'Еще не чистили';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 2) return 'Только что';
    if (diffMin < 60) return `${diffMin} ${this.declension(diffMin, ['минуту', 'минуты', 'минут'])} назад`;
    
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return `Сегодня в ${timeStr} (${diffHours} ${this.declension(diffHours, ['час', 'часа', 'часов'])} назад)`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return `Вчера в ${timeStr}`;
    }

    const dateFormatted = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    return `${dateFormatted} в ${timeStr}`;
  }

  declension(n, forms) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  formatAgeAtDate(birthDateStr, targetDateStr) {
    if (!birthDateStr || !targetDateStr) return '';
    const birth = new Date(birthDateStr);
    const target = new Date(targetDateStr);
    if (isNaN(target.getTime()) || target < birth) return '';

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

  // Генерация защищенной ссылки для быстрой передачи данных между папой и мамой
  generateShareLink() {
    try {
      const jsonStr = JSON.stringify(this.data);
      const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      }));
      const base = window.location.origin + window.location.pathname;
      return `${base}#sync=${encodeURIComponent(b64)}`;
    } catch (e) {
      console.error('Ошибка генерации ссылки синхронизации', e);
      return '';
    }
  }

  // Расшифровка данных из ссылки синхронизации
  decodeShareData(hash) {
    try {
      if (!hash) return null;
      const match = hash.match(/sync=([^&]+)/);
      if (!match) return null;
      const b64 = decodeURIComponent(match[1]);
      const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      console.error('Ошибка расшифровки ссылки синхронизации', e);
    }
    return null;
  }

  loadDemoData() {
    const today = new Date();
    const dStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    this.data.profile = {
      babyName: 'Малыш',
      birthDate: dStr(270),
      timerDuration: 60,
      soundEnabled: true,
      showToothNumbers: false
    };

    this.data.teeth = {
      '81': { status: 'erupted_earlier', date: '', dateUnknown: true, notes: 'Вылез самым первым, заметили ложечкой', symptoms: ['drool'] },
      '71': { status: 'erupted_earlier', date: '', dateUnknown: true, notes: 'Вылез следом', symptoms: ['drool'] },
      '51': { status: 'erupted', date: dStr(12), notes: 'Верхний правый резец показался', symptoms: ['fever', 'whiny', 'gel'] },
      '61': { status: 'erupting', date: dStr(2), notes: 'Десна очень набухла', symptoms: ['whiny', 'drool', 'gel'] }
    };

    this.data.brushings = [
      { id: 'b_1', timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), type: 'morning', duration: 60, note: '' },
      { id: 'b_2', timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), type: 'evening', duration: 60, note: '' },
      { id: 'b_3', timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), type: 'morning', duration: 60, note: '' }
    ];
    this.save();
  }
}

const appStorage = new AppStorage();
