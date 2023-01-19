import { IQuestionHasId } from '~/interfaces/questionnaire/question';
import { useCurrentUser } from '~/stores/context';

type QuestionProps = {
  question: IQuestionHasId,
}

const Question = ({ question }: QuestionProps): JSX.Element => {
  const { data: currentUser } = useCurrentUser();
  const lang = currentUser?.lang;

  const questionText = lang === 'en_US' ? question.text.en_US : question.text.ja_JP;

  return <div className="row mt-4">
    <div className="col-6 d-flex align-items-center">
      <span>
        {questionText}
      </span>
    </div>
    <div className="col-1 d-flex align-items-center p-0">
      <div className="btn-group btn-group-toggle flex-fill grw-questionnaire-btn-group" data-toggle="buttons">
        <label className="btn btn-outline-primary active">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-noAnswer`}/> -
        </label>
      </div>
    </div>
    <div className="col-5 d-flex align-items-center">
      <div className="btn-group btn-group-toggle flex-fill grw-questionnaire-btn-group" data-toggle="buttons">
        <label className="btn btn-outline-primary">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-option1`}/> 1
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-option2`}/> 2
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-option3`}/> 3
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-option4`}/> 4
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name={`question-${question._id}`} id={`${question._id}-option5`}/> 5
        </label>
      </div>
    </div>
  </div>;
};

export default Question;
