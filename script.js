// Gemini API configuration
const API_KEY = "AIzaSyAXiO-3nKD9QUNNIiAYHwcw5GE7NDeLa8c";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// DOM Elements
const categoryElement = document.getElementById('category');
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const totalScoreElement = document.getElementById('total-score');
const restartButton = document.getElementById('restart-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const categorySelector = document.getElementById('category-selector');
const questionContainer = document.getElementById('question-container');

// Quiz state
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let currentCategory = '';

// Event listeners
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentCategory = button.dataset.category;
        categoryElement.textContent = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Quiz`;
        loadQuestions(currentCategory);
        categorySelector.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        submitButton.classList.remove('hidden');
    });
});

prevButton.addEventListener('click', showPreviousQuestion);
nextButton.addEventListener('click', showNextQuestion);
submitButton.addEventListener('click', submitQuiz);
restartButton.addEventListener('click', restartQuiz);

// Initialize
function init() {
    resultContainer.classList.add('hidden');
    questionContainer.classList.add('hidden');
    submitButton.classList.add('hidden');
    categorySelector.classList.remove('hidden');
}

// Load questions from Gemini API
async function loadQuestions(category) {
    try {
        displayLoading(true);
        
        const prompt = `Generate 5 multiple-choice coding questions about ${category} programming. 
        Format the output as valid JSON with the following structure:
        [
          {
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Brief explanation of why this answer is correct"
          }
        ]
        The questions should vary in difficulty from easy to hard. Make sure the correctAnswer is the index (0-3) of the correct option. 
        Do not include anything else except for the JSON array.`;

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Unexpected API response format');
        }
        
        const generatedText = data.candidates[0].content.parts[0].text;
        questions = extractJsonFromText(generatedText);
        
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('Failed to parse quiz questions from API response');
        }
        
        // Validate question format
        questions = questions.map(sanitizeQuestion);

        userAnswers = Array(questions.length).fill(null);
        updateQuizUI();
        displayLoading(false);
    } catch (error) {
        console.error('Error fetching questions:', error);
        displayError('Failed to load questions. Using fallback questions.');
        questions = getFallbackQuestions(category);
        userAnswers = Array(questions.length).fill(null);
        updateQuizUI();
        displayLoading(false);
    }
}

// Extract JSON from text, handling different formats
function extractJsonFromText(text) {
    try {
        // Try direct JSON parsing first
        return JSON.parse(text);
    } catch (e) {
        console.log('Direct JSON parsing failed, trying to extract JSON from text');
        
        try {
            // Look for array pattern
            const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Try to find anything that looks like JSON
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']') + 1;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonString = text.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonString);
            }
            
            // Handle markdown code blocks
            const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[1]) {
                return JSON.parse(markdownMatch[1]);
            }
        } catch (innerError) {
            console.error('Failed to extract JSON:', innerError);
        }
        
        throw new Error('Could not extract valid JSON from response');
    }
}

// Sanitize question data to ensure it has the correct structure
function sanitizeQuestion(question, index) {
    // Ensure question has all required properties
    const sanitized = {
        question: question.question || `Question ${index + 1}`,
        options: Array.isArray(question.options) ? question.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: (typeof question.correctAnswer === 'number' && question.correctAnswer >= 0 && question.correctAnswer <= 3) 
            ? question.correctAnswer 
            : 0,
        explanation: question.explanation || "No explanation provided"
    };
    
    // Ensure we have exactly 4 options
    while (sanitized.options.length < 4) {
        sanitized.options.push(`Option ${sanitized.options.length + 1}`);
    }
    
    return sanitized;
}

// Fallback questions if API fails
function getFallbackQuestions(category) {
    const fallbackQuestions = {
        javascript: [
            {
                question: "Which of the following is not a JavaScript data type?",
                options: ["String", "Boolean", "Float", "Symbol"],
                correctAnswer: 2,
                explanation: "Float is not a distinct data type in JavaScript. JavaScript has Number for both integers and floating-point numbers."
            },
            {
                question: "What does the '===' operator do in JavaScript?",
                options: ["Checks equality with type conversion", "Assigns a value", "Checks strict equality without type conversion", "Checks if a variable exists"],
                correctAnswer: 2,
                explanation: "The === operator checks for strict equality without type conversion."
            },
            {
                question: "Which method adds an element to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correctAnswer: 0,
                explanation: "push() adds elements to the end of an array."
            },
            {
                question: "What is a closure in JavaScript?",
                options: ["A function that has access to its own scope", "A way to close a browser window", "A function that has access to variables in its outer scope", "A method to end a loop"],
                correctAnswer: 2,
                explanation: "A closure is a function that has access to variables in its outer (enclosing) function's scope."
            },
            {
                question: "Which is the correct way to declare a variable in modern JavaScript?",
                options: ["var x = 5;", "let x = 5;", "const x = 5;", "Both B and C"],
                correctAnswer: 3,
                explanation: "Both let and const are modern ways to declare variables, with different behaviors regarding reassignment."
            }
        ],
        python: [
            {
                question: "What is the output of `print(type(1/2))` in Python 3?",
                options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'decimal'>"],
                correctAnswer: 1,
                explanation: "In Python 3, division of integers produces a float by default."
            },
            {
                question: "Which of the following is not a valid Python data structure?",
                options: ["List", "Tuple", "Array", "Dictionary"],
                correctAnswer: 2,
                explanation: "Array is not a built-in data structure in Python. Python has lists, tuples, sets, and dictionaries as its primary built-in data structures."
            },
            {
                question: "How do you create a function in Python?",
                options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
                correctAnswer: 1,
                explanation: "In Python, functions are defined using the 'def' keyword."
            },
            {
                question: "What does the `*args` parameter do in Python?",
                options: ["Multiplies all arguments", "Allows a function to accept multiple keyword arguments", "Allows a function to accept a variable number of positional arguments", "Unpacks a dictionary into keyword arguments"],
                correctAnswer: 2,
                explanation: "`*args` allows a function to accept a variable number of positional arguments which are collected into a tuple."
            },
            {
                question: "What is the correct way to import a module named 'math' in Python?",
                options: ["import math", "#include math", "using math", "include math"],
                correctAnswer: 0,
                explanation: "The correct way to import a module in Python is using the 'import' keyword."
            }
        ],
        java: [
            {
                question: "Which of these is not a primitive data type in Java?",
                options: ["int", "float", "String", "char"],
                correctAnswer: 2,
                explanation: "String is not a primitive data type in Java; it's a class."
            },
            {
                question: "What is the correct way to declare a constant in Java?",
                options: ["const int MAX = 100;", "final int MAX = 100;", "static int MAX = 100;", "var MAX = 100;"],
                correctAnswer: 1,
                explanation: "In Java, constants are declared using the 'final' keyword."
            },
            {
                question: "Which keyword is used to inherit a class in Java?",
                options: ["implements", "extends", "inherits", "using"],
                correctAnswer: 1,
                explanation: "The 'extends' keyword is used for class inheritance in Java."
            },
            {
                question: "What does JVM stand for?",
                options: ["Java Very Modern", "Java Virtual Machine", "Java Visual Manager", "Java Verified Module"],
                correctAnswer: 1,
                explanation: "JVM stands for Java Virtual Machine, which executes Java bytecode."
            },
            {
                question: "Which of the following is not a feature of Java?",
                options: ["Platform Independence", "Automatic Garbage Collection", "Pointers", "Multithreading"],
                correctAnswer: 2,
                explanation: "Java does not support direct memory access through pointers for safety and security."
            }
        ],
        cpp: [
            {
                question: "Which of the following is used to allocate memory dynamically in C++?",
                options: ["malloc()", "alloc()", "new", "create()"],
                correctAnswer: 2,
                explanation: "The 'new' operator is used for dynamic memory allocation in C++."
            },
            {
                question: "What is the correct way to declare a reference variable in C++?",
                options: ["int &ref = x;", "int *ref = &x;", "ref int = x;", "int ref = &x;"],
                correctAnswer: 0,
                explanation: "References in C++ are declared using the & symbol before the variable name."
            },
            {
                question: "Which is not a storage class specifier in C++?",
                options: ["static", "extern", "register", "volatile"],
                correctAnswer: 3,
                explanation: "volatile is a type qualifier, not a storage class specifier."
            },
            {
                question: "What is the purpose of the 'virtual' keyword in C++?",
                options: ["To create virtual reality applications", "To allow function overriding in derived classes", "To declare virtual memory usage", "To create a virtual copy of an object"],
                correctAnswer: 1,
                explanation: "The 'virtual' keyword is used to allow function overriding in derived classes, enabling polymorphism."
            },
            {
                question: "Which C++ feature allows you to use a class as a template argument?",
                options: ["Function templates", "Class templates", "Template specialization", "Template metaprogramming"],
                correctAnswer: 1,
                explanation: "Class templates in C++ allow classes to be used as template arguments."
            }
        ],
        web: [
            {
                question: "Which HTML tag is used to link an external JavaScript file?",
                options: ["<javascript>", "<script>", "<js>", "<link>"],
                correctAnswer: 1,
                explanation: "The <script> tag is used to include external JavaScript files."
            },
            {
                question: "What does CSS stand for?",
                options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Systems", "Colorful Style Sheets"],
                correctAnswer: 1,
                explanation: "CSS stands for Cascading Style Sheets."
            },
            {
                question: "Which of the following is NOT a valid CSS selector?",
                options: [".class", "#id", "*", "<div>"],
                correctAnswer: 3,
                explanation: "<div> is not a valid CSS selector. It should be 'div' without angle brackets."
            },
            {
                question: "What is the correct way to write a JavaScript array?",
                options: ["var colors = (1:'red', 2:'green', 3:'blue')", "var colors = 'red', 'green', 'blue'", "var colors = ['red', 'green', 'blue']", "var colors = 'red' + 'green' + 'blue'"],
                correctAnswer: 2,
                explanation: "JavaScript arrays are written with square brackets, and array elements are separated by commas."
            },
            {
                question: "Which HTTP status code represents 'Not Found'?",
                options: ["200", "404", "500", "301"],
                correctAnswer: 1,
                explanation: "404 is the HTTP status code for 'Not Found'."
            }
        ]
    };
    
    return fallbackQuestions[category] || fallbackQuestions.javascript;
}

// Show the current question
function updateQuizUI() {
    if (questions.length === 0) return;
    
    // Update progress indicators
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = questions.length;
    
    // Display current question
    const currentQuestion = questions[currentQuestionIndex];
    questionTextElement.textContent = currentQuestion.question;
    
    // Create options
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        
        // If user has selected this option
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        
        optionElement.addEventListener('click', () => {
            selectOption(index);
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation buttons
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

// Handle option selection
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update UI to reflect selection
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === optionIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Navigate to previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuizUI();
    }
}

// Navigate to next question
function showNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        updateQuizUI();
    }
}

// Submit quiz and show results
function submitQuiz() {
    // Calculate score
    let score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === questions[index].correctAnswer) {
            score++;
        }
    });
    
    // Update results UI
    scoreElement.textContent = score;
    totalScoreElement.textContent = questions.length;
    
    // Show correct/incorrect answers
    showAnswers();
    
    // Hide quiz controls and show results
    submitButton.classList.add('hidden');
    prevButton.disabled = true;
    nextButton.disabled = true;
    resultContainer.classList.remove('hidden');
}

// Show correct and incorrect answers
function showAnswers() {
    const options = optionsContainer.querySelectorAll('.option');
    const currentQuestion = questions[currentQuestionIndex];
    
    options.forEach((option, index) => {
        if (index === currentQuestion.correctAnswer) {
            option.classList.add('correct');
        } else if (index === userAnswers[currentQuestionIndex] && index !== currentQuestion.correctAnswer) {
            option.classList.add('incorrect');
        }
    });
    
    // Add explanation
    if (currentQuestion.explanation) {
        const explanationElement = document.createElement('p');
        explanationElement.classList.add('explanation');
        explanationElement.textContent = currentQuestion.explanation;
        optionsContainer.appendChild(explanationElement);
    }
}

// Restart the quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = Array(questions.length).fill(null);
    resultContainer.classList.add('hidden');
    init();
}

// Display loading state
function displayLoading(isLoading) {
    if (isLoading) {
        questionTextElement.textContent = "Loading questions...";
        optionsContainer.innerHTML = '<p>Please wait while we generate your quiz...</p>';
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}

// Display error message
function displayError(message) {
    questionTextElement.textContent = message;
}

// Initialize the app
init(); 