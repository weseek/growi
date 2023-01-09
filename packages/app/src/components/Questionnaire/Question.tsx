import { IQuestionHasId } from '~/interfaces/questionnaire/question';

type QuestionProps = {
  question: IQuestionHasId,
}

const Question = ({ question }: QuestionProps): JSX.Element => {
  return <div className="row mt-4">
    <div className="col-5 d-flex align-items-center">
      <span>
        {question.text}
      </span>
    </div>
    <div className="col-7 d-flex align-items-center">
      <div className="btn-group btn-group-toggle flex-fill" data-toggle="buttons">
        <label className="btn btn-outline-primary">
          <input type="radio" name="options" id="option1"/> 1
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name="options" id="option2" /> 2
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name="options" id="option3" /> 3
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name="options" id="option3" /> 4
        </label>
        <label className="btn btn-outline-primary">
          <input type="radio" name="options" id="option3" /> 5
        </label>
      </div>
    </div>
  </div>;
};

export default Question;
