import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import hero from './assets/pet.png'
import Header from './Components/Header'
import Adoptions from './Components/Adoptions'
import Adopt from './Components/Adopt'

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
          <a href="#adopt"><button>Adopt an animal</button></a>
          <a href="#feed"><button>Feed an animal</button></a>
        </div>
        <img src={hero} alt="hero" />
      </div>
     </div>
      <Adoptions />
      <Adopt />
      <div className="faq">
        <h3>FAQs</h3>
        <h4>Why should I adopt an animal?</h4>
        <p>Ukrainian zoos are in severe need of help now and will be in need after the war ends. There are no visitors in the zoos, which results in no budgeting. When you adopt/feed an animal, you are helping us keep them alive and healthy.</p>
        <h4>Will I be able to take the animal home after adoption?</h4>
        <p>No, you won't. However, you will be rewarded with an NFT that verifies your parentage.</p>
        <h4>How often can I feed my animals?</h4>
        <p>You can feed your animals as many times as you want.</p>
        <h4>What is the cost of adopting an animal?</h4>
        <p>The cost of adopting an animal is 1 NEAR.</p>
        <h4>What is the cost of feeding an animal?</h4>
        <p>The cost of feeding an animal is 1 NEAR.</p>
        <h4>Why do I have to pay to adopt an animal?</h4>
        <p>The adoption fee is used in the maintenance of the zoo an dthe welfare of the animals.</p>
      </div>
     <footer>
       <p>Created with ❤️ by <a href="https://www.twitter.com/tjelailah">@tjelailah</a>.</p>
     </footer>
    </>
  )
}