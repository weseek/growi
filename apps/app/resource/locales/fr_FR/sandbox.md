# Qu'est-ce que Sandbox ?
- Sur cette page, vous trouverez des conseils qui vous aideront à maîtriser GROWI
- N'hésitez pas à enrichir le contenu de vos pages avec les références sous cette hiérarchie de pages

# :closed_book: Titres et paragraphes
- En insérant des titres et des paragraphes, vous pouvez rendre le texte de la page plus facile à lire

## En-têtes
- Ajoutez `#` avant le texte du titre pour créer un titre
    - En fonction du nombre de `#`, la taille de la police des titres sera différente de celle affichée dans l'écran d'affichage
- Le nombre de `#` déterminera le niveau de hiérarchie et vous aidera à organiser le contenu

```markdown
# Titre de premier niveau
## Titre de deuxième niveau
### Titre de troisième niveau
#### Titre de quatrième niveau
##### Titre de cinquième niveau
###### Titre de sixième niveau
```

## Saut
- Insérez deux espaces de demi-largeur à la fin de la phrase que vous souhaitez couper
    - Vous pouvez également modifier cela dans le paramètre pour couper la ligne sans demi-largeur espaces
        - Modifiez le paramètre de saut de ligne dans le secteur « Paramètres Markdown » de la page d'administration

#### Exemple : Sans saut de ligne
Paragraphe 1
Paragraphe 2

#### Exemple : Avec saut de ligne
Paragraphe 1  
Paragraphe 2

## Bloc
- Les paragraphes peuvent être créés en insérant une ligne vide dans le texte
- Le passage peut être divisé en phrases et les rendre plus faciles à lire

#### Exemple : Sans paragraphe
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

#### Exemple : Avec paragraphe
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Lignes horizontales
- Insérer la ligne horizontale avec trois astérisques consécutifs ou plus `*` ou des traits de soulignement `_`

#### Exemple
Ci-dessous se trouve une ligne horizontale
***

Ci-dessous se trouve une ligne horizontale
___

```markdown
Ci-dessous se trouve une ligne horizontale
***

Ci-dessous se trouve une ligne horizontale
___
```

# :green_book: Style du texte
- Différents styles peuvent être appliqués pour enrichir l'expression textuelle d'une phrase
    - Ces styles peuvent également être facilement appliqués en sélectionnant l'icône de la barre d'outils en bas de l'écran d'édition

## Italique
- Entourez le texte d'un astérisque `*` ou d'un trait de soulignement `_`.

#### Exemples
- Cette phrase indique l'emphase avec *Italique*
- Cette phrase indique l'emphase avec _Italique_

```markdown
- Cette phrase indique l'emphase avec *Italique*
- Cette phrase indique l'emphase avec _Italique_
```

## Gras
- Entourez le texte de deux astérisques `*` ou de deux traits de soulignement `_`

#### Exemple
- Cette phrase indique l'emphase avec **Gras**
- Cette phrase indique l'emphase avec __Gras__

```markdown
- Cette phrase indique l'emphase avec **Gras**
- Cette phrase indique l'emphase avec __Gras__
```

## Italique et Gras
- Entourez le texte de trois astérisques `*` ou de trois traits de soulignement `_`

#### Exemple
- Cette phrase indique l'emphase avec ***Italique et Gras***
- Cette phrase indique l'emphase avec ___Italique et Gras___

```markdown
- Cette phrase indique l'emphase avec ***Italique et gras***
- Cette phrase indique l'emphase avec ___Italique et gras___
```

# :orange_book: Insérer des listes
## Liste à puces
- Insérer une liste à puces en commençant une ligne par un trait d'union `-`, un plus `+` ou un astérisque `*`

#### Exemple
- Cette phrase est présente dans la liste à puces
    - Cette phrase est présente dans la liste à puces
        - Cette phrase est présente dans la liste à puces
        - Cette phrase est présente dans la liste à puces
- Cette phrase est présente dans la liste à puces
    - Cette phrase est présente dans la liste à puces

## Liste numérotée
- `Number.` au début d'une ligne pour insérer une liste numérotée
    - Les numéros sont automatiquement attribués

- La liste numérotée et la liste à puces peuvent également être combinées pour être utilisées

#### Exemple
1. Cette phrase est présente dans la liste numérotée
    1. Cette phrase est présente dans la liste numérotée
    1. Cette phrase est présente dans la liste numérotée
    1. Cette phrase est présente dans la liste numérotée
        - Cette phrase est présente dans la liste à puces
1. Cette phrase est présente dans la liste à puces
    - Cette phrase est présente dans la liste à puces

## Liste des tâches
- Insérer une liste de cases à cocher non cochées en écrivant `[]`
    - Cocher la case à cocher en écrivant `[x]`

#### Exemple
- [ ] Tâche 1
    - [x] Tâche 1-1
    - [ ] Tâche 1-2
- [x] Tâche 2

# :blue_book: Lien

## Lien automatique
Il suffit d'écrire l'URL et le lien sera généré automatiquement.

### Exemple

https://www.google.co.jp

```markdown
https://www.google.co.jp
```

## Libellé et lien
Insérez un lien en écrivant `[label](URL)`

### Exemple
- [Google](https://www.google.co.jp/)
- [Sandbox est ici](/Sandbox)

```markdown
- [Google](https://www.google.co.jp/)
- [Sandbox est ici](/Sandbox)
```

## Syntaxe de lien flexible

La syntaxe de lien flexible permet d'écrire facilement un lien par chemin de page, un lien de page relatif et un libellé de lien et une URL.

- [[/Sandbox]]
- [[./Math]]
- [[Comment écrire des formules ?>./Math]]

```markdown
- [[/Sandbox]]
- [[./Math]]
- [[Comment écrire des formules ?>./Math]]
```

# :notebook: Autres
## Citations
- Utilisez des expressions entre guillemets en mettant `>` au début du paragraphe
- Plusieurs citations peuvent être exprimées en utilisant une séquence de caractères `>`
- Des listes et d'autres éléments peuvent être utilisés ensemble dans les citations

#### Exemple
> - Citation
> - Citation
>> Plusieurs citations doivent insérer plus de `>`

```markdown
> - Citation
> - Citation
>> Plusieurs citations doivent insérer plus de `>`
```

## Code
- Il est possible d'exprimer le code en l'ajoutant en trois `` ` ``

#### Exemple

```markdown
Ajoutez des codes ici

Les sauts de ligne et les paragraphes peuvent être reflétés dans le code tel quel
```

#### Exemple (code source)

```javascript:mersenne-twister.js
function MersenneTwister(seed) {
if (arguments.length == 0) {
seed = new Date().getTime();
}

this._mt = new Array(624);
this.setSeed(seed);
}
```

## Code en ligne
- Entourez les mots de `` ` `` pour créer du code en ligne

#### Exemple
Voici le `code en ligne`

## Tableau

### Syntaxe générale

#### Exemple

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

```markdown
| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |
```

### CSV / TSV

#### Exemple

``` tsv
Cellule de contenu Cellule de contenu
Cellule de contenu Cellule de contenu
```

~~~
``` csv
Cellule de contenu,Cellule de contenu
Cellule de contenu,Cellule de contenu
```
~~~

~~~
``` tsv
Cellule de contenu Cellule de contenu
Cellule de contenu Cellule de contenu
```
~~~

### CSV / TSV (avec en-tête)

#### Exemple

``` tsv-h
Premier en-tête Deuxième en-tête
Cellule de contenu Cellule de contenu
Cellule de contenu Cellule de contenu
```

~~~
``` csv-h
Premier en-tête Deuxième en-tête
Cellule de contenu,Cellule de contenu
Cellule de contenu,Cellule de contenu
```
~~~

~~~
``` tsv-h
Premier en-tête Deuxième en-tête
Cellule de contenu Cellule de contenu
Cellule de contenu Contenu Cellule
```
~~~

# :ledger: Autres applications
- [Bootstrap](/Sandbox/Bootstrap)

- [Diagrammes](/Sandbox/Diagrammes)

- [Math](/Sandbox/Math)