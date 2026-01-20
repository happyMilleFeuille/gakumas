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
    
    // 2. 상태 변수
    let currentLang = localStorage.getItem('lang') || 'ko';
    let currentBg = localStorage.getItem('selectedBg') || '';
    const idolList = [
        'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 
        'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
    ];

    const logo = document.querySelector('.logo');
    
    // 3. 초기화 로직
    updateLanguage(currentLang);
    if (currentBg && idolSection) {
        idolSection.style.backgroundImage = `url('images/${currentBg}.png')`;
    }

    // 로고 클릭 시 홈으로 이동
    if (logo) {
        logo.addEventListener('click', () => {
            renderHome();
        });
    }

    // 4. 언어 변경 함수
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
                    if (textNode) {
                        textNode.textContent = translations[lang][key];
                    }
                }
            }
        });
        document.documentElement.lang = lang;
    }

    // 5. 배경 설정 함수
    function setBackground(name) {
        if (idolSection) {
            idolSection.style.backgroundImage = `url('images/${name}.png')`;
            localStorage.setItem('selectedBg', name);
            currentBg = name;
        }
    }

    // 6. 이벤트 리스너 - 언어 변경
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.id.split('-')[1];
            updateLanguage(lang);
        });
    });

    // 7. 이벤트 리스너 - 모바일 메뉴 토글
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    // 8. 이벤트 리스너 - 메뉴 링크 (상단 햄버거 메뉴)
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                if (targetId === 'idol') renderIdolList();
                if (targetId === 'home') renderHome();
                
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('is-active');
            }
        });
    });

    // 9. 이벤트 리스너 - 부채꼴 메뉴 버튼
    menuButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index === 0) renderIdolList(); // 아이돌
            if (index === 2) renderHome();     // 홈
        });
    });

    // 10. 렌더링 함수 - 홈
    function renderHome() {
        if (!contentArea) return;
        contentArea.innerHTML = `
            <h1 data-i18n="main_title">새로운 프로젝트에 오신 것을 환영합니다</h1>
            <p data-i18n="main_subtitle">이곳에 프로젝트 내용을 채워 넣어 보세요.</p>
        `;
        updateLanguage(currentLang);
    }

    // 11. 렌더링 함수 - 아이돌 목록
    function renderIdolList() {
        if (!contentArea) return;
        contentArea.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'idol-grid';

        idolList.forEach(name => {
            const item = document.createElement('div');
            item.className = 'idol-item';
            
            const img = document.createElement('img');
            img.src = `icons/idolicons/${name}.png`;
            img.className = 'idol-icon';
            img.alt = name;

            img.addEventListener('click', () => setBackground(name));
            
            item.appendChild(img);
            grid.appendChild(item);
        });

        contentArea.appendChild(grid);
    }
});