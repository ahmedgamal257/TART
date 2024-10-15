document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');

    const previousTexts = document.getElementById('previousTexts');  // Add this line
    const loadPreviousTextButton = document.getElementById('loadPreviousText');  // Add this line

    const themeToggle = document.getElementById('themeToggle'); // Add this line
    const startTestAfterMemorization = document.getElementById('startTestAfterMemorization'); // Add this line
    const startTestAfterlistening = document.getElementById('startTestAfterlistening'); // Add this line

    const timeChunk = document.getElementById('timeChunk');
    const timeAnswer = document.getElementById('timeAnswer');
    const chunkSelect = document.getElementById('chunkSelect');
    const startMemorization = document.getElementById('startMemorization');
    const startListening = document.getElementById('startListening')
    const startTest = document.getElementById('startTest');

    const parametersInterface = document.getElementById('parametersInterface');
    const memorizationInterface = document.getElementById('MemorizationInterface');
    const listenInterface = document.getElementById('listenInterface');
    const testInterface = document.getElementById('TestInterface');
    const chunkDisplay = document.getElementById('chunkDisplay');
    const chunkDisplayTimer = document.getElementById('chunkDisplayTimer');
    const questionDisplay = document.getElementById('questionDisplay');
    const answerDisplay = document.getElementById('answerDisplay');
    const timer = document.getElementById('timer');

    const nextQuestionButton = document.getElementById('nextQuestion');
    const showAnswerButton = document.getElementById('showAnswer'); // Add this line

    let countdown;  // Declare countdown globally so it can be cleared

    let chunks = {};
    let currentChunk = '';
    let currentQuestions = [];
    let currentQuestionIndex = 0;

    // Set dark theme as default
    document.body.classList.add('dark-theme');
    document.querySelector('.container').classList.add('dark-theme');
    // themeToggle.checked = true; // Check the toggle box

    // Fetch previously stored texts from localStorage
    function loadStoredTexts() {
        const storedTexts = JSON.parse(localStorage.getItem('previousTexts')) || [];
        previousTexts.innerHTML = '<option value="">--Select Previously Used Text--</option>';
        storedTexts.forEach((text, index) => {
            const option = document.createElement('option');
            option.value = text;
            option.textContent = `Text ${index + 1}`;
            previousTexts.appendChild(option);
        });
    }

    // Store the current input text when the user starts memorization or test
    function storeCurrentText() {
        const currentText = inputText.value.trim();
        if (!currentText) return;

        let storedTexts = JSON.parse(localStorage.getItem('previousTexts')) || [];
        if (!storedTexts.includes(currentText)) {
            storedTexts.push(currentText);
            localStorage.setItem('previousTexts', JSON.stringify(storedTexts));
        }
    }

    // Load the selected previous text into the input field
    loadPreviousTextButton.addEventListener('click', () => {
        const selectedText = previousTexts.value;
        if (selectedText) {
            inputText.value = selectedText;
            parseInput();  // Call parseInput to update chunks dropdown
        }
    });

    // Call this function to populate the dropdown on page load
    loadStoredTexts();

    // Event listener for dark theme toggle
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme');
        document.querySelector('.container').classList.toggle('dark-theme');
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => button.classList.toggle('dark-theme')); // Toggle button styles
    });

    // Function to parse input and populate the dropdown
    function parseInput() {
        try {
            const input = inputText.value;
            chunks = JSON.parse(input);

            // Clear the dropdown
            chunkSelect.innerHTML = '';

            // Populate the dropdown
            Object.keys(chunks).forEach((chunk, index) => {
                const option = document.createElement('option');
                option.value = chunk;
                option.textContent = `${index + 1} - ${chunk}`;
                chunkSelect.appendChild(option);
            });
        } catch (error) {
            alert('Invalid input! Please enter a valid Python dictionary.');
            console.error(error);
        }
    }

    // Function to start the memorization process
    function startMemorizationProcess() {
        storeCurrentText();
        currentChunk = chunkSelect.value;
        if (!currentChunk) {
            alert('Please select a chunk to memorize.');
            return;
        }
    
        memorizationInterface.classList.remove('hidden');
        testInterface.classList.add('hidden');
        parametersInterface.classList.add('hidden');
        listenInterface.classList.add('hidden');
        
        chunkDisplay.style.display = 'block';
        startTestAfterMemorization.classList.remove('hidden');
        //---------------------------------------------------
        const words = currentChunk.split(' ');
        let wordIndex = 0;

        // Calculate the total time based on the number of words in the chunk
        const wordCount = words.length;
        const timePerWord = parseFloat(timeChunk.value); // Use parseFloat to handle decimals
        let totalTime = wordCount * timePerWord;

        chunkDisplay.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
        
        const hideWordInterval = setInterval(() => {
            if (wordIndex < words.length){
                const wordspans = chunkDisplay.querySelectorAll('.word');
                wordspans[wordIndex].style.transition = 'opacity .5s ease';
                wordspans[wordIndex].style.opacity = '0';

                wordIndex++;
            }
            else {
                clearInterval(hideWordInterval);
            }
        }, timePerWord * 1000);

        //---------------------------------------------------
        
        countdown = setInterval(() => {
            if (totalTime <= 0) {
                const timerSound = document.getElementById('timer-sound');
                timerSound.currentTime = 0;
                timerSound.play().catch(error => {
                    console.error("Audio play failed:", error);
                });
    
                clearInterval(countdown);
                chunkDisplay.style.display = 'none';
                startQuestionDisplay();

            } else {
                chunkDisplayTimer.textContent = `Time remaining: ${totalTime.toFixed(1)} seconds`; // Display one decimal place
                totalTime -= 0.1; // Decrease by 0.1 each time for better precision
            }
        }, 100);
    }
    
//START=========================================
    // Function to start the listening process
    function startListeningProcess() {
        storeCurrentText();
        currentChunk = chunkSelect.value;
        if (!currentChunk) {
            alert('Please select a chunk to memorize.');
            return;
        }
    
        listenInterface.classList.remove('hidden');
        testInterface.classList.add('hidden');
        parametersInterface.classList.add('hidden');
        memorizationInterface.classList.add('hidden');
        startTestAfterlistening.classList.remove('hidden');
        
        chunkDisplay.style.display = 'block';
        //---------------------------------------------------
        const text = currentChunk;
        const apiKey = 'sk_a2a42f23b95c3a72455fef44a8451d1ebcb88d2caeab4eb3';  // Replace with your actual ElevenLabs API key

        // Replace this with the correct voice ID from ElevenLabs
        const url = `https://api.elevenlabs.io/v1/text-to-speech/VR6AewLTigWG4xSOukaG`; // Example: Replace 'YOUR_VOICE_ID'
        
        const data = {
            text: text,
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75
            }
        };
    
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey
            },
            body: JSON.stringify(data)
        })
        .then(response => response.blob())
        .then(blob => {
            const audioURL = URL.createObjectURL(blob);
            const audioElement = document.getElementById("audio-player");
            audioElement.src = audioURL;
            audioElement.play();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
//=========================================
    // Event listener for the "Start Test" button
    startTestAfterMemorization.addEventListener('click', () => {
        startTestProcess(); // Call the function to start the test
    });


    // Function to start displaying questions
    function startQuestionDisplay() {
        currentQuestions = Object.entries(chunks[currentChunk]);
        currentQuestionIndex = 0;

        if (currentQuestions.length > 0) {
            displayNextQuestion();
        } else {
            alert('No questions available for this chunk!');
        }
    }

    // Function to display the next question
    function displayNextQuestion() {
        // Clear the previous timer if it exists
        clearInterval(countdown); 

        if (currentQuestionIndex < currentQuestions.length) {
            const [question, answer] = currentQuestions[currentQuestionIndex];
    
            // Clear previous question and answer
            questionDisplay.textContent = question;
            answerDisplay.textContent = '';  // Clear the answer display for the new question
            questionDisplay.style.display = 'block';
            nextQuestionButton.classList.remove('hidden');  // Show "Next Question" button
            showAnswerButton.classList.remove('hidden');    // Show the "Show Answer" button
            nextQuestionButton.disabled = false;  // Enable the button immediately

            // Start countdown for answer display
            let time = parseInt(timeAnswer.value, 10);
            timer.textContent = `Time until answer: ${time} seconds`;
            countdown = setInterval(() => {
                if (time <= -1) {

                    // Play sound when time ends
                    const timerSound = document.getElementById('timer-sound');
                    timerSound.currentTime = 0;  // Reset sound to the beginning
                    timerSound.play().catch(error => {
                        console.error("Audio play failed:", error);  // Handle potential errors
                    });

                    clearInterval(countdown);
                    answerDisplay.textContent = answer;  // Display the current question's answer
                    answerDisplay.style.display = 'block';
                    nextQuestionButton.disabled = false;  // Enable the "Next Question" button
                } else {
                    timer.textContent = `Time until answer: ${time} seconds`;
                    time--;
                }
            }, 1000);
        } else {
            alert('All questions have been displayed. Please choose a new chunk.');
            chunkSelect.selectedIndex = 0;  // Reset the dropdown
            testInterface.classList.add('hidden');  // Hide the test interface
            parametersInterface.classList.remove('hidden');  // Show parameters again
        }
    }
    

    // Function to display the answer immediately and stop the timer
    function showAnswer(answer) {
        clearInterval(countdown);  // Stop the timer
        answerDisplay.textContent = answer;  // Display the current question's answer
        answerDisplay.style.display = 'block';
        nextQuestionButton.disabled = false;  // Enable the "Next Question" button
    }

    // Event listener for the "Show Answer" button
    showAnswerButton.addEventListener('click', () => {
        const answer = currentQuestions[currentQuestionIndex][1];
        showAnswer(answer);  // Show the answer when button is clicked
    });

    // Event listener for the "Next Question" button
    nextQuestionButton.addEventListener('click', () => {
        clearInterval(countdown); // Stop the previous question's timer
        nextQuestionButton.disabled = false;  // Disable button until next question
        currentQuestionIndex++;
        displayNextQuestion();  // Move to the next question
    });


    // Function to start the test process
    function startTestProcess() {
        storeCurrentText();  // Add this line to store the text
        currentChunk = chunkSelect.value;
        if (!currentChunk) {
            alert('Please select a chunk to test.');
            return;
        }

        // Hide other interfaces
        testInterface.classList.remove('hidden');
        memorizationInterface.classList.add('hidden');
        parametersInterface.classList.add('hidden');
        listenInterface.classList.add('hidden');


        questionDisplay.style.display = 'none';
        answerDisplay.style.display = 'none';

        currentQuestions = Object.entries(chunks[currentChunk]);
        currentQuestionIndex = 0;

        if (currentQuestions.length > 0) {
            displayNextQuestion();
        } else {
            alert('No questions available for this chunk!');
        }
    }

    // Event Listeners
    inputText.addEventListener('input', parseInput);
    startMemorization.addEventListener('click', startMemorizationProcess);
    startListening.addEventListener('click', startListeningProcess);
    startTest.addEventListener('click', startTestProcess);
    startTestAfterlistening.addEventListener('click', startTestProcess);
});
