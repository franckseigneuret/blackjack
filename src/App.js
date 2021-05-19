import { useState, useEffect } from 'react'
import styled from 'styled-components'


import './App.css';
const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const Ul = styled.ul`
  display: flex;
  list-style: none;
  li img {
    height: 150px;
  }
`;

const codeValueMapping = {
  'ACE': 1, // ou 10
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'JACK': 10,
  'QUEEN': 10,
  'KING': 10,
}

const reducer = (accumulator, currentValue) => {
  console.log('accumulator = ', accumulator)
  console.log('currentValue = ', currentValue)
  console.log('currentValue.value = ', currentValue.value)
  return accumulator + codeValueMapping[currentValue.value]
}

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
        const playerCards = datas.cards.slice(0, 2)
        const bankCards = datas.cards.slice(2)
        const scoreTemp = { ...score }
        console.log('d=', datas.cards)

        scoreTemp.player.cards = playerCards
        scoreTemp.player.total = playerCards.reduce(reducer, 0)
        
        scoreTemp.bank.cards = bankCards
        scoreTemp.bank.total = bankCards.reduce(reducer, 0)
        setScore(scoreTemp)
      })
  }, [deckId])

  // useEffect(() => {
    
  // }, [score])

  return (
    <div className="App">
      {
        !isFirstnameDefined && <>
          <input type="text" name="firstname" onChange={handleName} />
          <button onClick={handleFirstnameDefined}>Votre nom</button>
        </>
      }

      {
        isFirstnameDefined && firstname &&
        <div>
          <Main>

            <div>

              <p>Votre jeu {firstname} :</p>
              <Ul>
                {
                  score.player.cards && score.player.cards.map((c, k) => (
                    <li key={k}><img src={c.image} alt={c.code} /></li>
                  ))
                }
              </Ul>
              <p>
                Total : {score.player.total}
              </p>
            </div>
            <div>
              <p>Le jeu de la banque :</p>
              <Ul>
                {
                  score.bank.cards && score.bank.cards.map((c, k) => (
                    <li key={k}><img src={c.image} alt={c.code} /></li>
                  ))
                }
              </Ul>
              <p>
                Total : {score.bank.total}
              </p>
            </div>
          </Main>
          <p>deck_id : {deckId}</p>
          <p>link : https://deckofcardsapi.com/api/deck/{deckId}/draw/?count=4</p>
        </div>
      }
    </div>
  );
}

export default App;
