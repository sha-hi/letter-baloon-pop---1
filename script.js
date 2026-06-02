// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Add some simple interactivity or sound effects later if needed
    console.log("Madrasa Games Menu loaded!");
    
    const cards = document.querySelectorAll('.game-card:not(.locked)');
    
    cards.forEach(card => {
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('mouseup', () => {
            card.style.transform = '';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});
