import { Container } from 'unstated';

export default class CounterContainer extends Container {

  static getClassName() {
    return 'CounterContainer';
  }

  state = {
    count: 0,
  }

  increment = () => {
    this.setState(state => ({ count: state.count + 1 }));
  }

  decrement = () => {
    this.setState(state => ({ count: state.count - 1 }));
  }

  reset = () => {
    this.setState({ count: 0 });
  }

}
