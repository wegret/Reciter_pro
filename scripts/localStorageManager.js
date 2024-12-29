/*
 * @Author: wlaten
 * @Date: 2024-12-29 14:34:48
 * @LastEditTime: 2024-12-29 15:49:14
 * @Discription: file content
 */

const STORAGE_KEY = 'quizData'; // 存储在 localStorage 的 key

// 从 localStorage 读取数据
export function getStoredQuizData() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (dataStr) {
        const data = JSON.parse(dataStr);
        if (typeof data.latestQuestionId === 'undefined') {
            data.latestQuestionId = 0;
            saveQuizData(data); // 保存回 localStorage
        }
        return data;
    }
    return {
        questionStats: {}, // 用于存放每道题的统计信息，{ '1': { attempts: 2, correct: 1 }, ... }
        latestQuestionId: 0
    };
}

// 写入 localStorage
export function saveQuizData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 更新单道题的统计
export function updateQuestionStat(questionId, isCorrect) {
    const data = getStoredQuizData();
    if (!data.questionStats[questionId]) {
        data.questionStats[questionId] = {
            attempts: 0,
            correct: 0
        };
    }
    data.questionStats[questionId].attempts++;
    if (isCorrect) {
        data.questionStats[questionId].correct++;
    }
    saveQuizData(data);
}

// 获取错题列表
export function getWrongQuestions(allQuestions) {
    const data = getStoredQuizData();
    return allQuestions.filter(q => {
        const stat = data.questionStats[q.id];
        // 如果没有做过或者做过但正确率低，则当成需要再次练习
        if (!stat) return false;
        // 正确率低于 80% 就归为错题
        const correctRate = stat.correct / stat.attempts;
        return correctRate < 0.8;
    });
}

// 统计全局正确率、答题数等
export function getGlobalStats() {
    const data = getStoredQuizData();
    const stats = data.questionStats;
    let totalAttempts = 0, totalCorrect = 0;
    for (let qid in stats) {
        totalAttempts += stats[qid].attempts;
        totalCorrect += stats[qid].correct;
    }
    return {
        answeredCount: totalAttempts,
        correctCount: totalCorrect,
        correctRate: totalAttempts > 0 ? (totalCorrect / totalAttempts) : 0
    };
}

export function getLatestQuestionId() {
    const data = getStoredQuizData();
    return data.latestQuestionId || 0;
}

export function setLatestQuestionId(id) {
    const numericId = Number(id);
    console.log(`setLatestQuestionId called with id=${numericId}`);
    const data = getStoredQuizData();
    console.log(`Current latestQuestionId before update: ${data.latestQuestionId}`);
    if (numericId > data.latestQuestionId) {
        data.latestQuestionId = numericId;
        saveQuizData(data);
        console.log(`Updated latestQuestionId to ${numericId}`);
    } else {
        console.log(`Not updating latestQuestionId since ${numericId} <= ${data.latestQuestionId}`);
    }
}
