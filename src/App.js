import { useState, useEffect } from 'react'

import './App.css';
import {
  Main,
  Hand,
  Ul,
  DashedCircle,
} from './AppStyles'

const codeValueMapping = {
  'ACE': 1, // ou 11
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
  for (let i = 0; i < accumulator.length; i++) {
    accumulator[i] += codeValueMapping[currentValue.value]
  }
  if (currentValue.value === 'ACE') {
    let newCase = 0
    for (let i = 0; i < accumulator.length; i++) {
      newCase = accumulator[i] + 10 // 10 en plus cas l'AS vaut déjà 1 ==> 11
    }
    accumulator.push(newCase)
  }

  return accumulator
}

function App() {
  const [isFirstnameDefined, setIsFirstnameDefined] = useState(false)
  const [firstname, setFirstname] = useState('Franck')
  const [deckId, setDeckId] = useState(null)
  const [buttonsVisible, setButtonsVisible] = useState(true)
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
    firstname && setIsFirstnameDefined(true)
  }

  useEffect(() => {
    // load des cartes à jouer
    isFirstnameDefined && fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then((r) => r.json())
      .then(datas => {
        fetch(`https://deckofcardsapi.com/api/deck/${datas.deck_id}/shuffle/`) // mélange des cartes du deck
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
        scoreTemp.player.total = playerCards.reduce(reducer, [0])

        scoreTemp.bank.cards = bankCards
        scoreTemp.bank.total = bankCards.reduce(reducer, [0])
        setScore(scoreTemp)
      })
  }, [deckId])

  // ajoute une carte au jeu du player ou de la banque
  const handleDraw = who => {
    /**
     * @TODO : bloquer les boutons, le temps du fetch + analyse retour (si erreur 500 par exemple)
     */
    (who === 'player' || who === 'bank') && fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then((r) => r.json())
      .then(datas => {
        const newCard = datas.cards[0]
        const newHand = [...score[who].cards, newCard]

        const scoreTemp = {
          ...score,
          [who]: {
            ...score[who],
            cards: newHand,
            total: newHand.reduce(reducer, [0]),
          }
        }
        setScore(scoreTemp)
      })
  }
  // le joueur passe son tour
  const handlePass = () => {
    setButtonsVisible(false)

    // la banque démarre son tour et tire tant qu'il ne dépasse pas 17
    if (score.bank.total < 17) {
      handleDraw('bank')
    }
  }

  return (
    <div className="App">
      {
        !isFirstnameDefined && <>
          <h1>Jouer au Blackjack</h1>
          <Main>
            <div>
              <input type="text" name="firstname" onChange={handleName} value={firstname} />
              <button onClick={handleFirstnameDefined}>Entrez votre nom</button>
            </div>
          </Main>
        </>
      }

      {
        isFirstnameDefined && firstname &&
        <div>
          <Main>

            <Hand>
              <p>Votre jeu {firstname} :</p>
              <Ul>
                {
                  score.player.cards && score.player.cards.map((c, k) => (
                    <li key={k}><img src={c.image} alt={c.code} /></li>
                  ))
                }
              </Ul>
              <p>
                Total : <ul>{score.player.total && score.player.total.map((sum)=>(
                  <li style={sum > 21 ? {textDecoration: 'line-through'} : {fontWeight: 'bold'}}>{sum + ' '}</li>
                ))}
                </ul>
              </p>
              <div style={buttonsVisible ? { display: 'block' } : { display: 'none' }}>
                <DashedCircle onClick={() => handleDraw('player')}>Tirer</DashedCircle>
                <DashedCircle onClick={handlePass}>Passer</DashedCircle>
              </div>
            </Hand>

            <Hand>
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
            </Hand>
          </Main>
        </div>
      }
    </div>
  );
}

export default App;
