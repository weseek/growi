import { ChangeEventHandler, useState } from 'react'
import './App.css'



function replaceImport(str: string): string {
  const regex = /import {[\s\n]*([^}]+)[\s\n]*} from 'reactstrap';/;

  return str.replace(regex, (_match, group: string) => {
    const modules = group
      .split(',')
      .map(mod => mod.trim())
      .filter(mod => mod.length > 0)

    return modules.map((mod) => {
      return `import ${mod} from 'reactstrap/es/${mod}';`
    }).join('\n')
  });
}

function App() {

  const [output, setOutput] = useState('');

  const changeHandler: ChangeEventHandler<HTMLTextAreaElement> = (e): void => {
    const { value } = e.target;

    const replacedValue = replaceImport(value);

    setOutput(replacedValue);
  }
  return (
    <>
      <h1>Input</h1>
      <div className="card">
        <textarea rows={5} onChange={changeHandler} />
      </div>

      <h1>Output</h1>
      <div className="card">
        <textarea rows={5} value={output} />
      </div>
    </>
  )
}

export default App
