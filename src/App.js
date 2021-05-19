import { useState, useEffect } from 'react'

import './App.css';

function App() {
  const [isFirstnameDefined, setIsFirstnameDefined] = useState(false)
  const [firstname, setFirstname] = useState(null)
  const [part, setPart] = useState(null)
  const [deckId, setDeckId] = useState(null)

  const handleName = (e) => {
    setFirstname(e.currentTarget.value)
  }

  const handleFirstnameDefined = (e) => {
    setIsFirstnameDefined(true)
  }

  useEffect(() => {

    isFirstnameDefined && fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
      .then((r) => r.json())
      .then(datas => {
        setPart(datas)
        setDeckId(datas.deck_id)
      })

  }, [isFirstnameDefined])

  return (
    <div className="App">
      {
        !isFirstnameDefined && <>
          <input type="text" name="firstname" onChange={handleName} />
          <button onClick={handleFirstnameDefined}>Votre nom</button>
        </>
      }

      {
        isFirstnameDefined && firstname && <p>Bonjour {firstname}</p>
      }

    </div>
  );
}

export default App;
