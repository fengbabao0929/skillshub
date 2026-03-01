#!/usr/bin/env node

/**
 * 高转化IP自我介绍生成器（增强版）
 *
 * 核心理念：通过问答式深度挖掘，生成让用户主动追随的强IP自我介绍
 *
 * 增强功能：
 * - 生成50个一句话自我介绍（有画面感、情感化、演绎化）
 * - 人设自动检测与用户确认机制
 * - 100字和3分钟自我介绍的增强版生成
 *
 * ============================================================================
 * 【核心逻辑】"现在的价值"必须从"以前的我"自然升华
 * ============================================================================
 *
 * 问题：很多IP自我介绍的"现在的价值"部分是生硬的营销话术，与前面的
 *       "失败经历"缺乏逻辑关联，导致信任感断裂。
 *
 * 解决：建立"失败经历 → 核心收获 → 价值传递"的自然递进逻辑
 *
 * 逻辑链条（以学习教练为例）：
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 以前的我：高考失败（至暗时刻）                                │
 *   │    ↓                                                         │
 *   │ 转折点：选择自学考试（被迫找到另一条路）                        │
 *   │    ↓                                                         │
 *   │ 核心收获：磨练出自学能力（不是书本上学的，是实战中摸索出来的）      │
 *   │    ↓                                                         │
 *   │ 自然升华（关键）：                                            │
 *   │   "那段经历让我明白一件事：很多'放弃'的孩子，其实不是不想学，     │
 *   │    而是还没找到适合自己的路。我当年就是这样。如果那时候有人      │
 *   │    帮我找到路，我不会走那么多弯路。"                           │
 *   │    ↓                                                         │
 *   │   现在的两件事：                                              │
 *   │    1. 帮孩子找到属于他的路（因为我当年就是找不到路而放弃）        │
 *   │    2. 让孩子知道"你现在经历的，我也经历过"（共情而非说教）        │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * 关键原则：
 *   ✅ 价值必须从经历中自然提炼，而非生硬添加
 *   ✅ 用"我经历了X，所以我能帮你解决Y"的句式建立逻辑关联
 *   ✅ 避免"我能帮你解决三件事"这种营销化表达
 *   ✅ 用讲故事的方式传递价值，而非列清单
 *
 * 代码实现：见 generate3Min() 方法中的"现在的价值（自然递进）"部分
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// IP类型选择器 - 二级选择
// ============================================================================

const IP_TYPE_CATEGORIES = {
  education: {
    name: "教育培训类",
    icon: "👩‍🏫",
    professions: {
      "A-1": "学习教练",
      "A-2": "高报规划师（高考志愿填报）",
      "A-3": "家庭教育指导师",
      "A-4": "学科辅导老师",
      "A-5": "留学顾问",
      "A-6": "生涯规划师",
      "A-7": "注意力/学习力训练师",
      "A-8": "其他（自定义）"
    }
  },

  professional: {
    name: "专业服务类",
    icon: "💼",
    professions: {
      "B-1": "平面设计师",
      "B-2": "UI/UX设计师",
      "B-3": "品牌策划师",
      "B-4": "律师",
      "B-5": "会计师",
      "B-6": "咨询顾问",
      "B-7": "翻译",
      "B-8": "其他（自定义）"
    }
  },

  lifestyle: {
    name: "生活服务类",
    icon: "🏋️‍♂️",
    professions: {
      "C-1": "健身教练",
      "C-2": "瑜伽老师",
      "C-3": "营养师",
      "C-4": "美妆博主",
      "C-5": "穿搭博主",
      "C-6": "美甲师",
      "C-7": "其他（自定义）"
    }
  },

  finance: {
    name: "保险金融类",
    icon: "📊",
    professions: {
      "D-1": "保险经纪人",
      "D-2": "理财规划师",
      "D-3": "房产中介",
      "D-4": "贷款顾问",
      "D-5": "其他（自定义）"
    }
  },

  creator: {
    name: "内容创作者",
    icon: "📝",
    professions: {
      "E-1": "自由撰稿人",
      "E-2": "短视频博主",
      "E-3": "播客主",
      "E-4": "知识博主",
      "E-5": "其他（自定义）"
    }
  },

  other: {
    name: "其他",
    icon: "✨",
    professions: {
      "F-1": "自定义职业（请输入）"
    }
  }
};

// ============================================================================
// 问题库 - 六大维度深度挖掘
// ============================================================================

const QUESTION_CATEGORIES = {
  profession: {
    name: "专业维度",
    icon: "💼",
    questions: [
      "你的专业领域/职业是什么？",
      "你深耕这个领域几年了？",
      "你服务过/帮助过多少客户/学员？",
      "你最引以为傲的一个成果是什么？",
      "你在专业上有什么特别的技能/方法？",
      "你做过最成功的一个案例是什么？能具体说说吗？"
    ]
  },

  life: {
    name: "生活维度",
    icon: "🌟",
    questions: [
      "你有什么特别的爱好？",
      "你做过最'野'或最特别的事情是什么？",
      "你有什么别人做不到的生活技能？",
      "你周末一般怎么度过？",
      "你有什么收藏癖好吗？",
      "你最喜欢的放松方式是什么？"
    ]
  },

  personality: {
    name: "性格特质",
    icon: "🎭",
    questions: [
      "朋友/客户最常用来形容你的三个词是什么？",
      "你是个急性子还是慢性子？做事风格是怎样的？",
      "你有什么'反差萌'的地方吗？",
      "你在压力大的时候会怎么调节？",
      "你更倾向于冒险还是稳妥？举个例子"
    ]
  },

  failures: {
    name: "踩坑经历",
    icon: "🔥",
    questions: [
      "你人生最至暗/最困难的时刻是什么？",
      "你曾经因为什么决定'走错路'了？后来怎么走出来的？",
      "你最痛的一次失败经历是什么？从中学到了什么？",
      "有什么事情是你当时觉得天要塌了，现在回头看觉得'也没什么'的？",
      "你最大的遗憾是什么？"
    ]
  },

  family: {
    name: "家庭/孩子",
    icon: "👨‍👩‍👧‍👦",
    questions: [
      "你有孩子吗？孩子多大？",
      "你孩子/学生最让你头疼的是什么？",
      "你作为家长/老师最焦虑的时刻是什么？",
      "你和孩子之间最难忘的一个故事是什么？",
      "你最想传递给孩子/学生什么价值观？"
    ]
  },

  values: {
    name: "价值观",
    icon: "💡",
    questions: [
      "你坚信的一个理念是什么？",
      "你做这件事的初心是什么？",
      "你最想帮别人解决什么问题？",
      "你有什么'非主流'的观点吗？",
      "如果用一句话概括你的'人生哲学'，会是什么？"
    ]
  }
};

// ============================================================================
// 用户画像定义（新增）
// ============================================================================

class PersonaProfile {
    constructor() {
        this.rawData = {};
        this.personaSummary = "";
        this.gender = 'unknown';
    }

    updateFromAnswers(answers) {
        this.rawData = answers;
        this.gender = this.detectGender(answers);
        this.generatePersonaSummary();
    }

    generatePersonaSummary() {
        const data = this.rawData;

        // 根据性别确定角色
        const parentRole = this.gender === 'male' ? '爸爸' : '妈妈';

        // 检测职业
        const profession = data.profession?.field || "专业人士";

        // 检测核心特质
        const traits = data.personality?.threeWords || "";

        this.personaSummary = `我是一名${profession}，${parentRole}${traits ? '，' + traits : ''}。`;
    }

    detectGender(data) {
        // 从答案中检测性别
        const allAnswers = JSON.stringify(data);

        // 检测爸爸/儿子相关关键词
        if (allAnswers.includes('我是一名爸爸') || allAnswers.includes('我是爸爸') ||
            allAnswers.includes('爸爸，不是妈妈') || allAnswers.includes('作为父亲')) {
            return 'male';
        }

        // 检测孩子性别来判断
        if (data.family?.childGender) {
            if (data.family.childGender.includes('儿子') || data.family.childGender.includes('男孩')) {
                return 'male'; // 有儿子的可能是爸爸或妈妈，需要更多信息
            }
        }

        // 从自我描述中检测（女儿相关的描述）
        if (allAnswers.includes('我女儿') || allAnswers.includes('女孩')) {
            // 单凭女儿不能判断父母性别
        }

        // 检测妈妈相关关键词
        if (allAnswers.includes('我是一名妈妈') || allAnswers.includes('我是妈妈') ||
            allAnswers.includes('妈妈，不是爸爸')) {
            return 'female';
        }

        return 'unknown';
    }

    validateWithUser() {
        return `
=== 请确认你的人设 ===

${this.personaSummary}

⚠️ 如果有错误，请告诉我正确的信息
   例如："我是一名爸爸，不是妈妈"
   或："我没有孩子"
`;
    }
}

// ============================================================================
// 增强版生成器引擎
// ============================================================================

class EnhancedIntroGenerator {
    constructor(userAnswers, professionCode = null) {
        this.answers = userAnswers;
        this.professionCode = professionCode;
        this.persona = new PersonaProfile();
        this.persona.updateFromAnswers(userAnswers);
    }

    // 获取职业化标签
    getLabel(key) {
        const defaults = {
            client: "客户",
            clientType: "客户",
            field: "这个领域"
        };
        return defaults[key] || "";
    }

    // 生成50个一句话自我介绍（增强版 - 有画面感、情感化、演绎化）
    generate50Sentences() {
        const sentences = [];
        const data = this.answers;
        const parentRole = this.persona.gender === 'male' ? '爸爸' : '妈妈';

        // ===== 专业成就类 (10-12条) =====
        if (data.profession) {
            const p = data.profession;

            // 深耕领域 - 演绎化
            if (p.field) {
                sentences.push(`我在${p.field}的路上走了${p.years || '很多'}年，见过太多孩子从"我不行"到"我可以"的转变。`);
                sentences.push(`有人问我为什么坚持做${p.field}？因为每次看到孩子眼里的光重新亮起来，一切都值了。`);
            }

            // 服务案例 - 情感化
            if (p.clients) {
                sentences.push(`陪伴过${p.clients}个家庭走过至暗时刻，我依然记得每个孩子第一次主动说"我来试试"时的表情。`);
            }

            // 独家方法 - 演绎化
            if (p.methodology || p.specialSkill) {
                const method = p.methodology || p.specialSkill;
                sentences.push(`我不相信千篇一律的方法，每个孩子都是独一无二的谜题，而我享受解题的过程。`);
                sentences.push(`"${method}"这套方法不是书上看来的，是在一次次"好像不行了"到"居然可以"的实践中摸索出来的。`);
            }

            // 变化时间线 - 画面感
            if (p.timeline) {
                sentences.push(`${p.timeline}，这是我给自己和家长的承诺——不是速成，而是真实的生长。`);
            }

            // 专业态度 - 情感化
            sentences.push(`我不是那种"包提分"的教练，我更愿意做孩子学习路上的陪跑者，陪他们找到自己的节奏。`);
            sentences.push(`家长说我像个"百宝箱"，其实我只是把踩过的坑、走过的路，整理成了可以复用的经验。`);
        }

        // ===== 生活爱好类 (10-12条) =====
        if (data.life) {
            const l = data.life;

            // 阅读习惯 - 画面感
            if (l.readingHabit) {
                sentences.push(`每天清晨的阅读时间，是我和自己对话的仪式，也是我保持"松弛感"的秘密武器。`);
                sentences.push(`书本是我的另一个"孩子"，读专业书让我有底气，读心理学让我懂人性，读国学让我有定力。`);
            }

            // 运动爱好 - 演绎化
            if (l.sports) {
                sentences.push(`${l.sports}，这些运动让我明白——人生不是短跑，是耐力赛，配速要自己掌握。`);
                sentences.push(`当我在${l.sports}时，我不是在"锻炼"，是在和自己的身体对话，听听它在说什么。`);
            }

            // 极限挑战 - 情感化
            if (l.wildThing) {
                sentences.push(`${l.wildThing}，那种精疲力尽但心里燃着火的感觉，就是我想要传递给孩子的——你比你想象的更强大。`);
                sentences.push(`有人说我${l.wildThing}是"自虐"，我说这是在练习面对困难时不逃跑的勇气。`);
            }

            // 周末生活 - 画面感
            if (l.weekend) {
                sentences.push(`周末不"鸡娃"，${l.weekend}——充电的人才能发光，这是我对自己也是对家长的建议。`);
            }

            // 反差感 - 演绎化
            sentences.push(`工作时候我很"逻辑"，生活里我很"随性"，这种切换让我保持平衡，也让我更懂孩子需要的空间。`);
        }

        // ===== 性格特质类 (8-10条) =====
        if (data.personality) {
            const per = data.personality;

            // 三词标签 - 情感化
            if (per.threeWords) {
                const words = per.threeWords.split(/[、,，]/);
                words.forEach(word => {
                    sentences.push(`"${word.trim()}"——这是朋友给我的标签，但我知道，这是我在一次次"不完美"中打磨出来的自己。`);
                });
            }

            // 风格描述 - 演绎化
            if (per.style) {
                sentences.push(`我${per.style}，因为教育路上容不得半点虚假，家长把孩子交给我，就是一份沉甸甸的信任。`);
            }

            // 反差萌 - 画面感
            if (per.contrast) {
                sentences.push(`${per.contrast}，这种"反差"让我既能理解孩子的脆弱，也能撑起家长的期待。`);
            }

            // 压力调节 - 情感化
            if (per.stressRelief) {
                sentences.push(`压力大的时候我会${per.stressRelief}，因为一个情绪不稳定的成年人，给不了孩子任何支持。`);
            }

            sentences.push(`我不追求完美的教育，我只追求真实的陪伴——因为孩子要的不是完美的父母，是真实的你。`);
        }

        // ===== 踩坑经历类 (10-12条) =====
        if (data.failures) {
            const f = data.failures;

            // 至暗时刻 - 情感化
            if (f.hardestTime) {
                sentences.push(`${f.hardestTime}，那段日子我不敢跟任何人说，但现在我愿意分享，因为我知道你不是一个人。`);
                sentences.push(`现在回想${f.hardestTime}，当时的"天要塌了"，回头看其实是"天要亮了"的前奏。`);
            }

            // 走错的路 - 演绎化
            if (f.wrongPath) {
                sentences.push(`${f.wrongPath}，这个决定让我损失了很多，但也让我明白——及时止损，本身就是一种前进。`);
            }

            // 失败教训 - 画面感
            if (f.failureLesson) {
                sentences.push(`"${f.failureLesson}"，这句话不是书本上学的，是我用真金白银和无数个失眠夜换来的。`);
            }

            // 遗憾 - 情感化
            if (f.regret) {
                sentences.push(`${f.regret}，但我不后悔，因为每个遗憾都在提醒我——下一次，可以做得更好。`);
            }

            // 绝境时刻 - 演绎化
            if (f.desperateMoment) {
                sentences.push(`${f.desperateMoment}，那种感觉我太懂了——就像在隧道里走了很久，看不到光，但还是得继续走。`);
            }

            // 走出来 - 画面感
            if (f.recovery) {
                sentences.push(`${f.recovery}，这是我的自救方式，也希望成为你的。`);
            }

            sentences.push(`我现在能有这份"松弛感"，是因为我曾经真的"紧绷"过，而且断了。`);
            sentences.push(`踩过的坑不会白踩，它让我成为家长眼中"懂我的人"——因为我也在那里待过。`);
        }

        // ===== 家庭/孩子类 (6-8条) =====
        if (data.family) {
            const fam = data.family;

            // 孩子信息 - 画面感
            if (fam.childAge && fam.childGender) {
                const role = fam.role || parentRole || '家长';
                sentences.push(`作为${fam.childAge}${fam.childGender}的${role}，我说的每一句话，都先在自己身上"试毒"过。`);

                // 爸爸专属
                if (this.persona.gender === 'male') {
                    sentences.push(`作为${role}，我或许没有妈妈那么细腻，但我用逻辑和行动，给孩子另一种坚实的支撑。`);
                }
            }

            // 头疼的问题 - 情感化
            if (fam.headache) {
                sentences.push(`${fam.headache}，是的，这是我家的情况，所以我懂你看到作业时的那种血压升高。`);
            }

            // 焦虑时刻 - 画面感
            if (fam.anxiousMoment) {
                sentences.push(`${fam.anxiousMoment}，那种感觉我太熟悉了——就像胸口压了块石头，但表面还要装"没事"。`);
            }

            // 解决方法 - 演绎化
            if (fam.solution) {
                sentences.push(`${fam.solution}，这个方法不是书上写的，是我和我家孩子一次次"试错"后的幸存者。`);
            }

            // 温暖故事 - 情感化
            if (fam.story) {
                sentences.push(`${fam.story}，那一刻我知道，教育不是控制，是看见。`);
            }

            sentences.push(`我和孩子不是"教育者与被教育者"，我们是两个不完美的人，在彼此身上练习成长。`);
        }

        // ===== 价值观类 (8-10条) =====
        if (data.values) {
            const v = data.values;

            // 坚信的理念 - 情感化
            if (v.belief) {
                sentences.push(`${v.belief}，这不是口号，是我每天对自己说的话，尤其是在我也要"崩溃"的时候。`);
            }

            // 初心 - 演绎化
            if (v.initialIntention) {
                sentences.push(`${v.initialIntention}，这份初心支撑我走过最艰难的日子，也让我依然热爱这份事业。`);
            }

            // 想解决的问题 - 画面感
            if (v.solveProblem) {
                sentences.push(`${v.solveProblem}，这是我每天都在思考和实践的——因为我知道，改变的不仅是孩子，也是一个家庭的命运。`);
            }

            // 非主流观点 - 情感化
            if (v.uncommonView) {
                sentences.push(`${v.uncommonView}，这个观点可能不被认同，但这是我真实经历后的结论。`);
            }

            // 人生哲学 - 演绎化
            if (v.philosophy) {
                sentences.push(`${v.philosophy}，这句话不只在教育上适用，也是我的人生信条。`);
            }

            sentences.push(`我不相信"标准答案"，我相信每个孩子都有属于自己的"解法"，我的工作是帮他们找到。`);
            sentences.push(`教育不是把孩子塑造成我们想要的样子，而是陪他们长成他们自己的样子。`);
            sentences.push(`我传递的不仅是学习方法，更是一种生活态度——松弛、真实、允许不完美。`);
        }

        // ===== 补充通用模板（确保50条）=====
        const genericTemplates = [
            '我是一个相信"长期主义"的人，教育路上没有捷径，但每一步都算数。',
            '我每天都在练习"松弛感"，因为我知道，焦虑的家长养不出从容的孩子。',
            '我不追求成为"完美家长"，我只追求成为"真实父母"——因为孩子要的是真实的你。',
            '我相信"看见"的力量——看见孩子的努力，看见自己的进步，看见教育的本质。',
            '我见过太多"逆袭"的故事，也见证过很多"遗憾"的结局，这些都让我更敬畏教育的复杂性。',
            '我不是那种给孩子"打鸡血"的教练，我更愿意做"降温剂"——让焦虑的父母松弛下来。',
            '每个孩子都是独特的"谜题"，而我享受和他们一起"解题"的过程。',
            '教育路上没有"标准答案"，但有很多"可能答案"——我的工作是帮孩子找到他们的那一个。',
            '我说过很多"正确的话"，但孩子记住的，都是那些"真实的话"——那些暴露我的脆弱、不完美的话。',
            '我希望孩子记住的不是"我的方法"，而是"我的样子"——一个在困难面前不放弃的人。'
        ];

        return [...sentences, ...genericTemplates].slice(0, 50);
    }

    // 生成100字自我介绍（陌生人见面版）- 增强版
    generate100WordsStranger() {
        const data = this.answers;
        const parentRole = this.persona.gender === 'male' ? '爸爸' : '妈妈';
        let intro = "";

        // 开场：身份 + 专业
        if (data.profession?.field) {
            const traits = data.personality?.threeWords || "";
            intro = `我是一名${data.profession.field}${traits ? `，朋友形容我"${traits}"` : ''}。\n\n`;
        }

        // 中段：共情 - 演绎化
        if (data.family?.headache) {
            intro += `作为${parentRole}，${data.family.headache}——这些我都经历过，所以我懂你。\n\n`;
        }

        // 专业方法
        if (data.profession?.methodology) {
            intro += `我用"${data.profession.methodology}"这套方法，帮助过很多家庭从对抗走向合作。\n\n`;
        }

        // 结尾：价值主张 - 情感化
        if (data.values?.solveProblem) {
            intro += `${data.values.solveProblem}。\n\n`;
        } else if (data.values?.belief) {
            intro += `${data.values.belief}。\n\n`;
        }

        intro += "期待与你深度链接！";

        return intro;
    }

    // 生成100字自我介绍（朋友圈故事版）- 增强版
    generate100WordsMoment() {
        const data = this.answers;
        let moment = "";

        // 场景化开头 - 演绎化
        if (data.life?.wildThing) {
            moment = `${data.life.wildThing}，那种精疲力尽但心里燃着火的感觉，就是我想要传递给孩子的——你比你想象的更强大。\n\n`;
        } else if (data.family?.story) {
            moment = `${data.family.story}，那一刻我知道，教育不是控制，是看见。\n\n`;
        } else if (data.profession?.proudAchievement) {
            moment = `${data.profession.proudAchievement}，看到这个结果真的很欣慰。\n\n`;
        }

        // 引出理念/价值观 - 情感化
        if (data.values?.belief) {
            moment += `${data.values.belief}\n\n`;
        }

        // 拉回自己 - 演绎化
        moment += "这就是我，一个";

        if (data.personality?.threeWords) {
            moment += data.personality.threeWords;
        } else {
            moment += "用心做事、真实活着的人";
        }

        moment += "。";

        return moment;
    }

    // 检测踩坑经历是否与IP相关
    checkFailureRelevance() {
        const data = this.answers;
        const profession = data.profession?.field || "";
        const failures = data.failures;

        if (!failures) return { relevant: true, warnings: [] };

        const warnings = [];
        const relevantKeywords = {
            "学习教练": ["学习", "教育", "孩子", "学生", "家长", "学校", "成绩", "考试", "辅导"],
            "教育": ["学习", "教育", "孩子", "学生", "家长", "学校"],
            "健身": ["健身", "运动", "身材", "减脂", "增肌"],
            "保险": ["保险", "理赔", "保障", "家庭"],
            "律师": ["法律", "案件", "官司", "纠纷"],
            "设计师": ["设计", "创意", "品牌", "视觉"]
        };

        // 获取相关关键词
        let relevantKw = [];
        for (const [key, keywords] of Object.entries(relevantKeywords)) {
            if (profession.includes(key)) {
                relevantKw = keywords;
                break;
            }
        }

        // 检查是否有相关关键词
        const allFailuresText = JSON.stringify(failures);
        const hasRelevantFailure = relevantKw.some(kw => allFailuresText.includes(kw));

        if (!hasRelevantFailure && relevantKw.length > 0) {
            warnings.push({
                type: "failure_not_relevant",
                message: `⚠️ 检测到你的踩坑经历与"${profession}"IP关联度不高。`,
                suggestion: `建议补充与${profession}相关的困难经历，例如：`,
                examples: this.generateRelevantFailureExamples(profession, relevantKw)
            });
        }

        return {
            relevant: hasRelevantFailure || relevantKw.length === 0,
            warnings: warnings
        };
    }

    // 生成相关的踩坑经历示例
    generateRelevantFailureExamples(profession, keywords) {
        const examples = {
            "学习教练": [
                "自己孩子学习遇到困难，尝试各种方法都无效的无力感",
                "刚入行时，家长不信任、孩子不配合的挫败经历",
                "曾经用错误的方法辅导孩子，导致关系紧张的时刻"
            ],
            "教育": [
                "教学初期，学生成绩不升反降的自我怀疑",
                "和家长沟通失败，被投诉或质疑的经历"
            ],
            "default": [
                "职业初期的迷茫和挫败",
                "最不自信的那个时刻",
                "想要放弃但最终坚持下来的经历"
            ]
        };

        return examples[profession] || examples["default"];
    }

    // 生成逻辑检查和引导
    generateLogicCheck() {
        const data = this.answers;
        const checks = [];
        const profession = data.profession?.field || "";

        // 检查踩坑经历相关性
        const failureCheck = this.checkFailureRelevance();
        if (!failureCheck.relevant) {
            checks.push(...failureCheck.warnings);
        }

        // 检查家庭经历（如果有孩子相关IP）
        if (profession.includes("教练") || profession.includes("教育")) {
            if (!data.family || !data.family.childAge) {
                checks.push({
                    type: "family_missing",
                    message: "⚠️ 作为教育类IP，建议分享家庭/孩子相关经历",
                    suggestion: "这能让你更懂家长的焦虑，建立更强的信任感"
                });
            }
        }

        return checks;
    }

    // 生成3分钟自我介绍 - 增强版（带逻辑检查）
    generate3Min() {
        const data = this.answers;
        const parentRole = this.persona.gender === 'male' ? '爸爸' : '妈妈';

        // 首先进行逻辑检查
        const logicChecks = this.generateLogicCheck();
        let warnings = "";
        if (logicChecks.length > 0) {
            warnings = "\n\n=== ⚠️ 逻辑检查提醒 ===\n\n";
            logicChecks.forEach(check => {
                warnings += `${check.message}\n\n`;
                if (check.suggestion) {
                    warnings += `💡 ${check.suggestion}\n\n`;
                }
                if (check.examples) {
                    warnings += `例如：\n${check.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}\n\n`;
                }
            });
            warnings += "你可以补充这些信息后重新生成，或使用当前版本。\n\n";
        }

        let intro = "";

        // ========== 第一部分：现在的我 ==========
        intro += "**【现在的我】**\n\n";

        // 核心逻辑：用一句话整合身份，然后自然过渡到"松弛感的来源"
        // 避免：职业→家庭→焦虑→松弛感（频繁换频道）
        // 改为：身份整合→松弛感不是天生的→引出以前的我

        const hasFamily = data.family?.childAge && data.family?.childGender;
        const profession = data.profession?.field || "专业人士";
        const personality = data.personality?.threeWords || "";

        // 第一句：整合身份
        if (hasFamily) {
            intro += `我是一名${profession}，也是一名${data.family.childAge}${data.family.childGender}的${parentRole}。\n\n`;
        } else {
            intro += `我是一名${profession}。\n\n`;
        }

        // 第二句：引出性格特质+转折
        if (personality) {
            intro += `朋友形容我"${personality}"。但其实，我这份"松弛感"不是天生的，而是被"逼"出来的——因为...\n\n`;
        } else {
            intro += `很多人问我为什么有这份松弛感，其实...\n\n`;
        }

        // ========== 第二部分：以前的我（智能桥接）==========
        intro += "**【以前的我】**\n\n";

        if (data.failures?.hardestTime) {
            const failureText = data.failures.hardestTime;

            // 检查是否与IP直接相关
            const profession = data.profession?.field || "";
            const hasRelevantKeywords = /学习|教育|孩子|学生|家长|学校/.test(failureText);

            if (hasRelevantKeywords || !profession.includes("教练") && !profession.includes("教育")) {
                // 直接相关或非教育IP，直接使用
                intro += `${failureText}，那段日子我不敢跟任何人说。\n\n`;
            } else {
                // 不相关，需要桥接
                intro += `${failureText}\n\n`;
                intro += `这段看似与${profession}无关的经历，却让我学会了——面对困难时的决策力，以及及时止损的勇气。这些能力，现在我用在了帮助每个家庭寻找最适合的教育方案上。\n\n`;
            }
        }

        if (data.failures?.wrongPath) {
            intro += `${data.failures.wrongPath}\n\n`;
        }

        if (data.failures?.recovery) {
            intro += `${data.failures.recovery}\n\n`;
        }

        intro += '现在回头看，那些"天要塌了"的时刻，其实是"天要亮了"的前奏。\n\n';

        // ========== 第三部分：现在的价值（自然递进）==========
        intro += "**【现在的价值】**\n\n";

        // 核心逻辑：从"以前的我"自然升华到"现在的价值"
        // 关键：将"失败经历"转化为"独特价值"，而非生硬的营销话术

        const hasRelevantFailure = data.failures?.hardestTime && (
            data.failures.hardestTime.includes("学习") ||
            data.failures.hardestTime.includes("高考") ||
            data.failures.hardestTime.includes("考试") ||
            data.failures.hardestTime.includes("教育")
        );

        if (hasRelevantFailure) {
            // 失败经历与IP高度相关 → 自然升华
            // 关键：用"我当年就是这样"建立情感连接，而非说教

            intro += `那段经历让我明白一件事：**很多"放弃"的孩子，其实不是不想学，而是还没找到适合自己的路。**\n\n`;
            intro += `我当年就是这样。如果那时候有人告诉我"还有别的路"，或者帮我找到"自学"这条路，我可能不会走那么多弯路。\n\n`;
            intro += `所以现在，我做两件事：\n\n`;

            intro += `**第一，帮孩子找到属于他/她的那条路。**\n`;
            intro += `不是千篇一律的"标准答案"，而是根据每个孩子的特点，量身定制适合他/她的学习方法。`;
            intro += `因为只有孩子自己找到的路，他/她才愿意走下去。`;
            if (data.profession?.methodology) {
                intro += `我用"${data.profession.methodology}"这套方法，已经帮助很多孩子找到了自己的节奏。`;
            }
            intro += `\n\n`;

            intro += `**第二，让孩子知道"你现在经历的，我也经历过"。**\n`;
            intro += `当我跟孩子说"我也曾崩溃过，后来我找到了路"，他们的眼神会突然亮起来——因为一个真的"跌倒过"又"爬起来"的人，比任何说教都有力量。\n\n`;

            intro += `所以，如果你家孩子也在经历"找不到路"的迷茫，欢迎链接我。`;
            intro += `我不是来拯救谁的，我是来告诉孩子：你看，我当年那么惨都走过来了，你也可以。`;
        } else if (data.values?.belief || data.values?.solveProblem) {
            // 失败经历不相关或缺失 → 使用价值观表达
            if (data.values?.belief) {
                intro += `${data.values.belief}\n\n`;
            }

            if (data.values?.solveProblem) {
                intro += `${data.values.solveProblem}\n\n`;
            }

            intro += "如果你也正在经历我曾经经历的困境，欢迎链接我，一起破局！";
        } else {
            // 兜底：通用表达
            intro += `我想用我的经历和方法，帮助更多家庭找到适合自己的教育之路。\n\n`;
            intro += `如果你也正在经历教育焦虑，或者你的孩子也遇到了挫折，欢迎链接我，一起破局！`;
        }

        return warnings + intro;
    }

    // 生成人设总结供用户确认
    generatePersonaSummary() {
        return this.persona.validateWithUser();
    }
}

// ============================================================================
// 职业化话术模板
// ============================================================================

const PROFESSION_TEMPLATES = {
  "A-1": {
    labels: {
      client: "学生",
      clientType: "家庭",
      field: "学习力提升"
    }
  },
  "A-2": {
    labels: {
      client: "家长",
      clientType: "考生",
      field: "高考志愿填报"
    }
  }
};

// ============================================================================
// 原版生成器（保持向后兼容）
// ============================================================================

class IntroGenerator {
    constructor(userAnswers, professionCode = null) {
        this.answers = userAnswers;
        this.professionCode = professionCode;
        this.templates = professionCode ? PROFESSION_TEMPLATES[professionCode] : null;
    }

    getLabel(key) {
        if (this.templates && this.templates.labels[key]) {
            return this.templates.labels[key];
        }
        const defaults = {
            client: "客户",
            clientType: "客户",
            field: "这个领域"
        };
        return defaults[key] || "";
    }

    generate30Sentences() {
        const sentences = [];
        const clientLabel = this.getLabel('client');

        if (this.answers.profession) {
            const p = this.answers.profession;
            if (p.field) sentences.push(`我深耕${p.field}${p.years || '多年'}`);
            if (p.clients) sentences.push(`我已经服务过${p.clients}位${clientLabel}`);
            if (p.proudAchievement) sentences.push(`我曾经${p.proudAchievement}`);
            if (p.specialSkill) sentences.push(`我${p.specialSkill}`);
            if (p.successCase) sentences.push(`${p.successCase}，这是我做过最成功的案例`);
        }

        const generic = [
            "我是一个不断学习、持续成长的人",
            "我相信每个人都有无限可能",
            "我喜欢挑战自己，走出舒适区"
        ];

        return [...sentences, ...generic].slice(0, 30);
    }

    generate100WordsStranger() {
        let intro = "";
        const clientLabel = this.getLabel('client');

        if (this.answers.profession?.field) {
            const p = this.answers.profession;
            intro += `我深耕${p.field}${p.years || '多年'}，`;
        }

        if (this.answers.profession?.clients || this.answers.profession?.proudAchievement) {
            const p = this.answers.profession;
            intro += `服务过${p.clients || '很多'}${clientLabel}，`;
            if (p.proudAchievement) intro += `${p.proudAchievement}`;
        } else {
            intro += "积累了丰富的实战经验";
        }

        intro += "。";
        intro += "\n\n期待与你深度链接！";

        return intro;
    }

    generate100WordsMoment() {
        let moment = "";

        if (this.answers.profession?.proudAchievement) {
            moment += `今天${this.answers.profession.proudAchievement.substring(0, 30)}，看到这个结果真的很欣慰。\n\n`;
        } else if (this.answers.family?.story) {
            moment += `${this.answers.family.story.substring(0, 40)}，这件事让我思考了很多。\n\n`;
        } else if (this.answers.life?.wildThing) {
            moment += `${this.answers.life.wildThing.substring(0, 40)}，这就是我想要的生活状态。\n\n`;
        }

        if (this.answers.values?.belief) {
            moment += `我始终坚信${this.answers.values.belief}。\n\n`;
        }

        moment += "这就是我，一个";

        if (this.answers.personality?.threeWords) {
            moment += this.answers.personality.threeWords;
        } else {
            moment += "用心做事、真实活着的人";
        }

        moment += "。";

        return moment;
    }

    generate3Min() {
        let intro = "";
        const clientLabel = this.getLabel('client');

        intro += "【现在的我】\n\n";

        if (this.answers.profession?.field) {
            const p = this.answers.profession;
            const personality = this.answers.personality?.threeWords || "靠谱";
            intro += `我是${personality}的${p.field}${p.years || '资深'}从业者，`;
        }

        if (this.answers.profession?.clients || this.answers.profession?.proudAchievement) {
            const p = this.answers.profession;
            intro += `服务过${p.clients || '很多'}${clientLabel}，${p.proudAchievement || '积累了丰富经验'}。`;
        }

        intro += "\n\n很多人问我是怎么做到的，其实...";
        intro += "\n\n";

        intro += "【以前的我】\n\n";
        intro += "我跟很多人一样，";

        const hasHardship = this.answers.failures?.hardestTime || this.answers.family?.headache;

        if (this.answers.failures?.hardestTime) {
            intro += `${this.answers.failures.hardestTime}，`;
        }

        if (this.answers.family?.headache) {
            intro += `${this.answers.family.headache}，`;
        }

        intro += "那种无力感我太懂了。\n\n";

        if (this.answers.failures?.wrongPath) {
            intro += `${this.answers.failures.wrongPath}，`;
        }

        if (this.answers.failures?.failureLesson) {
            intro += `${this.answers.failures.failureLesson}。`;
        }

        intro += "\n\n";

        intro += "【现在的价值】\n\n";

        if (this.answers.values?.belief) {
            intro += `${this.answers.values.belief}，`;
        }

        if (this.answers.values?.solveProblem) {
            intro += `我能帮你${this.answers.values.solveProblem}。`;
        }

        intro += "\n\n如果你也正在经历我曾经经历的困境，欢迎链接我，一起破局！";

        return intro;
    }
}

// ============================================================================
// 问答引导流程
// ============================================================================

function generateQuestionFlow() {
    let flow = `# 高转化IP自我介绍生成器 - 问答挖掘流程

## 核心原则

通过深入挖掘你的真实经历和想法，生成立体、有温度的IP自我介绍。

---

`;

    Object.entries(QUESTION_CATEGORIES).forEach(([key, category]) => {
        flow += `## ${category.icon} ${category.name}\n\n`;

        category.questions.forEach((q, i) => {
            flow += `${i + 1}. ${q}\n`;
        });

        flow += '\n';
    });

    flow += `---

## 生成完成后

你将获得：
- ✅ 50个一句话自我介绍（多维度人设素材，有画面感）
- ✅ 100字自我介绍 - 陌生人见面版
- ✅ 100字自我介绍 - 朋友圈故事版
- ✅ 3分钟自我介绍（社群分享/直播开场）

## 使用建议

1. **50个一句话**：每天发一条朋友圈，轮着发，反复讲
2. **100字陌生人版**：加好友后主动发送，快速建立专业印象
3. **100字朋友圈版**：配合场景化图片，讲述有温度的故事
4. **3分钟版**：直播开场、社群分享、路演演讲
`;

    return flow;
}

// ============================================================================
// 示例（用于测试）
// ============================================================================

function generateExample() {
    const exampleAnswers = {
        profession: {
            field: "学习教练",
            years: "6年",
            clients: "近300位",
            methodology: "三力模型"
        },
        life: {
            readingHabit: "每天清晨读书，专业、心理、国学",
            sports: "攀岩、潜水、徒步、爬山、健身、露营",
            wildThing: "跑斯巴达障碍赛，每次浑身泥和伤但乐此不疲",
            weekend: "和家人一起看书、喝茶，组织读书会或珠海培训师俱乐部的课程"
        },
        personality: {
            threeWords: "松弛感、百宝箱、逻辑性强"
        },
        failures: {
            hardestTime: "投资健身工作室，经历重资产重房租压力",
            wrongPath: "合伙人选择的失败",
            recovery: "及时止损，寻求专业帮助，通过冥想和潜水自我调节"
        },
        family: {
            childAge: "5年级",
            childGender: "女孩",
            headache: "学习主动性不足、数学自信心不够、过度关注人际关系",
            solution: "抓住小进步不断赋能、抓基础一点点提升、陪伴倾听引导"
        },
        values: {
            belief: "孩子不应该只用学习来被判断，每个孩子都有自己的未来，我们可以帮他们长成自己的样子",
            solveProblem: "帮助家长解决错误的教育理念、亲子对抗问题"
        }
    };

    const generator = new EnhancedIntroGenerator(exampleAnswers);

    let output = `# 增强版生成示例

---

## 人设确认

${generator.generatePersonaSummary()}

---

## 50个一句话自我介绍（增强版）

`;

    const sentences = generator.generate50Sentences();
    sentences.forEach((s, i) => {
        output += `${i + 1}. ${s}\n`;
    });

    output += `

---

## 100字自我介绍（陌生人见面版）

${generator.generate100WordsStranger()}

---

## 100字自我介绍（朋友圈故事版）

${generator.generate100WordsMoment()}

---

## 3分钟自我介绍

${generator.generate3Min()}

---

## 使用示例

### 朋友圈使用
每天选择"50个一句话"中的一条，配图发布：
- 📸 配斯巴达赛后照片 + "跑完斯巴达，浑身泥和伤但乐此不疲，教育也是这样..."
- 📸 配晨读照片 + "每天清晨的阅读时间，是我和自己对话的仪式..."
- 📸 配工作照 + "我不是那种'包提分'的教练，我更愿意做陪跑者..."

### 社群分享
使用"3分钟自我介绍"作为开场
`;

    return output;
}

// ============================================================================
// IP类型选择器显示函数
// ============================================================================

function showIPTypeSelector() {
    let selector = `╔════════════════════════════════════════════════════════════╗
║          🎯 第一步：选择你的IP类型                          ║
╚════════════════════════════════════════════════════════════╝

请选择最符合你的类型：

`;

    Object.entries(IP_TYPE_CATEGORIES).forEach(([key, category]) => {
        const code = getCategoryCode(key);
        selector += `【${code}】 ${category.icon} ${category.name}\n`;
    });

    selector += `
提示：输入选项代码（如 A、B、C）或完整名称
你的选择：__ `;

    return selector;
}

function showProfessionSelector(categoryKey) {
    const category = IP_TYPE_CATEGORIES[categoryKey];

    if (!category) {
        return "无效的选择，请重新选择。";
    }

    let selector = `╔════════════════════════════════════════════════════════════╗
║          🎯 第二步：选择你的职业                            ║
╚════════════════════════════════════════════════════════════╝

${category.icon} ${category.name}

请选择你的具体职业：

`;

    Object.entries(category.professions).forEach(([code, profession]) => {
        selector += `【${code}】 ${profession}\n`;
    });

    selector += `
提示：输入选项代码（如 A-1、B-3）或完整名称
选择"其他"可以自定义职业
你的选择：__ `;

    return selector;
}

function generateSelectionFlow() {
    let flow = `# IP类型选择 - 交互式流程

## 使用说明

这是一个两步选择流程，帮助精准定位用户的IP身份。

---

## 第一步：选择IP类型

`;

    Object.entries(IP_TYPE_CATEGORIES).forEach(([key, category]) => {
        const code = getCategoryCode(key);
        flow += `### 【${code}】 ${category.icon} ${category.name}\n\n`;

        const professionCount = Object.keys(category.professions).length;
        const previewProfessions = Object.values(category.professions).slice(0, 3);
        flow += `包含职业：${previewProfessions.join('、')}等 ${professionCount} 个选项\n\n`;
    });

    flow += `---

## 第二步：选择具体职业

根据第一步选择，展示对应类别下的细分职业列表。
`;

    return flow;
}

function getCategoryCode(key) {
    const codes = {
        education: 'A',
        professional: 'B',
        lifestyle: 'C',
        finance: 'D',
        creator: 'E',
        other: 'F'
    };
    return codes[key] || '?';
}

function getProfessionFromCode(code) {
    const categoryCode = code.split('-')[0];
    const categoryKey = Object.keys(IP_TYPE_CATEGORIES).find(
        key => getCategoryCode(key) === categoryCode
    );

    if (categoryKey && IP_TYPE_CATEGORIES[categoryKey]) {
        return IP_TYPE_CATEGORIES[categoryKey].professions[code] || null;
    }

    return null;
}

// ============================================================================
// 命令行界面
// ============================================================================

function parseArgs() {
    const args = process.argv.slice(2);
    return {
        mode: args.includes('--enhanced') ? 'enhanced-example' :
              args.includes('--flow') ? 'flow' :
              args.includes('--example') ? 'example' :
              args.includes('--select') ? 'select' :
              args.includes('--selection-flow') ? 'selection-flow' :
              args[0] || 'help',
        category: args.find((a, i) => a === '--category' && args[i + 1]) ?
          args[args.indexOf('--category') + 1] : null
    };
}

function showHelp() {
    console.log(`
高转化IP自我介绍生成器（增强版）

通过问答式深度挖掘，生成让用户主动追随的强IP自我介绍

命令：
  /ip-select                      显示IP类型选择器
  /ip-select --category <类型>    显示具体职业选择器
  /ip-selection-flow             查看完整选择流程说明
  /ip-flow                       查看通用问答流程
  /ip-example                    查看原版生成示例
  /ip-example --enhanced         查看增强版生成示例（50句+人设确认）

生成内容（增强版）：
  • 50个一句话自我介绍 - 多维度塑造立体人设，有画面感
  • 100字自我介绍 - 陌生人见面版（情感化演绎）
  • 100字自我介绍 - 朋友圈故事版（场景化）
  • 3分钟自我介绍 - 社群分享/直播开场
  • 人设自动检测与用户确认

核心理念：
  • 演绎化 > 复制粘贴
  • 情感化 > 客观描述
  • 画面感 > 抽象概括
  • 真实 > 完美
`);
}

function main() {
    const options = parseArgs();

    switch (options.mode) {
        case 'select':
            if (options.category) {
                console.log(showProfessionSelector(options.category));
            } else {
                console.log(showIPTypeSelector());
            }
            break;

        case 'selection-flow':
            console.log(generateSelectionFlow());
            break;

        case 'flow':
            console.log(generateQuestionFlow());
            break;

        case 'enhanced-example':
            console.log(generateExample());
            break;

        case 'example':
            const exampleGen = new IntroGenerator({
                profession: {
                    field: "学习教练",
                    years: "6年",
                    clients: "近300位",
                    proudAchievement: "帮助一个孩子在3个月内成绩提升了395名"
                }
            });
            console.log("原版生成器（30句）：\n");
            exampleGen.generate30Sentences().forEach((s, i) => {
                console.log(`${i + 1}. ${s}`);
            });
            break;

        case 'help':
        default:
            showHelp();
    }
}

// 导出供其他模块使用
export {
    IP_TYPE_CATEGORIES,
    QUESTION_CATEGORIES,
    EnhancedIntroGenerator,
    IntroGenerator,
    PersonaProfile,
    showIPTypeSelector,
    showProfessionSelector,
    generateSelectionFlow,
    generateQuestionFlow,
    generateExample,
    getProfessionFromCode
};

main();
