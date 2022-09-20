let lastBlinkedElem;

export const blinkElem = (elem: HTMLElement): void => {
  if (lastBlinkedElem != null) {
    lastBlinkedElem.classList.remove('blink');
  }

  elem.classList.add('blink');
  lastBlinkedElem = elem;
};

export const blinkSectionHeaderAtBoot = (): HTMLElement | undefined => {
  const { hash } = window.location;

  if (hash.length === 0) {
    return;
  }

  // omit '#'
  const id = hash.replace('#', '');
  // don't use jQuery and document.querySelector
  //  because hash may containe Base64 encoded strings
  const elem = document.getElementById(id);
  if (elem != null && elem.tagName.match(/h\d+/i)) { // match h1, h2, h3...
    blinkElem(elem);
    return elem;
  }
};
