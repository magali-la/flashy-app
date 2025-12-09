// ========================================
// State Management
// ========================================
let currentDeckName = 'Beginner French';
let currentCardIndex = 0;
let isCardFlipped = false;

// Sample card data for Beginner French
let cards = [
  { front: 'Bonjour', back: 'Hello' },
  { front: 'Au revoir', back: 'Goodbye' },
  { front: 'Merci', back: 'Thank you' },
  { front: 'S\'il vous plaît', back: 'Please' },
];

// ========================================
// DOM Elements
// ========================================
const deckItems = document.querySelectorAll('.deck-item');
const cardFront = document.querySelector('.card-front');
const cardBack = document.querySelector('.card-back');
const flipBtn = document.querySelector('[aria-label="Flip card"]');
const prevBtn = document.querySelector('[aria-label="Previous card"]');
const nextBtn = document.querySelector('[aria-label="Next card"]');
const shuffleBtn = document.querySelector('[aria-label="Shuffle deck"]');
const newCardBtn = document.querySelector('[aria-label="Create new card"]');
const deckTitle = document.querySelector('.text-4xl.font-bold');

// ========================================
// Initialize: Mark Beginner French as active
// ========================================
function initializeUI() {
  deckItems.forEach((item) => {
    if (item.textContent.trim() === 'Beginner French') {
      item.classList.add('active');
    }
  });
  renderCard();
}

// ========================================
// Card Navigation & Display
// ========================================
function renderCard() {
  if (cards.length === 0) return;

  const card = cards[currentCardIndex];
  cardFront.textContent = card.front;
  cardBack.textContent = card.back;
  isCardFlipped = false;

  // Reset card visibility
  cardFront.classList.remove('hidden');
  cardFront.setAttribute('aria-hidden', 'false');
  cardBack.classList.add('hidden');
  cardBack.setAttribute('aria-hidden', 'true');
}

function flipCard() {
  isCardFlipped = !isCardFlipped;

  if (isCardFlipped) {
    cardFront.classList.add('hidden');
    cardFront.setAttribute('aria-hidden', 'true');
    cardBack.classList.remove('hidden');
    cardBack.setAttribute('aria-hidden', 'false');
  } else {
    cardFront.classList.remove('hidden');
    cardFront.setAttribute('aria-hidden', 'false');
    cardBack.classList.add('hidden');
    cardBack.setAttribute('aria-hidden', 'true');
  }
}

function nextCard() {
  if (cards.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % cards.length;
  renderCard();
}

function prevCard() {
  if (cards.length === 0) return;
  currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
  renderCard();
}

function shuffleDeck() {
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
    this.fields = fields; // array of { label, id, value }
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

    // Close on ESC anywhere while modal is open
    this._onKeydown = (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'Tab') this.trapFocus(e);
    };
    document.addEventListener('keydown', this._onKeydown);

    // Close when clicking the overlay (outside modal content)
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

    // Semi-transparent overlay (not black) so the user can still see the screen
    this.modal.style.backgroundColor = 'rgba(255,255,255,0.65)'; // light translucent overlay
    // optional subtle blur
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
    const focusableElements = this.modal.querySelectorAll(
      'input, button'
    );
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

      // remove global listeners added in open()
      document.removeEventListener('keydown', this._onKeydown);
      // overlay click listener removed automatically when modal element is removed

      if (this.previousFocus) this.previousFocus.focus();
    }
  }
}

// ========================================
// Event Listeners
// ========================================
flipBtn.addEventListener('click', flipCard);
prevBtn.addEventListener('click', prevCard);
nextBtn.addEventListener('click', nextCard);
shuffleBtn.addEventListener('click', shuffleDeck);

/* Add click listener to card container to flip on click */
const cardContainer = document.querySelector('.card');
cardContainer.addEventListener('click', flipCard);

newCardBtn.addEventListener('click', () => {
  const modal = new Modal('Add New Card', [
    { label: 'Front (Question)', id: 'card-front', value: '' },
    { label: 'Back (Answer)', id: 'card-back', value: '' },
  ]);

  modal.open((formData) => {
    if (formData['card-front'].trim() && formData['card-back'].trim()) {
      cards.push({
        front: formData['card-front'],
        back: formData['card-back'],
      });
      currentCardIndex = cards.length - 1;
      renderCard();
    }
  });
});

// Placeholder for edit deck name (optional enhancement)
deckTitle.addEventListener('dblclick', () => {
  const modal = new Modal('Edit Deck Name', [
    { label: 'Deck Name', id: 'deck-name', value: currentDeckName },
  ]);

  modal.open((formData) => {
    if (formData['deck-name'].trim()) {
      currentDeckName = formData['deck-name'];
      deckTitle.textContent = currentDeckName;
    }
  });
});

// ========================================
// Initialize on page load
// ========================================
document.addEventListener('DOMContentLoaded', initializeUI);
