import styled from 'styled-components'

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  text-align: left;
`;

const Hand = styled.div`
  padding: 20px 50px;
  margin: 10px;
  background-color: #f9b3b3;
`;
const Ul = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;

  li + li {
    margin-left: -80px;
  }
  li img {
    height: 150px;
  }
`;

const DashedCircle = styled.button`
    position: relative;
    display: inline-block;
    margin: 5px;
    width: 70px;
    height: 70px;
    border: 4px dashed red;
    border-radius: 50%;
    line-height: 60px;
    text-align: center;
    font-family: Helvetica;
    color: white;
    z-index: 1;
    cursor: pointer;

  &::before {
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0px;
    border-radius: 50%;
    background: blue;
    content: '';
  }
  &::after {
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 5px;
    border: 3px dashed white;
    border-radius: 50%;
    background: rgba(0,0,0,0.4);
    content: '';
  }
`
const ScoreBullet = styled.ul`
  list-style: none;

  li {
    display: inline-block;
    background: white;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    text-align: center;
    margin: 5px;
    font-weight: bold;
  }

  li.wrong {
    text-decoration: line-through;
    color: red;
  }
`

export {
  Main,
  Hand,
  Ul,
  DashedCircle,
  ScoreBullet,
}