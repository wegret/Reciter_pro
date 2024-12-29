/*
 * @Author: wlaten
 * @Date: 2024-12-29 14:34:20
 * @LastEditTime: 2024-12-29 15:54:38
 * @Discription: file content
 */

export class QuestionManager {
    constructor(questions) {
        this.questions = questions;
        this.currentIndex = 0;
    }

    // 获取下一道题
    getNextQuestion(wrongQuestions) {
        // 如果错题不为空，优先返回部分错题
        if (wrongQuestions && wrongQuestions.length > 0) {
            const shouldPickWrong = Math.random() < 0.3; // 30% 概率抽错题
            if (shouldPickWrong) {
                const randomIndex = Math.floor(Math.random() * wrongQuestions.length);
                return wrongQuestions[randomIndex];
            }
        }

        // 否则返回正常顺序题
        if (this.currentIndex < this.questions.length) {
            const q = this.questions[this.currentIndex];
            this.currentIndex++;
            return q;
        } else 
            return null;
    }
}
