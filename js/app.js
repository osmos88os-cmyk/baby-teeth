// Главное приложение Vue 3
const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;

const app = createApp({
  setup() {
    // Вкладки
    const currentTab = ref('brush'); // 'brush' | 'teeth' | 'history'
    
    // Данные из хранилища
    const profile = ref({ ...appStorage.data.profile });
    const teethData = ref({ ...appStorage.data.teeth });
    const brushings = ref([...appStorage.data.brushings]);
    
    // Полноэкранный / PWA баннер
    const isStandalone = ref(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
    const showPwaBanner = ref(!isStandalone.value && !localStorage.getItem('pwa_banner_dismissed'));

    // --- ТАЙМЕР ЧИСТКИ ---
    const isTimerRunning = ref(false);
    const timerSeconds = ref(60);
    const initialTimerSeconds = ref(60);
    let timerInterval = null;
    const showBrushConfirmModal = ref(false);
    const pendingBrushType = ref('morning');
    const brushNoteInput = ref('');

    // --- МОДАЛЬНОЕ ОКНО ЗУБИКА (BOTTOM SHEET) ---
    const activeToothModal = ref(null);
    const toothForm = ref({
      status: 'none',
      date: '',
      notes: '',
      symptoms: []
    });

    // Вид в разделе "Зубки": 'jaw' (схема) или 'list' (список)
    const teethViewMode = ref('jaw');

    // Профиль модалка / настройки
    const showSettingsModal = ref(false);
    const profileForm = ref({ ...profile.value });

    // Уведомление (Toast)
    const toast = ref({ show: false, message: '', type: 'info' });
    let toastTimeout = null;

    const showToast = (message, type = 'info') => {
      toast.value = { show: true, message, type };
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    // --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ---
    const allTeeth = computed(() => BABY_TEETH);
    const symptomsList = computed(() => TOOTH_SYMPTOMS);

    const upperTeeth = computed(() => BABY_TEETH.filter(t => t.jaw === 'upper'));
    const lowerTeeth = computed(() => BABY_TEETH.filter(t => t.jaw === 'lower'));

    const teethStats = computed(() => {
      let erupted = 0;
      let erupting = 0;
      Object.values(teethData.value).forEach(t => {
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
    });

    const eruptedList = computed(() => {
      const list = [];
      Object.keys(teethData.value).forEach(id => {
        const t = teethData.value[id];
        if (t.status === 'erupted' || t.status === 'erupting') {
          const info = BABY_TEETH.find(item => item.id === id);
          list.push({
            id,
            ...t,
            info,
            ageText: profile.value.birthDate && t.date 
              ? appStorage.formatAgeAtDate(profile.value.birthDate, t.date)
              : ''
          });
        }
      });
      list.sort((a, b) => {
        if (a.date && b.date) return new Date(b.date) - new Date(a.date);
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      return list;
    });

    // Последняя чистка
    const lastBrushing = computed(() => {
      if (brushings.value.length === 0) return null;
      return brushings.value[0];
    });

    const lastBrushingText = computed(() => {
      if (!lastBrushing.value) return 'Еще не чистили';
      return appStorage.formatRelativeTime(lastBrushing.value.timestamp);
    });

    // Статус на сегодня
    const todayBrushings = computed(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      return brushings.value.filter(b => b.timestamp.startsWith(todayStr));
    });

    const hasMorningBrush = computed(() => {
      return todayBrushings.value.some(b => b.type === 'morning');
    });

    const hasEveningBrush = computed(() => {
      return todayBrushings.value.some(b => b.type === 'evening');
    });

    const streakDays = computed(() => {
      return appStorage.getStreakDays();
    });

    // Дни текущей недели для виджета
    const weekDays = computed(() => {
      const days = [];
      const now = new Date();
      const currentDay = now.getDay(); // 0 - воскресенье, 1 - понедельник
      const mondayOffset = (currentDay === 0 ? -6 : 1) - currentDay;
      
      const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + mondayOffset + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayBrushings = brushings.value.filter(b => b.timestamp.startsWith(dateStr));
        
        days.push({
          dateStr,
          dayName: dayNames[i],
          dayNum: d.getDate(),
          isToday: dateStr === now.toISOString().split('T')[0],
          morning: dayBrushings.some(b => b.type === 'morning'),
          evening: dayBrushings.some(b => b.type === 'evening'),
          count: dayBrushings.length
        });
      }
      return days;
    });

    // Прогресс кольца таймера
    const timerProgress = computed(() => {
      const total = initialTimerSeconds.value || 60;
      return ((total - timerSeconds.value) / total) * 100;
    });

    const timerMinutesStr = computed(() => {
      const m = Math.floor(timerSeconds.value / 60);
      const s = timerSeconds.value % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    });

    const todayFormatted = computed(() => {
      const now = new Date();
      return now.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
    });

    const streakText = computed(() => {
      return appStorage.declension(streakDays.value, ['день подряд', 'дня подряд', 'дней подряд']);
    });

    const formatTimestamp = (iso) => {
      return appStorage.formatRelativeTime(iso);
    };

    const formatDateRu = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      return dateStr;
    };

    const getSymptomLabel = (symId) => {
      const s = TOOTH_SYMPTOMS.find(item => item.id === symId);
      return s ? `${s.icon} ${s.label}` : symId;
    };

    // --- МЕТОДЫ ЧИСТКИ ---
    const openAddBrushModal = (preselectedType = null) => {
      soundFX.playPop();
      const hour = new Date().getHours();
      pendingBrushType.value = preselectedType || (hour < 14 ? 'morning' : (hour >= 17 ? 'evening' : 'extra'));
      brushNoteInput.value = '';
      showBrushConfirmModal.value = true;
    };

    const confirmAddBrushing = () => {
      const item = appStorage.addBrushing(pendingBrushType.value, null, brushNoteInput.value);
      brushings.value = [...appStorage.data.brushings];
      showBrushConfirmModal.value = false;
      soundFX.playSuccess();
      showToast('Чистка зубок сохранена! 🪥✨', 'success');
      
      if (window.confetti) {
        window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    };

    const deleteBrushingItem = (id) => {
      if (confirm('Удалить эту запись о чистке?')) {
        appStorage.deleteBrushing(id);
        brushings.value = [...appStorage.data.brushings];
        showToast('Запись удалена', 'info');
      }
    };

    // --- ТАЙМЕР ДЛЯ РЕБЕНКА ---
    const startBrushTimer = (durationSec = 60) => {
      soundFX.init();
      soundFX.playPop();
      initialTimerSeconds.value = durationSec;
      timerSeconds.value = durationSec;
      isTimerRunning.value = true;
      currentTab.value = 'brush';

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (timerSeconds.value > 1) {
          timerSeconds.value--;
          if (timerSeconds.value <= 3) {
            soundFX.playTick();
          }
        } else {
          finishBrushTimer();
        }
      }, 1000);
    };

    const stopBrushTimer = () => {
      clearInterval(timerInterval);
      isTimerRunning.value = false;
      timerSeconds.value = initialTimerSeconds.value;
    };

    const finishBrushTimer = () => {
      clearInterval(timerInterval);
      isTimerRunning.value = false;
      timerSeconds.value = 0;
      soundFX.playFanfare();

      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      // Предлагаем сразу зафиксировать чистку
      setTimeout(() => {
        pendingBrushType.value = new Date().getHours() < 14 ? 'morning' : 'evening';
        brushNoteInput.value = `Таймер ${initialTimerSeconds.value} сек`;
        showBrushConfirmModal.value = true;
      }, 700);
    };

    // --- УПРАВЛЕНИЕ ЗУБКАМИ ---
    const getToothState = (id) => {
      return teethData.value[id] || { status: 'none', date: '', notes: '', symptoms: [] };
    };

    const openToothModal = (tooth) => {
      soundFX.playPop();
      activeToothModal.value = tooth;
      const current = getToothState(tooth.id);
      toothForm.value = {
        status: current.status || 'none',
        date: current.date || new Date().toISOString().split('T')[0],
        notes: current.notes || '',
        symptoms: Array.isArray(current.symptoms) ? [...current.symptoms] : []
      };
    };

    const closeToothModal = () => {
      activeToothModal.value = null;
    };

    const setToothFormStatus = (status) => {
      toothForm.value.status = status;
      if (status !== 'none' && !toothForm.value.date) {
        toothForm.value.date = new Date().toISOString().split('T')[0];
      }
      soundFX.playPop();
    };

    const setTodayDate = () => {
      toothForm.value.date = new Date().toISOString().split('T')[0];
      soundFX.playPop();
    };

    const setYesterdayDate = () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      toothForm.value.date = d.toISOString().split('T')[0];
      soundFX.playPop();
    };

    const toggleSymptom = (symptomId) => {
      soundFX.playPop();
      const idx = toothForm.value.symptoms.indexOf(symptomId);
      if (idx > -1) {
        toothForm.value.symptoms.splice(idx, 1);
      } else {
        toothForm.value.symptoms.push(symptomId);
      }
    };

    const saveToothModal = () => {
      if (!activeToothModal.value) return;
      appStorage.setTooth(activeToothModal.value.id, toothForm.value);
      teethData.value = { ...appStorage.data.teeth };
      soundFX.playSuccess();
      showToast(`Зубик "${activeToothModal.value.name}" обновлен! 🦷`, 'success');

      if (toothForm.value.status === 'erupted' && window.confetti) {
        window.confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      }
      closeToothModal();
    };

    const resetToothStatus = () => {
      if (!activeToothModal.value) return;
      if (confirm(`Сбросить отметку для "${activeToothModal.value.name}"?`)) {
        appStorage.setTooth(activeToothModal.value.id, { status: 'none' });
        teethData.value = { ...appStorage.data.teeth };
        showToast('Отметка сброшена', 'info');
        closeToothModal();
      }
    };

    // --- НАСТРОЙКИ И ПРОФИЛЬ ---
    const openSettings = () => {
      soundFX.playPop();
      profileForm.value = { ...profile.value };
      showSettingsModal.value = true;
    };

    const saveSettings = () => {
      appStorage.updateProfile(profileForm.value);
      profile.value = { ...appStorage.data.profile };
      soundFX.enabled = profile.value.soundEnabled;
      showSettingsModal.value = false;
      showToast('Настройки сохранены 👍', 'success');
    };

    const toggleSound = () => {
      profile.value.soundEnabled = !profile.value.soundEnabled;
      appStorage.updateProfile({ soundEnabled: profile.value.soundEnabled });
      soundFX.enabled = profile.value.soundEnabled;
      if (soundFX.enabled) soundFX.playPop();
      showToast(soundFX.enabled ? 'Звук включен 🔔' : 'Звук выключен 🔕', 'info');
    };

    // Резервная копия
    const downloadBackup = () => {
      const json = appStorage.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zubki-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Резервная копия скачана! 📥', 'success');
    };

    const copyBackupToClipboard = () => {
      const json = appStorage.exportJSON();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
          showToast('Данные скопированы в буфер! Можно отправить в мессенджер 📋', 'success');
        });
      } else {
        showToast('Буфер недоступен', 'error');
      }
    };

    const importBackupFromFile = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = appStorage.importJSON(e.target.result);
        if (res.success) {
          profile.value = { ...appStorage.data.profile };
          teethData.value = { ...appStorage.data.teeth };
          brushings.value = [...appStorage.data.brushings];
          showToast('Данные успешно восстановлены! 🎉', 'success');
          showSettingsModal.value = false;
        } else {
          alert('Ошибка при чтении файла бэкапа: ' + res.error);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    };

    const loadDemo = () => {
      if (confirm('Загрузить пример заполненных зубок и чисток? (Текущие данные будут перезаписаны)')) {
        appStorage.loadDemoData();
        profile.value = { ...appStorage.data.profile };
        teethData.value = { ...appStorage.data.teeth };
        brushings.value = [...appStorage.data.brushings];
        showToast('Демо-данные загружены! 🌟', 'success');
        showSettingsModal.value = false;
      }
    };

    const clearAllData = () => {
      if (confirm('Вы уверены, что хотите стереть все зубки и чистки? Это действие необратимо.')) {
        localStorage.removeItem('baby_teeth_brush_tracker_v1');
        appStorage.data = appStorage.getDefaultData();
        profile.value = { ...appStorage.data.profile };
        teethData.value = {};
        brushings.value = [];
        showToast('Все данные очищены', 'info');
        showSettingsModal.value = false;
      }
    };

    const dismissPwaBanner = () => {
      showPwaBanner.value = false;
      localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    onMounted(() => {
      soundFX.enabled = profile.value.soundEnabled;
      // Регистрация Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW register error', err);
        });
      }
    });

    onUnmounted(() => {
      clearInterval(timerInterval);
    });

    return {
      currentTab,
      profile,
      teethData,
      brushings,
      allTeeth,
      upperTeeth,
      lowerTeeth,
      symptomsList,
      teethStats,
      eruptedList,
      lastBrushing,
      lastBrushingText,
      todayBrushings,
      hasMorningBrush,
      hasEveningBrush,
      streakDays,
      weekDays,
      // PWA banner
      showPwaBanner,
      dismissPwaBanner,
      // Таймер
      isTimerRunning,
      timerSeconds,
      initialTimerSeconds,
      timerProgress,
      timerMinutesStr,
      startBrushTimer,
      stopBrushTimer,
      finishBrushTimer,
      // Чистка
      showBrushConfirmModal,
      pendingBrushType,
      brushNoteInput,
      openAddBrushModal,
      confirmAddBrushing,
      deleteBrushingItem,
      // Зубки
      teethViewMode,
      activeToothModal,
      toothForm,
      getToothState,
      openToothModal,
      closeToothModal,
      setToothFormStatus,
      setTodayDate,
      setYesterdayDate,
      toggleSymptom,
      saveToothModal,
      resetToothStatus,
      // Настройки
      showSettingsModal,
      profileForm,
      openSettings,
      saveSettings,
      toggleSound,
      downloadBackup,
      copyBackupToClipboard,
      importBackupFromFile,
      loadDemo,
      clearAllData,
      // Toast
      toast,
      // Форматирование и локализация
      todayFormatted,
      streakText,
      formatTimestamp,
      formatDateRu,
      getSymptomLabel
    };
  }
});

app.mount('#app');
