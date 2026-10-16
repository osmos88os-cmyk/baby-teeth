// Модуль Push и Web-уведомлений для Android и iPhone (iOS 16.4+)

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.lastNotificationTime = parseInt(localStorage.getItem('last_brush_notification_ts') || '0', 10);
  }

  // Проверка, установлено ли приложение на экран Домой (для iOS)
  isIOSStandalone() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    return { isIOS, isStandalone };
  }

  // Статус разрешений
  getPermissionStatus() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  // Запрос разрешения на отправку уведомлений
  async requestPermission() {
    if (!this.isSupported) {
      alert('Уведомления не поддерживаются вашим браузером');
      return false;
    }

    const { isIOS, isStandalone } = this.isIOSStandalone();
    if (isIOS && !isStandalone) {
      alert('На iPhone для работы уведомлений добавьте приложение на экран «Домой»:\nНажмите «Поделиться» ➔ «На экран Домой»');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Ошибка запроса разрешения на уведомления', e);
      return false;
    }
  }

  // Отправка уведомления через Service Worker (работает на Android и iOS)
  async sendNotification(title, body, tag = 'brush-reminder') {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: './icons/icon-192.png',
          badge: './icons/icon-192.png',
          tag,
          vibrate: [200, 100, 200],
          data: { url: './index.html' }
        });
        localStorage.setItem('last_brush_notification_ts', Date.now().toString());
        this.lastNotificationTime = Date.now();
        return true;
      } else {
        // Fallback
        new Notification(title, {
          body,
          icon: './icons/icon-192.png',
          tag
        });
        localStorage.setItem('last_brush_notification_ts', Date.now().toString());
        this.lastNotificationTime = Date.now();
        return true;
      }
    } catch (e) {
      console.error('Ошибка отправки уведомления:', e);
      return false;
    }
  }

  // Тестовое уведомление для проверки
  async sendTestNotification() {
    const hasPermission = Notification.permission === 'granted' || (await this.requestPermission());
    if (!hasPermission) {
      return { success: false, reason: 'Нет разрешения' };
    }

    const sent = await this.sendNotification(
      '🪥 Зубки малыша — Тест',
      'Уведомления работают отлично! Теперь вы не забудете почистить зубки малышу ✨',
      'test-notification'
    );
    return { success: sent };
  }

  // Проверка необходимости напомнить о чистке зубок
  checkReminders(storageData) {
    if (!this.isSupported || Notification.permission !== 'granted') return;
    const profile = storageData?.profile || {};
    if (profile.notificationsEnabled === false) return;

    const now = new Date();
    const nowTs = now.getTime();

    // Защита от частых уведомлений (не чаще чем раз в 3 часа)
    if (nowTs - this.lastNotificationTime < 3 * 3600 * 1000) {
      return;
    }

    const brushings = storageData?.brushings || [];
    const lastBrushing = brushings[0];
    const thresholdHours = profile.reminderIntervalHours || 8; // По умолчанию 8 часов

    // 1. ПРОВЕРКА: ЕСЛИ ДАВНО НЕ ЧИСТИЛИ ЗУБЫ (> thresholdHours)
    if (lastBrushing) {
      const diffMs = nowTs - new Date(lastBrushing.timestamp).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours >= thresholdHours) {
        this.sendNotification(
          '🪥 Пора почистить зубки!',
          `Прошло уже ${diffHours} ч. с прошлой чистки малыша. Не забудьте позаботиться о зубках!`,
          'overdue-reminder'
        );
        return;
      }
    } else {
      // Вообще нет записей
      this.sendNotification(
        '🪥 Напоминание о чистке',
        'Сегодня еще не чистили зубки малышу. Давайте почистим!',
        'empty-reminder'
      );
      return;
    }

    // 2. РАСПИСАНИЕ: УТРО (09:00) И ВЕЧЕР (20:30)
    const hour = now.getHours();
    const todayStr = now.toISOString().split('T')[0];
    const todayBrushings = brushings.filter(b => b.timestamp.startsWith(todayStr));
    const hasMorning = todayBrushings.some(b => b.type === 'morning');
    const hasEvening = todayBrushings.some(b => b.type === 'evening');

    // Утреннее окно (9:00 - 11:30)
    if (hour >= 9 && hour <= 11 && !hasMorning) {
      this.sendNotification(
        '☀️ Доброе утро! Время чистки зубок',
        'Почистите зубки малышу после завтрака для свежести и защиты эмали 🪥',
        'morning-reminder'
      );
      return;
    }

    // Вечернее окно (20:00 - 22:30)
    if (hour >= 20 && hour <= 22 && !hasEvening) {
      this.sendNotification(
        '🌙 Добрый вечер! Время вечерней чистки',
        'Почистите зубки малышу перед сном, чтобы защитить их ночью 🪥✨',
        'evening-reminder'
      );
      return;
    }
  }
}

const notificationManager = new NotificationManager();
