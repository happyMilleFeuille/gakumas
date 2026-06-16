import { state } from './state.js';
import translations from './i18n.js';
import { produceList } from './producedata.js';

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (useJaNames() && card.name_ja) return card.name_ja;
    return card.name || '';
};

const replaceDescIcons = (text) => {
    if (!text) return '';
    
    let result = text;
    
    // --- 1. Normalization Phase (Run first to shield terms from keyword matches) ---
    result = result.replace(/(원기|元気)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `genki${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/(의욕|やる気)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `motivation${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/(호조|好調)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `goodcondition${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/호조\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?\s*턴/gi, (match, spanOpen, num, spanClose) => `goodcondition${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/好調\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?\s*ターン/gi, (match, spanOpen, num, spanClose) => `goodcondition${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/(집중|集中)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `concentration${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/(전력|全力)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `fullpower${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/(호인상|好印象)\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, term, spanOpen, num, spanClose) => `goodimpression${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/스킬카드\s*사용\s*수\s*추가\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => `use${spanOpen || ''}${num}${spanClose || ''}`);
    result = result.replace(/スキルカード使用数追加\s*\+\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => `use${spanOpen || ''}${num}${spanClose || ''}`);
    
    // 1. 체력 소비 / 体力消費
    result = result.replace(/(체력\s*소비|소비\s*체력|体力\s*消費|消費\s*体力)/g, (match) => {
        return `<img src="icons/hpreduce.webp" alt="HP Reduce" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 2. 호조 / 好調 (절호조 / 絶好調 제외)
    result = result.replace(/(절호조|호조)/g, (match) => {
        if (match === '절호조') return match;
        return `<img src="icons/goodcondition.webp" alt="Good Condition" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    result = result.replace(/(絶好調|好調)/g, (match) => {
        if (match === '絶好調') return match;
        return `<img src="icons/goodcondition.webp" alt="Good Condition" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 3. 의욕 / やる気
    result = result.replace(/(의욕|やる気)/g, (match) => {
        return `<img src="icons/motivation.webp" alt="Motivation" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 4. 전력 / 全力
    result = result.replace(/(전력|全力)/g, (match) => {
        return `<img src="icons/fullpower.webp" alt="Full Power" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 5. 강기 / 強気
    result = result.replace(/(강기|強気)/g, (match) => {
        return `<img src="icons/enthusiasm.webp" alt="Enthusiasm" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 6. 온존 / 温存
    result = result.replace(/(온존|温存)/g, (match) => {
        return `<img src="icons/preservation.webp" alt="Preservation" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 7. 호인상 / 好印象
    result = result.replace(/(호인상|好印象)/g, (match) => {
        return `<img src="icons/goodimpression.webp" alt="Good Impression" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 8. 집중 / 集中
    result = result.replace(/(집중|集中)/g, (match) => {
        return `<img src="icons/concentration.webp" alt="Concentration" class="pssr-info-modal-desc-inline-icon">${match}`;
    });
    
    // 9. 시작 카드 / 레슨 개시 시 손패로 이동 / レッスン開始時手札に入る -> Map to startingcard first for dynamic localization
    result = result.replace(/(레슨\s*개시\s*시\s*손패로\s*이동|レッスン開始時手札に入る)/gi, 'startingcard');
    
    // 10. 중복불가 / 重複不可 -> Map to nooverlab first for dynamic localization
    result = result.replace(/(중복\s*불가|重複\s*不可)/gi, 'nooverlab');
    
    // 11. 레슨 중 1회 / レッスン中1回 -> Map to limit1 first for dynamic localization
    result = result.replace(/(레슨\s*중\s*1회|レッスン\s*中\s*1\s*回)/gi, 'limit1');
    
    // 12. (레슨 내 [num]회) / （レッスン内[num]回） -> Map to inlesson[num] first for dynamic localization
    result = result.replace(/[（\(]레슨\s*내\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?\s*회[\)）]/gi, (match, spanOpen, num, spanClose) => {
        return `inlesson${spanOpen || ''}${num}${spanClose || ''}`;
    });
    result = result.replace(/[（\(]レッスン\s*内\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?\s*回[\)）]/gi, (match, spanOpen, num, spanClose) => {
        return `inlesson${spanOpen || ''}${num}${spanClose || ''}`;
    });
    
    // 13. 스킬카드를 [num]장 드로우 / スキルカードを[num]枚引く -> Map to draw[num] first for dynamic localization
    result = result.replace(/스킬카드를\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?장\s*드로우/gi, (match, spanOpen, num, spanClose) => {
        return `draw${spanOpen || ''}${num}${spanClose || ''}`;
    });
    result = result.replace(/스킬카드를\s*드로우/gi, 'draw1');
    result = result.replace(/スキルカードを\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?枚\s*引く/gi, (match, spanOpen, num, spanClose) => {
        return `draw${spanOpen || ''}${num}${spanClose || ''}`;
    });
    result = result.replace(/スキルカードを\s*引く/gi, 'draw1');
    
    // --- 2. Codified Tag Replacements (Run last to avoid double-matching) ---
    // hpreduce[num] (optional span tags wrapping the number are preserved)
    result = result.replace(/hpreduce\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `체력소비 ${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `体力消費 ${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `HP Reduce ${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/hpreduce.webp" alt="HP Reduce" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // conreduce[num] / conconsume[num] (optional span tags wrapping the number are preserved)
    result = result.replace(/(conreduce|conconsume)\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, prefix, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `집중소비 ${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `集中消費 ${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Concentration Consume ${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/concentration.webp" alt="Concentration" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // startingcard
    result = result.replace(/startingcard/gi, (match) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = '레슨 개시 시 손패로 이동';
        } else if (state.currentLang === 'ja') {
            label = 'レッスン開始時手札に入る';
        } else {
            label = 'Enters hand at start of lesson';
        }
        return label;
    });

    // nooverlab (nooverlap)
    result = result.replace(/(nooverlab|nooverlap)/gi, (match) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = '중복불가';
        } else if (state.currentLang === 'ja') {
            label = '重複不可';
        } else {
            label = 'Unique';
        }
        return label;
    });

    // limit1
    result = result.replace(/limit1/gi, (match) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = '레슨 중 1회';
        } else if (state.currentLang === 'ja') {
            label = 'レッスン中1回';
        } else {
            label = 'Once per lesson';
        }
        return label;
    });

    // inlesson[num] (optional span tags wrapping the number are preserved)
    result = result.replace(/inlesson\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        if (state.currentLang === 'ko') {
            return `(레슨 내 ${spanOpen || ''}${num}${spanClose || ''}회)`;
        } else if (state.currentLang === 'ja') {
            return `（レッスン内${spanOpen || ''}${num}${spanClose || ''}回）`;
        } else {
            return `(${spanOpen || ''}${num}${spanClose || ''} times per lesson)`;
        }
    });

    // draw[num] (optional span tags wrapping the number are preserved)
    result = result.replace(/draw\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        const count = parseInt(num, 10);
        if (state.currentLang === 'ko') {
            return `스킬카드를 ${spanOpen || ''}${num}${spanClose || ''}장 드로우`;
        } else if (state.currentLang === 'ja') {
            return `スキルカードを${spanOpen || ''}${num}${spanClose || ''}枚引く`;
        } else {
            return `Draw ${spanOpen || ''}${num}${spanClose || ''} skill card${count > 1 ? 's' : ''}`;
        }
    });

    // genki[num]
    result = result.replace(/genki\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `원기+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `元気+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Genki +${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/genki.webp" alt="Genki" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // motivation[num]
    result = result.replace(/motivation\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `의욕+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `やる気+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Motivation +${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/motivation.webp" alt="Motivation" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // goodcondition[num]
    result = result.replace(/goodcondition\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `호조 ${spanOpen || ''}${num}${spanClose || ''}턴`;
        } else if (state.currentLang === 'ja') {
            label = `好調${spanOpen || ''}${num}${spanClose || ''}ターン`;
        } else {
            label = `Good Condition for ${spanOpen || ''}${num}${spanClose || ''} turn(s)`;
        }
        return `<img src="icons/goodcondition.webp" alt="Good Condition" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // concentration[num]
    result = result.replace(/concentration\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `집중+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `集中+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Concentration +${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/concentration.webp" alt="Concentration" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // fullpower[num]
    result = result.replace(/fullpower\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `전력+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `全力+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Full Power +${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/fullpower.webp" alt="Full Power" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // goodimpression[num]
    result = result.replace(/goodimpression\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        let label = '';
        if (state.currentLang === 'ko') {
            label = `호인상+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            label = `好印象+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            label = `Good Impression +${spanOpen || ''}${num}${spanClose || ''}`;
        }
        return `<img src="icons/goodimpression.webp" alt="Good Impression" class="pssr-info-modal-desc-inline-icon">${label}`;
    });

    // use[num] (optional span tags wrapping the number are preserved)
    result = result.replace(/use\s*(<span class="pssr-info-modal-diff-added">)?(\d+)(<\/span>)?/gi, (match, spanOpen, num, spanClose) => {
        if (state.currentLang === 'ko') {
            return `스킬카드 사용 수 추가+${spanOpen || ''}${num}${spanClose || ''}`;
        } else if (state.currentLang === 'ja') {
            return `スキルカード使用数追加+${spanOpen || ''}${num}${spanClose || ''}`;
        } else {
            return `Additional skill card plays +${spanOpen || ''}${num}${spanClose || ''}`;
        }
    });
    
    return result;
};

const formatDescLines = (descHtml, personalColor) => {
    if (!descHtml) return '';
    const lines = descHtml.split(/<br\s*\/?>/gi);
    return lines.map(line => {
        const hasDiff = line.includes('pssr-info-modal-diff-added');
        if (hasDiff) {
            return `<div class="pssr-info-modal-diff-line-changed" style="background-color: ${personalColor}33;">${line}</div>`;
        }
        return `<div class="pssr-info-modal-diff-line">${line}</div>`;
    }).join('');
};

const getLocalizedItem = (item) => {
    if (!item) return null;
    if (Array.isArray(item)) {
        return {
            name: item[0] || '',
            desc: item[1] || ''
        };
    }
    let name = '';
    let desc = '';
    if (state.currentLang === 'en') {
        name = item.name_en || item.name_ja || item.name || '';
        desc = (item.desc_en || item.desc_ja || item.desc || '').replace(/\n/g, '<br>');
    } else if (useJaNames()) {
        name = item.name_ja || item.name || '';
        desc = (item.desc_ja || item.desc || '').replace(/\n/g, '<br>');
    } else {
        name = item.name || '';
        desc = (item.desc || '').replace(/\n/g, '<br>');
    }
    return { name, desc };
};

const getBadgeText = (isPlus) => {
    if (isPlus) {
        if (state.currentLang === 'en') return 'Plus';
        if (state.currentLang === 'ja') return 'プラス';
        return '플러스';
    } else {
        if (state.currentLang === 'en') return 'Normal';
        if (state.currentLang === 'ja') return '通常';
        return '일반';
    }
};

const getDefaultItemName = (isPlus) => {
    if (isPlus) {
        if (state.currentLang === 'en') return 'Unique P-Item+';
        if (state.currentLang === 'ja') return '固有Pアイテム+';
        return '고유 P-아이템+';
    } else {
        if (state.currentLang === 'en') return 'Unique P-Item';
        if (state.currentLang === 'ja') return '固有Pアイテム';
        return '고유 P-아이템';
    }
};

const getDefaultDescText = () => {
    if (state.currentLang === 'en') return 'Detailed info will be added later.';
    if (state.currentLang === 'ja') return '詳細情報は後日追加予定です。';
    return '상세 정보는 추후 추가될 예정입니다.';
};

const getRarityIcon = (rarity) => {
    if (!rarity) return '';
    const r = rarity.toLowerCase();
    if (r === 'pssr' || r === 'ssr') return 'icons/ssr.png';
    if (r === 'psr' || r === 'sr') return 'icons/sr.png';
    if (r === 'pr' || r === 'r') return 'icons/r.png';
    return '';
};

const getPlanIcon = (plan) => {
    if (!plan) return '';
    const p = plan.toLowerCase();
    if (p === 'sense' || p === 'logic' || p === 'anomaly') {
        return `icons/${p}.webp`;
    }
    return '';
};

const getOsusumeIcon = (osusume) => {
    if (!osusume) return '';
    const o = osusume.toLowerCase();
    const list = ['concentration', 'goodcondition', 'goodimpression', 'motivation', 'fullpower', 'preservation', 'enthusiasm'];
    if (list.includes(o)) {
        return `icons/${o}.webp`;
    }
    return '';
};

const getLocalizedSource = (source) => {
    const s = source || 'normal';
    const sourceKeyMap = {
        limited: 'filter_limited',
        limited_f: 'filter_limited_f',
        limited_u: 'filter_limited_u',
        dist: 'filter_dist'
    };
    const sourceKey = sourceKeyMap[s] || 'filter_normal';
    return translations[state.currentLang]?.[sourceKey] || translations.ko[sourceKey] || '';
};

const getDDayText = (dateStr) => {
    if (!dateStr) return '';
    try {
        const cardDate = new Date(dateStr.replace(/-/g, '/'));
        cardDate.setHours(0, 0, 0, 0);
        
        const jstString = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
        const today = new Date(jstString);
        today.setHours(0, 0, 0, 0);
        
        const diffMs = today.getTime() - cardDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return ' (D-Day)';
        } else if (diffDays > 0) {
            return ` (D+${diffDays})`;
        } else {
            return ` (D${diffDays})`;
        }
    } catch (e) {
        console.error('Error calculating D-Day:', e);
        return '';
    }
};

const getRelativeDDayText = (targetDateStr, baseDateStr) => {
    if (!targetDateStr || !baseDateStr) return '';
    try {
        const targetDate = new Date(targetDateStr.replace(/-/g, '/'));
        targetDate.setHours(0, 0, 0, 0);
        
        const baseDate = new Date(baseDateStr.replace(/-/g, '/'));
        baseDate.setHours(0, 0, 0, 0);
        
        const diffMs = targetDate.getTime() - baseDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'D-Day';
        } else if (diffDays > 0) {
            return `D+${diffDays}`;
        } else {
            return `D${diffDays}`;
        }
    } catch (e) {
        console.error('Error calculating relative D-Day:', e);
        return '';
    }
};

const tokenize = (str) => {
    const regex = /[a-zA-Z가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]+|[0-9]+|[^a-zA-Z가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF0-9\s]|\s+/g;
    return str.match(regex) || [];
};

const diffStrings = (str1, str2) => {
    if (str1 === str2) return str2;
    try {
        const tokens1 = tokenize(str1);
        const tokens2 = tokenize(str2);
        
        const dp = Array(tokens1.length + 1).fill(0).map(() => Array(tokens2.length + 1).fill(0));
        for (let i = 1; i <= tokens1.length; i++) {
            for (let j = 1; j <= tokens2.length; j++) {
                if (tokens1[i - 1] === tokens2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        
        let i = tokens1.length;
        let j = tokens2.length;
        const result = [];
        
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
                result.unshift({ type: 'equal', val: tokens1[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                result.unshift({ type: 'insert', val: tokens2[j - 1] });
                j--;
            } else {
                i--;
            }
        }
        
        let html = '';
        let currentSpan = '';
        for (const token of result) {
            if (token.type === 'insert') {
                currentSpan += token.val;
            } else {
                if (currentSpan) {
                    html += `<span class="pssr-info-modal-diff-added">${currentSpan}</span>`;
                    currentSpan = '';
                }
                html += token.val;
            }
        }
        if (currentSpan) {
            html += `<span class="pssr-info-modal-diff-added">${currentSpan}</span>`;
        }
        return html;
    } catch (e) {
        console.error('Error diffing strings:', e);
        return str2;
    }
};

const getPlanIconPath = (card) => {
    const plan = (card.plan || '').toLowerCase();
    if (!['sense', 'logic', 'anomaly'].includes(plan)) return { icon0: null, icon3: null, second0: null, second3: null };
    const baseId = card.id.replace(/\d*$/, '').replace(/another$/, '');
    return {
        icon0: `idols/${plan}/${baseId}0.webp`,
        icon3: `idols/${plan}/${baseId}.webp`,
        second0: `idols/${plan}/${baseId}second0.webp`,
        second3: `idols/${plan}/${baseId}second.webp`
    };
};

export function showProduceCardInfoModal(card, personalColor) {
    const existing = document.getElementById('pssr-info-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'pssr-info-modal';
    modal.className = 'pssr-info-modal-overlay';
    
    const isMobile = window.innerWidth <= 768;
    const img1 = isMobile ? `idols/${card.id}1.webp` : `idols/thumb/${card.id}1.webp`;
    const img2 = isMobile ? `idols/${card.id}2.webp` : `idols/thumb/${card.id}2.webp`;
    const localizedName = getLocalizedCardName(card);
    
    const itemData = getLocalizedItem(card.item);
    const itemPlusData = getLocalizedItem(card.itemplus);
    
    const name1 = itemData ? itemData.name : getDefaultItemName(false);
    const rawDesc1 = itemData ? itemData.desc : getDefaultDescText();
    const desc1 = formatDescLines(replaceDescIcons(rawDesc1), personalColor);
    
    const name2 = itemPlusData ? itemPlusData.name : (itemData ? itemData.name + '+' : getDefaultItemName(true));
    const desc2Raw = itemPlusData ? itemPlusData.desc : (itemData ? itemData.desc : getDefaultDescText());
    const desc2 = formatDescLines(replaceDescIcons(diffStrings(rawDesc1, desc2Raw)), personalColor);
    
    const planIcons = getPlanIconPath(card);
    
    // 같은 아이돌의 직전/직후 PSSR 찾기
    const idolMatch = card.id.match(/^ssr([a-z]+)_/);
    const idolName = idolMatch ? idolMatch[1] : '';
    let prevCard = null;
    let nextCard = null;
    let prevCardOsusume = null;
    let nextCardOsusume = null;

    if (idolName && card.releasedAt && card.rarity === 'PSSR') {
        const sameIdolPSSRs = produceList.filter(p =>
            p.rarity === 'PSSR' &&
            p.releasedAt &&
            p.id.startsWith(`ssr${idolName}_`) &&
            p.id !== card.id &&
            p.another !== true
        );
        // 직전: releasedAt < current, 가장 최근
        const prevList = sameIdolPSSRs.filter(p => p.releasedAt < card.releasedAt)
            .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
        if (prevList.length > 0) prevCard = prevList[0];
        // 직후: releasedAt > current, 가장 이른
        const nextList = sameIdolPSSRs.filter(p => p.releasedAt > card.releasedAt)
            .sort((a, b) => a.releasedAt.localeCompare(b.releasedAt));
        if (nextList.length > 0) nextCard = nextList[0];

        // 직전/직후 동일 오스스메 찾기
        if (card.osusume) {
            const sameOsusumePSSRs = sameIdolPSSRs.filter(p => p.osusume === card.osusume);
            const prevOsuList = sameOsusumePSSRs.filter(p => p.releasedAt < card.releasedAt)
                .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
            if (prevOsuList.length > 0) prevCardOsusume = prevOsuList[0];
            const nextOsuList = sameOsusumePSSRs.filter(p => p.releasedAt > card.releasedAt)
                .sort((a, b) => a.releasedAt.localeCompare(b.releasedAt));
            if (nextOsuList.length > 0) nextCardOsusume = nextOsuList[0];
        }
    }

    // 날짜+D-Day 칸 (직전 + 현재 + 직후)
    const makeDateBox = (c, extraClass = '', dDayText = '', badgeType = 'osusume') => {
        if (!c) return '<div class="pssr-info-modal-date-row pssr-info-modal-date-row-empty"></div>';
        const name = getLocalizedCardName(c);
        
        let badge = '';
        if (badgeType === 'plan') {
            const planIcon = getPlanIcon(c.plan);
            badge = planIcon ? `<img src="${planIcon}" alt="${c.plan}" class="pssr-info-modal-date-osusume">` : '';
        } else {
            const osuIcon = getOsusumeIcon(c.osusume);
            badge = osuIcon ? `<img src="${osuIcon}" alt="${c.osusume}" class="pssr-info-modal-date-osusume">` : '';
        }
        
        const dDayBadge = dDayText ? `<span class="pssr-info-modal-date-dday-badge" style="background-color: ${personalColor};">${dDayText.trim()}</span>` : '';
        const thumbBg = `background-image: url('idols/thumb/${c.id}1.webp');`;
        const isLongName = name.length >= 15;
        return `<div class="pssr-info-modal-date-row${extraClass ? ' ' + extraClass : ''}" style="${thumbBg}">${badge}${dDayBadge}<span class="pssr-info-modal-card-name${isLongName ? ' pssr-info-modal-card-name-long' : ''}">${name}</span><span class="pssr-info-modal-meta-text">${c.releasedAt}</span></div>`;
    };

    let finalDateHtml = '';
    if (card.releasedAt && card.rarity === 'PSSR') {
        const arrow = '<span class="pssr-info-modal-date-arrow">→</span>';
        
        // 1. 전체 출시 순서 (플랜 뱃지 표시)
        const currentBoxPlan = makeDateBox(card, '', '', 'plan');
        const prevDDay = prevCard ? getRelativeDDayText(prevCard.releasedAt, card.releasedAt) : '';
        const nextDDay = nextCard ? getRelativeDDayText(nextCard.releasedAt, card.releasedAt) : '';
        const prevBox = prevCard ? makeDateBox(prevCard, 'pssr-info-modal-date-row-prev', prevDDay, 'plan') : makeDateBox(null);
        const nextBox = nextCard ? makeDateBox(nextCard, 'pssr-info-modal-date-row-next', nextDDay, 'plan') : makeDateBox(null);
        const prevArrow = prevCard ? arrow : '<span class="pssr-info-modal-date-arrow" style="visibility:hidden">→</span>';
        const nextArrow = nextCard ? arrow : '<span class="pssr-info-modal-date-arrow" style="visibility:hidden">→</span>';
        const dateHtml = `<div class="pssr-info-modal-date-wrapper">${prevBox}${prevArrow}${currentBoxPlan}${nextArrow}${nextBox}</div>`;

        // 2. 동일 오스스메 출시 순서 (오스스메 뱃지 표시)
        const currentBoxOsu = makeDateBox(card, '', '', 'osusume');
        const prevOsuDDay = prevCardOsusume ? getRelativeDDayText(prevCardOsusume.releasedAt, card.releasedAt) : '';
        const nextOsuDDay = nextCardOsusume ? getRelativeDDayText(nextCardOsusume.releasedAt, card.releasedAt) : '';
        const prevOsuBox = prevCardOsusume ? makeDateBox(prevCardOsusume, 'pssr-info-modal-date-row-prev', prevOsuDDay, 'osusume') : makeDateBox(null);
        const nextOsuBox = nextCardOsusume ? makeDateBox(nextCardOsusume, 'pssr-info-modal-date-row-next', nextOsuDDay, 'osusume') : makeDateBox(null);
        const prevOsuArrow = prevCardOsusume ? arrow : '<span class="pssr-info-modal-date-arrow" style="visibility:hidden">→</span>';
        const nextOsuArrow = nextCardOsusume ? arrow : '<span class="pssr-info-modal-date-arrow" style="visibility:hidden">→</span>';
        const dateHtmlOsusume = `<div class="pssr-info-modal-date-wrapper">${prevOsuBox}${prevOsuArrow}${currentBoxOsu}${nextOsuArrow}${nextOsuBox}</div>`;

        finalDateHtml = `
            ${dateHtml}
            <div class="pssr-info-modal-date-container-osusume">
                ${dateHtmlOsusume}
            </div>
        `;
    }

    const metaItems = [];
    if (idolName) {
        metaItems.push(`<img src="icons/idolicons/${idolName}_c.png" alt="${idolName}" class="pssr-info-modal-meta-idol-icon" onerror="this.src='icons/idol.png'">`);
    }
    const rarityImg = getRarityIcon(card.rarity);
    if (rarityImg) {
        metaItems.push(`<img src="${rarityImg}" alt="${card.rarity}" class="pssr-info-modal-meta-icon">`);
    }
    const planImg = getPlanIcon(card.plan);
    if (planImg) {
        metaItems.push(`<img src="${planImg}" alt="${card.plan}" class="pssr-info-modal-meta-icon">`);
    }
    const osusumeImg = getOsusumeIcon(card.osusume);
    if (osusumeImg) {
        metaItems.push(`<img src="${osusumeImg}" alt="${card.osusume}" class="pssr-info-modal-meta-icon">`);
    }
    const localizedSource = getLocalizedSource(card.source);
    if (localizedSource) {
        metaItems.push(`<span class="pssr-info-modal-meta-source">${localizedSource}</span>`);
    }
    if (card.releasedAt) {
        const dDay = getDDayText(card.releasedAt);
        metaItems.push(`<span class="pssr-info-modal-meta-text">${card.releasedAt}${dDay}</span>`);
    }
    
    const metaHtml = metaItems.length > 0 
        ? `<div class="pssr-info-modal-meta-row">${metaItems.join(' <span class="pssr-info-modal-meta-divider"></span> ')}</div>`
        : '';
    const metaDividerHtml = (metaHtml && finalDateHtml)
        ? `<div class="pssr-info-modal-meta-divider-line"></div>`
        : '';
    const cardData = getLocalizedItem(card.card);
    const cardPlusData = getLocalizedItem(card.cardplus);
    
    const cardName1 = cardData ? cardData.name : '';
    const rawCardDesc1 = cardData ? cardData.desc : '';
    const cardDesc1 = formatDescLines(replaceDescIcons(rawCardDesc1), personalColor);
    const cardName2 = (cardPlusData ? cardPlusData.name : '') || (cardName1 ? cardName1 + '+' : '');
    const cardDesc2Raw = cardPlusData ? cardPlusData.desc : (cardData ? cardData.desc : '');
    const cardDesc2 = formatDescLines(replaceDescIcons(diffStrings(rawCardDesc1, cardDesc2Raw)), personalColor);

    const card2Data = getLocalizedItem(card.cardsecond);
    const card2PlusData = getLocalizedItem(card.cardsecondplus);
    const card2Name1 = card2Data ? card2Data.name : '';
    const rawCard2Desc1 = card2Data ? card2Data.desc : '';
    const card2Desc1 = formatDescLines(replaceDescIcons(rawCard2Desc1), personalColor);
    const card2Name2 = (card2PlusData ? card2PlusData.name : '') || (card2Name1 ? card2Name1 + '+' : '');
    const card2Desc2Raw = card2PlusData ? card2PlusData.desc : (card2Data ? card2Data.desc : '');
    const card2Desc2 = formatDescLines(replaceDescIcons(diffStrings(rawCard2Desc1, card2Desc2Raw)), personalColor);

    const trainBlockHtml = (planIcons.icon0 && planIcons.icon3 && cardData) ? `
                    <div class="pssr-info-modal-item-details pssr-info-modal-train-block">
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/train.webp" alt="Train" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}1a; border-color: ${personalColor}33;">
                            <img src="${planIcons.icon0}" alt="Plan Item 0" class="pssr-info-modal-item-icon" onerror="this.closest('.pssr-info-modal-train-block').style.display='none';">
                            <div class="pssr-info-modal-detail-content">
                                ${cardName1 ? `<div class="pssr-info-modal-detail-name">${cardName1}</div>` : ''}
                                <div class="pssr-info-modal-detail-desc">${cardDesc1}</div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/train.webp" alt="Train" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">3</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}1a; border-color: ${personalColor}33;">
                            <img src="${planIcons.icon3}" alt="Plan Item 3" class="pssr-info-modal-item-icon" onerror="this.closest('.pssr-info-modal-train-block').style.display='none';">
                            <div class="pssr-info-modal-detail-content">
                                ${cardName2 ? `<div class="pssr-info-modal-detail-name">${cardName2}</div>` : ''}
                                <div class="pssr-info-modal-detail-desc">${cardDesc2}</div>
                            </div>
                        </div>
                    </div>` : '';

    const train6BlockHtml = (planIcons.second0 && planIcons.second3 && card2Data) ? `
                    <div class="pssr-info-modal-item-details pssr-info-modal-train6-block">
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/train.webp" alt="Train" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}1a; border-color: ${personalColor}33;">
                            <img src="${planIcons.second0}" alt="Second Item 0" class="pssr-info-modal-item-icon" onerror="this.closest('.pssr-info-modal-train6-block').style.display='none';">
                            <div class="pssr-info-modal-detail-content">
                                ${card2Name1 ? `<div class="pssr-info-modal-detail-name">${card2Name1}</div>` : ''}
                                <div class="pssr-info-modal-detail-desc">${card2Desc1}</div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/train.webp" alt="Train" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">6</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}1a; border-color: ${personalColor}33;">
                            <img src="${planIcons.second3}" alt="Second Item 6" class="pssr-info-modal-item-icon" onerror="this.closest('.pssr-info-modal-train6-block').style.display='none';">
                            <div class="pssr-info-modal-detail-content">
                                ${card2Name2 ? `<div class="pssr-info-modal-detail-name">${card2Name2}</div>` : ''}
                                <div class="pssr-info-modal-detail-desc">${card2Desc2}</div>
                            </div>
                        </div>
                    </div>` : '';
        
    modal.innerHTML = `
        <div class="pssr-info-modal-content" style="border-color: ${personalColor}; --personal-color: ${personalColor};">
            <h2 class="pssr-info-modal-title-overlay">${localizedName}</h2>
            <div class="pssr-info-modal-scroll-wrapper">
                <div class="pssr-info-modal-images">
                    <div class="pssr-info-modal-img-box">
                        <img src="${img1}" alt="Image 1" class="pssr-info-modal-img">
                    </div>
                    <div class="pssr-info-modal-img-box">
                        <img src="${img2}" alt="Image 2" class="pssr-info-modal-img">
                    </div>
                </div>
                ${metaHtml}
                ${metaDividerHtml}
                ${finalDateHtml}
                <div class="pssr-info-modal-body">
                    <div class="pssr-info-modal-item-details">
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/sainou.webp" alt="Talent" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}33; border-color: ${personalColor}66;">
                            <img src="idols/item/${card.id}.webp" alt="Item Icon" class="pssr-info-modal-item-icon" onerror="this.closest('.pssr-info-modal-item-details').style.display='none';">
                            <div class="pssr-info-modal-detail-content">
                                <div class="pssr-info-modal-detail-name">${name1}</div>
                                <div class="pssr-info-modal-detail-desc">${desc1}</div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-condition-row">
                            <div class="pssr-info-modal-sainou-box">
                                <div class="pssr-info-modal-sainou-wrapper" style="border-color: ${personalColor}33;">
                                    <img src="icons/sainou.webp" alt="Talent" class="pssr-info-modal-sainou-icon">
                                    <span class="pssr-info-modal-sainou-text">2</span>
                                </div>
                            </div>
                        </div>
                        <div class="pssr-info-modal-detail-row" style="background-color: ${personalColor}33; border-color: ${personalColor}66;">
                            <div class="pssr-info-modal-item-plus-wrapper">
                                <img src="idols/item/${card.id}.webp" alt="Item Icon +" class="pssr-info-modal-item-icon">
                                <img src="icons/itemplus.webp" alt="Plus" class="pssr-info-modal-item-plus-badge">
                            </div>
                            <div class="pssr-info-modal-detail-content">
                                <div class="pssr-info-modal-detail-name">${name2}</div>
                                <div class="pssr-info-modal-detail-desc">${desc2}</div>
                            </div>
                        </div>
                    </div>
                    ${trainBlockHtml}
                    ${train6BlockHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 이미지 잔상 방지 처리 (로드 완료 시 노출)
    const modalImgs = modal.querySelectorAll('.pssr-info-modal-img');
    modalImgs.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            img.addEventListener('error', () => {
                img.classList.add('loaded');
            });
        }
    });
    
    window.closeProduceCardInfoModal = () => {
        modal.remove();
    };
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            history.back();
        }
    });
    
    history.pushState({ modalOpen: 'pssr-info' }, "");
}
window.showProduceCardInfoModal = showProduceCardInfoModal;
