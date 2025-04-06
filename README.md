# CodeQuiz - Coding MCQ Challenge Website

A simple, interactive website that generates coding multiple-choice questions and coding challenges using the Google Gemini API.

## Features

- Multiple programming categories (JavaScript, Python, Java, C++, Web Development)
- Dynamically generated questions using AI
- Two modes:
  - MCQ Quiz: Test your knowledge with multiple-choice questions
  - Coding Challenges: Solve real coding problems and submit your solutions
- Interactive quiz interface with immediate feedback
- Code editor for writing and submitting solutions
- AI-based code evaluation and feedback
- Score tracking and results display
- Responsive design for desktop and mobile devices
- Fallback questions and challenges if API is unavailable

## Setup Instructions

1. Clone this repository to your local machine
2. Open the project folder in your preferred code editor
3. Open the `index.html` file in a web browser to start the application

No server setup required! This is a pure HTML, CSS, and JavaScript application.

## How to Use

### MCQ Quiz Mode

1. Open index.html
2. Select a programming category from the available options
3. Read each question and select the answer you believe is correct
4. Use the Previous and Next buttons to navigate between questions
5. Click Submit when you've answered all questions
6. View your results and explanations for each question
7. Click Try Again to restart with new questions

### Coding Challenge Mode

1. Click the "Coding Challenges" button on the MCQ quiz page
2. Select a programming category
3. Read the challenge description, examples, and constraints
4. Choose your preferred programming language
5. Write your solution in the code editor
6. Click "Run Code" to test your solution with example inputs
7. Click "Submit Solution" when you're ready to have your solution evaluated
8. View detailed feedback on your solution's correctness, efficiency, and quality
9. Navigate between challenges using the Previous and Next buttons

## API Key

The application uses the Google Gemini API for generating questions and evaluating code solutions. The API key is included in the script.js and script2.js files:

```javascript
const API_KEY = "AIzaSyAXiO-3nKD9QUNNIiAYHwcw5GE7NDeLa8c";
```

Note: In a production environment, it's recommended to secure your API keys with proper authentication and authorization methods.

## Technical Details

- Pure HTML, CSS, and JavaScript implementation
- Uses the Gemini API to generate custom coding questions and challenges
- Includes robust error handling with fallback content
- AI-powered code evaluation and feedback
- Responsive design using CSS media queries
- No external libraries or frameworks required

## License

This project is open source and available for personal and educational use. 