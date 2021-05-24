import {
  Hand,
  Ul,
  DashedCircle,
} from './AppStyles'

import Score from './Score'

const HandGame = ({ score, who, title, handleDraw, handlePass, buttonsVisible }) => (

  <Hand>
    <p>{title}</p>
    <Ul>
      {
        score[who].cards && score[who].cards.map((c, k) => (
          <li key={k}><img src={c.image} alt={c.code} /></li>
        ))
      }
    </Ul>
    <div>
      Total : <Score whoseScore={score[who]} />
    </div>
    {
      who !== 'bank' &&
      <div style={buttonsVisible ? { display: 'block' } : { display: 'none' }}>
        <DashedCircle onClick={() => handleDraw('player')}>Tirer</DashedCircle>
        <DashedCircle onClick={() => handlePass()}>Passer</DashedCircle>
      </div>
    }
  </Hand>
)

export default HandGame
