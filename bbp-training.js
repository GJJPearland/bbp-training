/**
 * BBP Training System - Main JavaScript File
 * Bloodborne Pathogen Training for BJJ Schools
 * Handles slide navigation, quiz functionality, and certificate generation
 */

// Global variables
let currentSlide = 0;
let slides;
let visibleSlides;
let totalSlides = 33;
let quizPassed = false;
let currentQuestionIndex = 0;
let quizAnswers = {};
let completionId = null;

// Quiz answer key
const correctAnswers = {
    q1: 'b', q2: 'c', q3: 'b', q4: 'b', q5: 'b',
    q6: 'b', q7: 'b', q8: 'b', q9: 'c', q10: 'b'
};

/**
 * Initialize the training system when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeSlides();
    setupEventListeners();
    showSlide(0);
});

/**
 * Initialize slide elements and count
 */
function initializeSlides() {
    slides = document.querySelectorAll('.slide');
    visibleSlides = Array.from(slides);
    totalSlides = visibleSlides.length;
    
    console.log('Total slides found:', totalSlides);
    document.getElementById('total-slides').textContent = totalSlides;
}

/**
 * Set up all event listeners for buttons and keyboard navigation
 */
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('prev-btn').addEventListener('click', prevSlide);
    document.getElementById('next-btn').addEventListener('click', nextSlide);
    
    // Quiz start button
    const startQuizBtn = document.getElementById('start-quiz-btn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    // Quiz question buttons
    const quizButtons = [
        { id: 'next-q1-btn', fn: () => nextQuestion(1) },
        { id: 'next-q2-btn', fn: () => nextQuestion(2) },
        { id: 'next-q3-btn', fn: () => nextQuestion(3) },
        { id: 'next-q4-btn', fn: () => nextQuestion(4) },
        { id: 'next-q5-btn', fn: () => nextQuestion(5) },
        { id: 'next-q6-btn', fn: () => nextQuestion(6) },
        { id: 'next-q7-btn', fn: () => nextQuestion(7) },
        { id: 'next-q8-btn', fn: () => nextQuestion(8) },
        { id: 'next-q9-btn', fn: () => nextQuestion(9) },
        { id: 'submit-quiz-btn', fn: submitQuiz }
    ];
    
    quizButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.fn);
            console.log(`Added listener to ${btn.id}`);
        } else {
            console.warn(`Button ${btn.id} not found`);
        }
    });
    
    // Certificate buttons
    const certButtons = [
        { id: 'print-cert-btn', fn: printCertificate },
        { id: 'save-pdf-btn', fn: savePDF },
        { id: 'email-cert-btn', fn: emailCertificate },
        { id: 'submit-cert-btn', fn: submitCertificate },
        { id: 'cancel-email-btn', fn: cancelEmail }
    ];
    
    certButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.fn);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            prevSlide();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'Home') {
            showSlide(0);
        } else if (e.key === 'End') {
            showSlide(visibleSlides.length - 1);
        }
    });
}

/**
 * Display a specific slide by index
 * @param {number} n - Slide index to display
 */
function showSlide(n) {
    // Validate slide index
    if (n < 0 || n >= visibleSlides.length) return;
    
    // Check if trying to access certificate without passing quiz
    if (n === visibleSlides.length - 1 && !quizPassed) {
        alert('You must complete and pass the quiz before accessing the certificate.');
        return;
    }
    
    // If navigating to certificate slide directly, ensure certificate is generated
    if (n === visibleSlides.length - 1 && quizPassed) {
        // Get the score from the results page if available
        const scoreDisplay = document.querySelector('.score-display');
        const score = scoreDisplay ? parseInt(scoreDisplay.textContent) : 100;
        generateCertificate(score);
    }
    
    // Auto-collect quiz answers when leaving a quiz slide
    if (currentSlide >= 20 && currentSlide <= 30) {
        collectCurrentQuizAnswer();
    }
    
    // Hide all slides and their quiz buttons
    visibleSlides.forEach((slide, index) => {
        slide.classList.remove('active');
        const quizBtns = slide.querySelectorAll('.quiz-btn');
        quizBtns.forEach(btn => {
            btn.style.display = 'none';
        });
    });
    
    // Show the target slide
    currentSlide = n;
    visibleSlides[currentSlide].classList.add('active');
    
    // Show quiz buttons only on the active slide if it's a quiz slide
    const activeSlide = visibleSlides[currentSlide];
    if (activeSlide.classList.contains('quiz-slide')) {
        const quizBtns = activeSlide.querySelectorAll('.quiz-btn');
        quizBtns.forEach(btn => {
            btn.style.display = 'block';
        });
    }
    
    // Update counter
    document.getElementById('current-slide').textContent = currentSlide + 1;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const navigation = document.querySelector('.navigation');
    
    // Reset navigation visibility and state
    prevBtn.style.display = 'block';
    prevBtn.style.visibility = 'visible';
    nextBtn.style.display = 'block';
    nextBtn.style.visibility = 'visible';
    navigation.style.display = 'flex';
    
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === visibleSlides.length - 1;
    
    // Hide navigation on certificate slide
    if (activeSlide.id === 'certificate-slide') {
        console.log('On certificate slide - hiding navigation');
        navigation.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        document.body.classList.add('certificate-active');
    } else {
        document.body.classList.remove('certificate-active');
    }
    
    // Check if this is the last quiz question slide
    const slideContent = activeSlide.innerHTML;
    const isLastQuizQuestion = slideContent.includes('Question 10 of 10') && slideContent.includes('Submit Quiz');
    
    if (isLastQuizQuestion) {
        console.log('Found last quiz question - hiding next button');
        nextBtn.style.display = 'none';
        nextBtn.style.visibility = 'hidden';
    }
    
    // Update progress bar
    const progressPercentage = ((currentSlide + 1) / visibleSlides.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
}

/**
 * Automatically collect quiz answers when leaving a quiz slide
 */
function collectCurrentQuizAnswer() {
    const currentSlideEl = visibleSlides[currentSlide];
    const slideContent = currentSlideEl.innerHTML;
    
    // Determine which question this is
    let questionNumber = null;
    for (let i = 1; i <= 10; i++) {
        if (slideContent.includes(`Question ${i} of 10`)) {
            questionNumber = i;
            break;
        }
    }
    
    if (questionNumber) {
        const selectedAnswer = currentSlideEl.querySelector(`input[name="q${questionNumber}"]:checked`);
        if (selectedAnswer) {
            quizAnswers[`q${questionNumber}`] = selectedAnswer.value;
            console.log(`Auto-collected answer for Q${questionNumber}: ${selectedAnswer.value}`);
        } else {
            console.log(`No answer selected for Q${questionNumber}`);
        }
    }
}

/**
 * Go to previous slide
 */
function prevSlide() {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
}

/**
 * Go to next slide with quiz validation
 */
function nextSlide() {
    // Check if this is a quiz question by content
    const currentSlideEl = visibleSlides[currentSlide];
    const slideContent = currentSlideEl.innerHTML;
    
    // If we're on a quiz question, require an answer before proceeding
    if (slideContent.includes('quiz-options') && slideContent.includes('Question') && slideContent.includes('of 10')) {
        // Determine which question this is
        let questionNumber = null;
        for (let i = 1; i <= 10; i++) {
            if (slideContent.includes(`Question ${i} of 10`)) {
                questionNumber = i;
                break;
            }
        }
        
        if (questionNumber) {
            const selectedAnswer = currentSlideEl.querySelector(`input[name="q${questionNumber}"]:checked`);
            
            if (!selectedAnswer) {
                // Show alert and highlight the question
                alert(`⚠️ Please select an answer for Question ${questionNumber} before continuing to the next slide.`);
                
                // Add visual highlight
                const questionBox = currentSlideEl.querySelector('.question-box');
                if (questionBox) {
                    questionBox.style.border = '3px solid #dc3545';
                    questionBox.style.backgroundColor = '#fff5f5';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        questionBox.style.border = '2px solid #dee2e6';
                        questionBox.style.backgroundColor = '#f8f9fa';
                    }, 3000);
                }
                
                return; // Don't proceed to next slide
            } else {
                // Store the answer if not already stored
                if (!quizAnswers[`q${questionNumber}`]) {
                    quizAnswers[`q${questionNumber}`] = selectedAnswer.value;
                    console.log(`Stored answer for Q${questionNumber}: ${selectedAnswer.value}`);
                }
            }
        }
    }
    
    // Original nextSlide logic
    if (currentSlide < visibleSlides.length - 1) {
        showSlide(currentSlide + 1);
    }
}

/**
 * Start the quiz from the beginning
 */
function startQuiz() {
    currentQuestionIndex = 0;
    quizAnswers = {};
    showSlide(20); // Go to first quiz question
}

/**
 * Move to next quiz question
 * @param {number} questionNum - Current question number
 */
function nextQuestion(questionNum) {
    const selectedAnswer = document.querySelector(`input[name="q${questionNum}"]:checked`);
    
    if (!selectedAnswer) {
        // Show a helpful message with visual feedback
        alert(`⚠️ Please select an answer for Question ${questionNum} before continuing.`);
        
        // Add visual highlight to the question options to draw attention
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.style.border = '3px solid #dc3545';
            questionBox.style.backgroundColor = '#fff5f5';
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                questionBox.style.border = '2px solid #dee2e6';
                questionBox.style.backgroundColor = '#f8f9fa';
            }, 3000);
        }
        
        return; // Don't proceed to next question
    }
    
    // Store the answer
    quizAnswers[`q${questionNum}`] = selectedAnswer.value;
    console.log(`Stored answer for Q${questionNum}: ${selectedAnswer.value}`);
    currentQuestionIndex++;
    
    if (currentQuestionIndex < 10) {
        showSlide(20 + currentQuestionIndex);
    }
}

/**
 * Submit the quiz and calculate results
 */
function submitQuiz() {
    console.log('submitQuiz called');
    
    // Check if current question (Q10) is answered
    const selectedAnswer = document.querySelector('input[name="q10"]:checked');
    if (!selectedAnswer) {
        alert('⚠️ Please select an answer for Question 10 before submitting the quiz.');
        
        // Add visual highlight to draw attention
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.style.border = '3px solid #dc3545';
            questionBox.style.backgroundColor = '#fff5f5';
            
            setTimeout(() => {
                questionBox.style.border = '2px solid #dee2e6';
                questionBox.style.backgroundColor = '#f8f9fa';
            }, 3000);
        }
        return;
    }
    
    // Store the final answer
    quizAnswers.q10 = selectedAnswer.value;
    console.log(`Stored answer for Q10: ${selectedAnswer.value}`);
    
    // Add visual feedback
    const submitBtn = document.getElementById('submit-quiz-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Processing results...';
        submitBtn.disabled = true;
    }
    
    console.log('Final quiz answers:', quizAnswers);
    
    // Calculate score
    let correctCount = 0;
    for (let question in correctAnswers) {
        const userAnswer = quizAnswers[question];
        const correctAnswer = correctAnswers[question];
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            correctCount++;
        }
        console.log(`Question ${question}: answered "${userAnswer}", correct is "${correctAnswer}" - ${isCorrect ? 'CORRECT' : 'WRONG'}`);
    }
    
    const scorePercentage = (correctCount / 10) * 100;
    const passed = scorePercentage >= 80;
    
    console.log(`Final Score: ${correctCount}/10 (${scorePercentage}%) - ${passed ? 'PASSED' : 'FAILED'}`);
    
    showQuizResults(scorePercentage, correctCount, passed);
}

/**
 * Display quiz results
 * @param {number} score - Percentage score
 * @param {number} correct - Number of correct answers
 * @param {boolean} passed - Whether the quiz was passed
 */
function showQuizResults(score, correct, passed) {
    console.log('showQuizResults called with:', { score, correct, passed });
    
    // Hide all quiz buttons first
    document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    console.log('About to navigate to results slide...');
    
    // Force navigation to results slide (slide 31)
    currentSlide = 31;
    
    // Hide all slides
    visibleSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show the results slide
    visibleSlides[31].classList.add('active');
    
    // Remove certificate-active class if it was set
    document.body.classList.remove('certificate-active');
    
    // Update counter and navigation
    document.getElementById('current-slide').textContent = 32; // Display as 32 since it's 1-indexed
    
    // Update navigation buttons - show them on results slide
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const navigation = document.querySelector('.navigation');
    
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    navigation.style.display = 'flex'; // Show navigation on results slide
    
    // Update progress bar
    const progressPercentage = (32 / visibleSlides.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
    
    console.log('Forced navigation to results slide completed');
    
    const resultsContent = document.getElementById('results-content');
    console.log('Results content element:', resultsContent);
    
    if (!resultsContent) {
        console.error('Results content element not found!');
        return;
    }
    
    // Small delay to ensure slide is visible before updating content
    setTimeout(() => {
        console.log('Timeout executed, updating results content...');
        
        if (passed) {
            console.log('User passed - creating success content');
            quizPassed = true;
            resultsContent.innerHTML = `
                <div class="results-box pass-result">
                    <h2>🎉 Congratulations!</h2>
                    <div class="score-display pass-score">${score}%</div>
                    <p><strong>You scored ${correct} out of 10 questions correct.</strong></p>
                    <p>You have successfully passed the Bloodborne Pathogen Training!</p>
                    <button class="nav-btn results-btn" id="generate-cert-btn" style="margin: 20px auto 60px auto; display: block; z-index: 1002;">Generate Certificate</button>
                </div>
            `;
            
            console.log('Pass content set, adding event listener...');
            
            // Add event listener to the generate certificate button
            const generateBtn = document.getElementById('generate-cert-btn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    console.log('Generate certificate clicked');
                    generateCertificate(score);
                });
                console.log('Generate certificate button listener added');
            } else {
                console.error('Generate certificate button not found after creating it!');
            }
        } else {
            console.log('User failed - creating fail content');
            quizPassed = false;
            resultsContent.innerHTML = `
                <div class="results-box fail-result">
                    <h2>Review Required</h2>
                    <div class="score-display fail-score">${score}%</div>
                    <p><strong>You scored ${correct} out of 10 questions correct.</strong></p>
                    <p>You need 80% or higher to pass. Please review the training material and retake the quiz.</p>
                    <button class="nav-btn results-btn" id="retake-quiz-btn" style="margin: 20px auto 60px auto; display: block; z-index: 1002;">Retake Quiz</button>
                    <button class="nav-btn results-btn" id="review-training-btn" style="background: #6c757d; margin: 10px auto 60px auto; display: block; z-index: 1002;">Review Training</button>
                </div>
            `;
            
            console.log('Fail content set, adding event listeners...');
            
            // Add event listeners to the buttons
            const retakeBtn = document.getElementById('retake-quiz-btn');
            const reviewBtn = document.getElementById('review-training-btn');
            
            if (retakeBtn) {
                retakeBtn.addEventListener('click', retakeQuiz);
                console.log('Retake quiz button listener added');
            }
            if (reviewBtn) {
                reviewBtn.addEventListener('click', () => showSlide(0));
                console.log('Review training button listener added');
            }
        }
        
        console.log('Quiz results content updated successfully');
    }, 100);
}

/**
 * Reset and retake the quiz
 */
function retakeQuiz() {
    quizAnswers = {};
    currentQuestionIndex = 0;
    quizPassed = false;
    
    // Clear all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reset navigation visibility
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.style.display = 'block';
    }
    
    // Clear certificate fields
    document.getElementById('final-score').textContent = '';
    document.getElementById('completion-date').textContent = '';
    document.getElementById('completion-id').textContent = '';
    document.getElementById('next-training-date').textContent = '';
    
    startQuiz();
}

/**
 * Generate certificate with completion data
 * @param {number} score - Quiz score percentage
 */
function generateCertificate(score) {
    // Generate a more robust completion ID
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    completionId = `BBP-${timestamp.toString(36).toUpperCase()}-${randomPart.toUpperCase()}`;
    
    const today = new Date();
    const completionDate = today.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextTrainingDate = nextYear.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // Force navigation to certificate slide (slide 32)
    currentSlide = 32;
    
    // Hide all slides
    visibleSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show the certificate slide
    visibleSlides[32].classList.add('active');
    
    // Add certificate-active class to hide navigation
    document.body.classList.add('certificate-active');
    
    // Update progress bar to 100%
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    
    // Update certificate fields immediately with real values
    const completionDateEl = document.getElementById('completion-date');
    const finalScoreEl = document.getElementById('final-score');
    const completionIdEl = document.getElementById('completion-id');
    const nextTrainingDateEl = document.getElementById('next-training-date');
    
    if (completionDateEl) {
        completionDateEl.textContent = completionDate;
        console.log('Set completion date:', completionDate);
    }
    if (finalScoreEl) {
        finalScoreEl.textContent = `${score}%`;
        console.log('Set final score:', `${score}%`);
    }
    if (completionIdEl) {
        completionIdEl.textContent = completionId;
        console.log('Set completion ID:', completionId);
    }
    if (nextTrainingDateEl) {
        nextTrainingDateEl.textContent = nextTrainingDate;
        console.log('Set next training date:', nextTrainingDate);
    }
    
    // Focus on name input
    setTimeout(() => {
        const nameInput = document.getElementById('employee-name');
        if (nameInput) {
            nameInput.focus();
        }
    }, 500);
    
    const completionData = {
        id: completionId, 
        completionDate: completionDate,
        nextTrainingDate: nextTrainingDate, 
        score: score,
        timestamp: new Date().toISOString()
    };
    
    try {
        let completions = JSON.parse(localStorage.getItem('bbp-completions') || '[]');
        completions.push(completionData);
        localStorage.setItem('bbp-completions', JSON.stringify(completions));
    } catch (e) {
        console.log('Local storage not available');
    }
}

/**
 * Print the certificate
 */
function printCertificate() {
    if (!quizPassed) {
        alert('You must complete and pass the quiz before printing the certificate.');
        return;
    }
    
    const nameInput = document.getElementById('employee-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your full name before printing the certificate.');
        nameInput.focus();
        return;
    }
    
    window.print();
}

/**
 * Save certificate as PDF
 */
function savePDF() {
    if (!quizPassed) {
        alert('You must complete and pass the quiz before saving the certificate.');
        return;
    }
    
    const nameInput = document.getElementById('employee-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your full name before saving the certificate.');
        nameInput.focus();
        return;
    }
    
    // Show loading message
    const saveBtn = document.getElementById('save-pdf-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Generating PDF...';
    saveBtn.disabled = true;
    
    // Get the certificate element
    const certificateElement = document.querySelector('.certificate');
    
    // Use html2canvas to capture the certificate
    html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape', 'mm', 'letter');
        
        // Add the canvas image to the PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 279.4;
        const imgHeight = 215.9;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Save the PDF
        const filename = `BBP_Certificate_${name.replace(/\s+/g, '_')}_${completionId}.pdf`;
        pdf.save(filename);
        
        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
}

/**
 * Show email certificate form
 */
function emailCertificate() {
    if (!quizPassed) {
        alert('You must complete and pass the quiz before emailing the certificate.');
        return;
    }
    
    const nameInput = document.getElementById('employee-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your full name before emailing the certificate.');
        nameInput.focus();
        return;
    }
    
    document.getElementById('email-form').style.display = 'block';
    document.getElementById('student-email').focus();
}

/**
 * Cancel email form
 */
function cancelEmail() {
    document.getElementById('email-form').style.display = 'none';
    document.getElementById('student-email').value = '';
    document.getElementById('student-comments').value = '';
}

/**
 * Submit certificate via email
 */
function submitCertificate() {
    const studentEmail = document.getElementById('student-email').value.trim();
    const studentName = document.getElementById('employee-name').value.trim();
    const comments = document.getElementById('student-comments').value.trim();
    
    if (!studentEmail) {
        alert('Please enter your email address.');
        document.getElementById('student-email').focus();
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
        alert('Please enter a valid email address.');
        document.getElementById('student-email').focus();
        return;
    }
    
    const submissionData = {
        studentName: studentName, 
        studentEmail: studentEmail,
        completionId: completionId,
        completionDate: document.getElementById('completion-date').textContent,
        score: document.getElementById('final-score').textContent,
        nextTrainingDate: document.getElementById('next-training-date').textContent,
        comments: comments, 
        submissionTime: new Date().toISOString()
    };
    
    // Instructor email address for certificate submissions
    const instructorEmail = 'gjjpearland@gmail.com';
    const subject = `BBP Training Certificate - ${studentName} (ID: ${completionId})`;
    const body = `Bloodborne Pathogen Training Certificate Submission

Student Information:
- Name: ${studentName}
- Email: ${studentEmail}
- Completion ID: ${completionId}
- Completion Date: ${document.getElementById('completion-date').textContent}
- Quiz Score: ${document.getElementById('final-score').textContent}
- Next Training Due: ${document.getElementById('next-training-date').textContent}

${comments ? `Comments: ${comments}` : ''}

This email confirms successful completion of OSHA Bloodborne Pathogen Training.

Submitted via BJJ School Training System
Timestamp: ${new Date().toLocaleString()}`;
    
    try {
        let submissions = JSON.parse(localStorage.getItem('bbp-submissions') || '[]');
        submissions.push(submissionData);
        localStorage.setItem('bbp-submissions', JSON.stringify(submissions));
    } catch (e) {
        console.log('Local storage not available');
    }
    
    const mailtoLink = `mailto:${instructorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    alert(`Certificate submission prepared!\n\nAn email has been opened with your completion details.\nCompletion ID: ${completionId}\n\nPlease send the email to complete your submission.`);
    cancelEmail();
}
