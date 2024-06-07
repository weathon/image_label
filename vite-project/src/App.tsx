import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip } from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip
)
function App() {
  const [files, setFiles] = useState([])
  const [finished, setFinished] = useState(0)
  const [currentFileName, setCurrentFileName] = useState("")
  const [currentFileContent, setCurrentFileContent] = useState([]) // array of numbers
  const [ans, setAns] = useState([])
  // fetch /index.txt (list file) and show a progress bar of how many file processed
  useEffect(() => {
    fetch('/data/index.txt').then(x => x.text()).then(x => {
      setFiles(x.split("\n"))
      console.log(x.split("\n"))
      setCurrentFileName(x.split("\n")[0])

    })
  }, [])

  useEffect(() => {
    if (currentFileName) {
      fetch(`/data/${currentFileName}`).then(x => x.text()).then(x => {
        const x2 = x.split("\n").map(x => parseInt(x)).filter(x => !isNaN(x)).filter(x => x >= -5000)
        console.log(x2)
        setCurrentFileContent(x2)
        setFinished(finished + 1)
      })
    }
  }, [currentFileName])
  const handleClick = () => {
    // fetch the next file when clicked
    const currentIndex = files.indexOf(currentFileName);
    const nextIndex = currentIndex + 1;
    if (nextIndex < files.length) {
      setCurrentFileName(files[nextIndex]);
    }
  };

  return (
    <>
      {/* progress bar */}
      <p>
        Files processed: {finished}/{files.length} [
        {"-".repeat(Math.round((finished / files.length) * 10)) +
          ">" +
          ".".repeat(Math.round(((files.length - finished) / files.length) * 10))}
        ]
      </p>
      {/* get current file, then split by \n and convert each element to a number ONLY IF POSSIBLE, then plot them using react chart.js-2 */}
      <p>Current file: {currentFileName}</p>
      <button onClick={handleClick}>Next File</button>
      <Line
        style={{ width: "1000px", height: "1000px" }}
        data={{
          labels: currentFileContent.map((_, i) => i),
          datasets: [
            {
              label: "Dataset",
              data: currentFileContent,
              fill: false,
            },
          ],
        }}
        // copilot
        options={{
          events: ['click'],
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.dataset.label || "";
                  if (ans.length > 0) {
                    setAns([ans[ans.length - 1], context.parsed.x])
                  }
                  else {
                    setAns([context.parsed.x])
                  }
                },
              },
            },
          },
        }}
      />
      <p>{ans.join(",")}</p>
      <button onClick={()=>{
        // append {filename:ans} into localstorage
        const data = JSON.parse(localStorage.getItem("data") || "{}")
        data[currentFileName] = ans
        localStorage.setItem("data", JSON.stringify(data))
        setFinished(finished + 1)
        const currentIndex = files.indexOf(currentFileName);
        const nextIndex = currentIndex + 1;
        if (nextIndex < files.length) {
          setCurrentFileName(files[nextIndex]);
        }
        // set 
      }}>Next</button>
    </>
  );
}

export default App
