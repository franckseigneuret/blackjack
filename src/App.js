import { useState, useEffect } from 'react'

import './App.css';

function App() {
  const [isFirstnameDefined, setIsFirstnameDefined] = useState(false)
  const [firstname, setFirstname] = useState(null)
  const [part, setPart] = useState(null)
  const [deckId, setDeckId] = useState(null)
  const [draw, setDraw] = useState(false)
  const [score, setScore] = useState({
    bank: {
      cards: [],
      total: 0,
    },
    player: {
      cards: [],
      total: 0,
    },
  })

  const handleName = (e) => {
    setFirstname(e.currentTarget.value)
  }

  const handleFirstnameDefined = (e) => {
    setIsFirstnameDefined(true)
  }

  useEffect(() => {
    // load des cartes à jouer
    isFirstnameDefined && fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then((r) => r.json())
      .then(datas => {
        setPart(datas)
        setDeckId(datas.deck_id)
      })

  }, [isFirstnameDefined])

  useEffect(() => {
    // distribution des premières cartes (2 pour la bank et 2 pour le player)
    isFirstnameDefined && fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
      .then((r) => r.json())
      .then(datas => {
        const scoreTemp = { ...score }
        console.log('d=', datas.cards)
        // fill 2 cards for player
        scoreTemp.player.cards = datas.cards.slice(0, 2)
        // fill 2 cards for bank
        scoreTemp.bank.cards = datas.cards.slice(2)
        setScore(scoreTemp)
      })
  }, [deckId])

  return (
    <div className="App">
      {
        !isFirstnameDefined && <>
          <input type="text" name="firstname" onChange={handleName} />
          <button onClick={handleFirstnameDefined}>Votre nom</button>
        </>
      }

      {
        isFirstnameDefined && firstname && <>
          <div>
            <p>Bonjour {firstname}</p>
            <p>deck_id : {deckId}</p>
            <p>link : https://deckofcardsapi.com/api/deck/{deckId}/draw/?count=4</p>

            <p>Votre jeu :</p>
            <ul>
              {
                score.player.cards && score.player.cards.map(c => (
                  <li><img src={c.image} alt={c.code} /></li>
                ))
              }
            </ul>
          </div>
          <div>
            <p>Le jeu de la banque :</p>
            <ul>
              {
                score.bank.cards && score.bank.cards.map(c => (
                  <li><img src={c.image} alt={c.code} /></li>
                ))
              }
            </ul>
          </div>
          
        </>
      }



    </div>
  );
}

export default App;
