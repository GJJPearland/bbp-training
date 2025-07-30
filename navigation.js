// navigation.js - Handles all slide navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    window.currentSlide = 0;
    window.slides = document.querySelectorAll('.slide');
    window.visibleSlides = Array.from(window.slides).filter(slide => slide.id !== 'admin-panel');
    window.totalSlides = window.visibleSlides.length;
    
    // Initialize navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (window.currentSlide > 0) {
                window.showSlide(window.currentSlide - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (window.currentSlide < window.visibleSlides.length - 1) {
                window.showSlide(window.currentSlide + 1);
            }
        });
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Skip keyboard navigation when inside form fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Left arrow or Page Up: Previous slide
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            if (window.currentSlide > 0) {
                window.showSlide(window.currentSlide - 1);
            }
        }
        // Right arrow or Page Down: Next slide
        else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            if (window.currentSlide < window.visibleSlides.length - 1) {
                window.showSlide(window.currentSlide + 1);
            }
        }
        // Home key: First slide
        else if (e.key === 'Home') {
            window.showSlide(0);
        }
        // End key: Last slide
        else if (e.key === 'End') {
            window.showSlide(window.visibleSlides.length - 1);
        }
    });
    
    // Check for saved progress
    const savedSlide = localStorage.getItem('bbp_current_slide');
    if (savedSlide) {
        const resumeSlideIndex = parseInt(savedSlide);
        if (resumeSlideIndex > 0) {
            const resumeConfirm = confirm("Would you like to resume from where you left off?");
            if (resumeConfirm) {
                window.showSlide(resumeSlideIndex);
            } else {
                window.showSlide(0);
            }
        } else {
            window.showSlide(0);
        }
    } else {
        window.showSlide(0);
    }
});

// Function to show a specific slide
window.showSlide = function(n) {
    // Make sure slides are initialized
    if (!window.slides || !window.visibleSlides) {
        window.slides = document.querySelectorAll('.slide');
        window.visibleSlides = Array.from(window.slides).filter(slide => slide.id !== 'admin-panel');
        window.totalSlides = window.visibleSlides.length;
    }
    
    // Check if trying to access certificate without passing quiz
    if (n === window.visibleSlides.length - 1 && !window.quizPassed) {
        alert('You must complete and pass the quiz before accessing the certificate.');
        return;
    }
    
    // Hide all slides
    for (let i = 0; i < window.visibleSlides.length; i++) {
        window.visibleSlides[i].style.display = 'none';
    }
    
    // Show the current slide
    window.currentSlide = n;
    window.visibleSlides[n].style.display = 'block';
    
    // Update progress bar
    const progressPercent = ((n + 1) / window.visibleSlides.length) * 100;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progressPercent + '%';
        progressBar.setAttribute('aria-valuenow', progressPercent);
    }
    
    // Update slide counter
    const slideCounter = document.getElementById('slide-counter');
    if (slideCounter) {
        slideCounter.textContent = `${n + 1} / ${window.visibleSlides.length}`;
    }
    
    // Save progress to localStorage
    localStorage.setItem('bbp_current_slide', n);
};
