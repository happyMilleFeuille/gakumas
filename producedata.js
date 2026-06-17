// producedata.js
export const produceList = [
    // --- 리나미 SSR (PSSR) ---
    { id: "ssrrinami_1st", name: "clumsy trick", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 10.3, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/ND5MsmApfTE?si=GLya6fTOH15jVFMq" },
    { id: "ssrrinami_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "sense", releasedAt: "2024-08-01", source: "limited", another: true, jumpTime2: 6.2 },
    { id: "ssrrinami_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "sense", releasedAt: "2024-09-30", source: "limited", another: true },
    { id: "ssrrinami_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-11-28", another: true, jumpTime2: 8.1 },
    { id: "ssrrinami_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-02-28", plan: "sense", jumpTime2: 6.3, source: "limited", another: true },
    { id: "ssrrinami_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-11", jumpTime2: 7.1, plan: "sense", source: "limited", another: true },
    { id: "ssrrinami_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "sense", jumpTime2: 7.1, source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrrinami_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrrinami_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", releasedAt: "2025-09-29", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrrinami_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 7.2, releasedAt: "2026-02-27", another: true },
    {
        id: "ssrrinami_2nd", name: "L.U.V", osusume: "goodimpression", rarity: "PSSR", plan: "logic", releasedAt: "2024-10-18", source: "normal", jumpTime2: 11.4,
        item: {
            desc: "체력 회복 효과의 스킬카드 사용 후\n✦ 원기의 50%만큼 호인상을 증가시키고 원기를 전부 소모\n✦ 호인상의 200%만큼 파라미터 상승\n✦ hpreduce5\n✦ inlesson1",
            desc_ja: "体力回復効果のスキルカード使用後、\n✦ 元気の50%分好印象増加させ、元気を0にする\n✦ 好印象の200%分パラメータ上昇\n✦ hpreduce5\n✦ inlesson1",
        },
        itemplus: {
            desc: "체력 회복 효과의 스킬카드 사용 후\n✦ 원기의 70%만큼 호인상을 증가시키고 원기를 전부 소모\n✦ 호인상의 200%만큼 파라미터 상승\n✦ hpreduce5\n✦ inlesson1",
            desc_ja: "体力回復効果のスキルカード使用後、\n✦ 元気の70%分好印象増加させ、元気を0にする\n✦ 好印象の200%分パラメータ上昇\n✦ hpreduce5\n✦ inlesson1",
        },
        card: {
            name: "また、明日",
            desc: "호인상이 1이상일 경우 사용 가능\n✦ 최대체력의 10%만큼 체력 회복\n✦ goodimpression3 \n✦ genki5\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "好印象が1以上の場合、使用可\n✦ 最大体力の10%分体力回復\n✦ goodimpression3 \n✦ genki5\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "호인상이 1이상일 경우 사용 가능\n✦ 최대체력의 10%만큼 체력 회복\n✦ goodimpression5 \n✦ genki10\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "好印象が1以上の場合、使用可\n✦ 最大体力の10%分体力回復\n✦ goodimpression5 \n✦ genki10\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrrinami_3rd", name: "36℃ U.B.U", osusume: "goodimpression", rarity: "PSSR", plan: "logic", releasedAt: "2025-09-17", source: "normal", jumpTime2: 8.7, youtube_url: "https://youtu.be/szxn42peP3M?si=0Fa3iBImUAHj4Rsm",
        item: {
            desc: "어느 한 쪽의 지침인 경우 강기 스킬카드 사용 후 3회마다 \n✦ 여유로 지침 변경\n✦ 열의 증가+40% (1턴)\n✦ genki3\n✦ inlesson3",
            desc_ja: "いずれかの指針の場合、強気効果のスキルカード使用後3回ごとに、\n✦ のんびりに変更\n✦ 熱意増加+40%（1ターン）\n✦ genki3\n✦ inlesson5",
        },
        itemplus: {
            desc: "어느 한 쪽의 지침인 경우 강기 스킬카드 사용 후 3회마다 \n✦ 여유로 지침 변경\n✦ 열의 증가+40% (1턴)\n✦ genki3",
            desc_ja: "いずれかの指針の場合、強気効果のスキルカード使用後3回ごとに、\n✦ のんびりに変更\n✦ 熱意増加+40%（1ターン）\n✦ genki3",
        },
        card: {
            name: "微熱ノスタルジー",
            desc: "hpreduce7\n호인상이 10이상일 경우 사용 가능\n✦ genki2\n✦ motivation2\n✦ 덱 혹은 버림패에 있는 카드 1장 당 goodimpression2\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce7\n好印象が10以上の場合、使用可\n✦ genki2\n✦ motivation2\n✦ 山札か捨札にあるスキルカード1枚につき、goodimpression2\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce5\n호인상이 10이상일 경우 사용 가능\n✦ genki6\n✦ motivation4\n✦ 덱 혹은 버림패에 있는 카드 1장 당 goodimpression2\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce5\n好印象が10以上の場合、使用可\n✦ genki6\n✦ motivation4\n✦ 山札か捨札にあるスキルカード1枚につき、goodimpression2\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        primacard: {
            name: "笑顔を生み出す一番星",
            desc: "startingcard\n✦ goodimpression10\n✦ use1\n✦ 微熱ノスタルジー♡를 덱의 랜덤한 위치에 5장 생성\n✦ 다음 턴, 제외패 이외에 있는 微熱ノスタルジー를 손패로 이동\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ goodimpression10\n✦ use1\n✦ 微熱ノスタルジー♡を山札のランダムな位置に5枚生成\n✦ 次のターン、除外以外にある微熱ノスタルジーを手札に移動\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        tokencard: {
            name: "微熱ノスタルジー♡",
            desc: "✦ goodimpression2\n✦ 호인상 강화+20% (3턴)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression2\n✦ 好印象強化+20%（3ターン）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 사키 SSR (PSSR) ---
    { id: "ssrsaki_1st", name: "Fighting My Way", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 6.2, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/T1GK55fsIhw?si=co4Dg0YTDqRSh5hQ" },
    { id: "ssrsaki_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-07-01", another: true },
    { id: "ssrsaki_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-09-30", another: true },
    { id: "ssrsaki_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-12-09", another: true },
    { id: "ssrsaki_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2025-02-01", another: true, jumpTime2: 7.2 },
    { id: "ssrsaki_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 7.2, releasedAt: "2025-03-10", another: true },
    { id: "ssrsaki_1st9another", name: "Howling over the World", rarity: "PSSR", releasedAt: "2025-05-29", plan: "sense", source: "limited", releasedAt: "2025-05-29", another: true },
    { id: "ssrsaki_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2025-08-29", another: true },
    { id: "ssrsaki_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 9.3, releasedAt: "2026-02-27", another: true },
    {
        id: "ssrsaki_2nd", name: "Boom Boom Pow", osusume: "goodimpression", rarity: "PSSR", releasedAt: "2024-06-19", plan: "logic", source: "normal", jumpTime2: 9.3,
        item: {
            desc: "직접효과로 체력이 감소했을 경우\n✦ goodimpression2\n✦ inlesson4",
            desc_ja: "直接効果で体力が減少した時、\n✦ goodimpression2\n✦ inlesson4",
        },
        itemplus: {
            desc: "직접효과로 체력이 감소했을 경우\n✦ goodimpression2",
            desc_ja: "直接効果で体力が減少した時、\n✦ goodimpression2",
        },
        card: {
            name: "POW！",
            desc: "hpreduce5\n✦ 호인상의 250%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce5\n✦ 好印象の250%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "hpreduce3\n✦ 호인상의 260%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ 好印象の260%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsaki_3rd", name: "Wildest Flower", osusume: "goodimpression", rarity: "PSSR", releasedAt: "2026-03-19", plan: "logic", source: "normal", jumpTime2: 7.2, youtube_url: "https://youtu.be/iiiLtE4w2pE?si=1LC4wWMxbAt-huak",
        item: {
            desc: "lessonstart\n✦ 파라미터 상승량 감소(4턴)\n✦ 3턴 후 motivation2・use1\n✦ 6턴 후 goodimpression4\n✦ inlesson1",
            desc_ja: "lessonstart\n✦ パラメータ上昇量減少（4ターン）\n✦ 3ターン後、motivation2・use1\n✦ 6ターン後、goodimpression4\n✦ inlesson1",
        },
        itemplus: {
            desc: "lessonstart\n✦ 파라미터 상승량 감소(4턴)\n✦ 3턴 후 motivation2・use1\n✦ 6턴 후 goodimpression4・use1\n✦ inlesson1",
            desc_ja: "lessonstart\n✦ パラメータ上昇量減少（4ターン）\n✦ 3ターン後、motivation2・use1\n✦ 6ターン後、goodimpression4・use1\n✦ inlesson1",
        },
        card: {
            name: "鮮やかに咲く花",
            desc: "startingcard\n✦ 이후 호인상이 6이상인 경우 호인상 효과의 스킬카드를 3회 사용할 때마다 호인상 추가 발동+1 (3턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 以降、好印象が6以上の場合、好印象効果のスキルカードを3回使用するごとに、好印象追加発動+1（3ターン）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ 이후 호인상이 6이상인 경우 호인상 효과의 스킬카드를 3회 사용할 때마다 호인상 추가 발동+1 (3턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 以降、好印象が6以上の場合、好印象効果のスキルカードを3回使用するごとに、好印象追加発動+1（3ターン）\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },


    // --- 치나 SSR (PSSR) ---
    {
        id: "ssrchina_1st", name: "Wonder scale", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 8.3, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/NkC8ahzYm3k?si=PvNkLoCN_-yhNxPE",
        item: {
            desc: "직접효과로 의욕 증가 후\n✦ motivation3\n✦ inlesson2",
            desc_ja: "直接効果でやる気が増加後、\n✦ motivation3\n✦ inlesson2",
        },
        itemplus: {
            desc: "직접효과로 의욕 증가 후\n✦ motivation3\n✦ inlesson3",
            desc_ja: "直接効果でやる気が増加後、\n✦ motivation3\n✦ inlesson3",
        },
        card: {
            name: "お嬢様の晴れ舞台",
            desc: "hpreduce4\n✦ genki2\n✦ 원기의 100%만큼 파라미터 상승\n✦ motivation2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ genki2\n✦ 元気の100%分パラメータ上昇\n✦ motivation2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce4\n✦ genki5\n✦ 원기의 120%만큼 파라미터 상승\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ genki5\n✦ 元気の120%分パラメータ上昇\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "파라미터+", ja: "元気分パラメータ+" },
                cost: "100",
                desc: {
                    ko: "hpreduce4\n✦ genki5\n✦ 원기의 180%만큼 파라미터 상승\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "hpreduce4\n✦ genki5\n✦ 元気の180%分パラメータ上昇\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
                },
            },
            custom2: {
                name: { ko: "스킬카드 사용 수+", ja: "スキルカード使用数+" },
                cost: "100",
                desc: {
                    ko: "hpreduce4\n✦ genki5\n✦ 원기의 120%만큼 파라미터 상승\n✦ motivation3\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "hpreduce4\n✦ genki5\n✦ 元気の120%分パラメータ上昇\n✦ motivation3\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                }
            }
        },
    },
    { id: "ssrchina_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-07-12", another: true },
    { id: "ssrchina_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", releasedAt: "2024-08-11", plan: "logic", source: "limited", another: true },
    { id: "ssrchina_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "logic", releasedAt: "2024-11-28", source: "limited", another: true, jumpTime2: 8.2 },
    { id: "ssrchina_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", plan: "logic", releasedAt: "2025-02-14", source: "limited", another: true },
    { id: "ssrchina_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-01", plan: "logic", source: "limited", another: true, jumpTime2: 7.1 },
    { id: "ssrchina_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrchina_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "logic", releasedAt: "2025-08-29", source: "limited", another: true },
    { id: "ssrchina_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", releasedAt: "2025-09-29", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrchina_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 7.3, releasedAt: "2026-02-27", another: true },
    { id: "ssrchina_2nd", name: "매일, 발견적 스텝!", name_en: "Every steps are for discovery!", name_ja: "日々、発見的ステップ!", osusume: "goodcondition", rarity: "PSSR", releasedAt: "2024-08-22", plan: "sense", source: "normal", jumpTime2: 9.4 },
    {
        id: "ssrchina_3rd", name: "하늘과 약속", name_en: "A Tiny Brave Promise", osusume: "goodcondition", name_ja: "空と約束", rarity: "PSSR", plan: "sense", releasedAt: "2025-10-21", source: "normal", jumpTime2: 9.0, youtube_url: "https://youtu.be/WxFmsuy4nrM?si=AD1GxXNrDtL2AG29",
        item: {
            desc: "남은 턴이 3턴 이내일 때 턴 개시 시 \n✦ 덱 혹은 버림패에 있는 랜덤한 스킬카드 (SSR)를 손패로 이동\n✦ 호조의 20%만큼 집중 증가\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "残り3ターン以内のターン開始時、\n✦ ランダムな山札か捨札にあるスキルカード（SSR）を手札に移動\n✦ 好調の20%分集中増加\n✦ hpreduce1\n✦ inlesson3",
        },
        itemplus: {
            desc: "남은 턴이 3턴 이내일 때 턴 개시 시 \n✦ 덱 혹은 버림패에 있는 랜덤한 스킬카드 (SSR)를 손패로 이동\n✦ 호조의 30%만큼 집중 증가\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "残り3ターン以内のターン開始時、\n✦ ランダムな山札か捨札にあるスキルカード（SSR）を手札に移動\n✦ 好調の30%分集中増加\n✦ hpreduce1\n✦ inlesson3",
        },
        card: {
            name: "世界一の勇気",
            desc: "✦ 호조의 1100%만큼 파라미터를 상승시킨 후 호조를 전부 소모\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調の1100%分パラメータを上昇させ、好調を0にする\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 호조의 1100%만큼 파라미터를 상승시킨 후 호조를 전부 소모\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調の1100%分パラメータを上昇させ、好調を0にする\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        primacard: {
            name: "皆に愛される一番星",
            desc: "startingcard\n✦ goodcondition4\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ goodcondition4\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 스미카 SSR (PSSR) ---
    { id: "ssrsumika_1st", name: "Tame-Lie-One-Step", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 6.4, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/O0Ylv6GNWMQ?si=0OKoVjMM8dpoSSeN" },
    { id: "ssrsumika_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", releasedAt: "2024-08-01", rarity: "PSSR", plan: "sense", source: "limited", another: true, jumpTime2: 6.3 },
    { id: "ssrsumika_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", releasedAt: "2024-10-08", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrsumika_1st4another", name: "White Night! White Wish!", rarity: "PSSR", releasedAt: "2024-11-28", plan: "sense", source: "limited", another: true },
    { id: "ssrsumika_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", releasedAt: "2025-02-14", plan: "sense", source: "limited", another: true },
    { id: "ssrsumika_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-02-28", plan: "sense", jumpTime2: 7.3, source: "limited", another: true },
    { id: "ssrsumika_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", jumpTime2: 7.1, rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrsumika_1st9another", name: "Howling over the World", rarity: "PSSR", releasedAt: "2025-05-29", plan: "sense", source: "limited", another: true },
    { id: "ssrsumika_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", rarity: "PSSR", releasedAt: "2025-09-29", plan: "sense", source: "limited", another: true },
    { id: "ssrsumika_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 7.4, releasedAt: "2026-02-27", another: true },
    {
        id: "ssrsumika_2nd", name: "숨겼던 나", name_en: "Two Sides Of The Same Me", osusume: "fullpower", name_ja: "カクシタワタシ", releasedAt: "2024-12-18", rarity: "PSSR", plan: "anomaly", source: "normal", jumpTime2: 12.2,
        item: {
            name: "敗れ知らずのポイ",
            desc: "턴 개시 시 레슨 중 얻은 누계 전력치가 5이상일 경우\n✦ fullpower5\n✦ 踏切の先に를 보류로 이동\n✦ inlesson1",
            desc_ja: "ターン開始時、このレッスン中の累計全力値が5以上の場合、\n✦ fullpower5\n✦ 踏切の先にを保留に移動\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 레슨 중 얻은 누계 전력치가 5이상일 경우\n✦ fullpower8\n✦ 踏切の先に를 보류로 이동\n✦ inlesson1",
            desc_ja: "ターン開始時、このレッスン中の累計全力値が5以上の場合、\n✦ fullpower8\n✦ 踏切の先にを保留に移動\n✦ inlesson1",
        },
        card: {
            name: "踏切の先に",
            desc: "지침이 전력일 경우 사용 가능\n✦ param10 (3회) \n✦ 다음 턴, 온존 2단계로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "全力の場合、使用可\n✦ param10（3回） \n✦ 次のターン、温存2段階目に変更\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "지침이 전력일 경우 사용 가능\n✦ param16 (3회) \n✦ 다음 턴, 온존 2단계로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "全力の場合、使用可\n✦ param16（3回） \n✦ 次のターン、温存2段階目に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsumika_3rd", name: "Love & Joy", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2025-06-19", jumpTime2: 8.6, youtube_url: "https://youtu.be/YzBr_c61TsU?si=tVarpAMm8HEV5kU1",
        item: {
            desc: "액티브카드를 2회 사용할 때마다\n✦ 집중 증가량 증가+25% (5턴)\n✦ inlesson2",
            desc_ja: "アクティブスキルカードを2回使用するごとに、\n✦ 集中増加量増加+25%（5ターン）\n✦ inlesson2",
        },
        itemplus: {
            desc: "액티브카드를 2회 사용할 때마다\n✦ 집중 증가량 증가+25% (5턴)\n✦ inlesson3",
            desc_ja: "アクティブスキルカードを2回使用するごとに、\n✦ 集中増加量増加+25%（5ターン）\n✦ inlesson3",
        },
        card: {
            name: "もうためらわない",
            desc: "hpreduce6\n✦ 이후 직접효과로 집중이 7이상 증가 후 param12（집중효과 1.5배 적용）\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n✦ 以降、直接効果で集中が7以上増加後、param12（集中効果を1.5倍適用）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce3\n✦ 이후 직접효과로 집중이 7이상 증가 후 param12（집중효과 1.5배 적용）\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ 以降、直接効果で集中が7以上増加後、param12（集中効果を1.5倍適用）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        primacard: {
            name: "背中を押す一番星",
            desc: "startingcard\n✦ 집중 증가량 증가+10%\n✦ use1\n✦ 다음 턴, concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 集中増加量増加+10%\n✦ use1\n✦ 次のターン、concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },


    // --- 마오 SSR (PSSR) ---
    { id: "ssrmao_1st", name: "Fluorite", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 9.2, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/4AcOcsvGluY?si=1bIuj1lCYg4Ca5IQ" },
    { id: "ssrmao_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-08-01", another: true },
    { id: "ssrmao_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", releasedAt: "2024-10-08", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrmao_1st4another", name: "White Night! White Wish!", rarity: "PSSR", releasedAt: "2024-11-28", plan: "sense", source: "limited", another: true },
    { id: "ssrmao_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", releasedAt: "2025-02-01", jumpTime2: 7.2, plan: "sense", source: "limited", another: true },
    { id: "ssrmao_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-11", jumpTime2: 7.1, plan: "sense", source: "limited", another: true },
    { id: "ssrmao_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrmao_1st9another", name: "Howling over the World", rarity: "PSSR", releasedAt: "2025-05-29", plan: "sense", source: "limited", another: true, jumpTime2: 7.3 },
    { id: "ssrmao_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", releasedAt: "2025-09-29", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrmao_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 7.2, releasedAt: "2026-02-27", another: true },
    {
        id: "ssrmao_2nd", name: "Feel Jewel Dream", osusume: "goodimpression", rarity: "PSSR", plan: "logic", releasedAt: "2024-09-20", source: "normal", jumpTime2: 11.2,
        item: {
            desc: "턴 개시 시 의욕이 3이상인 경우 \n✦ goodimpression3\n✦ 의욕 감소 1\n✦ inlesson3",
            desc_ja: "ターン開始時、やる気が3以上の場合、\n✦ goodimpression3\n✦ やる気減少1\n✦ inlesson3",
        },
        itemplus: {
            desc: "턴 개시 시 의욕이 3이상인 경우 \n✦ goodimpression3\n✦ 의욕 감소 1\n✦ inlesson4",
            desc_ja: "ターン開始時、やる気が3以上の場合、\n✦ goodimpression3\n✦ やる気減少1\n✦ inlesson4",
        },
        card: {
            name: "月夜のランウェイ",
            desc: "✦ motivation3 \n✦ 이후 호인상효과의 스킬카드 사용 후, 호인상의 30%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation3 \n✦ 以降、好印象効果のスキルカード使用後、好印象の30%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ motivation3 \n✦ 이후 호인상효과의 스킬카드 사용 후, 호인상의 50%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation3 \n✦ 以降、好印象効果のスキルカード使用後、好印象の50%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrmao_3rd", name: "봐줘", name_en: "Face Me", name_ja: "見て", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2025-10-31", jumpTime2: 11.2, youtube_url: "https://youtu.be/nKO8cTM9jrI?si=5zmdnmkquuK_IEQg",
        item: {
            desc: "액티브 카드 사용 시 \n✦ 집중의 50%만큼 호조 증가\n✦ concentration1\n✦ inlesson1",
            desc_ja: "アクティブスキルカード使用時、\n✦ 集中の50%好調増加\n✦ concentration1\n✦ inlesson1",
        },
        itemplus: {
            desc: "액티브 카드 사용 시 \n✦ 집중의 50%만큼 호조 증가\n✦ concentration3\n✦ inlesson1",
            desc_ja: "アクティブスキルカード使用時、\n✦ 集中の50%好調増加\n✦ concentration3\n✦ inlesson1",
        },
        card: {
            name: "見つけた世界で",
            desc: "✦ 호조의 100%만큼 집중 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調の100%分集中増加\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 호조의 100%만큼 집중 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調の100%分集中増加\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        primacard: {
            name: "舞台で輝く一番星",
            desc: "startingcard\n✦ concentration4\n✦ 손패에 있는 멘탈카드(SR) 1장을 랜덤으로 코스트를 소비하지 않고 사용\n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ concentration4\n✦ ランダムな手札にあるメンタルスキルカード（SR）1枚をコストを消費せず使用\n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 코토네 SSR (PSSR) ---
    {
        id: "ssrkotone_1st", name: "세계에서 제일 귀여운 나", name_en: "Sekaiichi kawaii watashi", osusume: "goodimpression", name_ja: "世界一可愛い私", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 5.3, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/cHaEJgn4HYc?si=b6kiMK7AwkQuMJB1",
        item: {
            desc: "스킬카드 사용 후 호인상이 6이상일 경우\n✦ goodimpression3\n✦ use1\n✦ inlesson1",
            desc_ja: "スキルカード使用後、好印象が6以上の場合、\n✦ goodimpression3\n✦ use1\n✦ inlesson1",
        },
        itemplus: {
            desc: "스킬카드 사용 후 호인상이 6이상일 경우\n✦ goodimpression5\n✦ use1\n✦ inlesson1",
            desc_ja: "スキルカード使用後、好印象が6以上の場合、\n✦ goodimpression5\n✦ use1\n✦ inlesson1",
        },
        card: {
            name: "よそ見はダメ♪",
            desc: "✦ genki2\n✦ goodimpression7\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2\n✦ goodimpression7\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki4\n✦ goodimpression9\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki4\n✦ goodimpression9\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "효과 추가", ja: "効果追加" },
                cost: "100",
                desc: {
                    ko: "✦ genki4\n✦ goodimpression9\n✦ 호인상 강화+50% (5턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ genki4\n✦ goodimpression9\n✦ 好印象強化+50%（5ターン）\n <span style='color:#8B8FD8'>nooverlab limit1",
                },
            },
            custom2: {
                name: { ko: "스킬카드 사용 수+", ja: "スキルカード使用数+" },
                cost: "100",
                desc: {
                    ko: "✦ genki4\n✦ goodimpression9\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ genki4\n✦ goodimpression9\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                }
            }
        },
    },
    { id: "ssrkotone_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-07-01", another: true },
    { id: "ssrkotone_1st3another", name: "가장광소곡", name_en: "Fancy dress party", releasedAt: "2024-09-30", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "logic", source: "limited", another: true, jumpTime2: 8.1 },
    { id: "ssrkotone_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-01", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrkotone_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-03-10", jumpTime2: 7.1, plan: "logic", source: "limited", another: true },
    { id: "ssrkotone_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-11", plan: "logic", source: "limited", jumpTime2: 7.2, another: true },
    { id: "ssrkotone_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrkotone_1st9another", name: "Howling over the World", rarity: "PSSR", releasedAt: "2025-05-29", plan: "logic", source: "limited", another: true },
    { id: "ssrkotone_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrkotone_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 7.2, releasedAt: "2026-02-27", another: true },
    { id: "ssrkotone_2nd", name: "Yellow Big Bang!", osusume: "goodcondition", rarity: "PSSR", plan: "sense", releasedAt: "2024-06-10", source: "normal", jumpTime2: 10.3 },
    {
        id: "ssrkotone_3rd", name: "자기긍정감 떡상↑↑ 슈키슈키송", name_en: "Self-affirmation Explosion! Love Love Song", osusume: "concentration", name_ja: "自己肯定感爆上げ↑↑しゅきしゅきソング", releasedAt: "2025-08-12", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 8.1, youtube_url: "https://youtu.be/WCDLyXJgbIo?si=sUASzokNaAkg68Ho",
        item: {
            desc: "멘탈카드 사용 후 집중이 13이상일 경우, \n✦ genki2\n✦ 다음에 사용하는 멘탈카드의 효과를 1번 더 발동 (1회・1턴)\n✦ draw1\n✦ use1\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、集中が13以上の場合、\n✦ genki2\n✦ 次に使用するメンタルスキルカードの効果をもう1回発動（1回・1ターン）\n✦ draw1\n✦ use1\n✦ inlesson1",
        },
        itemplus: {
            desc: "멘탈카드 사용 후 집중이 13이상일 경우, \n✦ genki10\n✦ 다음에 사용하는 멘탈카드의 효과를 1번 더 발동 (1회・1턴)\n✦ draw2\n✦ use1\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、集中が13以上の場合、\n✦ genki10\n✦ 次に使用するメンタルスキルカードの効果をもう1回発動（1回・1ターン）\n✦ draw2\n✦ use1\n✦ inlesson1",
        },
        card: {
            name: "自己肯定感爆上げ↑↑",
            desc: "hpreduce3\n✦ 이후 멘탈카드 사용 시 concentration2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ 以降、メンタルスキルカード使用時、concentration2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce3\n✦ concentration1\n✦ 이후 멘탈카드 사용 시 concentration2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ concentration1\n✦ 以降、メンタルスキルカード使用時、concentration2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },

    // --- 테마리 SSR (PSSR) ---
    { id: "ssrtemari_1st", name: "Luna say maybe", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", jumpTime2: 11.4, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/Sq5Dj0U06vQ?si=z7zi9RBA43D7QpwX" },
    { id: "ssrtemari_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 6.4, releasedAt: "2024-07-01", another: true },
    { id: "ssrtemari_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-08-01", another: true },
    { id: "ssrtemari_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "sense", source: "limited", another: true, releasedAt: "2024-12-09", jumpTime2: 8.0 },
    { id: "ssrtemari_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-14", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrtemari_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", releasedAt: "2025-04-01", rarity: "PSSR", plan: "sense", jumpTime2: 10.2, source: "limited", another: true },
    { id: "ssrtemari_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrtemari_1st9another", name: "Howling over the World", rarity: "PSSR", plan: "sense", releasedAt: "2025-05-29", source: "limited", another: true, jumpTime2: 6.4 },
    { id: "ssrtemari_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "sense", source: "limited", another: true },
    { id: "ssrtemari_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2026-02-27", jumpTime2: 7.2, another: true },
    {
        id: "ssrtemari_2nd", name: "아이비", name_en: "IVY", osusume: "goodimpression", name_ja: "アイヴイ", rarity: "PSSR", releasedAt: "2024-05-22", plan: "logic", source: "normal", jumpTime2: 9.3,
        item: {
            desc: "턴 종료 시\n✦ 호인상의 100%만큼 파라미터 상승\n✦ genki3\n✦ inlesson2",
            desc_ja: "ターン終了時、好印象が10以上の場合、\n✦ 好印象の100%分パラメータ上昇\n✦ genki3\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 종료 시\n✦ 호인상의 100%만큼 파라미터 상승\n✦ genki3\n✦ inlesson3",
            desc_ja: "ターン終了時、好印象が10以上の場合、\n✦ 好印象の100%分パラメータ上昇\n✦ genki3\n✦ inlesson3",
        },
        card: {
            name: "絡まる想い",
            desc: "startingcard \n✦ goodimpression8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard \n✦ goodimpression8\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "startingcard \n✦ goodimpression10\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard \n✦ goodimpression10\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrtemari_3rd", name: "대체 언제부터", name_en: "Ittai itsukara", osusume: "fullpower", name_ja: "一体いつから", rarity: "PSSR", releasedAt: "2026-01-16", plan: "anomaly", jumpTime2: 9.3, source: "normal", youtube_url: "https://youtu.be/PE_iyDsY5xM?si=8v9OKPXlkxqQwl4r",
        item: {
            desc: "지침이 전력일 때\n✦ 다음으로 사용하는 액티브 카드의 소비체력을 0으로 줄임 (최대 1회)\n✦ 멘탈카드의 원기 수치 증가+4\n✦ inlesson2",
            desc_ja: "全力になった時、\n✦ 次に使用したアクティブスキルカードの消費体力を0にする（1回）\n✦ メンタルスキルカードの元気値増加+4\n✦ inlesson2",
        },
        itemplus: {
            desc: "지침이 전력일 때\n✦ 다음으로 사용하는 액티브 카드의 소비체력을 0으로 줄임 (최대 1회)\n✦ 멘탈카드의 원기 수치 증가+5\n✦ inlesson3",
            desc_ja: "全力になった時、\n✦ 次に使用したアクティブスキルカードの消費体力を0にする（1回）\n✦ メンタルスキルカードの元気値増加+5\n✦ inlesson3",
        },
        card: {
            name: "置き去りな自分",
            desc: "온존으로 지침 변경\n✦ fullpower2\n✦ 전력 액티브카드의 파라미터 증가량+50・코스트 수치 증가+8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "温存に変更\n✦ fullpower2\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+50・コスト値増加+8\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "온존으로 지침 변경\n✦ fullpower2\n✦ 전력 액티브카드의 파라미터 증가량+40・코스트 수치 증가+8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "温存に変更\n✦ fullpower2\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+40・コスト値増加+8\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        primacard: {
            name: "高みへ羽ばたく一番星",
            desc: "\n✦ fullpower5\n✦ use1\n✦ 이후 1회까지 턴 개시 시 전력인 경우, 제외패 이외에 있는 스킬카드 1장 선택해 코스트를 소비해서 사용\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "\n✦ fullpower5\n✦ use1\n✦ 以降1回まで、ターン開始時、全力の場合、除外以外のスキルカードを1枚選択し、コストを消費して使用\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 릴리야 SSR (PSSR) ---
    {
        id: "ssrlilja_1st", name: "백선", name_en: "Hakusen", name_ja: "白線", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 6.3, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/m4VahiqP9vA?si=SUBYu3W6gLIyRf9M",
        item: {
            desc: "턴 종료 시 원기가 7이상인 경우\n✦ 호인상 1.5배\n✦ 호인상의 30%만큼 파라미터 상승\n✦ inlesson1",
            desc_ja: "ターン終了時、元気が7以上の場合、\n✦ 好印象1.5倍\n✦ 好印象の30%分パラメータ上昇\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 종료 시 원기가 7이상인 경우\n✦ 호인상 1.5배\n✦ 호인상의 100%만큼 파라미터 상승\n✦ inlesson1",
            desc_ja: "ターン終了時、元気が7以上の場合、\n✦ 好印象1.5倍\n✦ 好印象の100%分パラメータ上昇\n✦ inlesson1",
        },
        card: {
            name: "もう怖くないから",
            desc: "✦ goodimpression3\n✦ 이후 턴 종료 시 goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression3\n✦ 以降、ターン終了時、goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ goodimpression4\n✦ 이후 턴 종료 시 goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression4\n✦ 以降、ターン終了時、goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "개시 손패에 추가", ja: "開始時手札に入る" },
                cost: "70",
                desc: {
                    ko: "startingcard\n✦ goodimpression4\n✦ 이후 턴 종료 시 goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "startingcard\n✦ goodimpression4\n✦ 以降、ターン終了時、goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
                },
            },
            custom2: {
                name: { ko: "스킬카드 사용 수+", ja: "スキルカード使用数+" },
                cost: "100",
                desc: {
                    ko: "✦ goodimpression4\n✦ 이후 턴 종료 시 goodimpression1\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ goodimpression4\n✦ 以降、ターン終了時、goodimpression1\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                }
            }
        },
    },
    { id: "ssrlilja_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", releasedAt: "2024-07-01", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-07-01", another: true },
    { id: "ssrlilja_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "logic", releasedAt: "2024-10-08", source: "limited", another: true },
    { id: "ssrlilja_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-01", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrlilja_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-03-10", plan: "logic", jumpTime2: 8.2, source: "limited", another: true },
    { id: "ssrlilja_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2025-05-09", another: true, jumpTime2: 6.4 },
    { id: "ssrlilja_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", releasedAt: "2025-08-29", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrlilja_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", releasedAt: "2025-09-29", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrlilja_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2026-02-27", jumpTime2: 7.4, another: true },
    {
        id: "ssrlilja_2nd", name: "극광", name_en: "Kyokkoo", name_ja: "極光", osusume: "enthusiasm", rarity: "PSSR", releasedAt: "2025-03-21", plan: "anomaly", source: "normal", jumpTime2: 9.6,
        item: {
            desc: "멘탈카드 사용 시 지침이 강기 2단계인 경우\n✦ 멘탈카드의 원기 수치 증가+4\n✦ hpreduce2\n✦ inlesson3",
            desc_ja: "メンタルスキルカード使用時、強気2段階目の場合、\n✦ メンタルスキルカードの元気値増加+4\n✦ hpreduce2\n✦ inlesson3",
        },
        itemplus: {
            desc: "멘탈카드 사용 시 지침이 강기 2단계인 경우\n✦ 멘탈카드의 원기 수치 증가+4\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "メンタルスキルカード使用時、強気2段階目の場合、\n✦ メンタルスキルカードの元気値増加+4\n✦ hpreduce1\n✦ inlesson3",
        },
        card: {
            name: "きらきらプリズム",
            desc: "지침이 온존일 경우 사용 가능\n✦ 강기 2단계로 지침 변경\n✦ 이후 멘탈카드 사용 시 지침이 강기 2단계일 경우, 강기효과 스킬카드의 파라미터치 증가+7\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "温存の場合、使用可\n✦ 強気2段階目に変更\n✦ 以降、メンタルスキルカード使用時、強気2段階目の場合、強気効果のスキルカードのパラメータ値増加+7\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "지침이 온존일 경우 사용 가능\n✦ 강기 2단계로 지침 변경\n✦ 이후 멘탈카드 사용 시 지침이 강기 2단계일 경우, 강기효과 스킬카드의 파라미터치 증가+8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "温存の場合、使用可\n✦ 強気2段階目に変更\n✦ 以降、メンタルスキルカード使用時、強気2段階目の場合、強気効果のスキルカードのパラメータ値増加+8\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrlilja_3rd", name: "Atmosphere", osusume: "fullpower", rarity: "PSSR", plan: "anomaly", source: "normal", releasedAt: "2025-12-08", jumpTime2: 9.5, youtube_url: "https://youtu.be/R9PEnLmv6zI?si=CG6jPxmYp4dGctXo",
        item: {
            desc: "턴 종료 시 전력치가 10이상인 경우 あふれ出る思い를 보류로 이동\n✦ genki5\n✦ 다음 턴, 전력치 증가량 증가+50% (1턴)\n✦ inlesson2",
            desc_ja: "ターン終了時、全力値が10以上の場合、あふれ出る思いを保留に移動\n✦ genki5\n✦ 次のターン、全力値増加量増加+50%（1ターン）\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 종료 시 전력치가 10이상인 경우 あふれ出る思い를 보류로 이동\n✦ genki5\n✦ 다음 턴, 전력치 증가량 증가+50% (1턴)\n✦ inlesson3",
            desc_ja: "ターン終了時、全力値が10以上の場合、あふれ出る思いを保留に移動\n✦ genki5\n✦ 次のターン、全力値増加量増加+50%（1ターン）\n✦ inlesson3",
        },
        card: {
            name: "あふれ出る思い",
            desc: "전력치 소비 6\n✦ use1\n✦ 다음 턴, fullpower2\n✦ 이후 3회까지 턴 종료 시 전력치가 9이하인 경우, param2 (누계 전력치의 100%만큼 파라미터 상승량 증가)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "全力値消費6\n✦ use1\n✦ 次のターン、fullpower2\n✦ 以降3回まで、ターン終了時、全力値が9以下の場合、param2（累計全力値の100%分、パラメータ上昇量増加）\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "전력치 소비 4\n✦ use1\n✦ 다음 턴, fullpower3\n✦ 이후 3회까지 턴 종료 시 전력치가 9이하인 경우, param2 (누계 전력치의 100%만큼 파라미터 상승량 증가)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "全力値消費4\n✦ use1\n✦ 次のターン、fullpower3\n✦ 以降3回まで、ターン終了時、全力値が9以下の場合、param2（累計全力値の100%分、パラメータ上昇量増加）\n <span style='color:#8B8FD8'>nooverlab",
        },
        primacard: {
            name: "勇気を届ける一番星",
            desc: "\n✦ param20 (누계 전력치의 650만큼 파라미터 상승량 증가)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "\n✦ param20（累積全力値の650%分、パラメータ上昇量増加）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },


    // --- 히로 SSR (PSSR) ---
    {
        id: "ssrhiro_1st", name: "광경", name_en: "Koukei", name_ja: "光景", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 10.3, releasedAt: "2024-05-16", youtube_url: "https://youtu.be/VJk2etK8I1w?si=OA8K2zri7qLpp5l2",
        item: {
            desc: "남은 턴이 2턴 이내일 때 턴 개시 시\n✦ 원기의 50%만큼 파라미터 상승\n✦ hpreduce1",
            desc_ja: "残り2ターン以内のターン開始時、\n✦ 元気の50%分パラメータ上昇\n✦ hpreduce1",
        },
        itemplus: {
            desc: "남은 턴이 2턴 이내일 때 턴 개시 시\n✦ 원기의 65%만큼 파라미터 상승\n✦ hpreduce1",
            desc_ja: "残り2ターン以内のターン開始時、\n✦ 元気の65%分パラメータ上昇\n✦ hpreduce1",
        },
        card: {
            name: "本気の魅力",
            desc: "✦ genki5\n✦ 의욕이 3이상일 경우 genki4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki5\n✦ やる気が3以上の場合、genki4\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki7\n✦ 의욕이 3이상일 경우 genki7\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki7\n✦ やる気が3以上の場合、genki7\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "원기 추가", ja: "元気追加" },
                cost: "100",
                desc: {
                    ko: "✦ genki7\n✦ 의욕이 3이상일 경우 genki7\n✦ genki3 (의욕효과 1.5배 적용)\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ genki7\n✦ やる気が3以上の場合、genki7\n✦ genki3（やる気効果を1.5倍適用）\n <span style='color:#8B8FD8'>nooverlab limit1",
                },
            },
            custom2: {
                name: { ko: "레슨 중 1회제한 해제", ja: "レッスン中1回の制限削除" },
                cost: "40",
                desc: {
                    ko: "✦ genki7\n✦ 의욕이 3이상일 경우 genki7\n <span style='color:#8B8FD8'>nooverlab",
                    ja: "✦ genki7\n✦ やる気が3以上の場合、genki7\n <span style='color:#8B8FD8'>nooverlab",
                }
            }
        },
    },
    { id: "ssrhiro_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-07-12", another: true, jumpTime2: 6.3 },
    { id: "ssrhiro_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-08-11", another: true },
    { id: "ssrhiro_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "logic", releasedAt: "2024-12-09", source: "limited", another: true },
    { id: "ssrhiro_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2025-02-28", another: true, jumpTime2: 8.2 },
    { id: "ssrhiro_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-01", plan: "logic", jumpTime2: 7.2, source: "limited", another: true },
    { id: "ssrhiro_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrhiro_1st9another", name: "Howling over the World", rarity: "PSSR", releasedAt: "2025-05-29", plan: "logic", source: "limited", another: true },
    { id: "ssrhiro_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", releasedAt: "2025-09-29", rarity: "PSSR", plan: "logic", source: "limited", another: true },
    { id: "ssrhiro_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2026-02-27", jumpTime2: 7.5, another: true },
    { id: "ssrhiro_2nd", name: "콘트라스트", name_en: "Contrast", name_ja: "コントラスト", osusume: "concentration", rarity: "PSSR", plan: "sense", releasedAt: "2024-07-22", source: "normal", jumpTime2: 10.3 },
    {
        id: "ssrhiro_3rd", name: "SUNFADED", name_en: "SUNFADED", name_ja: "サンフェーデッド", osusume: "enthusiasm", rarity: "PSSR", releasedAt: "2025-07-17", plan: "anomaly", source: "normal", jumpTime2: 8.3, youtube_url: "https://youtu.be/XLwmEuM0dIw?si=kG6RqnAE6FqImH1J",
        item: {
            desc: "스킬카드 코스트로 체력이 감소할 경우\n✦ 열의 증가+40%\n✦ inlesson3",
            desc_ja: "スキルカードコストで体力減少時、\n✦ 熱意増加+40%\n✦ inlesson3",
        },
        itemplus: {
            desc: "스킬카드 코스트로 체력이 감소할 경우\n✦ 열의 증가+60%\n✦ inlesson3",
            desc_ja: "スキルカードコストで体力減少時、\n✦ 熱意増加+60%\n✦ inlesson3",
        },
        card: {
            name: "日が差す方へ",
            desc: "hpreduce1\n✦ 지침이 강기인 경우 사용 가능\n✦ 온존으로 지침 변경\n✦ genki5\n✦ netsui8\n✦ 멘탈카드의 코스트 수치 증가+1・체력소비 코스트 수치 증가+1\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "hpreduce1\n✦ 強気の場合、使用可\n✦ 温存に変更\n✦ genki5\n✦ netsui8\n✦ メンタルスキルカードのコスト値増加+1・体力消費コスト値増加+1\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "hpreduce1\n✦ 지침이 강기인 경우 사용 가능\n✦ 온존으로 지침 변경\n✦ genki8\n✦ netsui10\n✦ 멘탈카드의 코스트 수치 증가+1・체력소비 코스트 수치 증가+1\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "hpreduce1\n✦ 強気の場合、使用可\n✦ 温存に変更\n✦ genki8\n✦ netsui10\n✦ メンタルスキルカードのコスト値増加+1・体力消費コスト値増加+1\n <span style='color:#8B8FD8'>nooverlab",
        },
        primacard: {
            name: "奇跡を起こした一番星",
            desc: "\n✦ 다음에 사용하는 日が差す方へ의 소비체력을 0으로 감소 (최대 5회)\n✦ use1\n✦ 강기효과 스킬카드의 파라미터치 증가+11\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "\n✦ 次に使用した日が差す方への消費体力を0にする（5回）\n✦ use1\n✦ 強気効果のスキルカードのパラメータ値増加+11\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 츠바메 SSR (PSSR) ---    
    {
        id: "ssrtsubame_1st", name: "이론무장하고", name_en: "RIRONBUSO SITE", name_ja: "理論武装して", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 7.8, releasedAt: "2025-11-16", youtube_url: "https://youtu.be/0ZWUdwVQOJA?si=4OJ6d8ZxH0k0LmvB",
        item: {
            desc: "직접효과로 의욕이 증가한 경우 원기가 7이상일 때 \n✦ motivation4\n✦ genki1\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "直接効果でやる気が増加後、元気が7以上の場合、\n✦ motivation4\n✦ genki1\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: "직접효과로 의욕이 증가한 경우 원기가 7이상일 때 \n✦ motivation6\n✦ genki1\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "直接効果でやる気が増加後、元気が7以上の場合、\n✦ motivation6\n✦ genki1\n✦ hpreduce2\n✦ inlesson2",
        },
        card: {
            name: "私は、決して",
            desc: "의욕이 9이상인 경우 사용 가능\n✦ 프라이드 (5턴)\n✦ use1\n✦ goodimpression8\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "やる気が9以上の場合、使用可\n✦ プライド（5ターン）\n✦ use1\n✦ goodimpression8\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "의욕이 9이상인 경우 사용 가능\n✦ 프라이드 (5턴)\n✦ use1\n✦ goodimpression9\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "やる気が9以上の場合、使用可\n✦ プライド（5ターン）\n✦ use1\n✦ goodimpression9\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrtsubame_1st12another", name: "ENDLESS DANCE", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2026-02-27", jumpTime2: 7.2, another: true },
    { id: "ssrtsubame_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 7.1, releasedAt: "2026-04-13", another: true },
    { id: "ssrtsubame_1st7another", name: "벛꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 7.5, releasedAt: "2026-04-21", another: true },


    // --- 세나 SSR (PSSR) ---
    {
        id: "ssrsena_1st", name: "작은 야망", name_en: "Tiny Ambition", name_ja: "ちいさな野望", osusume: "enthusiasm", rarity: "PSSR", plan: "anomaly", source: "normal", jumpTime2: 9.4, releasedAt: "2024-11-16", youtube_url: "https://youtu.be/UwA_4TafA_g?si=XjElH7VzQHnl7TGi",
        item: {
            name: "新しい、私",
            desc: "액티브 스킬카드 사용 후 \n✦ param8\n✦ 체력회복 4\n✦ inlesson1",
            desc_ja: "アクティブスキルカード使用後、\n✦ param8\n✦ 体力回復4\n✦ inlesson1",
        },
        itemplus: {
            desc: "액티브 스킬카드 사용 후 \n✦ param12\n✦ 체력회복 6\n✦ inlesson1",
            desc_ja: "アクティブスキルカード使用後、\n✦ param12\n✦ 体力回復6\n✦ inlesson1",
        },
        card: {
            name: "一番高い星",
            desc: "✦ 강기로 지침 변경\n✦ param3 (2회) \n✦ 성장 : 강기효과의 스킬카드 사용 후 자신의 파라미터치 증가+10・코스트 수치 증가+1 (최대 2회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ param3（2回） \n✦ 成長：強気効果のスキルカード使用後、自身のパラメータ値増加+10・コスト値増加+1（2回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ param6 (2회) \n✦ 성장 : 강기효과의 스킬카드 사용 후 자신의 파라미터치 증가+15・코스트 수치 증가+1 (최대 2회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ param6（2回） \n✦ 成長：強気効果のスキルカード使用後、自身のパラメータ値増加+15・コスト値増加+1（2回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "성장 변경", ja: "成長変更" },
                cost: "100",
                desc: {
                    ko: "✦ 강기로 지침 변경\n✦ param6 (2회) \n✦ 성장 : 강기효과의 스킬카드 사용 후 자신의 파라미터치 증가+15・코스트 수치 증가+1・plusattack1 (최대 2회)\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ 強気に変更\n✦ param6（2回） \n✦ 成長：強気効果のスキルカード使用後、自身のパラメータ値増加+15・コスト値増加+1・plusattack1（2回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
                },
            },
            custom2: {
                name: { ko: "스킬카드 사용 수+", ja: "スキルカード使用数+" },
                cost: "100",
                desc: {
                    ko: "✦ 강기로 지침 변경\n✦ param6 (2회) \n✦ 성장 : 강기효과의 스킬카드 사용 후 자신의 파라미터치 증가+15・코스트 수치 증가+1 (최대 2회)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "✦ 強気に変更\n✦ param6（2回） \n✦ 成長：強気効果のスキルカード使用後、自身のパラメータ値増加+15・コスト値増加+1（2回まで）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                }
            }
        },
    },
    { id: "ssrsena_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 7.0, releasedAt: "2025-02-28", another: true },
    { id: "ssrsena_1st7another", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 8.2, releasedAt: "2025-04-11", another: true },
    { id: "ssrsena_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", jumpTime2: 6.3, rarity: "PSSR", plan: "anomaly", source: "normal", releasedAt: "2025-05-09", another: true },
    { id: "ssrsena_1st9another", name: "Howling over the World", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-05-29", another: true },
    { id: "ssrsena_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-07-07", another: true },
    { id: "ssrsena_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-08-22", another: true },
    { id: "ssrsena_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-08-29", another: true },
    { id: "ssrsena_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-09-29", another: true },
    { id: "ssrsena_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-11-07", another: true },
    { id: "ssrsena_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-12-18", another: true },
    {
        id: "ssrsena_2nd", name: "Our Chant", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 10.1, releasedAt: "2025-04-22",
        item: {
            desc: "스킬카드 사용 후 호인상이 6이상인 경우\n✦ goodimpression2\n✦ motivation2\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "スキルカード使用後、好印象が6以上の場合、\n✦ goodimpression2\n✦ motivation2\n✦ hpreduce1\n✦ inlesson3",
        },
        itemplus: {
            desc: "스킬카드 사용 후 호인상이 6이상인 경우\n✦ goodimpression2\n✦ motivation2\n✦ inlesson3",
            desc_ja: "スキルカード使用後、好印象が6以上の場合、\n✦ goodimpression2\n✦ motivation2\n✦ inlesson3",
        },
        card: {
            name: "勇き上がる気持ち",
            desc: "✦ 호인상 증가량 증가+100%(3턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好印象増加量増加+100%（3ターン）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 호인상 증가량 증가+100%(3턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好印象増加量増加+100%（3ターン）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsena_3rd", name: "적나라", name_en: "SEKIRARA", name_ja: "赤裸々", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 7.6, releasedAt: "2026-02-09", youtube_url: "https://youtu.be/afh9Sq0Dtq4?si=vfvCdWpuf85lfBk5",
        item: {
            desc: "2턴마다 원기가 30이상인 경우\n✦ 체력 회복 1\n✦ 제외패에 있는 私を超えて（翔）1장 당 원기의 20%만큼 파라미터 상승",
            desc_ja: "2ターンごとに、元気が30以上の場合、\n✦ 体力回復1\n✦ 除外にある私を超えて（翔）1枚につき、元気の20%分パラメータ上昇量",
        },
        itemplus: {
            desc: "2턴마다 원기가 30이상인 경우\n✦ 체력 회복 2\n✦ 제외패에 있는 私を超えて（翔）1장 당 원기의 25%만큼 파라미터 상승",
            desc_ja: "2ターンごとに、元気が30以上の場合、\n✦ 体力回復2\n✦ 除外にある私を超えて（翔）1枚につき、元気の25%分パラメータ上昇量",
        },
        card: {
            name: "私を超えて",
            desc: "startingcard\n✦ use1\n✦ 이후 원기효과의 스킬카드를 2회 사용할 때마다 私を超えて（翔）를 덱의 제일 위에 생성\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ use1\n✦ 以降、元気効果のスキルカードを2回使用するごとに、私を超えて（翔）を山札の一番上に生成\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ use1\n✦ 이후 원기효과의 스킬카드를 2회 사용할 때마다 私を超えて（翔）를 덱의 제일 위에 생성\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ use1\n✦ 以降、元気効果のスキルカードを2回使用するごとに、私を超えて（翔）を山札の一番上に生成\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        tokencard: {
            name: "私を超えて（翔）",
            desc: "hpreduce1\n✦ 원기가 15이상인 경우 사용 가능\n✦ 원기의 80%만큼 파라미터 상승\n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce1\n✦ 元気が15以上の場合、使用可\n✦ 元気の80%分パラメータ上昇\n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- 우메 SSR (PSSR) ---
    {
        id: "ssrume_1st", name: "The Rolling Riceball", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 9.4, releasedAt: "2024-06-01", youtube_url: "https://youtu.be/FL-NhmFGQYw?si=NR38ucVx1cmxrs-C",
        item: {
            desc: "멘탈카드 사용 후 의욕이 5이상인 경우\n✦ motivation3\n✦ use1\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、やる気が5以上の場合、\n✦ motivation3\n✦ use1\n✦ inlesson1",
        },
        itemplus: {
            desc: "멘탈카드 사용 후 의욕이 5이상인 경우\n✦ motivation5\n✦ use1\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、やる気が5以上の場合、\n✦ motivation5\n✦ use1\n✦ inlesson1",
        },
        card: {
            name: "おっきなおにぎり",
            desc: "hpreduce3\n✦ genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+5)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+5）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce3\n✦ genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+8)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+8）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardcustom: {
            custom1: {
                name: { ko: "효과변경", ja: "効果変更" },
                cost: "100",
                desc: {
                    ko: "hpreduce3\n✦ 이후 2회까지 액티브카드를 3회 사용할 때마다 genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+12)\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "hpreduce3\n✦ 以降2回まで、アクティブスキルカードを3回使用するごとに、genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+12）\n <span style='color:#8B8FD8'>nooverlab limit1"
                },
            },
            custom2: {
                name: { ko: "스킬카드 사용 수+", ja: "スキルカード使用数+" },
                cost: "100",
                desc: {
                    ko: "hpreduce3\n✦ genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+8)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                    ja: "hpreduce3\n✦ genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+8）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
                }
            }
        },
    },
    { id: "ssrume_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-07-12", another: true },
    { id: "ssrume_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-08-11", another: true },
    { id: "ssrume_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2024-09-30", another: true },
    { id: "ssrume_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2025-05-09", another: true, jumpTime2: 6.3 },
    { id: "ssrume_1st9another", name: "Howling over the World", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2025-05-29", another: true },
    { id: "ssrume_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2025-08-29", another: true },
    { id: "ssrume_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2025-09-29", another: true },
    { id: "ssrume_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", plan: "logic", source: "limited", releasedAt: "2026-02-14", another: true },
    { id: "ssrume_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 7.2, releasedAt: "2026-04-13", another: true },
    { id: "ssrume_1st7another", name: "벛꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 8.1, releasedAt: "2026-04-21", another: true },
    {
        id: "ssrume_2nd", name: "구-스-피-", name_en: "Gu-Su-Pi", name_ja: "グースーピー", osusume: "enthusiasm", rarity: "PSSR", plan: "anomaly", source: "normal", jumpTime2: 9.2, releasedAt: "2025-11-28",
        item: {
            desc: "턴 개시 시 지침을 변경한 횟수가 4회 이상인 경우\n✦ 덱 혹은 버림패에 있는 랜덤한 온존효과의 스킬카드를 손패로 이동\n✦ グーチョキパーデポン의 plusattack1・파라미터 증가량+10・코스트 수치 증가+4\n✦ inlesson2",
            desc_ja: "ターン開始時、指針を変更した回数が4回以上の場合、\n✦ ランダムな山札か捨札の温存効果のスキルカードを手札に移動\n✦ グーチョキパーデポンのplusattack1・パラメータ値増加+10・コスト値増加+4\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 지침을 변경한 횟수가 4회 이상인 경우\n✦ 덱 혹은 버림패에 있는 랜덤한 온존효과의 스킬카드를 손패로 이동\n✦ グーチョキパーデポン의 plusattack1・파라미터 증가량+15・코스트 수치 증가+3\n✦ inlesson2",
            desc_ja: "ターン開始時、指針を変更した回数が4回以上の場合、\n✦ ランダムな山札か捨札の温存効果のスキルカードを手札に移動\n✦ グーチョキパーデポンのplusattack1・パラメータ値増加+15・コスト値増加+3\n✦ inlesson2",
        },
        card: {
            name: "グーチョキパーデポン",
            desc: "✦ 강기로 지침 변경\n✦ param8\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터 증가량+5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ param8\n✦ 成長：直接効果で強気になった時、自身のパラメータ増加量+5\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ param10\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터 증가량+5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ param10\n✦ 成長：直接効果で強気になった時、自身のパラメータ増加量+5\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrume_3rd", name: "새하얀 페이지와 수채의 주인공", name_en: "A Blank White Page and a Watercolor Hero", name_ja: "真っ白いページと水彩の主人公", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "normal", releasedAt: "2026-04-10", jumpTime2: 7.6, youtube_url: "https://youtu.be/zpDB6GzOXq0?si=lrT8tCS6sSxg6QB1",
        item: {
            desc: "3턴마다 턴 종료 시,\n✦ 원기의 110%만큼 파라미터를 상승시키고 원기를 전부 소모\n✦다음 턴에 draw1\n✦ inlesson3",
            desc_ja: "3ターンごとのターン終了時、\n✦ 元気の110%分パラメータ上昇させ、元気を0にする\n✦ 次のターン、draw1\n✦ inlesson3",
        },
        itemplus: {
            desc: "3턴마다 턴 종료 시,\n✦ 원기의 130%만큼 파라미터를 상승시키고 원기를 전부 소모\n✦ 다음 턴에 draw2\n✦ inlesson3",
            desc_ja: "3ターンごとのターン終了時、\n✦ 元気の130%分パラメータ上昇させ、元気を0にする\n✦ 次のターン、draw2\n✦ inlesson3",
        },
        card: {
            name: "あたしがいるよ",
            desc: "✦ genki2\n✦ motivation1\n✦ 이후 3회까지 턴 개시 시 원기가 0인 경우 레슨 중 소비한 원기의 80%만큼 원기 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2\n✦ motivation1\n✦ 以降3回まで、ターン開始時、元気が0の場合、レッスン中に消費した元気の80%分元気増加\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki2\n✦ motivation3\n✦ 이후 3회까지 턴 개시 시 원기가 0인 경우 레슨 중 소비한 원기의 80%만큼 원기 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2\n✦ motivation3\n✦ 以降3回まで、ターン開始時、元気が0の場合、レッスン中に消費した元気の80%分元気増加\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },



    // --- 미스즈 SSR (PSSR) ---
    {
        id: "ssrmisuzu_1st", name: "달거북이", name_en: "Moon Turtle", name_ja: "ツキノカメ", osusume: "preservation", rarity: "PSSR", plan: "anomaly", source: "normal", jumpTime2: 11.3, releasedAt: "2025-05-16", youtube_url: "https://youtu.be/E74wm1P6CPI?si=aXXLizwFsr42Igwf",
        item: {
            desc: "온존효과의 스킬카드 사용 후 지침이 전력일 경우\n✦ 누계 전력치의 140%만큼 파라미터 상승\n✦ hpreduce1",
            desc_ja: "温存効果のスキルカード使用後、全力の場合、\n✦ 累計全力値の140%分パラメータ上昇\n✦ hpreduce1",
        },
        itemplus: {
            desc: "온존효과의 스킬카드 사용 후 지침이 전력일 경우\n✦ 누계 전력치의 140%만큼 파라미터 상승",
            desc_ja: "温存効果のスキルカード使用後、全力の場合、\n✦ 累計全力値の140%分パラメータ上昇",
        },
        card: {
            name: "屋上から景色",
            desc: "startingcard\n✦ fullpower2\n✦ 전력효과의 스킬카드의 파라미터치 증가+4\n✦ 이후 턴 개시 시 지침이 온존인 경우 여유로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ fullpower2\n✦ 全力効果のスキルカードのパラメータ増加+4\n✦ 以降、ターン開始時、温存の場合、のんびりに変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ fullpower3\n✦ 전력효과의 스킬카드의 파라미터치 증가+9\n✦ 이후 턴 개시 시 지침이 온존인 경우 여유로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ fullpower3\n✦ 全力効果のスキルカードのパラメータ増加+9\n✦ 以降、ターン開始時、温存の場合、のんびりに変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    { id: "ssrmisuzu_1st1another", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-07-07", another: true },
    { id: "ssrmisuzu_1st2another", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-08-22", another: true },
    { id: "ssrmisuzu_1st10another", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", rarity: "PSSR", plan: "anomaly", releasedAt: "2025-08-29", source: "limited", another: true },
    { id: "ssrmisuzu_1st11another", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-09-29", another: true },
    { id: "ssrmisuzu_1st3another", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-11-07", another: true },
    { id: "ssrmisuzu_1st8another", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", rarity: "PSSR", plan: "anomaly", releasedAt: "2025-11-21", source: "normal", another: true },
    { id: "ssrmisuzu_1st4another", name: "White Night! White Wish!", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2025-12-18", jumpTime2: 8.3, another: true },
    { id: "ssrmisuzu_1st5another", name: "해피 밀푀유", name_en: "happymillefeuille", name_ja: "ハッピーミルフィーユ", rarity: "PSSR", plan: "anomaly", source: "limited", releasedAt: "2026-02-14", another: true },
    { id: "ssrmisuzu_1st6another", name: "눈녹을 쯤에", name_en: "Yukidokeni", name_ja: "雪解けに", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 7.1, releasedAt: "2026-04-13", another: true },
    { id: "ssrmisuzu_1st7another", name: "벛꽃 포토그래프", name_en: "Sakura Photograph", name_ja: "桜フォトグラフ", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 8.1, releasedAt: "2026-04-21", another: true },
    {
        id: "ssrmisuzu_2nd", name: "Superlative", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "normal", jumpTime2: 7.2, releasedAt: "2026-01-05",
        item: {
            desc: "턴 개시 시 호인상이 6이상인 경우\n✦ goodimpression10\n✦ 파라미터 상승량 감소 60% (2턴)\n✦ 이후 5회까지 멘탈카드 사용 시 motivation1\n✦ inlesson1",
            desc_ja: "ターン開始時、好印象が6以上の場合、\n✦ goodimpression10\n✦ パラメータ上昇量減少60%（2ターン）\n✦ 以降5回まで、メンタルスキルカード使用時、motivation1\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 호인상이 6이상인 경우\n✦ goodimpression13\n✦ 파라미터 상승량 감소 60% (2턴)\n✦ 이후 5회까지 멘탈카드 사용 시 motivation1\n✦ inlesson1",
            desc_ja: "ターン開始時、好印象が6以上の場合、\n✦ goodimpression13\n✦ パラメータ上昇量減少60%（2ターン）\n✦ 以降5回まで、メンタルスキルカード使用時、motivation1\n✦ inlesson1",
        },
        card: {
            name: "夢と現の境界線",
            desc: "✦ use1\n✦ 의욕이 8이하인 경우, 호인상 1.1배\n✦ 의욕이 9이상인 경우, 호인상의 140%만큼 파라미터 증가\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ use1\n✦ やる気が8以下の場合、好印象1.1倍\n✦ やる気が9以上の場合、好印象の140%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ use1\n✦ 의욕이 8이하인 경우, 호인상 1.1배\n✦ 의욕이 9이상인 경우, 호인상의 250%만큼 파라미터 증가\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ use1\n✦ やる気が8以下の場合、好印象1.1倍\n✦ やる気が9以上の場合、好印象の250%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        }
    },
    {
        id: "ssrmisuzu_3rd", name: "VEIL", osusume: "enthusiasm", rarity: "PSSR", plan: "anomaly", source: "normal", jumpTime2: 7.2, releasedAt: "2026-04-29", youtube_url: "https://youtu.be/AbxzlgJTM-I?si=u1JejBnCmOJ1RGgX",
        item: {
            desc: "어느 한 쪽의 지침인 경우 강기 스킬카드 사용 후 3회마다 \n✦ 여유로 지침 변경\n✦ 열의 증가+40% (1턴)\n✦ genki3\n✦ inlesson3",
            desc_ja: "いずれかの指針の場合、強気効果のスキルカード使用後3回ごとに、\n✦ のんびりに変更\n✦ 熱意増加+40%（1ターン）\n✦ genki3\n✦ inlesson5",
        },
        itemplus: {
            desc: "어느 한 쪽의 지침인 경우 강기 스킬카드 사용 후 3회마다 \n✦ 여유로 지침 변경\n✦ 열의 증가+40% (1턴)\n✦ genki3",
            desc_ja: "いずれかの指針の場合、強気効果のスキルカード使用後3回ごとに、\n✦ のんびりに変更\n✦ 熱意増加+40%（1ターン）\n✦ genki3",
        },
        card: {
            name: "教えてあげる",
            desc: "✦ 강기로 지침 변경\n✦ param6\n✦ netsui2 (2턴)\n✦ 다음 턴, draw2\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param6\n✦ netsui2 (2ターン)\n✦ 次のターン、draw2\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ param6\n✦ netsui2 (2턴)\n✦ 다음 턴, draw2\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param6\n✦ netsui2 (2ターン)\n✦ 次のターン、draw2\n <span style='color:#8B8FD8'>nooverlab",
        },
        primacard: {
            name: "星々を見下ろす一番星",
            desc: "✦ genki4\n✦ 열의 증가+30%\n✦ use1\n✦ 이후 3회까지 턴 개시 시 온존 상태가 아니라면 여유로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki4\n✦ 熱意増加+30%\n✦ use1\n✦ 以降3回まで、ターン開始時、非温存状態の場合、のんびりに変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },



    // 특별 통상
    {
        id: "ssrrinami_onsen", name: "어서오세요 초성온천", name_en: "Welcome to Hatsuboshi Onsen", name_ja: "ようこそ初星温泉", osusume: "motivation", rarity: "PSSR", releasedAt: "2024-09-01", plan: "logic", source: "normal", jumpTime2: 12.3,
        item: {
            desc: "스킬카드를 3회 사용할 때마다\n✦ genki1\n✦ motivation3\n✦ inlesson2",
            desc_ja: "スキルカードを3回使用するごとに、\n✦ genki1\n✦ motivation3\n✦ inlesson2",
        },
        itemplus: {
            desc: "스킬카드를 3회 사용할 때마다\n✦ genki2\n✦ motivation4\n✦ inlesson2",
            desc_ja: "スキルカードを3回使用するごとに、\n✦ genki2\n✦ motivation4\n✦ inlesson2",
        },
        card: {
            name: "さっぱりひといき",
            desc: "hpreduce5 \n✦ genki2 (의욕효과 2.3배 적용)\n✦ 원기의 50%만큼 파라미터 증가\n✦ 소비체력절감1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce5 \n✦ genki2（やる気効果を2.3倍適用）\n✦ 元気の50%分パラメータ上昇\n✦ 消費体力削減1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce4 \n✦ genki2 (의욕효과 2.3배 적용)\n✦ 원기의 80%만큼 파라미터 증가\n✦ 소비체력절감1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4 \n✦ genki2（やる気効果を2.3倍適用）\n✦ 元気の80%分パラメータ上昇\n✦ 消費体力削減1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrchina_onsen", name: "어서오세요 초성온천", name_en: "Welcome to Hatsuboshi Onsen", name_ja: "ようこそ初星温泉", osusume: "concentration", rarity: "PSSR", plan: "sense", releasedAt: "2024-09-11", source: "normal", jumpTime2: 11.3 },
    { id: "ssrsaki_animate", name: "고금동서 식은 죽 먹기", name_en: "All times, All places, ChoChoiNoChoi", name_ja: "古今東西ちょちょいのちょい", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "normal", releasedAt: "2024-10-28", jumpTime2: 11.2 },

    // 페스 (Campus Fes)
    {
        id: "ssrrinami_campusfes", name: "Campus mode!!", osusume: "fullpower", rarity: "PSSR", plan: "anomaly", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2025-01-02",
        item: {
            name: "きみが見つけた私",
            desc: "嬉しい誤算사용 후\n✦ 파라미터 상승량 증가 60% (2턴)\n✦ fullpower10\n✦ hpreduce1\n✦ inlesson1",
            desc_ja: "嬉しい誤算使用後、\n✦ パラメータ上昇量増加60%（2ターン）\n✦ fullpower10\n✦ hpreduce1\n✦ inlesson1",
            referimage: ["anomaly-r8"]
        },
        itemplus: {
            desc: "嬉しい誤算사용 후\n✦ 파라미터 상승량 증가 60% (2턴)\n✦ fullpower15\n✦ hpreduce1\n✦ inlesson1",
            desc_ja: "嬉しい誤算使用後、\n✦ パラメータ上昇量増加60%（2ターン）\n✦ fullpower15\n✦ hpreduce1\n✦ inlesson1",
            referimage: ["anomaly-r8"]
        },
        card: {
            name: "アイドルにしてくれた",
            desc: "전력으로 지침을 변경한 횟수가 1회 이상일 경우 사용가능 \n✦ param20\n✦ 성장 : 전력으로 지침 변경 시 자신의 plusattack1 (최대 4회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "全力になった回数が1回以上の場合、使用可 \n✦ param20\n✦ 成長：全力になった時、自身のplusattack1（4回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "전력으로 지침을 변경한 횟수가 1회 이상일 경우 사용가능 \n✦ param25\n✦ 성장 : 전력으로 지침 변경 시 자신의 plusattack1 (최대 4회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "全力になった回数が1回以上の場合、使用可 \n✦ param25\n✦ 成長：全力になった時、自身のplusattack1（4回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrchina_campusfes", name: "Campus mode!!", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", releasedAt: "2025-01-09", jumpTime2: 8.4,
        item: {
            desc: "ゆるふわおしゃべり사용 시 \n✦ 턴 추가+1\n✦ 원기 1.5배\n✦ hpreduce2\n✦ inlesson1",
            desc_ja: "ゆるふわおしゃべり使用時、\n✦ ターン追加+1\n✦ 元気1.5倍\n✦ hpreduce2\n✦ inlesson1",
            referimage: ["logic-r2"]
        },
        itemplus: {
            desc: "ゆるふわおしゃべり사용 시 \n✦ 턴 추가+1\n✦ 원기 1.5배\n✦ inlesson1",
            desc_ja: "ゆるふわおしゃべり使用時、\n✦ ターン追加+1\n✦ 元気1.5倍\n✦ inlesson1",
            referimage: ["logic-r2"]
        },
        card: {
            name: "広がり続ける世界",
            desc: "hpreduce3\n✦ motivation4\n✦ 다음 턴, genki5\n✦ 마지막 턴 종료 시 원기의 130%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ motivation4\n✦ 次のターン、genki5\n✦ 最終ターンのターン終了時、元気の130%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce3\n✦ motivation6\n✦ 다음 턴, genki8\n✦ 마지막 턴 종료 시 원기의 130%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ motivation6\n✦ 次のターン、genki8\n✦ 最終ターンのターン終了時、元気の130%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrtsubame_campusfes", name: "Campus mode!!", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.5, releasedAt: "2025-12-26",
        item: {
            desc: "出演計画 사용 시 \n✦ use1\n✦ 제외패에 있는 ダークヒーローの誕生를 손패로 이동\n✦ goodcondition7\n✦ hpreduce3\n✦ inlesson1",
            desc_ja: "出演計画使用時、\n✦ use1\n✦ 除外にあるダークヒーローの誕生を手札に移動\n✦ goodcondition7\n✦ hpreduce3\n✦ inlesson1",
            referimage: ["sense-sr11"]
        },
        itemplus: {
            desc: "出演計画 사용 시 \n✦ use1\n✦ 제외패에 있는 ダークヒーローの誕生를 손패로 이동\n✦ goodcondition9\n✦ inlesson1",
            desc_ja: "出演計画使用時、\n✦ use1\n✦ 除外にあるダークヒーローの誕生を手札に移動\n✦ goodcondition9\n✦ inlesson1",
            referimage: ["sense-sr11"]
        },
        card: {
            name: "ダークヒーローの誕生",
            desc: "startingcard\n✦ 파라미터 상승량 증가 10%\n✦ 마지막 턴 종료 시 param30 (호조효과 2배 적용)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ パラメータ上昇量増加10%\n✦ 最終ターンのターン終了時、param30（好調効果を2倍適用） \n<span style = 'color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ 파라미터 상승량 증가 10%\n✦ 마지막 턴 종료 시 param50 (호조효과 2배 적용)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ パラメータ上昇量増加10%\n✦ 最終ターンのターン終了時、param50（好調効果を2倍適用） \n<span style = 'color:#8B8FD8'>nooverlab limit1",
        }
    },
    { id: "ssrsena_campusfes", name: "Campus mode!!", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.4, releasedAt: "2025-01-02" },
    {
        id: "ssrmisuzu_campusfes", name: "Campus mode!!", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2025-06-30",
        item: {
            desc: "ひなたぼっこ사용 시\n✦ motivation15\n✦ 파라미터 상승량 감소 75% (2턴)\n✦ 3턴 후, 파라미터 상승량 증가 50% (4턴)\n✦ inlesson1",
            desc_ja: "ひなたぼっこ使用時、\n✦ motivation15\n✦ パラメータ上昇量減少75%（2ターン）\n✦ 3ターン後、パラメータ上昇量増加50%（4ターン）\n✦ inlesson1",
            referimage: ["logic-sr12"]
        },
        itemplus: {
            desc: "ひなたぼっこ사용 시\n✦ motivation15\n✦ 파라미터 상승량 감소 50% (2턴)\n✦ 3턴 후, 파라미터 상승량 증가 50% (4턴)\n✦ inlesson1",
            desc_ja: "ひなたぼっこ使用時、\n✦ motivation15\n✦ パラメータ上昇量減少50%（2ターン）\n✦ 3ターン後、パラメータ上昇量増加50%（4ターン）\n✦ inlesson1",
            referimage: ["logic-sr12"]
        },
        card: {
            name: "憧れのアイドル",
            desc: "hpreduce2\n✦ motivation2\n✦ 다음 턴, genki3\n✦ 이후 직접효과로 원기가 30이상 증가할 경우 원기의 20%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce2\n✦ motivation2\n✦ 次のターン、genki3\n✦ 以降、直接効果で元気が30以上増加後、元気の20%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce2\n✦ motivation3\n✦ 다음 턴, genki3\n✦ 이후 직접효과로 원기가 30이상 증가할 경우 원기의 30%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce2\n✦ motivation3\n✦ 次のターン、genki3\n✦ 以降、直接効果で元気が30以上増加後、元気の30%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    { id: "ssrsaki_campusfes", name: "Campus mode!!", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.4, releasedAt: "2024-12-26" },
    { id: "ssrtemari_campusfes", name: "Campus mode!!", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2024-12-26" },
    {
        id: "ssrkotone_campusfes", name: "Campus mode!!", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2024-12-26",
        item: {
            desc: "思い出し笑い 사용 후\n✦ goodimpression2\n✦ use1\n✦ hpreduce2\n✦ inlesson3",
            desc_ja: "思い出し笑い使用後、\n✦ goodimpression2\n✦ use1\n✦ hpreduce2\n✦ inlesson3",
            referimage: ["logic-r9"]
        },
        itemplus: {
            desc: "思い出し笑い 사용 후\n✦ goodimpression3\n✦ use1\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "思い出し笑い使用後、\n✦ goodimpression3\n✦ use1\n✦ hpreduce1\n✦ inlesson3",
            referimage: ["logic-r9"]
        },
        card: {
            name: "自慢のお姉ちゃんだぞ",
            desc: "✦ 이후 남은 턴이 3턴 이내일 때 턴 종료 시, 호인상의 140%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降、残り3ターン以内のターン終了時、好印象の140%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 이후 남은 턴이 3턴 이내일 때 턴 종료 시, 호인상의 180%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降、残り3ターン以内のターン終了時、好印象の180%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrmao_campusfes", name: "Campus mode!!", osusume: "enthusiasm", rarity: "PSSR", plan: "anomaly", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2025-01-02",
        item: {
            name: "ボクの一部",
            desc: "スターライト사용 시 온존일 경우\n✦ draw1\n✦ 소비체력감소 1턴\n✦ スターライト의 파라미터치 증가+10\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "スターライト使用時、温存の場合、\n✦ draw1\n✦ 消費体力減少1ターン\n✦ スターライトのパラメータ値増加+10\n✦ hpreduce1\n✦ inlesson3",
            referimage: ["anomaly-r2"]
        },
        itemplus: {
            desc: "スターライト사용 시 온존일 경우\n✦ draw2\n✦ 소비체력감소 1턴\n✦ スターライト의 파라미터치 증가+10\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "スターライト使用時、温存の場合、\n✦ draw2\n✦ 消費体力減少1ターン\n✦ スターライトのパラメータ値増加+10\n✦ hpreduce1\n✦ inlesson3",
            referimage: ["anomaly-r2"]
        },
        card: {
            name: "手にした答え",
            desc: "✦ スターライト의 plusattack1 \n✦ 덱 혹은 버림패에 있는 スターライト+1장을 손패로 이동\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ スターライトのplusattack1 \n✦ 山札か捨札にあるスターライト+1枚を手札に移動\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 온존 2단계로 지침 변경\n✦ スターライト의 plusattack1 \n✦ 덱 혹은 버림패에 있는 スターライト+1장을 손패로 이동\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存2段階目に変更\n✦ スターライトのplusattack1 \n✦ 山札か捨札にあるスターライト+1枚を手札に移動\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrlilja_campusfes", name: "Campus mode!!", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 9.1, releasedAt: "2025-01-16" },
    {
        id: "ssrsumika_campusfes", name: "Campus mode!!", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2025-01-16",
        item: {
            desc: "リスタート사용 후 원기가 7이상인 경우\n✦ 호인상 1.5배\n✦ 다음 턴, 제외에 있는 また、飛べる를 손패로 이동\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "リスタート使用時、元気が7以上の場合、\n✦ 好印象1.5倍\n✦ 次のターン、除外にあるまた、飛べるを手札に移動\n✦ hpreduce2\n✦ inlesson2",
            referimage: ["logic-r6"]
        },
        itemplus: {
            desc: "リスタート사용 후 원기가 7이상인 경우\n✦ 호인상 1.5배\n✦ 다음 턴, 제외에 있는 また、飛べる를 손패로 이동\n✦ inlesson2",
            desc_ja: "リスタート使用時、元気が7以上の場合、\n✦ 好印象1.5倍\n✦ 次のターン、除外にあるまた、飛べるを手札に移動\n✦ inlesson2",
            referimage: ["logic-r6"]
        },
        card: {
            name: "また、飛べる",
            desc: "✦ genki1\n✦ goodimpression3\n use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki1\n✦ goodimpression3\n use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki2\n✦ goodimpression5\n use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2\n✦ goodimpression5\n use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrhiro_campusfes", name: "Campus mode!!", osusume: "motivation", rarity: "PSSR", plan: "logic", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", jumpTime2: 8.3, releasedAt: "2025-01-09",
        item: {
            desc: "えいえいおー사용 시、현재 체력이 50%이상인 경우、\n✦ motivation2\n✦ use1\n✦ 최대체력의 15%만큼 체력 소비\n✦ inlesson5",
            desc_ja: "えいえいおー使用時、体力が50%以上の場合、\n✦ motivation2\n✦ use1\n✦ 最大体力の15%分体力消費\n✦ inlesson5",
            referimage: ["logic-r7"]
        },
        itemplus: {
            desc: "えいえいおー사용 시、현재 체력이 50%이상인 경우、\n✦ motivation3\n✦ use1\n✦ 최대체력의 15%만큼 체력 소비\n✦ inlesson5",
            desc_ja: "えいえいおー使用時、体力が50%以上の場合、\n✦ motivation3\n✦ use1\n✦ 最大体力の15%分体力消費\n✦ inlesson5",
            referimage: ["logic-r7"]
        },
        card: {
            name: "エウレカ！",
            desc: "✦ use1\n✦ 이후 턴 개시 시 체력이 50%이하일 경우 원기의 30%만큼 파라미터 상승・최대체력의 5%만큼 체력 회복\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ use1\n✦ 以降、ターン開始時、体力が50%以下の場合、元気の30%分パラメータ上昇・最大体力の5%分体力回復\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ use1\n✦ 이후 턴 개시 시 체력이 50%이하일 경우 원기의 40%만큼 파라미터 상승・최대체력의 10%만큼 체력 회복\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ use1\n✦ 以降、ターン開始時、体力が50%以下の場合、元気の40%分パラメータ上昇・最大体力の10%分体力回復\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrume_campusfes", name: "Campus mode!!", osusume: "fullpower", rarity: "PSSR", plan: "anomaly", source: "limited_f", youtube_url: "https://youtu.be/l1T_2zCHTk0?si=m_wD7y2f5s_Jj1vl", releasedAt: "2025-01-09",
        item: {
            name: "叶える覚悟",
            desc: "ジャストアピール사용 후 보류에 있는 스킬카드가 1장 이상일 시\n✦ 온존으로 지침 변경\n✦ fullpower2\n✦ 보류에 있는 스킬카드의 plusattack1・코스트 수치 증가+2\n✦ inlesson1",
            desc_ja: "ジャストアピール使用後、保留にあるスキルカードが1枚以上の場合、\n✦ 温存に変更\n✦ fullpower2\n✦ 保留にあるスキルカードのplusattack1・コスト値増加+2\n✦ inlesson1",
            referimage: ["anomaly-r1"]
        },
        itemplus: {
            desc: "ジャストアピール사용 후 보류에 있는 스킬카드가 1장 이상일 시\n✦ 온존 2단계로 지침 변경\n✦ fullpower4\n✦ 보류에 있는 스킬카드의 plusattack1・코스트 수치 증가+1\n✦ inlesson1",
            desc_ja: "ジャストアピール使用後、保留にあるスキルカードが1枚以上の場合、\n✦ 温存2段階目に変更\n✦ fullpower4\n✦ 保留にあるスキルカードのplusattack1・コスト値増加+1\n✦ inlesson1",
            referimage: ["anomaly-r1"]
        },
        card: {
            name: "新たなステージ",
            desc: "✦ 덱이나 버림패에 있는 스킬 카드를 선택해 보류로 이동\n✦ fullpower1\n✦ use1\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 山札か捨札にあるスキルカードを選択し、保留に移動 \n✦ fullpower1\n✦ use1\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ 덱이나 버림패에 있는 스킬 카드를 선택해 보류로 이동\n✦ fullpower2\n✦ use1\n✦ 보류에 있는 스킬카드의 파라미터치 증가+5\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 山札か捨札にあるスキルカードを選択し、保留に移動 \n✦ fullpower2\n✦ use1\n✦ 保留にあるスキルカードのパラメータ値増加+5\n <span style='color:#8B8FD8'>nooverlab",
        },
    },
    {
        id: "ssrtemari_hiffes", name: "잡동사니 로드", name_ja: "ガラクタロード", name_en: "GARAKUTA ROAD", osusume: "motivation", rarity: "PSSR", youtube_url: "https://youtu.be/O9oCfxSJXTY?si=52fg2ny6E-8hIYe8", jumpTime2: 7.5, plan: "logic", source: "limited_f", releasedAt: "2026-05-16",
        item: {
            desc: "마지막 턴 개시 시\n✦ 레슨 중 소비한 원기의 75%만큼 원기 증가\n✦ draw2\n✦ hpreduce3\n✦ inlesson1",
            desc_ja: "最終ターンのターン開始時、\n✦ レッスン中に消費した元気の75%分元気増加\n✦ draw2\n✦ hpreduce3\n✦ inlesson1",
        },
        itemplus: {
            desc: "마지막 턴 개시 시\n✦ 레슨 중 소비한 원기의 75%만큼 원기 증가\n✦ draw2\n✦ hpreduce1\n✦ inlesson1",
            desc_ja: "最終ターンのターン開始時、\n✦ レッスン中に消費した元気の75%分元気増加\n✦ draw2\n✦ hpreduce1\n✦ inlesson1",
        },
        card: {
            name: "クールすぎるアイドル",
            desc: "✦ motivation4\n✦ 燃え盛る青い炎를 덱의 맨 처음으로 이동\n소비체력 증가 1턴\n✦ 재연 : 燃え盛る青い炎를 사용 후 자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation4\n✦ 燃え盛る青い炎を山札の上に移動\n消費体力増加1ターン\n✦ 再演 : 燃え盛る青い炎使用後、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>	nooverlab limit1",
        },
        cardplus: {
            desc: "✦ motivation5\n✦ 燃え盛る青い炎를 덱의 맨 처음으로 이동\n소비체력 증가 1턴\n✦ 재연 : 燃え盛る青い炎를 사용 후 자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation5\n✦ 燃え盛る青い炎を山札の上に移動\n消費体力増加1ターン\n✦ 再演 : 燃え盛る青い炎使用後、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>	nooverlab limit1",
        },
        cardsecond: {
            name: "燃え盛る青い炎",
            desc: "✦ genki15\n✦ motivation5\n✦ 마지막 턴 종료 시 원기의 150%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki15\n✦ motivation5\n✦ 最終ターンのターン終了時、元気の150%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardsecondplus: {
            desc: "✦ genki27\n✦ motivation5\n✦ 마지막 턴 종료 시 원기의 150%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki27\n✦ motivation5\n✦ 最終ターンのターン終了時、元気の150%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrrinami_hiffes", name: "잡동사니 로드", name_ja: "ガラクタロード", name_en: "GARAKUTA ROAD", osusume: "goodcondition", rarity: "PSSR", youtube_url: "https://youtu.be/O9oCfxSJXTY?si=52fg2ny6E-8hIYe8", jumpTime2: 7.6, plan: "sense", source: "limited_f", releasedAt: "2026-05-16",
        item: {
            desc: "호조가 8턴 이상인 경우 호조 카드를 4회 사용할 때마다\n✦ goodconditionz1\n✦ use1\n✦ draw1\n✦ hpreduce1\n✦ inlesson5",
            desc_ja: "好調が8ターン以上の場合、好調効果のスキルカードを4回使用するごとに、\n✦ goodconditionz1\n✦ use1\n✦ draw1\n✦ hpreduce1\n✦ inlesson5",
        },
        itemplus: {
            desc: "호조가 6턴 이상인 경우 호조 카드를 4회 사용할 때마다\n✦ goodconditionz1\n✦ use1\n✦ draw1\n✦ inlesson5",
            desc_ja: "好調が6ターン以上の場合、好調効果のスキルカードを4回使用するごとに、\n✦ goodconditionz1\n✦ use1\n✦ draw1\n✦ inlesson5",
        },
        card: {
            name: "お姉さんの感覚",
            desc: "hpreduce6\n호조가 4턴 이상인 경우\n✦ goodcondition4\n✦ 최대체력의 10%만큼 체력 회복\n✦ 재연 : 스킬카드 사용 후 손패에 自然体の魅力이 1장 이상일 경우 자신을 재사용 (최대 4회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n好調が4ターン以上の場合、使用可\n✦ goodcondition4\n✦ 最大体力の10%分体力回復\n✦ 再演：スキルカード使用後、手札にある自然体の魅力が1枚以上の場合、自身を再使用（4回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce6\n호조가 4턴 이상인 경우\n✦ goodcondition6\n✦ 최대체력의 10%만큼 체력 회복\n✦ 재연 : 스킬카드 사용 후 손패에 自然体の魅力이 1장 이상일 경우 자신을 재사용 (최대 4회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n好調が4ターン以上の場合、使用可\n✦ goodcondition6\n✦ 最大体力の10%分体力回復\n✦ 再演：スキルカード使用後、手札にある自然体の魅力が1枚以上の場合、自身を再使用（4回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>	nooverlab limit1",
        },
        cardsecond: {
            name: "自然体の魅力",
            desc: "conreduce5\n호조가 12턴 이상일 경우 사용 가능\n✦ 최대체력의 10%만큼 체력 회복\n✦ 현재 체력의 800% 만큼 파라미터 상승\n✦ 파라미터+2(레슨 중 사용한 카드 1장마다 파라미터 상승량+9)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "conreduce5\n好調が12ターン以上の場合、使用可\n✦ 最大体力の10%分体力回復\n✦ 体力の800%分パラメータ上昇\nパラメータ+2（レッスン中に使用したカード1枚につき、パラメータ上昇量+9）\n <span style='color:#8B8FD8'>	nooverlab limit1",
        },
        cardsecondplus: {
            desc: "conreduce5\n호조가 12턴 이상일 경우 사용 가능\n✦ 최대체력의 20%만큼 체력 회복\n✦ 현재 체력의 1000% 만큼 파라미터 상승\n✦ 파라미터+2(레슨 중 사용한 카드 1장마다 파라미터 상승량+14)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "conreduce5\n好調が12ターン以上の場合、使用可\n✦ 最大体力の20%分体力回復\n✦ 体力の1000%分パラメータ上昇\nパラメータ+2（レッスン中に使用したカード1枚につき、パラメータ上昇量+14）\n <span style='color:#8B8FD8'>　nooverlab limit1",
        }
    },
    {
        id: "ssrhiro_hiffes", name: "잡동사니 로드", name_ja: "ガラクタロード", name_en: "GARAKUTA ROAD", osusume: "concentration", rarity: "PSSR", youtube_url: "https://youtu.be/O9oCfxSJXTY?si=52fg2ny6E-8hIYe8", plan: "sense", jumpTime2: 8.3, source: "limited_f", releasedAt: "2026-05-26",
        item: {
            desc: "아이돌 고유 스킬카드 사용 후 현재 체력이 80% 이상인 경우\n✦ 소비체력 절감 1\n✦ use1\n✦ hpreduce2\n✦ inlesson3",
            desc_ja: "アイドル固有スキルカード使用後、体力が80%以上の場合、\n✦ 消費体力削減1\n✦ use1\n✦ hpreduce2\n✦ inlesson3",
        },
        itemplus: {
            desc: "아이돌 고유 스킬카드 사용 후 현재 체력이 80% 이상인 경우\n✦ 소비체력 절감 1\n✦ genki1\n✦ use1\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "アイドル固有スキルカード使用後、体力が80%以上の場合、\n✦ 消費体力削減1\n✦ genki1\n✦ use1\n✦ hpreduce1\n✦ inlesson3",
        },
        card: {
            name: "わたしだけの思い出",
            desc: "hpreduce5\nstartingcard\n✦ draw1\n✦ 집중강화 5%\n✦ 이후 2턴동안 턴 종료 시、concentration2\n✦ 재연 : 2턴마다 체력이 80%이상인 경우, 자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'> nooverlab limit1",
            desc_ja: "hpreduce5\nstartingcard\n✦ draw1\n✦ 集中強化5%\n✦ 以降の2ターンの間、ターン終了時、concentration2\n✦ 再演：2ターンごとに、体力が80%以上の場合、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>　nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce3\nstartingcard\n✦ draw1\n✦ 집중강화 5%\n✦ 이후 2턴동안 턴 종료 시、concentration2\n✦ 재연 : 2턴마다 체력이 80%이상인 경우,자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'> nooverlab limit1",
            desc_ja: "hpreduce3\nstartingcard\n✦ draw1\n✦ 集中強化5%\n✦ 以降の2ターンの間、ターン終了時、concentration2\n✦ 再演：2ターンごとに、体力が80%以上の場合、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>　nooverlab limit1",
        },
        cardsecond: {
            name: "あなたがくれた夢",
            desc: "hpreduce7\nstartingcard\n✦ 최대체력의 20%만큼 체력 회복\n✦ 집중 증가량 추가+2\n현재 체력이 80% 이상인 경우, use1\n <span style='color:#8B8FD8'> nooverlab",
            desc_ja: "hpreduce7\nstartingcard\n✦ 最大体力の20%分体力回復\n✦ 集中増加量追加+2\n体力が80%以上の場合、use1\n <span style='color:#8B8FD8'>	nooverlab",
        },
        cardsecondplus: {
            desc: "hpreduce4\nstartingcard\n✦ 최대체력의 20%만큼 체력 회복\n✦ 집중 증가량 추가+2\n현재 체력이 80% 이상인 경우, use1\n <span style='color:#8B8FD8'> nooverlab",
            desc_ja: "hpreduce4\nstartingcard\n✦ 最大体力の20%分体力回復\n✦ 集中増加量追加+2\n体力が80%以上の場合、スキルカード使用数追加+1\n <span style='color:#8B8FD8'>	nooverlab",
        }
    },
    {
        id: "ssrlilja_hiffes", name: "잡동사니 로드", name_ja: "ガラクタロード", name_en: "GARAKUTA ROAD", osusume: "motivation", rarity: "PSSR", youtube_url: "https://youtu.be/O9oCfxSJXTY?si=52fg2ny6E-8hIYe8", plan: "logic", jumpTime2: 7.6, source: "limited_f", releasedAt: "2026-06-05",
        item: {
            desc: "직접효과로 의욕이 5회 증가 시\n✦ genki10 (의욕효과 2배 적용)\n✦ hpreduce1\n✦ inlesson2",
            desc_ja: "直接効果でやる気が5回増加時、\n✦ genki10（やる気効果を2倍適用）\n✦ hpreduce1\n✦ inlesson2",
        },
        itemplus: {
            desc: "직접효과로 의욕이 5회 증가 시\n✦ genki15 (의욕효과 2배 적용)\n✦ inlesson2",
            desc_ja: "直接効果でやる気が5回増加時、\n✦ genki15（やる気効果を2倍適用）\n✦ inlesson2",
        },
        card: {
            name: "わたしを支える言葉",
            desc: "✦ motivation3\n✦ 의욕 증가량 추가+1 (2턴)\n다음 턴, draw1\n✦ 재연 : 직접효과로 의욕이 5회 증가할 경우, 자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation3\n✦ やる気増加量追加+1（2ターン）\n次のターン、draw1\n✦ 再演：直接効果でやる気が5回増加時、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ motivation3\n✦ 의욕 증가량 추가+1 (2턴)\n다음 턴, draw1\n✦ 재연 : 직접효과로 의욕이 5회 증가할 경우, 자신을 재사용 (최대 2회・턴 내 1회까지)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation3\n✦ やる気増加量追加+1（2ターン）\n次のターン、draw1\n✦ 再演：直接効果でやる気が5回増加時、自身を再使用（2回まで・ターン内1回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardsecond: {
            name: "理想に手が届く日まで",
            desc: "✦ motivation1\n✦ use1\n이동 시 효과 : 손패로 이동한 경우, \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ motivation1\n✦ use1\n移動時効果：手札に移動した時、\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardsecondplus: {
            desc: "✦ motivation3\n✦ use1\n이동 시 효과 : 손패로 이동한 경우, \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ motivation3\n✦ use1\n移動時効果：手札に移動した時、\n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab",
        }
    },

    // 한정 (Limited)
    { id: "ssrmao_summerdist", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", osusume: "concentration", releasedAt: "2024-07-01", rarity: "PSSR", plan: "sense", source: "dist", youtube_url: "https://youtu.be/Z-LWjF5J6Mw?si=iDZ_xMAwUs5PeSz6" },
    { id: "ssrrinami_summerlimited", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", osusume: "goodcondition", releasedAt: "2024-07-12", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 10.4, youtube_url: "https://youtu.be/Z-LWjF5J6Mw?si=iDZ_xMAwUs5PeSz6" },
    {
        id: "ssrsumika_summerlimited", name: "너와 세미블루", name_en: "Kimi to Semi Blue", name_ja: "キミトセミブルー", osusume: "motivation", releasedAt: "2024-07-01", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 10.2, youtube_url: "https://youtu.be/Z-LWjF5J6Mw?si=iDZ_xMAwUs5PeSz6",
        item: {
            desc: "액티브카드 사용 후 의욕이 12이상인 경우 \n✦ 의욕의 270%만큼 파라미터 상승\n✦ hpreduce2\n✦ inlesson4",
            desc_ja: "アクティブスキルカード使用後、やる気が12以上の場合、\n✦ やる気の270%分パラメータ上昇\n✦ hpreduce2\n✦ inlesson4",
        },
        itemplus: {
            desc: "액티브카드 사용 후 의욕이 12이상인 경우 \n✦ 의욕의 340%만큼 파라미터 상승\n✦ hpreduce2\n✦ inlesson4",
            desc_ja: "アクティブスキルカード使用後、やる気が12以上の場合、\n✦ やる気の340%分パラメータ上昇\n✦ hpreduce2\n✦ inlesson4",
        },
        card: {
            name: "昼下がりのそよ風",
            desc: "hpreduce3\n✦ motivation7 \n✦ 의욕이 6이상인 경우 motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ motivation7 \n✦ やる気が6以上の場合、motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "hpreduce3\n✦ motivation8 \n✦ 의욕이 6이상인 경우 motivation5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce3\n✦ motivation8 \n✦ やる気が6以上の場合、motivation5\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsaki_kanmuridist", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", osusume: "goodimpression", releasedAt: "2024-08-01", rarity: "PSSR", plan: "logic", source: "dist", youtube_url: "https://youtu.be/E8G7BMd2a7g?si=4Q4zuYDOCt5A0pK4",
        item: {
            name: "敗れ知らずのポイ",
            desc: "턴 개시 시 호인상이 6이상인 경우 \n✦ 체력 회복 4\n✦ inlesson2",
            desc_ja: "ターン開始時、好印象が6以上の場合、\n✦ 体力回復4\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 호인상이 6이상인 경우 \n✦ 체력 회복 5\n✦ inlesson2",
            desc_ja: "ターン開始時、好印象が6以上の場合、\n✦ 体力回復5\n✦ inlesson2",
        },
        card: {
            name: "金魚すくいで勝負",
            desc: "hpreduce2\n✦ goodimpression3 \n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce2\n✦ goodimpression3 \n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "hpreduce2\n✦ goodimpression5 \n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce2\n✦ goodimpression5 \n✦ use1\n✦ draw1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrkotone_kanmurilimited", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", osusume: "motivation", releasedAt: "2024-08-11", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 10.2, youtube_url: "https://youtu.be/E8G7BMd2a7g?si=4Q4zuYDOCt5A0pK4",
        item: {
            desc: "3턴마다 호인상이 6이상인 경우 \n✦ 호인상의 100%만큼 원기 증가\n✦ motivation1\n✦ hpreduce1\n✦ inlesson4",
            desc_ja: "3ターンごとに、好印象が6以上の場合、\n✦ 好印象の100%分元気増加\n✦ motivation1\n✦ hpreduce1\n✦ inlesson4",
        },
        itemplus: {
            desc: "3턴마다 호인상이 6이상인 경우 \n✦ 호인상의 100%만큼 원기 증가\n✦ motivation1\n✦ hpreduce1",
            desc_ja: "3ターンごとに、好印象が6以上の場合、\n✦ 好印象の100%分元気増加\n✦ motivation1\n✦ hpreduce1",
        },
        card: {
            name: "夏宵の線香花火",
            desc: "hpreduce4\nstartingcard\n✦ goodimpression3\n✦ motivation2 \n✦ 이후 원기효과의 스킬카드 사용 후 goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\nstartingcard\n✦ goodimpression3\n✦ motivation2 \n✦ 以降、元気効果のスキルカード使用後、goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce4\nstartingcard\n✦ goodimpression4\n✦ motivation3 \n✦ 이후 원기효과의 스킬카드 사용 후 goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\nstartingcard\n✦ goodimpression4\n✦ motivation3 \n✦ 以降、元気効果のスキルカード使用後、goodimpression1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrlilja_kanmurilimited", name: "관국", name_en: "Kamurogiku", name_ja: "冠菊", osusume: "goodcondition", rarity: "PSSR", releasedAt: "2024-08-01", plan: "sense", source: "limited", jumpTime2: 9.3, youtube_url: "https://youtu.be/E8G7BMd2a7g?si=4Q4zuYDOCt5A0pK4" },
    { id: "ssrchina_halloweendist", name: "가장광소곡", name_en: "Fancy dress party", name_ja: "仮装狂騒曲", osusume: "concentration", releasedAt: "2024-09-30", rarity: "PSSR", plan: "sense", source: "dist", youtube_url: "https://youtu.be/8YNzp2vRS9I?si=iI19xe6asn2wlShB" },
    {
        id: "ssrtemari_halloweenlimited", name: "가장광소곡", name_en: "Fancy dress party", jumpTime2: 10.3, name_ja: "仮装狂騒曲", osusume: "motivation", releasedAt: "2024-09-30", rarity: "PSSR", plan: "logic", source: "limited", youtube_url: "https://youtu.be/8YNzp2vRS9I?si=iI19xe6asn2wlShB",
        item: {
            desc: "3턴마다 호인상이 3이상인 경우\n✦ 원기의 90%만큼 파라미터 상승\n✦ 의욕의 160%만큼 파라미터 상승\n✦ 호인상 감소2\n✦ inlesson3",
            desc_ja: "3ターンごとに、好印象が3以上の場合、\n✦ 元気の90%分パラメータ上昇\n✦ やる気の160%分パラメータ上昇\n✦ 好印象減少2\n✦ inlesson3",
        },
        itemplus: {
            desc: "3턴마다 호인상이 3이상인 경우\n✦ 원기의 100%만큼 파라미터 상승\n✦ 의욕의 230%만큼 파라미터 상승\n✦ 호인상 감소2\n✦ inlesson3",
            desc_ja: "3ターンごとに、好印象が3以上の場合、\n✦ 元気の100%分パラメータ上昇\n✦ やる気の230%分パラメータ上昇\n✦ 好印象減少2\n✦ inlesson3",
        },
        card: {
            name: "悪戦苦闘ハンドメイド",
            desc: "hpreduce4\n✦ goodimpression4 \n✦ motivation4\n✦ 호인상이 3이상인 경우 use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ goodimpression4 \n✦ motivation4\n✦ 好印象が3以上の場合、use1\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "hpreduce4\n✦ goodimpression6 \n✦ motivation5\n✦ 호인상이 3이상인 경우 use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ goodimpression6 \n✦ motivation5\n✦ 好印象が3以上の場合、use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrhiro_halloweenlimited", name: "가장광소곡", name_en: "Fancy dress party", jumpTime2: 10.3, name_ja: "仮装狂騒曲", osusume: "goodcondition", rarity: "PSSR", releasedAt: "2024-10-08", plan: "sense", source: "limited", youtube_url: "https://youtu.be/8YNzp2vRS9I?si=iI19xe6asn2wlShB" },
    {
        id: "ssrkotone_christmasdist", name: "White Night! White Wish!", osusume: "motivation", rarity: "PSSR", plan: "logic", releasedAt: "2024-11-28", source: "dist", youtube_url: "https://youtu.be/MXWTuX-QC00?si=9SLS_nXFeHS0nAl_",
        item: {
            desc: "턴 개시 시 의욕이 5이상인 경우\n✦ genki4\n✦ inlesson2",
            desc_ja: "ターン開始時、やる気が5以上の場合、\n✦ genki4\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 의욕이 5이상인 경우\n✦ genki6\n✦ inlesson2",
            desc_ja: "ターン開始時、やる気が5以上の場合、\n✦ genki6\n✦ inlesson2",
        },
        card: {
            name: "メリクリで～す♪",
            desc: "✦ goodimpression3 \n✦ 이후 멘탈카드 사용 시 motivation1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression3 \n✦ 以降、メンタルスキルカード使用時、motivation1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ goodimpression5 \n✦ 이후 멘탈카드 사용 시 motivation1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression5 \n✦ 以降、メンタルスキルカード使用時、motivation1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    { id: "ssrume_christmaslimited", name: "White Night! White Wish!", osusume: "goodcondition", jumpTime2: 10.7, rarity: "PSSR", plan: "sense", source: "limited", releasedAt: "2024-11-28", youtube_url: "https://youtu.be/MXWTuX-QC00?si=9SLS_nXFeHS0nAl_" },
    {
        id: "ssrlilja_christmaslimited", name: "White Night! White Wish!", osusume: "motivation", jumpTime2: 10.7, rarity: "PSSR", releasedAt: "2024-12-09", plan: "logic", source: "limited", youtube_url: "https://youtu.be/MXWTuX-QC00?si=9SLS_nXFeHS0nAl_",
        item: {
            desc: "턴 개시 후 의욕이 5이상인 경우\n✦ 의욕 1.3배\n✦ draw1\n✦ hpreduce1\n✦ inlesson3",
            desc_ja: "ターン開始後、やる気が5以上の場合、\n✦ やる気1.3倍\n✦ draw1\n✦ hpreduce1\n✦ inlesson3",
        },
        itemplus: {
            desc: "턴 개시 후 의욕이 5이상인 경우\n✦ 의욕 1.3배\n✦ draw1\n✦ inlesson3",
            desc_ja: "ターン開始後、やる気が5以上の場合、\n✦ やる気1.3倍\n✦ draw1\n✦ inlesson3",
        },
        card: {
            name: "愛をこめて",
            desc: "✦ genki4 (의욕효과 1.8배 적용) \n✦ 의욕의 300%만큼 파라미터 상승 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki4（やる気効果を1.8倍適用）\n✦ やる気の300%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki6 (의욕효과 2배 적용) \n✦ 의욕의 400%만큼 파라미터 상승 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki6（やる気効果を2倍適用）\n✦ やる気の400%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrhiro_valentinedist", name: "해피 밀푀유", name_en: "happymillefeuille", osusume: "fullpower", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-01", rarity: "PSSR", plan: "anomaly", source: "dist", youtube_url: "https://youtu.be/AON5aAVG3QU?si=jjjTsAYWxnD3L_Wd",
        item: {
            name: "れんしゅーのしるし",
            desc: "전력효과의 스킬카드 사용 시 \n✦ genki10\n✦ inlesson1",
            desc_ja: "全力効果のスキルカード使用時、\n✦ genki10\n✦ inlesson1",
        },
        itemplus: {
            desc: "전력효과의 스킬카드 사용 시 \n✦ genki13\n✦ inlesson1",
            desc_ja: "全力効果のスキルカード使用時、\n✦ genki13\n✦ inlesson1",
        },
        card: {
            name: "がんばった、よ",
            desc: "✦ fullpower4 \n✦ 덱 혹은 버림패에 있는 스킬카드를 선택해 보류로 이동\n✦ 이후 턴 개시 시 지침이 전력인 경우, 모든 카드의 파라미터치 증가+2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower4 \n✦ 山札か捨札にあるスキルカードを選択し、保留に移動\n✦ 以降、ターン開始時、全力の場合、すべてのスキルカードのパラメータ値増加+2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ fullpower5 \n✦ 덱 혹은 버림패에 있는 스킬카드를 선택해 보류로 이동\n✦ 이후 턴 개시 시 지침이 전력인 경우, 모든 카드의 파라미터치 증가+2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower5 \n✦ 山札か捨札にあるスキルカードを選択し、保留に移動\n✦ 以降、ターン開始時、全力の場合、すべてのスキルカードのパラメータ値増加+2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrrinami_valentinelimited", name: "해피 밀푀유", name_en: "happymillefeuille", osusume: "enthusiasm", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-01", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 9.3, youtube_url: "https://youtu.be/AON5aAVG3QU?si=jjjTsAYWxnD3L_Wd",
        item: {
            name: "あまいくちどけ",
            desc: "턴 종료 시 지침이 강기인 경우\n✦ 온존으로 지침 변경\n✦ genki2\n✦ inlesson2",
            desc_ja: "ターン終了時、強気の場合、\n✦ 温存に変更\n✦ genki2\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 종료 시 지침이 강기인 경우\n✦ 온존으로 지침 변경\n✦ genki5\n✦ inlesson2",
            desc_ja: "ターン終了時、強気の場合、\n✦ 温存に変更\n✦ genki5\n✦ inlesson2",
        },
        card: {
            name: "受け取ってくれる？",
            desc: "✦ 온존으로 지침 변경 \n✦ 이후 강기효과의 스킬카드 사용 후 강기효과의 스킬카드의 파라미터치 증가+2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存に変更 \n✦ 以降、強気効果のスキルカード使用後、強気効果のスキルカードのパラメータ値増加+2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 온존으로 지침 변경 \n✦ 이후 강기효과의 스킬카드 사용 후 강기효과의 스킬카드의 파라미터치 증가+3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存に変更 \n✦ 以降、強気効果のスキルカード使用後、強気効果のスキルカードのパラメータ値増加+3\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsena_valentinelimited", name: "해피 밀푀유", name_en: "happymillefeuille", osusume: "motivation", name_ja: "ハッピーミルフィーユ", releasedAt: "2025-02-14", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 9.8, youtube_url: "https://youtu.be/AON5aAVG3QU?si=jjjTsAYWxnD3L_Wd",
        item: {
            desc: "액티브카드 사용 시 의욕이 8이상인 경우\n✦ genki2 (의욕효과 2.2배 적용)\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用時、やる気が8以上の場合、\n✦ genki2（やる気効果を2.2倍適用）\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: "액티브카드 사용 시 의욕이 8이상인 경우\n✦ genki2 (의욕효과 2.2배 적용)\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用時、やる気が8以上の場合、\n✦ genki2（やる気効果を2.2倍適用）\n✦ inlesson2",
        },
        card: {
            name: "あなたにあげる",
            desc: "✦ 이후 3턴 간 턴 종료 시, 원기의 60%만큼 파라미터 상승 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降の3ターン間、ターン終了時、元気の60%分パラメータ上昇 \n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 이후 3턴 간 턴 종료 시, 원기의 80%만큼 파라미터 상승 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降の3ターン間、ターン終了時、元気の80%分パラメータ上昇 \n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrtemari_yukidokenidist", name: "눈녹을 쯤에", name_en: "Yukidokeni", osusume: "enthusiasm", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-02-28", plan: "anomaly", source: "dist", youtube_url: "https://youtu.be/ZnUy-qYDhAo?si=6Awhdq0VlneX_z9s",
        item: {
            name: "勝利の1枚",
            desc: "턴 개시 시 지침이 강기인 경우\n✦ genki6\n✦ inlesson2",
            desc_ja: "ターン開始時、強気の場合、\n✦ genki6\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 지침이 강기인 경우\n✦ genki8\n✦ inlesson2",
            desc_ja: "ターン開始時、強気の場合、\n✦ genki8\n✦ inlesson2",
        },
        card: {
            name: "おてつき注意！",
            desc: "startingcard\n✦ 이후 5턴 간 턴 개시시, 지침이 강기가 아닌 경우 강기로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 以降の5ターンの間、ターンの開始時、非強気の場合、強気に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ 이후 5턴 간 턴 개시시, 지침이 강기가 아닌 경우 강기로 지침 변경\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 以降の5ターンの間、ターンの開始時、非強気の場合、強気に変更\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrchina_yukidokenilimited", name: "눈녹을 쯤에", name_en: "Yukidokeni", osusume: "goodimpression", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-02-28", plan: "logic", source: "limited", jumpTime2: 9.3, youtube_url: "https://youtu.be/ZnUy-qYDhAo?si=6Awhdq0VlneX_z9s",
        item: {
            desc: "스킬카드 코스트로 강화상태를 소비했을 때 호인상이 3이상인 경우,\n✦ goodimpression2\n✦ motivation1\n✦ hpreduce1\n✦ inlesson4",
            desc_ja: "スキルカードコストで強化状態を消費した時、好印象が3以上の場合、\n✦ goodimpression2\n✦ motivation1\n✦ hpreduce1\n✦ inlesson4",
        },
        itemplus: {
            desc: "스킬카드 코스트로 강화상태를 소비했을 때 호인상이 3이상인 경우,\n✦ goodimpression2\n✦ motivation1\n✦ inlesson4",
            desc_ja: "スキルカードコストで強化状態を消費した時、好印象が3以上の場合、\n✦ goodimpression2\n✦ motivation1\n✦ inlesson4",
        },
        card: {
            name: "ちいさなおひさま",
            desc: "의욕소비 1\n✦ goodimpression3\n✦ 다음 턴, draw1\n✦ 호인상이 10이상인 경우, 호인상의 140%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "やる気消費\n✦ goodimpression3\n✦ 次のターン、draw1\n✦ 好印象が10以上の場合、好印象の140%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "의욕소비 1\n✦ goodimpression3\n✦ 다음 턴, draw1\n✦ 호인상이 10이상인 경우, 호인상의 220%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "やる気消費\n✦ goodimpression3\n✦ 次のターン、draw1\n✦ 好印象が10以上の場合、好印象の220%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
    },
    {
        id: "ssrmao_yukidokenilimited", name: "눈녹을 쯤에", name_en: "Yukidokeni", osusume: "fullpower", name_ja: "雪解けに", rarity: "PSSR", releasedAt: "2025-03-10", plan: "anomaly", source: "limited", jumpTime2: 11.4, youtube_url: "https://youtu.be/ZnUy-qYDhAo?si=6Awhdq0VlneX_z9s",
        item: {
            desc: "전력으로 지침이 변경되었을 때 강기로 지침 변경된 횟수가 1회 이상인 경우\n✦ 전력효과 액티브카드의 파라미터치 증가+11\n✦ 다음 턴, 온존 2단계로 지침 변경\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "全力になった時、強気になった回数が1回以上の場合、\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+11\n✦ 次のターン、温存2段階目に変更\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: "전력으로 지침이 변경되었을 때 강기로 지침 변경된 횟수가 1회 이상인 경우\n✦ 전력효과 액티브카드의 파라미터치 증가+11\n✦ 다음 턴, 온존 2단계로 지침 변경\n✦ inlesson2",
            desc_ja: "全力になった時、強気になった回数が1回以上の場合、\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+11\n✦ 次のターン、温存2段階目に変更\n✦ inlesson2",
        },
        card: {
            name: "頬張る3色",
            desc: "✦ 강기로 지침 변경\n✦ fullpower5\n✦ 전력효과 액티브카드의 파라미터치 증가+2\n✦ 다음 턴, 온존으로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ fullpower5\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+2\n✦ 次のターン、温存に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ fullpower5\n✦ 전력효과 액티브카드의 파라미터치 증가+4\n✦ 다음 턴, 온존으로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ fullpower5\n✦ 全力効果のアクティブスキルカードのパラメータ値増加+4\n✦ 次のターン、温存に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrlilja_sakuradist", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", osusume: "fullpower", name_ja: "桜フォトグラフ", releasedAt: "2025-04-01", rarity: "PSSR", plan: "anomaly", source: "dist", youtube_url: "https://youtu.be/CcA49B2t7j4?si=gG3MWuAlBx7zQEBR",
        item: {
            desc: "턴 개시 시 레슨 중 누계 전력치가 5이상인 경우\n✦ genki6\n✦ inlesson2",
            desc_ja: "ターン開始時、このレッスン中累計全力値が5以上の場合、\n✦ genki6\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 레슨 중 누계 전력치가 5이상인 경우\n✦ genki8\n✦ inlesson2",
            desc_ja: "ターン開始時、このレッスン中累計全力値が5以上の場合、\n✦ genki8\n✦ inlesson2",
        },
        card: {
            name: "放課後おしゃべり",
            desc: "✦ fullpower2\n✦ 다음 턴, param8(누계 전력치의 300% 만큼 파라미터 상승량 증가)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower2\n✦ 次のターン、param8（累計全力値の300%分、パラメータ上昇量増加）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ fullpower5\n✦ 다음 턴, param8(누계 전력치의 300% 만큼 파라미터 상승량 증가)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower5\n✦ 次のターン、param8（累計全力値の300%分、パラメータ上昇量増加）\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrsumika_sakuralimited", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", osusume: "goodcondition", name_ja: "桜フォトグラフ", releasedAt: "2025-04-01", rarity: "PSSR", jumpTime2: 10.3, plan: "sense", source: "limited", youtube_url: "https://youtu.be/CcA49B2t7j4?si=gG3MWuAlBx7zQEBR",
        item: {
            desc: "집중이 8이상인 경우 스킬카드를 2회 사용할 때마다 \n✦ goodcondition3 \n✦ 집중 감소 1",
            desc_ja: "集中が8以上の場合、スキルカードを2回使用するごとに、\n✦ goodcondition3 \n✦ 集中減少1",
        },
        itemplus: {
            desc: "집중이 3이상인 경우 스킬카드를 2회 사용할 때마다 \n✦ goodcondition3 \n✦ 집중 감소 1",
            desc_ja: "集中が3以上の場合、スキルカードを2回使用するごとに、\n✦ goodcondition3 \n✦ 集中減少1",
        },
        card: {
            name: "ヒーローと出会い",
            desc: "✦ goodcondition4\n✦ concentration1 \n✦ 호조가 4이상인 경우 다음 턴, use1\n✦ 호조가 12이상인 경우 2턴 후, use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodcondition4\n✦ concentration1 \n✦ 好調が4ターン以上の場合、次のターン、use1\n✦ 好調が12ターン以上の場合、2ターン後、use1\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "✦ goodcondition4\n✦ concentration2 \n✦ 호조가 4이상인 경우 다음 턴, use1\n✦ 호조가 12이상인 경우 2턴 후, use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodcondition4\n✦ concentration2 \n✦ 好調が4ターン以上の場合、次のターン、use1\n✦ 好調が12ターン以上の場合、2ターン後、use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsaki_sakuralimited", name: "벚꽃 포토그래프", name_en: "Sakura Photograph", osusume: "fullpower", name_ja: "桜フォトグラフ", rarity: "PSSR", releasedAt: "2025-04-11", plan: "anomaly", jumpTime2: 11.4, source: "limited", youtube_url: "https://youtu.be/CcA49B2t7j4?si=gG3MWuAlBx7zQEBR",
        item: {
            desc: "턴 개시 후 지침이 전력일 경우\n✦ genki10\n✦ fullpower3\n✦ 손패 스킬카드의 파라미터치 증가+10\n✦ 다음 턴, 온존으로 지침 변경\n✦ hpreduce3\n✦ inlesson1",
            desc_ja: "ターン開始後、全力の場合、\n✦ genki10\n✦ fullpower3\n✦ 手札のパラメータ値増加+10\n✦ 次のターン、温存に変更\n✦ hpreduce3\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 후 지침이 전력일 경우\n✦ genki10\n✦ fullpower3\n✦ 손패 스킬카드의 파라미터치 증가+10\n✦ 다음 턴, 온존으로 지침 변경\n✦ inlesson1",
            desc_ja: "ターン開始後、全力の場合、\n✦ genki10\n✦ fullpower3\n✦ 手札のパラメータ値増加+10\n✦ 次のターン、温存に変更\n✦ inlesson1",
        },
        card: {
            name: "あの日、この場所で",
            desc: "hpreduce6\n✦ fullpower10\n✦ 덱 혹은 버림패에 있는 스킬카드를 선택해 보류로 이동\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n✦ fullpower10\n✦ 山札か捨札にあるスキルカードを選択し、保留に移動\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce4\n✦ fullpower10\n✦ 덱 혹은 버림패에 있는 스킬카드를 2장 선택해 보류로 이동\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ fullpower10\n✦ 山札か捨札にあるスキルカードを2枚選択し、保留に移動\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrrinami_howlingdist", name: "Howling over the World", osusume: "concentration", rarity: "PSSR", releasedAt: "2025-05-29", plan: "sense", source: "dist", youtube_url: "https://youtu.be/NBJ67a459u8?si=n1AX0T-I27T5_Jjz",
        item: {
            name: "世界を救ったマイク",
            desc: "집중효과의 스킬카드 사용 후\n✦ 소비 체력 감소 2턴\n✦ inlesson2",
            desc_ja: "集中効果のスキルカード使用後、\n✦ 消費体力減少2ターン\n✦ inlesson2",
        },
        itemplus: {
            desc: "집중효과의 스킬카드 사용 후\n✦ 소비 체력 감소 2턴\n✦ inlesson3",
            desc_ja: "集中効果のスキルカード使用後、\n✦ 消費体力減少2ターン\n✦ inlesson3",
        },
        card: {
            name: "希望が届くまで",
            desc: "✦ param7 (집중효과 2배 적용)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param7（集中効果を2倍適用）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ param17 (집중효과 2배 적용)\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param17（集中効果を2倍適用）\n✦ use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrchina_howlinglimited", name: "Howling over the World", osusume: "enthusiasm", rarity: "PSSR", releasedAt: "2025-05-29", plan: "anomaly", source: "limited", youtube_url: "https://youtu.be/NBJ67a459u8?si=n1AX0T-I27T5_Jjz",
        item: {
            desc: "직접효과로 지침이 강기로 변경 됐을 때 원기가 50이상일 경우 \n✦ 원기의 440% 만큼 파라미터를 상승시키고 원기를 전부 소모\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "直接効果で強気になった時、元気が50以上の場合、\n✦ 元気の440%分パラメータ上昇させ、元気を0にする\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: "직접효과로 지침이 강기로 변경 됐을 때 원기가 50이상일 경우 \n✦ 원기의 500% 만큼 파라미터를 상승시키고 원기를 전부 소모\n✦ inlesson2",
            desc_ja: "直接効果で強気になった時、元気が50以上の場合、\n✦ 元気の500%分パラメータ上昇させ、元気を0にする\n✦ inlesson2",
        },
        card: {
            name: "次こそは、必ず",
            desc: "hpreduce6\n✦ startingcard\n✦ 온존으로 지침 변경\n✦ 멘탈카드의 원기 수치 증가+8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n✦ startingcard\n✦ 温存に変更\n✦ メンタルスキルカードの元気値増加+8\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce6\n✦ startingcard\n✦ 온존으로 지침 변경\n✦ 멘탈카드의 원기 수치 증가+11\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce6\n✦ startingcard\n✦ 温存に変更\n✦ メンタルスキルカードの元気値増加+11\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrlilja_howlinglimited", name: "Howling over the World", osusume: "goodimpression", rarity: "PSSR", releasedAt: "2025-06-09", plan: "logic", source: "limited", jumpTime2: 7.3, youtube_url: "https://youtu.be/NBJ67a459u8?si=n1AX0T-I27T5_Jjz",
        item: {
            desc: "2턴마다 턴 종료 시 제외에 있는 스킬카드가 8장 이하일 경우, \n✦ 호인상 강화+70% (3턴)\n✦ hpreduce1",
            desc_ja: "2ターンごとのターン終了時、除外にあるスキルカードが8枚以下の場合、\n✦ 好印象強化+70%（3ターン）\n✦ hpreduce1",
        },
        itemplus: {
            desc: "2턴마다 턴 종료 시 제외에 있는 스킬카드가 8장 이하일 경우, \n✦ 호인상 강화+70% (3턴)",
            desc_ja: "2ターンごとのターン終了時、除外にあるスキルカードが8枚以下の場合、\n✦ 好印象強化+70%（3ターン）",
        },
        card: {
            name: "戦う理由",
            desc: "✦ genki2 \n✦ goodimpression3 \n✦ 호인상 1.1배\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ genki2 \n✦ goodimpression3 \n✦ 好印象1.1倍\n <span style='color:#8B8FD8'>nooverlab",

        },
        cardplus: {
            desc: "✦ genki3 \n✦ goodimpression4 \n✦ 호인상 1.1배\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ genki3 \n✦ goodimpression4 \n✦ 好印象1.1倍\n <span style='color:#8B8FD8'>nooverlab",
        },
    },
    {
        id: "ssrsumika_miracledist", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", osusume: "goodimpression", releasedAt: "2025-08-29", rarity: "PSSR", plan: "logic", source: "dist", youtube_url: "https://youtu.be/dp-x87l413o?si=Hv_16Q1XBERH5SNg",
        item: {
            desc: "2턴 마다\n✦ 체력 회복 3\n✦ goodimpression1\n✦ inlesson2",
            desc_ja: "2ターンごとに、\n✦ 体力回復3\n✦ goodimpression1\n✦ inlesson2",
        },
        itemplus: {
            desc: "2턴 마다\n✦ 체력 회복 3\n✦ goodimpression2\n✦ inlesson2",
            desc_ja: "2ターンごとに、\n✦ 体力回復3\n✦ goodimpression2\n✦ inlesson2",
        },
        card: {
            name: "爆盛れ最強ルック",
            desc: "✦ genki3 \n✦ goodimpression4 \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki3 \n✦ goodimpression4 \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "✦ genki3 \n✦ goodimpression6 \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki3 \n✦ goodimpression6 \n✦ motivation3\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrmao_miraclelimited", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", osusume: "motivation", releasedAt: "2025-08-29", rarity: "PSSR", plan: "logic", source: "limited", jumpTime2: 9.2, youtube_url: "https://youtu.be/dp-x87l413o?si=Hv_16Q1XBERH5SNg",
        item: {
            desc: "턴 개시 시\n✦ 의욕증가량 증가+50%\n✦ 다음 턴, genki2\n✦ hpreduce2\n✦ inlesson1",
            desc_ja: "ターン開始時、\n✦ やる気増加量増加+50%\n✦ 次のターン、genki2\n✦ hpreduce2\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시\n✦ 의욕증가량 증가+50%\n✦ 다음 턴, genki2\n✦ inlesson1",
            desc_ja: "ターン開始時、\n✦ やる気増加量増加+50%\n✦ 次のターン、genki2\n✦ inlesson1",
        },
        card: {
            name: "ドラマチックホリデー",
            desc: "✦ 이후 의욕이 6이상이고 액티브 카드를 2회 사용할 때마다 genki7 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降、やる気が6以上の場合、アクティブスキルカードを2回使用するごとに、genki7\n <span style='color:#8B8FD8'>nooverlab limit1",

        },
        cardplus: {
            desc: "✦ motivation3\n✦ 이후 의욕이 6이상이고 액티브 카드를 2회 사용할 때마다 genki8 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ motivation3\n✦ 以降、やる気が6以上の場合、アクティブスキルカードを2回使用するごとに、genki8\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrhiro_miraclelimited", name: "미라클 나나우(˚∀˚)!", name_en: "Mirakulu Na Now(ﾟ∀ﾟ)！", name_ja: "ミラクルナナウ(˚∀˚)!", osusume: "fullpower", rarity: "PSSR", releasedAt: "2025-09-08", plan: "anomaly", source: "limited", youtube_url: "https://youtu.be/dp-x87l413o?si=Hv_16Q1XBERH5SNg",
        item: {
            desc: "전력상태 해제 후 제외패에 でこれーとまじっく가 1매 이상일 경우\n✦ でこれーとまじっく를 보류로 이동\n✦ でこれーとまじっく의 전력치 증가+2・파라미터치 증가+5・체력소비 코스트 수치 증가+2\n✦ inlesson3",
            desc_ja: "全力を解除後、除外にあるでこれーとまじっくが1枚以上の場合、\n✦ でこれーとまじっくを保留に移動\n✦ でこれーとまじっくの全力値増加+2・パラメータ値増加+5・体力消費コスト値増加+2\n✦ inlesson3",
        },
        itemplus: {
            desc: "전력상태 해제 후 제외패에 でこれーとまじっく가 1매 이상일 경우\n✦ でこれーとまじっく를 보류로 이동\n✦ でこれーとまじっく의 전력치 증가+2・파라미터치 증가+12・체력소비 코스트 수치 증가+2\n✦ inlesson3",
            desc_ja: "全力を解除後、除外にあるでこれーとまじっくが1枚以上の場合、\n✦ でこれーとまじっくを保留に移動\n✦ でこれーとまじっくの全力値増加+2・パラメータ値増加+12・体力消費コスト値増加+2\n✦ inlesson3",
        },
        card: {
            name: "でこれーとまじっく",
            desc: "hpreduce1 \n✦ fullpower2\n✦ genki6\n✦ 누계 전력치의 100%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce1 \n✦ fullpower2\n✦ genki6\n✦ 累計全力値の100%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce1 \n✦ fullpower2\n✦ genki9\n✦ 누계 전력치의 150%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce1 \n✦ fullpower2\n✦ genki9\n✦ 累計全力値の150%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrsaki_gamusyaradist", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", osusume: "enthusiasm", releasedAt: "2025-09-29", rarity: "PSSR", plan: "anomaly", source: "dist", youtube_url: "https://youtu.be/RVazZ92UGL8?si=3CuzdLdv9TMvOY5H",
        item: {
            desc: "턴 개시 시 지침이 강기일 경우 \n✦ 온존으로 지침 변경\n✦ genki6\n✦ inlesson1",
            desc_ja: "ターン開始時、強気の場合、\n✦ 温存に変更\n✦ genki6\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 지침이 강기일 경우 \n✦ 온존으로 지침 변경\n✦ genki10\n✦ inlesson1",
            desc_ja: "ターン開始時、強気の場合、\n✦ 温存に変更\n✦ genki10\n✦ inlesson1",
        },
        card: {
            name: "泥臭くあれ！",
            desc: "✦ 강기로 지침 변경 \n✦ param10\n✦ genki5\n✦ 다음 턴, 온존으로 지침 변경\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터치 증가+4 (최대 4회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更 \n✦ param10\n✦ genki5\n✦ 次のターン、温存に変更\n✦ 成長：直接効果で強気になった時、自身のパラメータ値増加+4（4回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경 \n✦ param10\n✦ genki10\n✦ 다음 턴, 온존으로 지침 변경\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터치 증가+4 (최대 4회)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更 \n✦ param10\n✦ genki10\n✦ 次のターン、温存に変更\n✦ 成長：直接効果で強気になった時、自身のパラメータ値増加+4（4回まで）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrkotone_gamusyaralimited", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", osusume: "goodcondition", releasedAt: "2025-09-29", rarity: "PSSR", plan: "sense", source: "limited", youtube_url: "https://youtu.be/RVazZ92UGL8?si=3CuzdLdv9TMvOY5H",
        item: {
            desc: "액티브 카드 사용 후 절호조 상태일 경우, \n✦ use1\n✦ draw1\n✦ hpreduce1\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用後、絶好調状態の場合、\n✦ use1\n✦ draw1\n✦ hpreduce1\n✦ inlesson2",
        },
        itemplus: {
            desc: "액티브 카드 사용 후 절호조 상태일 경우, \n✦ use1\n✦ draw2\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用後、絶好調状態の場合、\n✦ use1\n✦ draw2\n✦ inlesson2",
        },
        card: {
            name: "かましちゃえ♪",
            desc: "✦ goodcondition2 \n✦ goodconditionz1\n✦ 절호조가 5턴 이상인 경우 호조의 350%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodcondition2 \n✦ goodconditionz1\n✦ 絶好調が5ターン以上の場合、好調の350%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ goodcondition3 \n✦ goodconditionz2\n✦ 절호조가 5턴 이상인 경우 호조의 350%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodcondition3 \n✦ goodconditionz2\n✦ 絶好調が5ターン以上の場合、好調の350%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
    },
    {
        id: "ssrtemari_gamusyaralimited", name: "닥치는 대로 가자!", name_en: "GAMUSHARA NI IKOU!", name_ja: "がむしゃらに行こう！", osusume: "goodimpression", releasedAt: "2025-10-10", rarity: "PSSR", plan: "logic", source: "limited", youtube_url: "https://youtu.be/RVazZ92UGL8?si=3CuzdLdv9TMvOY5H",
        item: {
            desc: "한 턴 내에 스킬카드를 2회 사용할 때마다\n✦ genki5\n✦ 호인상 증가량 증가+50% (1턴)\n✦ hpreduce1\n✦ inlesson2",
            desc_ja: "ターン内にスキルカードを2回使用するごとに、\n✦ genki5\n✦ 好印象増加量増加+50%（1ターン）\n✦ hpreduce1\n✦ inlesson2",
        },
        itemplus: {
            desc: "한 턴 내에 스킬카드를 2회 사용할 때마다\n✦ genki7\n✦ 호인상 증가량 증가+50% (1턴)\n✦ inlesson2",
            desc_ja: "ターン内にスキルカードを2回使用するごとに、\n✦ genki7\n✦ 好印象増加量増加+50%（1ターン）\n\n✦ inlesson2",
        },
        card: {
            name: "空まで一直線",
            desc: "✦ goodimpression3\n✦ 호인상 강화+20%\n✦ use1\n✦ 소비체력 증가 1턴\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodimpression3\n✦ 好印象強化+20%\n✦ use1\n✦ 消費体力増加1ターン\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ goodimpression4\n✦ 호인상 강화+20%\n✦ use1\n✦ 소비체력 증가 1턴\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodimpression4\n✦ 好印象強化+20%\n✦ use1\n✦ 消費体力増加1ターン\n <span style='color:#8B8FD8'>nooverlab",
        },
    },
    {
        id: "ssrmisuzu_endlessdist", name: "ENDLESS DANCE", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "dist", releasedAt: "2026-02-27", youtube_url: "https://youtu.be/j38KXTf08Rs?si=Axb5vfeKIrhRR9K7",
        item: {
            desc: "멘탈카드 사용 후 호인상이 6이상인 경우\n✦ genki1\n✦ goodimpression1\n✦ inlesson2",
            desc_ja: "メンタルスキルカード使用後、好印象が6以上の場合、\n✦ genki1\n✦ goodimpression1\n✦ inlesson2",
        },
        itemplus: {
            desc: "멘탈카드 사용 후 호인상이 6이상인 경우\n✦ genki1\n✦ goodimpression2\n✦ inlesson2",
            desc_ja: "メンタルスキルカード使用後、好印象が6以上の場合、\n✦ genki1\n✦ goodimpression2\n✦ inlesson2",
        },
        card: {
            name: "虜になあれ",
            desc: "✦ goodimpression3\n✦ 호인상강화+50% (5턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression3\n✦ 好印象強化+50% (5ターン)\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ goodimpression5\n✦ 호인상강화+50% (5턴)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression5\n✦ 好印象強化+50% (5ターン)\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrume_endlesslimited", name: "ENDLESS DANCE", osusume: "concentration", rarity: "PSSR", plan: "sense", source: "limited", jumpTime2: 7.4, releasedAt: "2026-02-27", youtube_url: "https://youtu.be/j38KXTf08Rs?si=Axb5vfeKIrhRR9K7",
        item: {
            desc: "집중효과의 스킬카드를 3회 사용할 때마다\n✦ 제외패에 있는 스킬카드 2장 당 concentration1",
            desc_ja: "集中効果のスキルカードを3回使用するごとに、\n✦ 除外にあるスキルカード2枚につきconcentration1",
        },
        itemplus: {
            desc: "집중효과의 스킬카드를 3회 사용할 때마다\n✦ 제외패에 있는 스킬카드 2장 당 concentration1\n✦ genki2",
            desc_ja: "集中効果のスキルカードを3回使用するごとに、\n✦ 除外にあるスキルカード2枚につきconcentration1\n✦ genki2",
        },
        card: {
            name: "狂い咲け！",
            desc: "✦ concentration1\n✦ use1\n✦ 제외패에 있는 스킬카드가 4장 이상인 경우 param5\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ concentration1\n✦ use1\n✦ 除外にあるスキルカードが4枚以上にの場合、param5\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ concentration3\n✦ use1\n✦ 제외패에 있는 스킬카드가 4장 이상인 경우 param5\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ concentration3\n✦ use1\n✦ 除外にあるスキルカードが4枚以上にの場合、param5\n <span style='color:#8B8FD8'>nooverlab",
        }
    },
    {
        id: "ssrsena_endlesslimited", name: "ENDLESS DANCE", osusume: "enthusiasm", rarity: "PSSR", plan: "anomaly", source: "limited", jumpTime2: 7.3, releasedAt: "2026-03-09", youtube_url: "https://youtu.be/j38KXTf08Rs?si=Axb5vfeKIrhRR9K7",
        item: {
            desc: "직접효과로 강기가 되었을 때 전력치가 5이상일 경우,\n✦ genki4\n✦ 액티브 스킬카드의 파라미터치 증가+3\n✦ 전력치 감소2\n✦ 다음 턴, draw1",
            desc_ja: "直接効果で強気にになった時、全力値が5以上に場合、\n✦ genki4\n✦ アクティブスキルカードのパラメータ値増加+3\n✦ 全力値減少2\n✦ 次のターン、draw1",
        },
        itemplus: {
            desc: "직접효과로 강기가 되었을 때 전력치가 5이상일 경우,\n✦ genki6\n✦ 액티브 스킬카드의 파라미터치 증가+3\n✦ 전력치 감소2\n✦ 다음 턴, draw1",
            desc_ja: "直接効果で強気にになった時、全力値が5以上に場合、\n✦ genki6\n✦ アクティブスキルカードのパラメータ値増加+3\n✦ 全力値減少2\n✦ 次のターン、draw1",
        },
        card: {
            name: "踊り狂え！",
            desc: "✦ 강기로 지침 변경\n✦ param2\n✦ genki2\n✦ fullpower2\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터치 증가+2・원기 수치 증가+1\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param2\n✦ genki2\n✦ fullpower2\n✦ 成長：直接効果で強気になった時、自身のパラメータ値増加+2・元気値増加+1\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ param2 (2회)\n✦ genki2\n✦ fullpower2\n✦ 성장 : 직접효과로 강기가 되었을 때 자신의 파라미터치 증가+2・원기 수치 증가+1\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param2（2回）\n✦ genki2\n✦ fullpower2\n✦ 成長：直接効果で強気になった時、自身のパラメータ値増加+2・元気値増加+1\n <span style='color:#8B8FD8'>nooverlab",
        }
    },


    // 유닛 (unit)
    {
        id: "ssrsena_starmineunit", name: "Star-mine", osusume: "fullpower", rarity: "PSSR", plan: "anomaly", source: "limited_u", jumpTime2: 10.6, releasedAt: "2025-07-31", youtube_url: "https://youtu.be/BLkCR5h_Sv4?si=_4ic9SB8p_Ze-2aQ",
        item: {
            desc: "지침이 전력일 경우, 한 턴 내 스킬카드를 3회 사용할 때마다 \n✦ 전력치 증가량 증가+50% (1턴)\n✦ hpreduce1\n✦ 다음 턴, 온존 2단계로 지침 변경",
            desc_ja: "全力の場合、ターン内にスキルカードを3回使用するごとに、\n✦ 全力値増加量増加+50%（1ターン）\n✦ hpreduce1\n✦ 次のターン、温存2段階目に変更",
        },
        itemplus: {
            desc: "지침이 전력일 경우, 한 턴 내 스킬카드를 3회 사용할 때마다 \n✦ 전력치 증가량 증가+50% (1턴)\n✦ 다음 턴, 온존 2단계로 지침 변경",
            desc_ja: "全力の場合、ターン内にスキルカードを3回使用するごとに、\n✦ 全力値増加量増加+50%（1ターン）\n✦ 次のターン、温存2段階目に変更",
        },
        card: {
            name: "待ち望んだ瞬間",
            desc: "✦ 온존 2단계로 지침 변경\n✦ 이후 직접효과로 전력치가 증가 후 온존일 경우 fullpower1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存2段階目に変更\n✦ 以降、直接効果で全力値が増加後、温存の場合、fullpower1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 온존 2단계로 지침 변경\n✦ 이후 직접효과로 전력치가 증가 후 온존일 경우 fullpower1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存2段階目に変更\n✦ 以降、直接効果で全力値が増加後、温存の場合、fullpower1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrume_starmineunit", name: "Star-mine", osusume: "goodimpression", rarity: "PSSR", plan: "logic", source: "limited_u", jumpTime2: 10.4, releasedAt: "2025-07-31", youtube_url: "https://youtu.be/BLkCR5h_Sv4?si=_4ic9SB8p_Ze-2aQ",
        item: {
            desc: "멘탈카드 사용 후 원기가 30이상일 경우 \n✦ 원기의 50%만큼 호인상 증가\n✦ goodimpression2\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、元気が30以上の場合、\n✦ 元気の50%分好印象増加\n✦ goodimpression2\n✦ inlesson1",
        },
        itemplus: {
            desc: "멘탈카드 사용 후 원기가 30이상일 경우 \n✦ 원기의 50%만큼 호인상 증가\n✦ goodimpression5\n✦ inlesson1",
            desc_ja: "メンタルスキルカード使用後、元気が30以上の場合、\n✦ 元気の50%分好印象増加\n✦ goodimpression5\n✦ inlesson1",
        },
        card: {
            name: "つかみ取った未来",
            desc: "✦ genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+5)\n✦ goodimpression2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+5）\n✦ goodimpression2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki2 (레슨 중 사용한 스킬카드 1장 당 원기 증가량+8)\n✦ goodimpression2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki2（レッスン中に使用したスキルカード1枚につき、元気増加量+8）\n✦ goodimpression2\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrmisuzu_starmineunit", name: "Star-mine", osusume: "goodcondition", rarity: "PSSR", plan: "sense", source: "limited_u", jumpTime2: 11.0, releasedAt: "2025-07-31", youtube_url: "https://youtu.be/BLkCR5h_Sv4?si=_4ic9SB8p_Ze-2aQ",
        item: {
            name: "夜闇の星",
            desc: "4번째 턴 개시 시 \n✦ 호조 증가량 증가+50% (4턴)\n✦ inlesson1",
            desc_ja: "4ターン目開始時、\n✦ 好調増加量増加+50%（4ターン）\n✦ inlesson1",
        },
        itemplus: {
            desc: "4번째 턴 개시 시 \n✦ 호조 증가량 증가+50% (5턴)\n✦ inlesson1",
            desc_ja: "4ターン目開始時、\n✦ 好調増加量増加+50%（5ターン）\n✦ inlesson1",
        },
        card: {
            name: "朝が満たすまで",
            desc: "✦ 호조소비 2턴\n✦ concentration3\n✦ 3턴 후, 호조 5턴\n✦ 4턴 후, use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調消費2ターン\n✦ concentration3\n✦ 3ターン後、好調5ターン\n✦ 4ターン後、use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 호조소비 2턴\n✦ concentration5\n✦ 3턴 후, 호조 7턴\n✦ 4턴 후, use1\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 好調消費2ターン\n✦ concentration5\n✦ 3ターン後、好調7ターン\n✦ 4ターン後、use1\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrsaki_ameagariunit", name: "비 갠 뒤의 아이리스", name_en: "Ameagari no Iris", name_ja: "雨上がりのアイリス", osusume: "motivation", rarity: "PSSR", releasedAt: "2025-05-01", plan: "logic", source: "limited_u", jumpTime2: 10.1, youtube_url: "https://youtu.be/SPXHpau0jJI?si=oODrMuHOaMtcjNzu",
        item: {
            desc: "턴 개시 시 \n✦ motivation9\n✦ hpreduce4\n✦ 3턴 후 불안 5턴\n✦ inlesson1",
            desc_ja: "ターン開始時、\n✦ motivation9\n✦ hpreduce4\n✦ 3ターン後、不安5ターン\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 \n✦ motivation10\n✦ hpreduce3\n✦ 3턴 후 불안 5턴\n✦ inlesson1",
            desc_ja: "ターン開始時、\n✦ motivation10\n✦ hpreduce3\n✦ 3ターン後、不安5ターン\n✦ inlesson1",
        },
        card: {
            name: "わたしらしい色",
            desc: "✦ 의욕 1.5배 \n✦ 저하상태 회복1 \n✦ 다음 턴, genki4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ やる気1.5倍\n✦ 低下状態回復1\n✦ 次のターン、genki4\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 의욕 1.5배 \n✦ 저하상태 회복2 \n✦ 다음 턴, genki8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ やる気1.5倍\n✦ 低下状態回復2\n✦ 次のターン、genki8\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
    },
    {
        id: "ssrtemari_ameagariunit", name: "비 갠 뒤의 아이리스", name_en: "Ameagari no Iris", name_ja: "雨上がりのアイリス", osusume: "goodcondition", rarity: "PSSR", releasedAt: "2025-05-01", plan: "sense", source: "limited_u", jumpTime2: 10.2, youtube_url: "https://youtu.be/SPXHpau0jJI?si=oODrMuHOaMtcjNzu",
        item: {
            name: "雨上がりの女神",
            desc: "턴 개시 시\n✦ use1\n✦ genki5\n✦ 졸음 카드를 덱의 맨 위에 생성\n✦ inlesson5",
            desc_ja: "ターン開始時、\n✦ use1\n✦ genki5\n✦ 眠きを山札の1番上に生成\n✦ inlesson5",
        },
        itemplus: {
            desc: "턴 개시 시\n✦ use1\n✦ genki6\n✦ 졸음 카드를 덱의 맨 위에 생성\n✦ inlesson5",
            desc_ja: "ターン開始時、\n✦ use1\n✦ genki6\n✦ 眠きを山札の1番上に生成\n✦ inlesson5",
        },
        card: {
            name: "希望が届くまで",
            desc: "✦ 以降、スキルカードが除外に移動した時、goodcondition2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降、スキルカードが除外に移動した時、goodcondition2\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 以降、スキルカードが除外に移動した時、goodcondition2\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降、スキルカードが除外に移動した時、goodcondition2\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrkotone_ameagariunit", name: "비 갠 뒤의 아이리스", name_en: "Ameagari no Iris", name_ja: "雨上がりのアイリス", osusume: "enthusiasm", rarity: "PSSR", releasedAt: "2025-05-01", plan: "anomaly", source: "limited_u", jumpTime2: 9.4, youtube_url: "https://youtu.be/SPXHpau0jJI?si=oODrMuHOaMtcjNzu",
        item: {
            desc: "멘탈카드 사용 후 지침이 온존 2단계인 경우\n✦ hpreduce1\n✦ netsui4\n✦ inlesson4",
            desc_ja: "メンタルスキルカード使用後、温存2段階目の場合、\n✦ hpreduce1\n✦ netsui4\n✦ inlesson4",
        },
        itemplus: {
            desc: "멘탈카드 사용 후 지침이 온존 2단계인 경우\n✦ netsui4\n✦ inlesson4",
            desc_ja: "メンタルスキルカード使用後、温存2段階目の場合、\n✦ netsui4\n✦ inlesson4",
        },
        card: {
            name: "あたらしい光",
            desc: "✦ 온존 2단계로 지침 변경\n✦ netsui5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存2段階目に変更\n✦ netsui5\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 온존 2단계로 지침 변경\n✦ netsui8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 温存2段階目に変更\n✦ netsui8\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrchina_michinaruunit", name: "미지로 펼쳐지는", name_en: "Unknown Unbound", name_ja: "みちなるひろがる", osusume: "concentration", releasedAt: "2026-01-27", rarity: "PSSR", plan: "sense", source: "limited_u", jumpTime2: 8.2, youtube_url: "https://youtu.be/qwfpgEhngVI?si=VRd8V2lIVDiOGYgO",
        item: {
            desc: "스킬카드 코스트로 강화상태를 소비했을 때 호조가 3턴 이상인 경우\n✦ concentration2\n✦ 다음 턴, draw1\n✦ 호조소비 1",
            desc_ja: "スキルカードコストで強化状態を消費した時、好調が3ターン以上の場合、\n✦ concentration2\n✦ 次のターン、draw1\n✦ 好調消費1",
        },
        itemplus: {
            desc: "스킬카드 코스트로 강화상태를 소비했을 때 호조가 3턴 이상인 경우\n✦ concentration2\n✦ 다음 턴, draw2\n✦ 호조소비 1",
            desc_ja: "スキルカードコストで強化状態を消費した時、好調が3ターン以上の場合、\n✦ concentration2\n✦ 次のターン、draw2\n✦ 好調消費1",
        },
        card: {
            name: "どきどきはそのまま",
            desc: "호조소비 2턴\n✦ concentration2\n✦ 집중이 2이상인 경우 param40 (집중효과의 5배 적용)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "好調消費2ターン\n✦ concentration2\n✦ 集中が2以上の場合、param40（集中効果を5倍適用）\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "호조소비 2턴\n✦ concentration2\n✦ 집중이 2이상인 경우 param67 (집중효과의 5.5배 적용)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "好調消費2ターン\n✦ concentration2\n✦ 集中が2以上の場合、param67（集中効果を5.5倍適用）\n <span style='color:#8B8FD8'>nooverlab"
        }
    },
    {
        id: "ssrhiro_michinaruunit", name: "미지로 펼쳐지는", name_en: "Unknown Unbound", name_ja: "みちなるひろがる", osusume: "goodimpression", releasedAt: "2026-01-27", rarity: "PSSR", plan: "logic", source: "limited_u", jumpTime2: 8.3, youtube_url: "https://youtu.be/qwfpgEhngVI?si=VRd8V2lIVDiOGYgO",
        item: {
            desc: "lessonstart\n✦ genki7\n✦ motivation4\n✦ 최대체력의 80%만큼 체력 소비 \n✦ 이후 스킬카드 코스트로 강화상태를 소비한 경우 최대체력의 20%만큼 체력 회복・호인상 강화+10%\n✦ inlesson1",
            desc_ja: "lessonstart\n✦ genki7\n✦ motivation4\n✦ 最大体力の80%分体力消費 \n✦ 以降、スキルカードコストで強化状態を消費した時、最大体力の20%分体力回復・好印象強化+10%\n✦ inlesson1",
        },
        itemplus: {
            desc: "lessonstart\n✦ genki7\n✦ motivation4\n✦ 최대체력의 80%만큼 체력 소비 \n✦ 이후 스킬카드 코스트로 강화상태를 소비한 경우 최대체력의 20%만큼 체력 회복・호인상 강화+10%\n✦ inlesson1",
            desc_ja: "lessonstart\n✦ genki8\n✦ motivation5\n✦ 最大体力の80%分体力消費 \n✦ 以降、スキルカードコストで強化状態を消費した時、最大体力の20%分体力回復・好印象強化+10%\n✦ inlesson1",
        },
        card: {
            name: "心が跳ねるままに",
            desc: "의욕소비 2✦ goodimpression1\n✦ 다음 턴, draw2\n✦ 현재 체력이 50% 이상인 경우 goodimpression1\n✦ 현재 체력이 80% 이상인 경우 goodimpression2\n✦ 현재 체력이 100%인 경우 호인상의 220%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "やる気消費2✦ goodimpression1\n✦ 次のターン、draw2\n✦ 体力が50%以上の場合、goodimpression1\n✦ 体力が80%以上の場合、goodimpression2\n✦ 体力が100%の場合、好印象の220%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "의욕소비 2✦ goodimpression1\n✦ 다음 턴, draw2\n✦ 현재 체력이 50% 이상인 경우 goodimpression1\n✦ 현재 체력이 80% 이상인 경우 goodimpression2\n✦ 현재 체력이 100%인 경우 호인상의 320%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "やる気消費2✦ goodimpression1\n✦ 次のターン、draw2\n✦ 体力が50%以上の場合、goodimpression1\n✦ 体力が80%以上の場合、goodimpression2\n✦ 体力が100%の場合、好印象の320%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        }
    },
    {
        id: "ssrlilja_dokimekiunit", name: "두근두근 이모션", name_en: "Tokimeki Emotion", name_ja: "どきめきエモーション", osusume: "goodcondition", releasedAt: "2026-04-01", rarity: "PSSR", plan: "sense", source: "limited_u", jumpTime2: 8.3, youtube_url: "https://youtu.be/QulHtowM_6o?si=Benh9o2SxRGcRtG-",
        item: {
            desc: "직접효과로 호조가 7이상 증가했을 시 집중이 13이상인 경우,\n✦ 집중의 75%만큼 호조를 증가시키고 집중을 절반으로 감소\n✦ goodconditionz1\n✦ genki2",
            desc_ja: "直接効果で好調が7以上増加後、集中が13以上の場合、\n✦ 集中の75%分好調増加させ、集中を半分にする\n✦ goodconditionz1\n✦ genki2",
        },
        itemplus: {
            desc: "직접효과로 호조가 7이상 증가했을 시 집중이 13이상인 경우,\n✦ 집중의 75%만큼 호조를 증가시키고 집중을 절반으로 감소\n✦ goodconditionz2\n✦ genki2",
            desc_ja: "直接効果で好調が7以上増加後、集中が13以上の場合、\n✦ 集中の75%分好調増加させ、集中を半分にする\n✦ goodconditionz2\n✦ genki2",
        },
        card: {
            name: "いつかあなたの隣で",
            desc: "✦ goodcondition7\n✦ 다음 턴, 호조 100%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodcondition7\n✦ 次のターン、好調の100%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ goodcondition7\n✦ 다음 턴, 호조 100%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ goodcondition7\n✦ 次のターン、好調の100%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab",
        }
    },
    {
        id: "ssrsumika_dokimekiunit", name: "두근두근 이모션", name_en: "Tokimeki Emotion", name_ja: "どきめきエモーション", osusume: "enthusiasm", releasedAt: "2026-04-01", rarity: "PSSR", plan: "anomaly", source: "limited_u", jumpTime2: 8.3, youtube_url: "https://youtu.be/QulHtowM_6o?si=Benh9o2SxRGcRtG-",
        item: {
            desc: "턴 종료 시 레슨 중 누계 전력치가 13이상인 경우\n✦ いつもあなたの隣で의 plusattack1\n✦ hpreduce1\n✦ 다음 턴, いつもあなたの隣で를 손패로 이동\n✦ inlesson2",
            desc_ja: "ターン終了時、このレッスン中累計全力値が13以上の場合、\n✦ いつもあなたの隣でのplusattack1\n✦ hpreduce1\n✦ 次のターン、いつもあなたの隣でを手札に移動\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 종료 시 레슨 중 누계 전력치가 13이상인 경우\n✦ いつもあなたの隣で의 plusattack1\n✦ 다음 턴, いつもあなたの隣で를 손패로 이동\n✦ inlesson2",
            desc_ja: "ターン終了時、このレッスン中累計全力値が13以上の場合、\n✦ いつもあなたの隣でのplusattack1\n✦ 次のターン、いつもあなたの隣でを手札に移動\n✦ inlesson2",
        },
        card: {
            name: "いつもあなたの隣で",
            desc: "✦ 강기로 지침 변경\n✦ param7\n✦ genki7 \n✦ 성장 : 직접효과로 온존이 되었을 시 자신의 파라미터 증가치+7 (최대 2회)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param7\n✦ genki7 \n✦　成長：直接効果で温存になった時、自身のパラメータ増加値+7（2回まで）\n <span style='color:#8B8FD8'>nooverlab",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ param7\n✦ genki7 \n✦ 성장 : 직접효과로 온존이 되었을 시 자신의 파라미터 증가치+7 (최대 2회)\n <span style='color:#8B8FD8'>nooverlab",
            desc_ja: "✦ 強気に変更\n✦ param7\n✦ genki7 \n✦　成長：直接効果で温存になった時、自身のパラメータ増加値+7（2回まで）\n <span style='color:#8B8FD8'>nooverlab",
        }
    },
    {
        id: "ssrmao_sugarunit", name: "SUGAR FLAVOR", osusume: "goodcondition", releasedAt: "2026-06-15", rarity: "PSSR", plan: "sense", source: "limited_u", jumpTime2: 9.1, youtube_url: "https://youtu.be/z2WzTPOIWkE?si=IeVc4KvH4bf1ij8N",
        item: {
            desc: "호조가 5턴 이상인 경우 멘탈 스킬 사용 시 3회마다 \n✦ goodcondition3\n✦ goodconditionz1\n✦ inlesson3",
            desc_ja: "好調が5ターン以上の場合、メンタルスキルカード使用後3回ごとに、\n✦ goodcondition3\n✦ goodconditionz1\n✦ inlesson3",
        },
        itemplus: {
            desc: "호조가 5턴 이상인 경우 멘탈 스킬 사용 시 3회마다 \n✦ goodcondition3\n✦ goodconditionz1\n✦ genki3\n✦ inlesson3",
            desc_ja: "好調が5ターン以上の場合、メンタルスキルカード使用後3回ごとに、\n✦ goodcondition3\n✦ goodconditionz1\n✦ genki3\n✦ inlesson3",
        },
        card: {
            name: "奪われる心",
            desc: "✦ 이후 3회까지 액티브 스킬카드 사용 2회마다 호조의 150%만큼 파라미터 증가 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降3回まで、アクティブスキルカード使用時2回ごとに、好調の150%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 이후 3회까지 액티브 스킬카드 사용 2회마다 호조의 200%만큼 파라미터 증가 \n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 以降3回まで、アクティブスキルカード使用時2回ごとに、好調の200%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "ssrrinami_sugarunit", name: "SUGAR FLAVOR", osusume: "enthusiasm", releasedAt: "2026-06-15", rarity: "PSSR", plan: "anomaly", source: "limited_u", jumpTime2: 9.1, youtube_url: "https://youtu.be/z2WzTPOIWkE?si=IeVc4KvH4bf1ij8N",
        item: {
            desc: "액티브 사용 시 강기로 변경된 횟수가 4회 이상일 경우, \n✦ 강기로 지침 변경\n✦ 열의 추가+3 (1턴)",
            desc_ja: "アクティブスキルカード使用時、強気になった回数が4回以上の場合、\n✦ 強気に変更\n✦ 熱意追加+3（1ターン）",
        },
        itemplus: {
            desc: "액티브 사용 시 강기로 변경된 횟수가 3회 이상일 경우, \n✦ 강기로 지침 변경\n✦ 열의 추가+3 (1턴)",
            desc_ja: "アクティブスキルカード使用時、強気になった回数が3回以上の場合、\n✦ 強気に変更\n✦ 熱意追加+3（1ターン）",
        },
        card: {
            name: "甘く溶ける心",
            desc: "✦ 강기로 지침 변경\n✦ draw1\n✦ 이후 3회까지 액티브 사용 시 강기 2단계일 경우 온존으로 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ draw1\n✦ 以降3回まで、アクティブスキルカード使用時、強気2段階目の場合、温存に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ 강기로 지침 변경\n✦ draw1\n✦ 이후 3회까지 액티브 사용 시 강기 2단계일 경우 온존 2단계로 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ 強気に変更\n✦ draw1\n✦ 以降3回まで、アクティブスキルカード使用時、強気2段階目の場合、温存2段階目に変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },

    // --- PSR (Produce SR) ---
    {
        id: "srrinami_1sr", name: "『나다움』의 시작", name_en: "The Beginning of \"Being Myself\"", name_ja: "『私らしさ』のはじまり", osusume: "concentration", rarity: "PSR", plan: "sense", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 개시 시 집중이 5이상일 경우 \n✦ 체력 회복 2\n✦ inlesson3",
            desc_ja: "ターン開始時、集中が5以上の場合、\n✦ 体力回復2\n✦ inlesson3",
        },
        itemplus: {
            desc: "턴 개시 시 집중이 5이상일 경우 \n✦ 체력 회복 2\n✦ inlesson4",
            desc_ja: "ターン開始時、集中が5以上の場合、\n✦ 体力回復2\n✦ inlesson4",
        },
        card: {
            name: "寄り添う気持ち",
            desc: "✦ genki10\n✦ concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki10\n✦ concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki12\n✦ concentration5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki12\n✦ concentration5\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srchina_1sr", name: "가슴을 펴고 한걸음씩", name_en: "Chest Out, One Step at a Time", name_ja: "胸を張って一歩ずつ", osusume: "motivation", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "액티브 스킬 사용 후 \n✦ 원기의 60%만큼 파라미터 상승\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用後、\n✦ 元気の60%分パラメータ上昇\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: "액티브 스킬 사용 후 \n✦ 원기의 70%만큼 파라미터 상승\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用後、\n✦ 元気の70%分パラメータ上昇\n✦ hpreduce2\n✦ inlesson2",
        },
        card: {
            name: "いっしょけんめい",
            desc: "✦ genki1\n✦ motivation5\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki1\n✦ motivation5\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki4\n✦ motivation6\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki4\n✦ motivation6\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srtsubame_1sr", name: "초지관철", name_en: "Stay True to My First Resolve", name_ja: "初志貫徹", osusume: "goodimpression", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2025-11-16",
        item: {
            desc: "직접효과로 의욕이 증가 후 호인상이 6이상일 경우 \n✦ 프라이드 (2턴)\n✦ motivation4\n✦ inlesson1",
            desc_ja: "直接効果でやる気が増加後、好印象が6以上の場合、\n✦ プライド（2ターン）\n✦ motivation4\n✦ inlesson1",
        },
        itemplus: {
            desc: "직접효과로 의욕이 증가 후 호인상이 6이상일 경우 \n✦ 프라이드 (3턴)\n✦ motivation5\n✦ inlesson1",
            desc_ja: "直接効果でやる気が増加後、好印象が6以上の場合、\n✦ プライド（3ターン）\n✦ motivation5\n✦ inlesson1",
        },
        card: {
            name: "紫電一閃",
            desc: "✦ goodimpression2\n✦ 이후 4회까지 턴 종료 시 의욕이 6이상인 경우, 호인상의 80%만큼 파라미터 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression2\n✦ 以降4回まで、ターン終了時、やる気が6以上の場合、好印象の80%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ goodimpression4\n✦ 이후 4회까지 턴 종료 시 의욕이 6이상인 경우, 호인상의 80%만큼 파라미터 증가\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression4\n✦ 以降4回まで、ターン終了時、やる気が6以上の場合、好印象の80%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srsena_1sr", name: "첫 번째 별", name_en: "First Star", name_ja: "一番星", osusume: "fullpower", rarity: "PSR", plan: "anomaly", source: "normal", releasedAt: "2024-11-16",
        item: {
            desc: "스킬카드 사용 시 지침이 전력일 경우\n✦ param9\n✦ genki9\n✦ inlesson1",
            desc_ja: "スキルカード使用時、全力の場合、\n✦ param9\n✦ genki9\n✦ inlesson1",
        },
        itemplus: {
            desc: "스킬카드 사용 시 지침이 전력일 경우\n✦ param18\n✦ genki9\n✦ inlesson1",
            desc_ja: "スキルカード使用時、全力の場合、\n✦ param18\n✦ genki9\n✦ inlesson1",
        },
        card: {
            name: "王者の御出まし",
            desc: "✦ fullpower4\n✦ 소비 체력 감소 2턴\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower4\n✦ 消費体力減少2ターン\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ fullpower5\n✦ 소비 체력 감소 3턴\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ fullpower5\n✦ 消費体力減少3ターン\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srume_1sr", name: "아이돌 시작!", name_en: "Starting Out as an Idol!", name_ja: "アイドル、はじめっ!", osusume: "motivation", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "2턴마다 \n✦ genki5\n✦ inlesson2",
            desc_ja: "2ターンごとに、\n✦ genki5\n✦ inlesson2",
        },
        itemplus: {
            desc: "2턴마다 \n✦ genki5\n✦ inlesson3",
            desc_ja: "2ターンごとに、\n✦ genki5\n✦ inlesson3",
        },
        card: {
            name: "打倒お姉ちゃん",
            desc: "hpreduce4\n✦ genki3\n✦ 원기의 100%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ genki3\n✦ 元気の100%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "hpreduce4\n✦ genki3\n✦ 원기의 140%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "hpreduce4\n✦ genki3\n✦ 元気の140%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srmisuzu_1sr", name: "느긋하게, 한 걸음씩", name_en: "Slowly, One Step at a Time", name_ja: "ゆっくり、一歩ずつ", osusume: "preservation", rarity: "PSR", plan: "anomaly", source: "normal", releasedAt: "2025-05-16",
        item: {
            desc: " 액티브카드 사용 후 \n✦ 온존으로 지침 변경\n✦ 강기효과의 스킬카드의 파라미터 수치 증가+3\n✦ hpreduce2\n✦ inlesson2",
            desc_ja: "アクティブスキルカード使用後、\n✦ 温存に変更\n✦ 強気効果のスキルカードのパラメータ値増加+3\n✦ hpreduce2\n✦ inlesson2",
        },
        itemplus: {
            desc: " 액티브카드 사용 후 \n✦ 온존으로 지침 변경\n✦ 강기효과의 스킬카드의 파라미터 수치 증가+3\n✦ hpreduce2\n✦ inlesson3",
            desc_ja: "アクティブスキルカード使用後、\n✦ 温存に変更\n✦ 強気効果のスキルカードのパラメータ値増加+3\n✦ hpreduce2\n✦ inlesson3",
        },
        card: {
            name: "休み休み、前へ",
            desc: "startingcard\n✦ 온존으로 지침 변경\n✦ 이후 턴 개시 시 지침이 온존인 경우, 여유로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 温存に変更\n✦ 以降、ターン開始時、温存の場合、のんびりに変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "startingcard\n✦ 온존으로 지침 변경\n✦ 이후 턴 개시 시 지침이 온존인 경우, 여유로 지침 변경\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "startingcard\n✦ 温存に変更\n✦ 以降、ターン開始時、温存の場合、のんびりに変更\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srhiro_1sr", name: "가장 적성에 안맞는 일", name_en: "The Thing I'm Least Suited For", name_ja: "一番向いてないこと", osusume: "motivation", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 개시 시 원기가 7이상인 경우\n✦ motivation5\n✦ inlesson1",
            desc_ja: "ターン開始時、元気が7以上の場合、\n✦ motivation5\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 원기가 7이상인 경우\n✦ motivation6\n✦ inlesson1",
            desc_ja: "ターン開始時、元気が7以上の場合、\n✦ motivation6\n✦ inlesson1",
        },
        card: {
            name: "苦しいのが好き",
            desc: "✦ genki6\n✦ 의욕의 250%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki6\n✦ やる気の250%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ genki7\n✦ 의욕의 350%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ genki7\n✦ やる気の350%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srlilja_1sr", name: "한 발 내딛은 앞에는", name_en: "Beyond That First Step", name_ja: "一つ踏み出した先に", osusume: "goodimpression", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 개시 시 체력이 50% 이상인 경우\n✦ goodimpression3\n✦ inlesson1",
            desc_ja: "ターン開始時、体力が50%以上の場合、\n✦ goodimpression3\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 체력이 50% 이상인 경우\n✦ goodimpression4\n✦ inlesson1",
            desc_ja: "ターン開始時、体力が50%以上の場合、\n✦ goodimpression4\n✦ inlesson1",
        },
        card: {
            name: "純白の妖精",
            desc: "✦ goodimpression2\n✦ 호인상의 120%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression2\n✦ 好印象の120%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ goodimpression2\n✦ 호인상의 160%만큼 파라미터 상승\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression2\n✦ 好印象の160%分パラメータ上昇\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srmao_1sr", name: "시작은 멋있게", name_en: "A Cool Start", name_ja: "はじまりはカッコよく", osusume: "goodcondition", rarity: "PSR", plan: "sense", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "직접효과로 호조 증가 후 \n✦ goodcondition3\n✦ inlesson1",
            desc_ja: "直接効果で好調が増加後、\n✦ goodcondition3\n✦ inlesson1",
        },
        itemplus: {
            desc: "직접효과로 호조 증가 후 \n✦ goodcondition4\n✦ inlesson1",
            desc_ja: "直接効果で好調が増加後、\n✦ goodcondition4\n✦ inlesson1",
        },
        card: {
            name: "らしさ",
            desc: "✦ param4\n✦ 호조상태일 경우 concentration3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param4\n✦ 好調状態の場合、 concentration3\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ param6\n✦ 호조상태일 경우 concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param6\n✦ 好調状態の場合、 concentration4\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srkotone_1sr", name: "귀여움♡시작했어요", name_en: "Started Being Cute♡", name_ja: "カワイイ♡はじめました", osusume: "goodimpression", rarity: "PSR", plan: "logic", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 종료 시 원기가 7이상인 경우\n✦ goodimpression4\n✦ inlesson1",
            desc_ja: "ターン終了時、元気が7以上の場合、\n✦ goodimpression4\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 종료 시 원기가 7이상인 경우\n✦ goodimpression5\n✦ inlesson1",
            desc_ja: "ターン終了時、元気が7以上の場合、\n✦ goodimpression5\n✦ inlesson1",
        },
        card: {
            name: "Colorful Cute!",
            desc: "✦ goodimpression6\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression6\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ ✦ goodimpression8\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ goodimpression8\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srsumika_1sr", name: "꿈을 향한 리스타트", name_en: "Restart Towards Her Dreams", name_ja: "夢へのリスタート", osusume: "concentration", rarity: "PSR", plan: "sense", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "직접효과로 집중 증가 후 체력이 50%이상인 경우 \n✦ concentration2\n✦ inlesson2",
            desc_ja: "直接効果で集中が増加後、体力が50%以上の場合、\n✦ concentration2\n✦ inlesson2",
        },
        itemplus: {
            desc: "직접효과로 집중 증가 후 \n✦ concentration2\n✦ inlesson2",
            desc_ja: "直接効果で集中が増加後、\n✦ concentration2\n✦ inlesson2",
        },
        card: {
            name: "勇気の一歩",
            desc: "✦ param17 (집중효과 2배 적용)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param17（集中効果を2倍適用）\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ param24 (집중효과 2.5배 적용)\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param24（集中効果を2.5倍適用）\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srtemari_1sr", name: "한마리의 늑대", name_en: "A Lone Wolf", name_ja: "一匹狼", osusume: "concentration", rarity: "PSR", plan: "sense", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 개시 시 원기가 0일 경우\n✦ hpreduce1\n✦ concentration3\n✦ inlesson2",
            desc_ja: "ターン開始時、元気が0の場合、\n✦ hpreduce1\n✦ concentration3\n✦ inlesson2",
        },
        itemplus: {
            desc: "턴 개시 시 원기가 0일 경우\n✦ hpreduce1\n✦ concentration4\n✦ inlesson2",
            desc_ja: "ターン開始時、元気が0の場合、\n✦ hpreduce1\n✦ concentration4\n✦ inlesson2",
        },
        card: {
            name: "ローン・ウルフ",
            desc: "✦ param12\n✦ 집중이 3이상인 경우 param12\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param12\n✦ 集中が3以上の場合、param12\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ param12\n✦ 집중이 3이상인 경우 param12\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param12\n✦ 集中が3以上の場合、param12\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },
    {
        id: "srsaki_1sr", name: "내가 1번!", name_en: "I'm Number One!", name_ja: "わたしが一番!", osusume: "goodcondition", rarity: "PSR", plan: "sense", source: "normal", releasedAt: "2024-05-16",
        item: {
            desc: "턴 개시 시 호조상태일 경우\n✦ genki9\n✦ inlesson1",
            desc_ja: "ターン開始時、好調状態の場合、\n✦ genki9\n✦ inlesson1",
        },
        itemplus: {
            desc: "턴 개시 시 호조상태일 경우\n✦ genki12\n✦ inlesson1",
            desc_ja: "ターン開始時、好調状態の場合、\n✦ genki12\n✦ inlesson1",
        },
        card: {
            name: "一番は譲らない",
            desc: "✦ param18\n✦ goodcondition3\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param18\n✦ goodcondition3\n <span style='color:#8B8FD8'>nooverlab limit1",
        },
        cardplus: {
            desc: "✦ param26\n✦ goodcondition4\n <span style='color:#8B8FD8'>nooverlab limit1",
            desc_ja: "✦ param26\n✦ goodcondition4\n <span style='color:#8B8FD8'>nooverlab limit1",
        }
    },


    // --- PR (Produce R) ---
    { id: "rrinami_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "concentration", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-05-16" },
    { id: "rrinami_2r", name: "초심", name_en: "First Mind", name_ja: "初心", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-09-07" },
    { id: "rchina_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-05-16" },
    { id: "rchina_2r", name: "초심", name_en: "First Mind", name_ja: "初心", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-09-07" },
    { id: "rtsubame_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "enthusiasm", rarity: "PR", plan: "anomaly", source: "normal", releasedAt: "2025-11-16" },
    { id: "rsena_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "enthusiasm", rarity: "PR", plan: "anomaly", source: "normal", releasedAt: "2024-11-16" },
    { id: "rsena_2r", name: "초전", name_en: "First Battle", name_ja: "初陣", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2025-07-04" },
    { id: "rume_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-05-16" },
    { id: "rume_2r", name: "초전", name_en: "First Battle", name_ja: "初陣", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2025-07-04" },
    { id: "rmisuzu_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "preservation", rarity: "PR", plan: "anomaly", source: "normal", releasedAt: "2025-05-16" },
    { id: "rmisuzu_2r", name: "초전", name_en: "First Battle", name_ja: "初陣", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2025-07-04" },
    { id: "rsaki_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-05-16" },
    { id: "rsaki_2r", name: "초성", name_en: "First Voice", name_ja: "初声", osusume: "goodimpression", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-08-10" },
    { id: "rtemari_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "concentration", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-05-16" },
    { id: "rtemari_2r", name: "초성", name_en: "First Voice", name_ja: "初声", osusume: "goodimpression", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-08-10" },
    { id: "rkotone_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "goodimpression", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-05-16" },
    { id: "rkotone_2r", name: "초성", name_en: "First Voice", name_ja: "初声", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-08-10" },
    { id: "rmao_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-05-16" },
    { id: "rmao_2r", name: "초연", name_en: "First Love", name_ja: "初恋", osusume: "goodimpression", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-10-14" },
    { id: "rlilja_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "goodimpression", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-05-16" },
    { id: "rlilja_2r", name: "초심", name_en: "First Mind", name_ja: "初心", osusume: "goodcondition", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-09-07" },
    { id: "rsumika_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "concentration", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-05-16" },
    { id: "rsumika_2r", name: "초연", name_en: "First Love", name_ja: "初恋", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-10-14" },
    { id: "rhiro_1r", name: "학원생활", name_en: "School Life", name_ja: "学園生活", osusume: "motivation", rarity: "PR", plan: "logic", source: "normal", releasedAt: "2024-05-16" },
    { id: "rhiro_2r", name: "초연", name_en: "First Love", name_ja: "初恋", osusume: "concentration", rarity: "PR", plan: "sense", source: "normal", releasedAt: "2024-10-14" },

];

// 모든 데이터에 자동으로 type: "produce" 추가 (매번 적지 않아도 되도록)
produceList.forEach(item => {
    if (!item.type) item.type = "produce";
});
