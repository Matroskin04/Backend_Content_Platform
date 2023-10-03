import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerQuiz } from '../../../../domain/answer-quiz.entity';
import { Repository } from 'typeorm';
import { QuizAnswerStatusType } from '../../../../../../infrastructure/types/quiz-questions.general.types';
import { QuizAnswerStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';

@Injectable()
export class AnswersQuizOrmRepository {
  constructor(
    @InjectRepository(AnswerQuiz)
    protected answersQuizRepository: Repository<AnswerQuiz>,
  ) {}

  async createAnswer(
    status: QuizAnswerStatusEnum,
    quizId: string,
    userId: string,
    questionId: string,
  ): Promise<{ addedAt: string }> {
    const result = await this.answersQuizRepository
      .createQueryBuilder()
      .insert()
      .values({
        answerStatus: status,
        quizId,
        userId,
        questionId,
      })
      .returning(['"addedAt"'])
      .execute();

    return result.raw[0];
  }
}
