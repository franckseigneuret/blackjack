import {
  ScoreBullet,
} from './AppStyles'

const Score = ({ whoseScore }) => (

  <ScoreBullet>
    {whoseScore.total && whoseScore.total.map((sum, k) => (
    <li key={k} className={sum > 21 ? 'wrong': ''}>{sum + ' '}</li>
  ))}
  </ScoreBullet>
)

export default Score
