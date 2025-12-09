// ========================================
// State Management (Multi-Deck Support)
// ========================================
let currentDeckName = 'Beginner French';
let currentCardIndex = 0;
let isCardFlipped = false;

// Deck data structure
let decks = {
  'Beginner French': [
    { front: 'Bonjour', back: 'Hello' },
    { front: 'Au revoir', back: 'Goodbye' },
    { front: 'Merci', back: 'Thank you' },
    { front: 'S\'il vous plaît', back: 'Please' },
  ],
  'Coding 101': [],
  'World Cuisines Class': [],
};

// Get current deck cards
function getCurrentCards() {
  return decks[currentDeckName] || [];
}

// ========================================
// DOM Elements
// ========================================
const cardFront = document.querySelector('.card-front');
const cardBack = document.querySelector('.card-back');
const flipBtn = document.querySelector('[aria-label="Flip card"]');
const prevBtn = document.querySelector('[aria-label="Previous card"]');
const nextBtn = document.querySelector('[aria-label="Next card"]');
const shuffleBtn = document.querySelector('[aria-label="Shuffle deck"]');
const newCardBtn = document.querySelector('[aria-label="Create new card"]');
const newDeckBtn = document.querySelector('[aria-label="Create new deck"]');
const deckTitle = document.querySelector('.text-4xl.font-bold');
const deckList = document.querySelector('.deck-list');
const cardContainer = document.querySelector('.card');
const cardArea = document.querySelector('.flex.justify-center.items-center');

/* ========================================
   DOM Elements (additional)
   ======================================== */
const editCardBtn = document.getElementById('edit-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');

// ========================================
// Card Navigation & Display
// ========================================
function renderCard() {
  const cards = getCurrentCards();
  deckTitle.textContent = currentDeckName;

  // reset flipped state visually
  isCardFlipped = false;
  const cardElem = document.querySelector('.card');
  if (cardElem) cardElem.classList.remove('is-flipped');

  if (cards.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  const card = cards[currentCardIndex];
  const front = document.querySelector('.card-front');
  const back = document.querySelector('.card-back');

  if (front) front.textContent = card.front;
  if (back) back.textContent = card.back;

  if (front) front.setAttribute('aria-hidden', 'false');
  if (back) back.setAttribute('aria-hidden', 'true');
}

function showEmptyState() {
  const emptyStateDiv = document.querySelector('.empty-state');
  if (emptyStateDiv) {
    emptyStateDiv.classList.remove('hidden');
  } else {
    // Create empty state if it doesn't exist
    const newEmptyState = document.createElement('div');
    newEmptyState.className = 'empty-state flex flex-col items-center justify-center w-full max-w-md min-h-64 py-8';
    newEmptyState.innerHTML = `<p class="text-4xl font-bold text-gray-400">No cards yet!</p>`;
    cardArea.appendChild(newEmptyState);
  }

  // Hide the card container
  cardContainer.classList.add('hidden');
}

function hideEmptyState() {
  const emptyStateDiv = document.querySelector('.empty-state');
  if (emptyStateDiv) {
    emptyStateDiv.classList.add('hidden');
  }

  // Show the card container
  cardContainer.classList.remove('hidden');

  // Re-query cardFront and cardBack to ensure they're the correct DOM elements
  const cardFrontElement = document.querySelector('.card-front');
  const cardBackElement = document.querySelector('.card-back');
  
  if (cardFrontElement) {
    Object.defineProperty(window, 'cardFront', {
      value: cardFrontElement,
      writable: true,
      configurable: true,
    });
  }
  if (cardBackElement) {
    Object.defineProperty(window, 'cardBack', {
      value: cardBackElement,
      writable: true,
      configurable: true,
    });
  }
}

function flipCard() {
  const cards = getCurrentCards();
  if (cards.length === 0) return;

  const cardElem = document.querySelector('.card');
  const front = document.querySelector('.card-front');
  const back = document.querySelector('.card-back');

  isCardFlipped = !isCardFlipped;
  if (cardElem) cardElem.classList.toggle('is-flipped', isCardFlipped);

  if (front) front.setAttribute('aria-hidden', String(isCardFlipped));
  if (back) back.setAttribute('aria-hidden', String(!isCardFlipped));
}

function nextCard() {
  const cards = getCurrentCards();
  if (cards.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % cards.length;
  renderCard();
}

function prevCard() {
  const cards = getCurrentCards();
  if (cards.length === 0) return;
  currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
  renderCard();
}

function shuffleDeck() {
  const cards = getCurrentCards();
  if (cards.length === 0) return;

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentCardIndex = 0;
  renderCard();
}

// ========================================
// Modal Management
// ========================================
class Modal {
  constructor(title, fields) {
    this.title = title;
    this.fields = fields;
    this.modal = null;
    this.previousFocus = null;
  }

  open(onSubmit) {
    this.previousFocus = document.activeElement;
    this.createModalHTML();
    document.body.appendChild(this.modal);

    const submitBtn = this.modal.querySelector('.modal-submit');
    const closeBtn = this.modal.querySelector('.modal-close');

    submitBtn.addEventListener('click', () => {
      const formData = {};
      this.fields.forEach((field) => {
        const input = this.modal.querySelector(`#${field.id}`);
        formData[field.id] = input.value;
      });
      onSubmit(formData);
      this.close();
    });

    closeBtn.addEventListener('click', () => this.close());

    this._onKeydown = (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'Tab') this.trapFocus(e);
    };
    document.addEventListener('keydown', this._onKeydown);

    this._onOverlayClick = (e) => {
      if (e.target === this.modal) this.close();
    };
    this.modal.addEventListener('click', this._onOverlayClick);

    this.focusFirstInput();
  }

  createModalHTML() {
    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 flex items-center justify-center z-50';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.style.backgroundColor = 'rgba(255,255,255,0.65)';
    this.modal.style.backdropFilter = 'blur(4px)';

    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg shadow-lg p-8 w-96 max-w-full';

    const heading = document.createElement('h2');
    heading.className = 'text-2xl font-bold mb-6';
    heading.textContent = this.title;
    content.appendChild(heading);

    this.fields.forEach((field) => {
      const label = document.createElement('label');
      label.htmlFor = field.id;
      label.className = 'block text-sm font-semibold mb-2';
      label.textContent = field.label;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = field.id;
      input.className = 'w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-4 focus:ring-blue-300';
      input.value = field.value || '';

      content.appendChild(label);
      content.appendChild(input);
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex gap-4 mt-6';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn modal-submit px-4 py-2 flex-1';
    submitBtn.textContent = 'Save';
    submitBtn.type = 'button';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn modal-close px-4 py-2 flex-1 bg-gray-400 hover:brightness-95';
    closeBtn.textContent = 'Cancel';
    closeBtn.type = 'button';

    buttonGroup.appendChild(submitBtn);
    buttonGroup.appendChild(closeBtn);
    content.appendChild(buttonGroup);

    this.modal.appendChild(content);
  }

  focusFirstInput() {
    const firstInput = this.modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  trapFocus(e) {
    const focusableElements = this.modal.querySelectorAll('input, button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      document.removeEventListener('keydown', this._onKeydown);
      if (this.previousFocus) this.previousFocus.focus();
    }
  }
}

// ========================================
// Deck Item Click Handler
// ========================================
function attachDeckItemClickHandler(item) {
  item.addEventListener('click', () => {
    document.querySelectorAll('.deck-item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    currentDeckName = item.textContent.trim();
    currentCardIndex = 0;
    isCardFlipped = false;
    renderCard();
  });
}

// ========================================
// Open New Card Modal
// ========================================
function openNewCardModal() {
  const modal = new Modal('Add New Card', [
    { label: 'Front (Question)', id: 'card-front', value: '' },
    { label: 'Back (Answer)', id: 'card-back', value: '' },
  ]);

  modal.open((formData) => {
    if (formData['card-front'].trim() && formData['card-back'].trim()) {
      const cards = getCurrentCards();
      cards.push({
        front: formData['card-front'],
        back: formData['card-back'],
      });
      currentCardIndex = cards.length - 1;
      renderCard();
    }
  });
}

/* ========================================
   Edit / Delete handlers
   ======================================== */
function openEditCardModal() {
  const cards = getCurrentCards();
  if (!cards.length) return;

  const card = cards[currentCardIndex];
  const modal = new Modal('Edit Card', [
    { label: 'Front (Question)', id: 'card-front', value: card.front },
    { label: 'Back (Answer)', id: 'card-back', value: card.back },
  ]);

  modal.open((formData) => {
    if (formData['card-front'].trim() && formData['card-back'].trim()) {
      card.front = formData['card-front'];
      card.back = formData['card-back'];
      renderCard();
    }
  });
}

function deleteCurrentCard() {
  const cards = getCurrentCards();
  if (!cards.length) return;

  const confirmed = window.confirm('Delete this card? This action cannot be undone.');
  if (!confirmed) return;

  cards.splice(currentCardIndex, 1);
  // Adjust index
  if (currentCardIndex >= cards.length) {
    currentCardIndex = Math.max(0, cards.length - 1);
  }
  renderCard();
}

// Attach listeners safely (called once)
if (editCardBtn) editCardBtn.addEventListener('click', openEditCardModal);
if (deleteCardBtn) deleteCardBtn.addEventListener('click', deleteCurrentCard);

// ========================================
// Initialize: Mark Beginner French as active
// ========================================
function initializeUI() {
  document.querySelectorAll('.deck-item').forEach((item) => {
    if (item.textContent.trim() === 'Beginner French') {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
    attachDeckItemClickHandler(item);
  });

  renderCard();
}

// ========================================
// Event Listeners
// ========================================
flipBtn.addEventListener('click', flipCard);
prevBtn.addEventListener('click', prevCard);
nextBtn.addEventListener('click', nextCard);
shuffleBtn.addEventListener('click', shuffleDeck);

cardContainer.addEventListener('click', flipCard);

newCardBtn.addEventListener('click', openNewCardModal);

newDeckBtn.addEventListener('click', () => {
  const modal = new Modal('Create New Deck', [
    { label: 'Deck Name', id: 'deck-name', value: '' },
  ]);

  modal.open((formData) => {
    if (formData['deck-name'].trim()) {
      const deckName = formData['deck-name'].trim();
      decks[deckName] = [];

      const newLi = document.createElement('li');
      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'deck-item';
      newBtn.textContent = deckName;

      attachDeckItemClickHandler(newBtn);
      newLi.appendChild(newBtn);
      deckList.appendChild(newLi);

      document.querySelectorAll('.deck-item').forEach((el) => el.classList.remove('active'));
      newBtn.classList.add('active');
      currentDeckName = deckName;
      currentCardIndex = 0;
      isCardFlipped = false;
      renderCard();
    }
  });
});

// ensure card click flips (re-query card in case of DOM changes)
document.addEventListener('click', (e) => {
  const cardElem = document.querySelector('.card');
  if (!cardElem) return;
  if (cardElem.contains(e.target) && !e.target.matches('.btn')) {
    // clicking the card should flip (but ignore toolbar/button clicks)
    // only trigger when click is inside the card-inner area
    if (e.target.closest('.card')) {
      flipCard();
    }
  }
});

// ========================================
// Initialize on page load
// ========================================
document.addEventListener('DOMContentLoaded', initializeUI);
