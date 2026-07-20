import type { components } from '../api/openapi'

export type Quiz = components['schemas']['QuizResponse']
export type QuizQuestion = components['schemas']['QuizQuestionResponse']
export type QuizOption = components['schemas']['QuizOptionResponse']
export type UpsertQuizRequest = components['schemas']['UpsertQuizRequest']
export type QuizQuestionRequest = components['schemas']['QuizQuestionRequest']
export type QuizOptionRequest = components['schemas']['QuizOptionRequest']
export type QuizAttempt = components['schemas']['QuizAttemptResponse']
export type SubmitQuizAttemptRequest = components['schemas']['SubmitQuizAttemptRequest']
export type SubmitQuizAnswerRequest = components['schemas']['SubmitQuizAnswerRequest']
