/*
 * @Author: wlaten
 * @Date: 2024-12-29 14:35:18
 * @LastEditTime: 2024-12-29 16:36:23
 * @Discription: file content
 */

import { QuestionManager } from './questionManager.js';
import {
    getStoredQuizData,
    saveQuizData,
    updateQuestionStat,
    getWrongQuestions,
    getGlobalStats,
    getLatestQuestionId,
    setLatestQuestionId
} from './localStorageManager.js';

let questionManager;
let currentQuestion = null;

let isQuestionAnswered = false;
let wasCorrect = false;


export async function initApp() {
    const questions = await fetchQuestions();
    questionManager = new QuestionManager(questions);
    renderNextQuestion();

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', handleSubmitAnswer);

    updateStatsDisplay();
}

async function fetchQuestions() {
    const res = await fetch('./questions.json');
    // const res = await fetch('./test.json');
    const data = await res.json();
    return data;
}

function renderNextQuestion() {
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = '提交答案'; // "Submit Answer" in Chinese

    isQuestionAnswered = false;
    wasCorrect = false;

    const wrongQuestions = getWrongQuestions(questionManager.questions);
    currentQuestion = questionManager.getNextQuestion(wrongQuestions);

    if (!currentQuestion) {
        document.getElementById('question-title').textContent = '题库已完成！';
        document.getElementById('options-container').innerHTML = '';
        document.getElementById('feedback').textContent = '';
        return;
    }

    const questionTitle = document.getElementById('question-title');
    questionTitle.textContent = `${currentQuestion.id}. ${currentQuestion.title}`;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const isMultiple = (currentQuestion.type === '多选');

    currentQuestion.options.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.classList.add('option');

        const input = document.createElement('input');
        input.type = isMultiple ? 'checkbox' : 'radio';

        input.name = `question-option-${currentQuestion.id}`;
        input.value = opt;

        div.appendChild(input);

        const label = document.createElement('label');
        label.textContent = opt;
        div.appendChild(label);

        optionsContainer.appendChild(div);
    });

    // 清空反馈
    document.getElementById('feedback').textContent = '';
}

// 提交答案事件
function handleSubmitAnswer() {
    if (!currentQuestion) {
        return;
    }

    const submitBtn = document.getElementById('submit-btn');

    if (!isQuestionAnswered) {
        const isMultiple = (currentQuestion.type === '多选');

        let userAnswers = [];
        if (isMultiple) {
            const selectedCheckboxes = document.querySelectorAll(
                `input[name="question-option-${currentQuestion.id}"]:checked`
            );
            selectedCheckboxes.forEach(cb => {
                userAnswers.push(cb.value.charAt(0));
            });
        } else {
            const selectedRadio = document.querySelector(
                `input[name="question-option-${currentQuestion.id}"]:checked`
            );
            if (!selectedRadio) {
                alert('请先选择一个选项');
                return;
            }
            userAnswers.push(selectedRadio.value.charAt(0));
        }

        if (userAnswers.length === 0) {
            alert('请先选择至少一个选项');
            return;
        }

        let isCorrect = false;
        if (isMultiple) {
            // 假设多选答案为数组，如 ["A","C"]
            const correctAnswers = Array.isArray(currentQuestion.answer)
                ? currentQuestion.answer
                : currentQuestion.answer.split('');

            // 判断正确性的逻辑(用户选的数量=正确答案数量) && (每个选项都在正确答案里)
            if (userAnswers.length === correctAnswers.length) {
                isCorrect = userAnswers.every((ua) => correctAnswers.includes(ua));
            }
        }
        else {
            // 单选，对比第一个字符
            isCorrect = (userAnswers[0] === currentQuestion.answer);
        }

        console.log(`Handling answer for question id=${currentQuestion.id}, isCorrect=${isCorrect}`);

        updateQuestionStat(currentQuestion.id, isCorrect);
        setLatestQuestionId(currentQuestion.id);

        console.log(`After setLatestQuestionId, latestQuestionId=${getLatestQuestionId()}`);

        wasCorrect = isCorrect;
        isQuestionAnswered = true;

        // 显示反馈
        const feedback = document.getElementById('feedback');
        if (isCorrect) {
            feedback.textContent = '回答正确！';
            feedback.style.color = 'green';
        } else {
            if (isMultiple) {
                let showanswer = Array.isArray(currentQuestion.answer) ? currentQuestion.answer.join('、') : currentQuestion.answer;

                feedback.textContent = `回答错误！正确答案是：${showanswer}`;
            } else {
                feedback.textContent = `回答错误！正确答案是：${currentQuestion.answer}`;
            }
            feedback.style.color = 'red';
        }

        updateStatsDisplay();

        if (isCorrect) {
            setTimeout(() => {
                renderNextQuestion();
            }, 1500);
        }
        else {
            submitBtn.textContent = '下一题';
        }
    }
    else
        renderNextQuestion();
}


function updateStatsDisplay() {
    const stats = getGlobalStats();
    document.getElementById('answered-count').textContent = stats.answeredCount;
    document.getElementById('correct-rate').textContent = `${(stats.correctRate * 100).toFixed(2)}%`;
    const latestId = getLatestQuestionId();

    const maxId = Math.max(...questionManager.questions.map(q => q.id));

    const progressPercentage = ((latestId / maxId) * 100).toFixed(2) + '%';
    document.getElementById('progress-percentage').textContent = progressPercentage;

    const wrongQuestions = getWrongQuestions(questionManager.questions);
    document.getElementById('wrong-questions-count').textContent = wrongQuestions.length;
}

