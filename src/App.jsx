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

  const [filePath, setFilePath] = useState("../images/")
  const [grayscale, setGrayscale] = useState(false)
  const [width, setWidth] = useState(180)
  const [height, setHeight] = useState(80)

  const handleFileUpload = (file) => {
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleFilePath = (e) => {
    setFilePath(e.target.value)
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
    let options = new Options(filePath, arr, file.type, grayscale, dimensions);

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
            <div className="inputs">
              <div className="filePath">
                <label htmlFor="filePath">Path</label>
                <input
                  type="text"
                  id="filePath"
                  value={filePath}
                  onChange={handleFilePath}
                />
              </div>
              <div className="grayscale">
                <label htmlFor="grayscale">Grayscale</label>
                <input
                  type="checkbox"
                  id="grayscale"
                  onChange={handleGrayscale}
                  checked={grayscale}
                />
              </div>
              <div className="width">
                <label htmlFor="width">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(event) => setWidth(event.currentTarget.value)}
                />
              </div>
              <div className="height">
                <label htmlFor="height">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(event) => setHeight(event.currentTarget.value)}
                />
              </div>
            </div>
          </>
        )}

      </header>
    </div>
  )
}

export default App
