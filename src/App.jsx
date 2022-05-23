import React, { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
// import GrayscaleCheckbox from './Grayscale'
import './App.css'
import { invoke } from '@tauri-apps/api/tauri'

const fileTypes = ["JPG", "PNG", "GIF"]

class Dimensions {
  constructor(width, height) {
    this.width = width
    this.height = height
  }
}

class Options {
  constructor(filename, buffer, format, grayscale, scale) {
    this.filename = filename
    this.buffer = buffer
    this.format = format
    this.grayscale = grayscale
    this.scale = scale
  }
}

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [grayscale, setGrayscale] = useState(false)
  const [width, setWidth] = useState(180)
  const [height, setHeight] = useState(80)

  const handleFileUpload = (file) => {
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleGrayscale = (e) => {
    setGrayscale(e.target.checked)
  }

  async function submitImage() {

    let bytes = await file.arrayBuffer();
    let buffer = new Uint8Array(bytes);

    let arr = [];
    for (let key in buffer) {
      arr.push(buffer[key]);
    }

    let dimensions = new Dimensions(Number(width), Number(height));
    let options = new Options("../images/" + file.name, arr, file.type, grayscale, dimensions);

    invoke('save_img', { options: options });
  }

  function clearImage() {
    setFile(null);
  }

  return (
    <div className="App">

      <header className="App-header">
        <h3>Image Converter</h3>

        {file === null ? (
          <FileUploader
            className="testClass"
            handleChange={handleFileUpload}
            name="file"
            hoverTitle="Gimme gimme!"
            types={fileTypes}
          />
        ) : (
          <>
            <img className="preview" src={preview} alt={file.name} />
            <div className="row">
              <div className="column">
                <button id="clearImage" onClick={submitImage}>Submit</button>
              </div>
              <div className="column">
                <button id="clearImage" onClick={clearImage}>Clear</button>
              </div>
            </div>
            <hr />
            <div className="grayscale">
              <input
                type="checkbox"
                id="grayscale"
                onChange={handleGrayscale}
                checked={grayscale}
              />
              <label htmlFor="grayscale">Grayscale</label>
            </div>
            <div className="width">
              <input
                type="number"
                value={width}
                onChange={(event) => setWidth(event.currentTarget.value)}
              />
              <label htmlFor="width">Width</label>
            </div>
            <div className="height">
              <input
                type="number"
                value={height}
                onChange={(event) => setHeight(event.currentTarget.value)}
              />
              <label htmlFor="height">Height</label>
            </div>
          </>
        )}

      </header>
    </div>
  )
}

export default App
