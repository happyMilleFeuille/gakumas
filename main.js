// main.js
import translations from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const langBtns = document.querySelectorAll('.lang-btn');
    const idolSection = document.getElementById('idol');
    const contentArea = document.getElementById('content-area');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const logo = document.querySelector('.logo');
    
    // 2. 상태 변수
    let currentLang = localStorage.getItem('lang') || 'ko';
    let currentBg = localStorage.getItem('selectedBg') || '';
    const idolList = [
        'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 
        'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
    ];

    // 3. 초기화 로직
    updateLanguage(currentLang);
    if (currentBg && idolSection) {
        idolSection.style.backgroundImage = `url('images/${currentBg}.png')`;
    }

    // 4. 핵심 기능 함수들
    function updateLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        langBtns.forEach(b => b.classList.toggle('active', b.id === `lang-${lang}`));
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (el.tagName === 'SPAN' || el.children.length === 0) {
                    el.innerHTML = translations[lang][key];
                } else {
                    const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) textNode.textContent = translations[lang][key];
                }
            }
        });
        document.documentElement.lang = lang;
    }

    function setBackground(name) {
        if (idolSection) {
            idolSection.style.backgroundImage = `url('images/${name}.png')`;
            localStorage.setItem('selectedBg', name);
            currentBg = name;
        }
    }

    // 5. 내비게이션 관리
    function handleNavigation(target) {
        if (!target) return;
        switch(target) {
            case 'home': renderHome(); break;
            case 'idol': renderIdolList(); break;
        }
        if (navLinks) navLinks.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('is-active');
    }

    // 6. 렌더링 함수 (Templates 사용)
    function renderHome() {
        if (!contentArea) return;
        const tpl = document.getElementById('tpl-home');
        contentArea.innerHTML = '';
        contentArea.appendChild(tpl.content.cloneNode(true));
        updateLanguage(currentLang);
    }

    function renderIdolList() {
        if (!contentArea) return;
        contentArea.innerHTML = '';
        
        const gridTpl = document.getElementById('tpl-idol-grid');
        const itemTpl = document.getElementById('tpl-idol-item');
        const grid = gridTpl.content.cloneNode(true).querySelector('.idol-grid');

        idolList.forEach(name => {
            const item = itemTpl.content.cloneNode(true);
            const img = item.querySelector('.idol-icon');
            img.src = `icons/idolicons/${name}.png`;
            img.alt = name;
            img.addEventListener('click', () => setBackground(name));
            grid.appendChild(item);
        });

        contentArea.appendChild(grid);
    }

    // 7. 이벤트 바인딩
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => updateLanguage(btn.id.split('-')[1]));
    });

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    document.querySelectorAll('.nav-links a, .menu-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            if (el.tagName === 'A' && el.getAttribute('href').startsWith('#')) e.preventDefault();
            handleNavigation(el.dataset.target);
        });
    });

    if (logo) logo.addEventListener('click', () => handleNavigation('home'));
});