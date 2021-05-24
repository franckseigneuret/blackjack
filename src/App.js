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

function App() {
  const [isFirstnameDefined, setIsFirstnameDefined] = useState(false)
  const [canBankPlayAgain, setCanBankPlayAgain] = useState(false)
  const [firstname, setFirstname] = useState('AA')
  const [problem, setProblem] = useState(null)
  const [deckId, setDeckId] = useState(null)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [winner, setWinner] = useState(null)
  const [score, setScore] = useState({
    bank: {
      cards: [],
      total: [0], // addition des valeurs des cartes. array car l'AS génère plusieurs possibilités de total
    },
    player: {
      cards: [],
      total: [0], // addition des valeurs des cartes. array car l'AS génère plusieurs possibilités de total
    },
  })

  const handleFirstnameDefined = (e) => {
    firstname && setIsFirstnameDefined(true)
  }

  useEffect(() => {
    // load du deck de 6 jeux de cartes

    isFirstnameDefined && fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then(r => r.json())
      .then(datas => {
        fetch(`https://deckofcardsapi.com/api/deck/${datas.deck_id}/shuffle/`) // mélange des cartes du deck
        setDeckId(datas.deck_id)
      })
      .catch((error) => {
        setProblem('Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)')
        console.log('Request failed', error)
      })
      
  }, [isFirstnameDefined])

  useEffect(() => {
    // distribution des premières cartes (2 pour la bank et 2 pour le player)
    
    isFirstnameDefined && fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
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
        setProblem('Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)')
        console.log('Request failed', error)
      })

  }, [deckId])

  useEffect(() => {

    if (canBankPlayAgain && Math.min(score.bank.total) < 17) {
      /**
       * @TODO ajout sablier pour indiquer à l'utilisateur que l'IA de la banque joue
       */
      setTimeout(() => handleDraw('bank'), 3000)
    }
    else if (canBankPlayAgain) {
      getWinner()
    }

  }, [canBankPlayAgain])

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
          setCanBankPlayAgain(true)
        } else {
          /**
           * @TODO vérifier si le player ne dépasse pas 21. Si dépasserment, il perd
           */
        }

        setScore(scoreTemp)
      })
      .catch((error) => {
        setProblem('Un pb est survenu (probablement erreur 500 du serveur deckofcardsapi)')
        console.log('Request failed', error)
      })
  }

  // le joueur passe son tour
  const handlePass = () => {
    setButtonsVisible(false)

    // si la banque a moins de 17, elle rejoue. Sinon, le jeu s'arrete et on calcule qui gagne
    Math.min(...score.bank.total) < 17 ?
      handleDraw('bank')
      :
      getWinner()
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
      if (arr[i] > r && arr[i] < needle) {
        r = arr[i]
      }
    }
    return r

  }

  /**
   * annonce le gagnant
   */
  const getWinner = () => {

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
        !isFirstnameDefined && <>
          <h1>Jouer au Blackjack</h1>
          <Main>
            <div>
              <input type="text" name="firstname" onChange={e => setFirstname(e.currentTarget.value)} value={firstname} />
              <button onClick={handleFirstnameDefined}>Entrez votre nom</button>
            </div>
          </Main>
        </>
      }

      {
        isFirstnameDefined && firstname &&
        <div>
          {
            problem && <div>
              <p>{problem}</p>
              <a href="">Relancer la page</a>
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
            />

          </Main>
        </div>
      }
    </div>
  )
}

export default App
