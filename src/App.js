import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import hero from './assets/pet.png'
import Header from './Components/Header'

export default function App() {

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
     <div className="container">
      <Header />
      <div className="hero">
        <div className="hero-text">
          <h1>
            <span style={{color:"#1e8bb8"}}>Adopt</span> animals from Ukranian zoos.
          </h1>
          <p>Ukrainian zoos are in severe need of help now and will be in need after the war ends.</p>
          <a href="#projects"><button>Adopt an animal</button></a>
          <a href="#create-campaign"><button>Feed an animal</button></a>
        </div>
        <img src={hero} alt="hero" />
      </div>
     </div>
      {/* <Projects />
      <Create /> */}
     <footer>
       <p>Created with ❤️ by <a href="https://www.twitter.com/tjelailah">@tjelailah</a>.</p>
     </footer>
    </>
  )
}