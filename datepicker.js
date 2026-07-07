import { state } from './state.js';
import { cardList } from './carddata.js';
import { checkCardMatchFilters, normalizeDateStr } from './ui.js';

let startPicker = null;
let endPicker = null;

// 현재 선택된 필터 조건에 들어맞는 서포트 카드의 출시일만 추출
const getCardReleaseDates = () => {
    const dates = new Set();
    cardList.forEach(card => {
        if (card.releasedAt && checkCardMatchFilters(card, false)) {
            const normalized = normalizeDateStr(card.releasedAt);
            if (normalized) dates.add(normalized);
        }
    });
    return Array.from(dates);
};

export function updateDatePickerDots() {
    const specialDates = getCardReleaseDates();
    if (startPicker) markSpecialDates(startPicker, specialDates);
    if (endPicker) markSpecialDates(endPicker, specialDates);
}

export function updateDatePickerLanguage() {
    if (startPicker) startPicker.destroy();
    if (endPicker) endPicker.destroy();
    // ui.js의 renderSupport 대신 syncFilterUI나 null 전달. 언어변경 시 어차피 main.js에서 renderSupport를 호출함.
    initDatePicker();
}

const markSpecialDates = (fp, specialDates) => {
    if (!fp || !fp.days) return;
    const dayElems = fp.days.querySelectorAll('.flatpickr-day');
    dayElems.forEach(dayElem => {
        if (!dayElem.dateObj) return;
        const year = dayElem.dateObj.getFullYear();
        const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dayElem.dateObj.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        if (specialDates.includes(dateString)) {
            dayElem.classList.add('has-update');
        } else {
            dayElem.classList.remove('has-update');
        }
    });
};

export function initDatePicker(renderCallback) {
    const dateStartEl = document.querySelector('#date-filter-start');
    const dateEndEl = document.querySelector('#date-filter-end');
    
    if (!dateStartEl || !dateEndEl) return;

    const specialDates = getCardReleaseDates();

    const weekdaysByLang = {
        ko: { shorthand: ["일", "월", "화", "수", "목", "금", "토"], longhand: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] },
        ja: { shorthand: ["日", "月", "火", "水", "木", "金", "土"], longhand: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"] },
        en: { shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }
    };

    const customLocale = {
        weekdays: weekdaysByLang[state.currentLang] || weekdaysByLang.en,
        months: {
            shorthand: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            longhand: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        }
    };

    const commonOptions = {
        locale: customLocale,
        minDate: "2024-05-16",
        disableMobile: "true",
        monthSelectorType: "static",
        static: true,
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const currentDates = getCardReleaseDates();
            const year = dayElem.dateObj.getFullYear();
            const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dayElem.dateObj.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            if (currentDates.includes(dateString)) {
                dayElem.classList.add('has-update');
            } else {
                dayElem.classList.remove('has-update');
            }
        },
        onMonthChange: function(selectedDates, dateStr, fp) {
            setTimeout(() => updateDatePickerDots(), 10);
        },
        onYearChange: function(selectedDates, dateStr, fp) {
            setTimeout(() => updateDatePickerDots(), 10);
        },
        onOpen: function(selectedDates, dateStr, fp) {
            const dropdown = document.querySelector('#ability-dropdown');
            if (dropdown) dropdown.style.setProperty('overflow-y', 'visible', 'important');
        },
        onClose: function(selectedDates, dateStr, fp) {
            const dropdown = document.querySelector('#ability-dropdown');
            if (dropdown) dropdown.style.setProperty('overflow-y', 'auto', 'important');
        }
    };

    const createResetButton = (fp, defaultDateStr, isStart) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML = '↺';
        btn.className = "flatpickr-reset-btn";
        btn.title = "날짜 초기화";
        // 달력 상단 좌측에 고정 배치
        btn.style.cssText = "position: absolute; top: 6px; left: 10px; padding: 4px; font-size: 1.1rem; font-weight: bold; z-index: 100; border: none; background: transparent; cursor: pointer; color: #3f4458; opacity: 0.7;";
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            fp.setDate(defaultDateStr);
            fp.close();
            
            if (isStart) state.filters.dateRange.start = defaultDateStr;
            else state.filters.dateRange.end = defaultDateStr;
            
            sessionStorage.setItem('filters', JSON.stringify(state.filters));
            if (renderCallback) renderCallback();
        });
        fp.calendarContainer.appendChild(btn);
    };

    startPicker = flatpickr(dateStartEl, {
        ...commonOptions,
        defaultDate: state.filters.dateRange.start || "2024-05-16",
        onReady: function(selectedDates, dateStr, fp) {
            createResetButton(fp, "2024-05-16", true);
            updateDatePickerDots();
            fp.calendarContainer.classList.add('picker-align-left');
            if (fp.currentYearElement) {
                fp.currentYearElement.setAttribute('readonly', 'readonly');
                fp.currentYearElement.style.cursor = 'default';
            }
        },
        onChange: function(selectedDates, dateStr) {
            if (!dateStr) {
                dateStr = '2024-05-16';
                startPicker.setDate(dateStr);
            }
            state.filters.dateRange.start = dateStr;
            sessionStorage.setItem('filters', JSON.stringify(state.filters));
            if (renderCallback) renderCallback();
        }
    });

    endPicker = flatpickr(dateEndEl, {
        ...commonOptions,
        defaultDate: state.filters.dateRange.end || new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        onReady: function(selectedDates, dateStr, fp) {
            createResetButton(fp, new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0], false);
            updateDatePickerDots();
            fp.calendarContainer.classList.add('picker-align-right');
            if (fp.currentYearElement) {
                fp.currentYearElement.setAttribute('readonly', 'readonly');
                fp.currentYearElement.style.cursor = 'default';
            }
        },
        onChange: function(selectedDates, dateStr) {
            if (!dateStr) {
                dateStr = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                endPicker.setDate(dateStr);
            }
            state.filters.dateRange.end = dateStr;
            sessionStorage.setItem('filters', JSON.stringify(state.filters));
            if (renderCallback) renderCallback();
        }
    });
}

export function syncDatePickerUI() {
    if (startPicker && state.filters.dateRange.start) {
        startPicker.setDate(state.filters.dateRange.start, false);
    }
    if (endPicker && state.filters.dateRange.end) {
        endPicker.setDate(state.filters.dateRange.end, false);
    }
}

// 달력 밖 영역 클릭/터치 시 닫기
document.addEventListener('pointerdown', (e) => {
    const dateStartEl = document.querySelector('#date-filter-start');
    const dateEndEl = document.querySelector('#date-filter-end');

    if (startPicker && startPicker.isOpen) {
        const inCalendar = startPicker.calendarContainer && startPicker.calendarContainer.contains(e.target);
        const inInput = dateStartEl && dateStartEl.contains(e.target);
        if (!inCalendar && !inInput) {
            startPicker.close();
        }
    }
    if (endPicker && endPicker.isOpen) {
        const inCalendar = endPicker.calendarContainer && endPicker.calendarContainer.contains(e.target);
        const inInput = dateEndEl && dateEndEl.contains(e.target);
        if (!inCalendar && !inInput) {
            endPicker.close();
        }
    }
}, true);
