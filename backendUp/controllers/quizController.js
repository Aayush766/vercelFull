const Quiz = require('../models/Quiz');
const User = require('../models/User'); // Required to check student's grade
const QuizAttempt = require('../models/QuizAttempt'); // Newly created model for tracking attempts

// Create a new Quiz (Admin)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, grade, session, questions, attemptsAllowed, timeLimit, difficulty, category, dueDate, instructions } = req.body;

        // Basic validation
        if (!title || !grade || !session || !questions || questions.length === 0) {
            return res.status(400).json({ msg: 'Title, grade, session, and at least one question are required.' });
        }

        // Validate each question structure
        for (const q of questions) {
            if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
                return res.status(400).json({ msg: 'Each question must have text, at least two options, and a correct answer.' });
            }
            if (!q.options.includes(q.correctAnswer)) {
                return res.status(400).json({ msg: `Correct answer "${q.correctAnswer}" for question "${q.questionText}" is not among the provided options.` });
            }
        }

        const newQuiz = new Quiz({
            title,
            description,
            grade: Number(grade),
            session: Number(session),
            questions,
            attemptsAllowed: attemptsAllowed || 1,
            timeLimit: timeLimit || 60, // Default to 60 minutes if not provided
            difficulty: difficulty || 'Medium',
            category: category || 'General',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            instructions: instructions || 'Please read all questions carefully.',
            createdBy: req.user.id
        });

        await newQuiz.save();
        res.status(201).json({ msg: 'Quiz created successfully', quiz: newQuiz });

    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(500).json({ msg: 'Server error creating quiz', error: err.message });
    }
};

// Get all Quizzes (Admin)
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('createdBy', 'name email');
        res.json(quizzes);
    } catch (err) {
        console.error('Error fetching all quizzes:', err);
        res.status(500).json({ msg: 'Server error fetching quizzes', error: err.message });
    }
};

// Get Quizzes by Session and Grade (Student/Admin for listing, without correct answers)
exports.getQuizzesBySessionAndGrade = async (req, res) => {
    try {
        const { session, grade } = req.query;

        if (!session || !grade) {
            return res.status(400).json({ msg: 'Session and Grade query parameters are required.' });
        }

        const parsedSession = parseInt(session);
        const parsedGrade = parseInt(grade);

        if (isNaN(parsedSession) || isNaN(parsedGrade)) {
            return res.status(400).json({ msg: 'Session and Grade must be valid numbers.' });
        }

        const quizzes = await Quiz.find({
            session: parsedSession,
            grade: parsedGrade
        }).select('-__v -questions.correctAnswer'); // Exclude correct answers

        res.json(quizzes);
    } catch (err) {
        console.error('Error fetching quizzes by session and grade:', err);
        res.status(500).json({ msg: 'Server error fetching quizzes', error: err.message });
    }
};

// Get a single Quiz by ID (Admin, includes correct answers)
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        console.error('Error fetching quiz by ID:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz ID format' });
        }
        res.status(500).json({ msg: 'Server error fetching quiz', error: err.message });
    }
};

// Update a Quiz (Admin)
exports.updateQuiz = async (req, res) => {
    try {
        const { title, description, grade, session, questions, attemptsAllowed, timeLimit, difficulty, category, dueDate, instructions } = req.body;
        const quizId = req.params.id;

        if (!title || !grade || !session || !questions || questions.length === 0) {
            return res.status(400).json({ msg: 'Title, grade, session, and at least one question are required.' });
        }

        for (const q of questions) {
            if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
                return res.status(400).json({ msg: 'Each question must have text, at least two options, and a correct answer.' });
            }
            if (!q.options.includes(q.correctAnswer)) {
                return res.status(400).json({ msg: `Correct answer "${q.correctAnswer}" for question "${q.questionText}" is not among the provided options.` });
            }
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            {
                title, description,
                grade: Number(grade),
                session: Number(session),
                questions, attemptsAllowed, timeLimit, difficulty, category,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                instructions
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!updatedQuiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        res.json({ msg: 'Quiz updated successfully', quiz: updatedQuiz });

    } catch (err) {
        console.error('Error updating quiz:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz ID format' });
        }
        res.status(500).json({ msg: 'Server error updating quiz', error: err.message });
    }
};

// Delete a Quiz (Admin)
exports.deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

        if (!deletedQuiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.status(200).json({ msg: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Error deleting quiz:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz ID format' });
        }
        res.status(500).json({ msg: 'Server error deleting quiz', error: err.message });
    }
};

// --- NEW CRITICAL FUNCTION FOR STUDENT QUIZ OVERVIEW ---
exports.getQuizDetailsForStudent = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id; // Assumed from auth middleware

        if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid quiz ID format' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const student = await User.findById(studentId).select('grade'); // Get student's grade
        if (!student) {
            return res.status(404).json({ msg: 'Student profile not found.' });
        }

        // Optional: Validate if the quiz belongs to the student's grade
        if (student.grade !== quiz.grade) {
            console.warn(`Student ${studentId} (grade ${student.grade}) tried to access quiz ${quizId} (grade ${quiz.grade}). Access denied.`);
            return res.status(403).json({ msg: 'You are not authorized to view this quiz.' });
        }

        // Fetch user's attempts for this quiz using the QuizAttempt model
        const userAttemptsCount = await QuizAttempt.countDocuments({ student: studentId, quiz: quizId, isCompleted: true });

        // Build the response object, excluding correct answers
        const quizDetails = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            attemptsAllowed: quiz.attemptsAllowed,
            timeLimit: quiz.timeLimit,
            difficulty: quiz.difficulty,
            category: quiz.category,
            dueDate: quiz.dueDate,
            instructions: quiz.instructions,
            questionsCount: quiz.questions ? quiz.questions.length : 0,
            userAttempts: userAttemptsCount, // How many times this student has completed/submitted
        };

        res.json({ quiz: quizDetails }); // Send under 'quiz' key as expected by frontend

    } catch (err) {
        console.error('Error in getQuizDetailsForStudent:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz ID' });
        }
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Get a Quiz for Student to Take (includes questions, excludes correct answers) ---
exports.getQuizForStudentToTake = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id; // From auth middleware

        // Validate quizId format
        if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid quiz ID format' });
        }

        // Fetch the quiz, excluding the MongoDB __v field
        const quiz = await Quiz.findById(quizId).select('-__v');
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        // Get student's grade for authorization
        const student = await User.findById(studentId).select('grade');
        if (!student) {
            return res.status(404).json({ msg: 'Student profile not found.' });
        }

        // Security check: Ensure the quiz belongs to the student's grade
        if (student.grade !== quiz.grade) {
            console.warn(`Security Alert: Student ${studentId} (grade ${student.grade}) tried to access quiz ${quizId} (grade ${quiz.grade}). Access denied.`);
            return res.status(403).json({ msg: 'You are not authorized to take this quiz.' });
        }

        // Remove correct answers from questions before sending to student
        const questionsForStudent = quiz.questions.map(q => {
            // Convert Mongoose subdocument to plain object and then destructure
            const { correctAnswer, ...rest } = q.toObject();
            return rest;
        });

        // Construct the response object with necessary quiz details and the cleaned questions
        const quizDataForStudent = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            grade: quiz.grade,
            session: quiz.session,
            questions: questionsForStudent, // <--- This now includes the questions without answers
            attemptsAllowed: quiz.attemptsAllowed,
            timeLimit: quiz.timeLimit, // Make sure 'timeLimit' is defined in your Quiz model
            difficulty: quiz.difficulty,
            category: quiz.category,
            dueDate: quiz.dueDate,
            instructions: quiz.instructions,
        };

        res.json({ quiz: quizDataForStudent });

    } catch (err) {
        console.error('Error in getQuizForStudentToTake:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz ID' });
        }
        res.status(500).send('Server Error fetching quiz for student.');
    }
};

// --- Placeholder functions for quiz attempt management ---
// You will need to implement the full logic for these

// Submit Quiz (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers, startedAt, completedAt, timeTaken, timedOut } = req.body;
        const studentId = req.user.id; // Assumed from auth middleware

        // 1. Validate input
        if (!quizId || !answers || !Array.isArray(answers) || answers.length === 0 || !startedAt || !completedAt) {
            return res.status(400).json({ msg: 'Missing required submission data: quizId, answers (array), startedAt, completedAt.' });
        }

        // 2. Fetch the Quiz to validate answers and calculate score
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found.' });
        }

        // 3. Determine the attemptNumber
        // Count previous completed attempts for this student on this quiz
        const previousAttemptsCount = await QuizAttempt.countDocuments({
            student: studentId,
            quiz: quizId,
            isCompleted: true // Only count completed attempts
        });
        const attemptNumber = previousAttemptsCount + 1;

        // Optional: Check attempts allowed if you want to enforce it at submission
        if (quiz.attemptsAllowed && attemptNumber > quiz.attemptsAllowed) {
            return res.status(403).json({ msg: `You have exceeded the allowed number of attempts for this quiz (${quiz.attemptsAllowed}).` });
        }

        // 4. Calculate score and prepare answers for saving
        let score = 0;
        const processedAnswers = []; // This will store answers in the format required by Mongoose schema

        // We need to iterate over the quiz's actual questions to find correct answers
        // and link student's selected options to the correct questionId
        quiz.questions.forEach(q => {
            const studentAnswerForQ = answers.find(a => a.questionId.toString() === q._id.toString());

            if (studentAnswerForQ) {
                // Ensure questionId and selectedOption are present for the schema
                processedAnswers.push({
                    questionId: q._id, // Use the actual ObjectId from the quiz question
                    selectedOption: studentAnswerForQ.selectedOption // This must match what frontend sends
                });

                // Calculate score
                if (studentAnswerForQ.selectedOption === q.correctAnswer) {
                    score++;
                }
            } else {
                // If a question was skipped, you might want to record it or treat as incorrect
                processedAnswers.push({
                    questionId: q._id,
                    selectedOption: null // Or an empty string, depending on your schema
                });
            }
        });

        // 5. Create a new QuizAttempt document
        const newAttempt = new QuizAttempt({
            student: studentId,
            quiz: quizId,
            attemptNumber: attemptNumber, // <-- Now provided
            answers: processedAnswers, // <-- Now properly structured
            score: score,
            totalQuestions: quiz.questions.length,
            startedAt: new Date(startedAt),
            completedAt: new Date(completedAt),
            timeTaken: timeTaken,
            timedOut: timedOut,
            isCompleted: true
        });

        await newAttempt.save();

        res.status(200).json({
            msg: 'Quiz submitted successfully!',
            result: {
                attemptId: newAttempt._id,
                score: score,
                totalQuestions: quiz.questions.length,
                // You might also send an array of correct/incorrect status for each question here if frontend needs it
            }
        });

    } catch (err) {
        console.error('Error submitting quiz:', err);
        // Log the full error object for better debugging on the server
        console.error('Validation Errors:', err.errors);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: `Quiz submission failed: ${messages.join(', ')}` });
        }
        res.status(500).json({ msg: 'Server error submitting quiz', error: err.message });
    }
};


// Get a student's quiz attempts (Admin or Student's own history)
exports.getStudentQuizAttempts = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id; // Allow admin to specify, or student to view their own
        const attempts = await QuizAttempt.find({ student: studentId })
            .populate('quiz', 'title description grade session') // Populate relevant quiz details
            .sort({ completedAt: -1 }); // Latest attempts first

        res.json(attempts);
    } catch (err) {
        console.error('Error fetching student quiz attempts:', err);
        res.status(500).json({ msg: 'Server error fetching student quiz attempts', error: err.message });
    }
};

// Get all attempts for a specific quiz (Admin)
exports.getQuizAttemptsForQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const attempts = await QuizAttempt.find({ quiz: quizId })
            .populate('student', 'name email grade') // Populate relevant student details
            .sort({ completedAt: -1 });

        res.json(attempts);
    } catch (err) {
        console.error('Error fetching quiz attempts for quiz:', err);
        res.status(500).json({ msg: 'Server error fetching quiz attempts for quiz', error: err.message });
    }
};

// --- NEW FUNCTION: Get Quiz Results for Student (includes correct answers for review) ---
exports.getQuizResultsForStudent = async (req, res) => {
    try {
        const { quizId, attemptId } = req.params;
        const studentId = req.user.id; // Assumed from auth middleware

        // Optional: Validate quizId and attemptId format
        if (!quizId.match(/^[0-9a-fA-F]{24}$/) || !attemptId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid ID format.' });
        }

        // Fetch the quiz with its questions and correct answers
        const quiz = await Quiz.findById(quizId).select('questions title'); // Only fetch questions and title
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found.' });
        }

        // Fetch the specific quiz attempt by the student
        const attempt = await QuizAttempt.findOne({ _id: attemptId, student: studentId, quiz: quizId });
        if (!attempt) {
            // It's crucial that the attempt belongs to the authenticated student and the correct quiz
            return res.status(404).json({ msg: 'Quiz attempt not found or not authorized.' });
        }

        // Combine quiz questions with student's selected answers and the correct answers
        const questionsWithResults = quiz.questions.map(q => {
            const studentAnswer = attempt.answers.find(a => a.questionId.toString() === q._id.toString());
            return {
                _id: q._id,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer, // This is now included for review
                selectedAnswer: studentAnswer ? studentAnswer.selectedOption : null // Student's answer
            };
        });

        // Send back all necessary data for the result page
        res.json({
            quizTitle: quiz.title,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            timeTaken: attempt.timeTaken,
            questionsWithResults: questionsWithResults // Array with question details, student's answer, and correct answer
        });

    } catch (err) {
        console.error('Error fetching quiz results for student:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Quiz or Attempt ID' });
        }
        res.status(500).json({ msg: 'Server error fetching quiz results.', error: err.message });
    }
};


exports.getStudentQuizAttempts = async (req, res) => {
    try {
        const studentId = req.user.id; // From your authentication middleware
        console.log('Fetching attempts for student ID:', studentId); // Debug: Check studentId

        // Find all quiz attempts for this student, populate relevant quiz info
        const attempts = await QuizAttempt.find({ student: studentId })
            .populate('quiz', 'title') // Populate only the 'title' field from the Quiz model
            .sort({ completedAt: -1 }); // Sort by most recent attempts first

        console.log('Fetched raw attempts (before filtering):', attempts); // Debug: See raw attempts

        // Map to a cleaner format for the frontend, and IMPORTANTLY, filter out attempts with null quiz references
        const formattedAttempts = attempts
            .filter(attempt => attempt.quiz !== null) // <--- ADD THIS FILTER LINE
            .map(attempt => ({
                _id: attempt._id,
                quizId: attempt.quiz._id,
                quizTitle: attempt.quiz.title,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                completedAt: attempt.completedAt,
                // Add other summary data if needed for the AssessmentReport list view
            }));

        console.log('Formatted attempts (after filtering):', formattedAttempts); // Debug: See final data

        res.json(formattedAttempts);

    } catch (err) {
        console.error('Error fetching student quiz attempts:', err.message);
        // Log the full error object if the error is not 'Cannot read properties of null'
        if (!err.message.includes('Cannot read properties of null')) {
            console.error('Full Error Object:', err);
        }
        res.status(500).json({ msg: 'Server error fetching quiz attempts.' });
    }
};