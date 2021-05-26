# Jeu de carte : Blackjack

Test technique YouSign

## Vous trouverez :

- la possibilité de jouer au blackjack en solo contre la banque
- l'app vous demande votre nom (c'est plus sympa)
- au cours d'une partie, vous verrez votre/vos score(s) lié(s) à votre jeu de cartes (l'AS peut valoir 1 ou 11)

## Le code :

- utilisation des Hooks useState + useEffect
- utilisation du module [styled-components](https://github.com/styled-components/styled-components)

## Amélioration du code : (@TODO)
- [ ] analyser la quantité de carte dans le deck pour le recréer s'il est vide
- [ ] factoriser le code
- [ ] créer plus de composants
- [ ] possibilité de Redux pour enregistrer les scores et les communiquer à chaque composant
- [ ] possibilité le localStorage pour enregistrer les scores
- [ ] retirer styles inline +  isoler les styles dans une fichier
- [ ] écrire les commentaires du code en anglais
- [x] créer plus de composants React plutôt qu'un fichier App réunissant le tout
- [ ] permettre le jeu à plusieurs
- [ ] ajout un bouton pour réinitialiser la partie
- [ ] enregistrer les parties en ligne (par exemple sur [MongoDB](https://www.mongodb.com), via [ExpressJS](https://expressjs.com))
- [ ] propTypes
- [ ] TU