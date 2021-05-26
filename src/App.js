import { useState, useEffect } from 'react'

// styles
import './App.css'
import { Main } from './AppStyles'

// componenets
import HandGame from './HandGame'

const cardValueMapping = {
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

/**
 * accumulator est un tableau de scores possibles selon la présence de l'AS. par ex : 
 * 3 coeur, 6 trefle => accumulator = [9]
 * 3 coeur, AS trefle => accumulator = [4, 14]
 * @param {Array} accumulator 
 * @param {Object} currentValue 
 * @returns {Array}
 */
const reducer = (accumulator, currentValue) => {
  for (let i = 0; i < accumulator.length; i++) {
    accumulator[i] += cardValueMapping[currentValue.value]
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

const initialScore = {
  bank: {
    cards: [],
    total: [0], // addition des valeurs des cartes. array car l'AS génère plusieurs possibilités de total
  },
  player: {
    cards: [],
    total: [0], // addition des valeurs des cartes. array car l'AS génère plusieurs possibilités de total
  },
}

function App() {
  const [firstname, setFirstname] = useState('franck')
  const [startPlay, setStartPlay] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [bankCanPlayAgain, setBankCanPlayAgain] = useState(false)
  const [problem, setProblem] = useState(null)
  const [deckId, setDeckId] = useState(null)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [winner, setWinner] = useState(null)
  const [score, setScore] = useState(initialScore)


  const initialize = () => {
    setIsGameStarted(false)
    setBankCanPlayAgain(false)
    setProblem(null)
    setButtonsVisible(true)
    setWinner(null)
    setScore(initialScore)
  }
  const goToPlay = () => {
    firstname && setStartPlay(true)
  }

  /**
   * distribution des premières cartes (2 pour la bank et 2 pour le player)
   */
  const loadFirstHands = () => {

    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
      .then(r => r.json())
      .then(datas => {
        const playerCards = datas.cards.slice(0, 2)
        const bankCards = datas.cards.slice(2)
        const scoreTemp = { ...score }

        scoreTemp.player.cards = playerCards
        scoreTemp.player.total = playerCards.reduce(reducer, [0])

        scoreTemp.bank.cards = bankCards
        scoreTemp.bank.total = bankCards.reduce(reducer, [0])
        setScore(scoreTemp)
      })
      .catch((error) => {
        setProblem(<>
          <p>Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)</p>
          <button onClick={() => { initialize(); loadFirstHands(); }}>Réinitialiser</button>
        </>)
        console.log('Request failed', error)
      })
  }

  useEffect(() => {
    // si le startPlay vaut true ==> fetch le deck de 6 jeux de cartes
    startPlay && fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then(r => r.json())
      .then(datas => {
        fetch(`https://deckofcardsapi.com/api/deck/${datas.deck_id}/shuffle/`) // mélange des cartes du deck
        setDeckId(datas.deck_id)
      })
      .catch((error) => {
        setProblem('Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)')
        console.log('Request failed', error)
      })

  }, [startPlay])

  useEffect(() => {

    startPlay && loadFirstHands()

  }, [deckId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

    if (isGameStarted && !bankCanPlayAgain) {
      // si la banque a 21 dans son pannier de score => ignorer les autres valeurs de score et lanver getWinner
      if (score.player.total.filter(el => el > 21).length === score.player.total.length) {
        getWinner('player a dépassé 21')
      }
    }

    if (bankCanPlayAgain) {
      console.log('tour de la banque')
      console.log('score.bank.total.indexOf(21) = ', score.bank.total.indexOf(21))

      if (score.bank.total.indexOf(21) !== -1) {
        getWinner('score.bank.total.indexOf(21)')
      }
      else if (Math.min(...score.bank.total) < 17) {
        console.log('banque rejoue')
        setTimeout(() => handleDraw('bank'), 3000)
      }
      else {
        getWinner('else')
      }
    }

  }, [isGameStarted, bankCanPlayAgain, score]) // eslint-disable-line react-hooks/exhaustive-deps

  // ajoute une carte au jeu du player ou de la banque, et set les Scores
  const handleDraw = who => {
    /**
     * @TODO bloquer les boutons, le temps du fetch
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

        if (who === 'bank') {
          setBankCanPlayAgain(true)
        }

        setIsGameStarted(true)
        setScore(scoreTemp)
      })
      .catch((error) => {
        setProblem('Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)')
        console.log('Request failed', error)
      })
  }

  // le joueur passe son tour
  const handlePass = () => {
    console.log('pass')
    setIsGameStarted(true)
    setButtonsVisible(false)

    setBankCanPlayAgain(true)
  }

  /**
   * Retourne le score le plus proche de 21 obtenu par un joueur
   * @param {Array} arr
   * @returns {Number} meilleur score
   */
  const getBestScore = (arr) => {

    const needle = 21
    // return arr.reduce((a, b) => (Math.abs(b - needle) < Math.abs(a - needle) ? b : a))
    let r = null
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > r && arr[i] <= needle) {
        r = arr[i]
      }
    }
    return r

  }

  /**
   * annonce le gagnant
   */
  const getWinner = (from = '') => {

    console.log('getWinner from : ', from)
    setButtonsVisible(false)
    setBankCanPlayAgain(false)
    const bestScorePlayer = getBestScore(score.player.total)
    const bestScoreBank = getBestScore(score.bank.total)

    if (bestScorePlayer &&
      (
        bestScoreBank && bestScoreBank < bestScorePlayer ||
        bestScoreBank === null
      )
    ) {
      setWinner(`Bravo ${firstname}, vous avez gagné`)
    } else {
      setWinner('La banque gagné')
    }

  }

  return (
    <div className="App">
      {
        !startPlay && <>
          <h1>Jouer au Blackjack</h1>
          <Main>
            <div>
              <input type="text" name="firstname" onChange={e => setFirstname(e.currentTarget.value)} value={firstname} />
              <button onClick={goToPlay}>Entrez votre nom</button>
            </div>
          </Main>
        </>
      }

      {
        startPlay && firstname &&
        <div>
          {
            problem && <div>
              {problem}
            </div>
          }
          {
            winner && <div>
              <p>{winner}</p>
              <a href="">Relancer la page</a>
            </div>
          }
          <Main>

            <HandGame
              score={score}
              who={'player'}
              title={`Votre jeu ${firstname}`}
              handleDraw={handleDraw}
              handlePass={handlePass}
              buttonsVisible={buttonsVisible}
            />

            <HandGame
              score={score}
              who={'bank'}
              title={`Le jeu de la banque`}
              handleDraw={handleDraw}
              handlePass={handlePass}
              buttonsVisible={buttonsVisible}
              bankCanPlayAgain={bankCanPlayAgain}
            />

          </Main>
        </div>
      }
    </div>
  )
}

export default App
